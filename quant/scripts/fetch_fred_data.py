"""
fetch_fred_data.py — Fulcrum Memo v4 data pipeline (FRED side)
================================================================

Pulls all FRED series needed for the v4 Fulcrum Index. Architecture:

LONG-HISTORY SERIES (full inception, 40-year regime detection):
  - BAA10Y    : Moody's Baa Corporate over 10Y Treasury    (1986+)
  - AAA10Y    : Moody's Aaa Corporate over 10Y Treasury    (1983+)
  - DBAA      : Moody's Baa Corporate Yield (daily)        (1986+)
  - VIXCLS    : VIX                                          (1990+)
  - DGS10     : 10-Year Treasury Constant Maturity Rate     (1962+)
  - T10Y2Y    : 10Y-2Y Treasury Spread                       (1976+)
  - T10YIE    : 10Y Breakeven Inflation                      (2003+)

CURRENT-CYCLE SERIES (FRED restricted to 3-year window in April 2026):
  - BAMLH0A0HYM2  : ICE BofA HY OAS (master)
  - BAMLH0A3HYC   : ICE BofA CCC OAS  (canary tier)
  - BAMLH0A1HYBB  : ICE BofA BB OAS   (highest HY tier)
  - BAMLC0A4CBBB  : ICE BofA BBB OAS  (IG floor)

The split is deliberate. The Moody's Baa-Treasury spread (BAA10Y) is the
primary signal for the multi-decade rolling-percentile and regime-band logic.
ICE BofA HY OAS is kept for current-cycle analysis (the 2026 Iran period,
Kalshi positioning, RX desk-watch instruments) where the 3-year window is
sufficient and the HY-vs-IG dispersion (HY_OAS - BAA10Y) becomes its own
signal.

Why this works analytically:
  - Gilchrist-Zakrajšek (2012) used Baa spreads precisely because of the
    long history. Every default cycle since 1986 is captured.
  - When FRED restricted ICE BofA series to 3-year windows in April 2026,
    the right move was not to compromise the analysis — it was to follow
    the academic tradition that handled this constraint decades ago.
  - The HY-IG spread (HY_OAS - BAA10Y) is itself a tradable signal that
    captures which part of the capital structure is cracking first.

Run locally:
    export FRED_API_KEY=<your_key>
    python scripts/fetch_fred_data.py

Run in CI: see .github/workflows/update-fulcrum-data.yml
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time

# On Windows the default stdout encoding is cp1252, which chokes on the
# checkmark/arrow glyphs we use in progress output. Force UTF-8 so logs are
# readable both locally and in CI without per-platform branching.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# ============================================================================
# Configuration
# ============================================================================

FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"

# Long-history series — pull from inception. These drive the multi-decade
# regime detection and the v4 backtest workbook's primary signals.
LONG_HISTORY_SERIES: dict[str, dict[str, Any]] = {
    "BAA10Y": {
        "label": "Moody's Baa Corporate over 10Y Treasury",
        "unit_transform": "bps",   # FRED reports as percent; multiply ×100
        "site_file": "baaSpreadHistory.ts",
        "inception": "1986-01-02",
        "role": "primary_credit_signal",
    },
    "AAA10Y": {
        "label": "Moody's Aaa Corporate over 10Y Treasury",
        "unit_transform": "bps",
        "site_file": "aaaSpreadHistory.ts",
        "inception": "1983-01-03",
        "role": "ig_floor",
    },
    "DBAA": {
        "label": "Moody's Baa Corporate Bond Yield (daily)",
        "unit_transform": "raw",   # already in percent yield, keep as-is
        "site_file": "baaYieldHistory.ts",
        "inception": "1986-01-02",
        "role": "supplementary",
    },
    "VIXCLS": {
        "label": "VIX (CBOE Volatility Index)",
        "unit_transform": "raw",
        "site_file": "vixHistory.ts",
        "inception": "1990-01-02",
        "role": "vol_signal",
    },
    "DGS10": {
        "label": "10-Year Treasury Constant Maturity Rate",
        "unit_transform": "raw",
        "site_file": "dgs10History.ts",
        "inception": "1962-01-02",
        "role": "rates_signal",
    },
    "T10Y2Y": {
        "label": "10Y-2Y Treasury Spread (yield curve)",
        "unit_transform": "raw",
        "site_file": "yieldCurveHistory.ts",
        "inception": "1976-06-01",
        "role": "recession_indicator",
    },
    "T10YIE": {
        "label": "10-Year Breakeven Inflation Rate",
        "unit_transform": "raw",
        "site_file": "breakevenHistory.ts",
        "inception": "2003-01-02",
        "role": "inflation_signal",
    },
    "DCOILBRENTEU": {
        "label": "Brent Crude Spot Price (Europe)",
        "unit_transform": "raw",   # already in $/barrel
        "site_file": "brentSpotHistory.ts",
        "inception": "1987-05-20",
        "role": "energy_signal",
    },
}

# Current-cycle series — FRED restricted these to 3-year rolling window in
# April 2026 (announced on each series page: "Starting in April 2026, this
# series will only include 3 years of observations"). We pull what FRED
# gives us for current-period analysis only.
CURRENT_CYCLE_SERIES: dict[str, dict[str, Any]] = {
    "BAMLH0A0HYM2": {
        "label": "ICE BofA US High Yield Index OAS",
        "unit_transform": "bps",
        "site_file": "hyOasHistory.ts",
        "lookback_days": 1095,  # 3 years, FRED ceiling
        "role": "current_hy_signal",
    },
    "BAMLH0A3HYC": {
        "label": "ICE BofA CCC & Lower OAS (canary tier)",
        "unit_transform": "bps",
        "site_file": "cccOasHistory.ts",
        "lookback_days": 1095,
        "role": "canary_tier",
    },
    "BAMLH0A1HYBB": {
        "label": "ICE BofA BB OAS (highest HY tier)",
        "unit_transform": "bps",
        "site_file": "bbOasHistory.ts",
        "lookback_days": 1095,
        "role": "hy_top_tier",
    },
    "BAMLC0A4CBBB": {
        "label": "ICE BofA BBB OAS (IG floor)",
        "unit_transform": "bps",
        "site_file": "bbbOasHistory.ts",
        "lookback_days": 1095,
        "role": "ig_floor_current",
    },
}

# Default lookback for long-history series. ~50 years catches all post-1976
# data we have, and FRED returns "" for any pre-inception dates, so we won't
# miss anything by being generous.
DEFAULT_LONG_LOOKBACK_DAYS = 365 * 50


# ============================================================================
# FRED API client
# ============================================================================

@dataclass
class Observation:
    """One row from FRED."""
    obs_date: date
    value: float | None  # FRED uses "." for missing — we coerce to None


def fetch_series(
    series_id: str,
    api_key: str,
    start: date,
    end: date,
    *,
    max_retries: int = 3,
    timeout: int = 60,  # 60s for long-history pulls
) -> list[Observation]:
    """
    Fetch observations for one FRED series. Returns ascending-date list,
    missing values represented as None. Raises RuntimeError on persistent
    API failure so CI fails loudly rather than silently committing stale data.
    """
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "observation_start": start.isoformat(),
        "observation_end": end.isoformat(),
        "sort_order": "asc",
    }
    url = f"{FRED_BASE}?{urlencode(params)}"

    last_err: Exception | None = None
    for attempt in range(max_retries):
        try:
            req = Request(url, headers={"User-Agent": "fulcrum-memo-pipeline/1.0"})
            with urlopen(req, timeout=timeout) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            break
        except (HTTPError, URLError, TimeoutError) as e:
            last_err = e
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise RuntimeError(
                    f"FRED API failed for {series_id} after {max_retries} attempts: {e}"
                ) from e

    raw = payload.get("observations", [])
    out: list[Observation] = []
    for row in raw:
        try:
            d = datetime.strptime(row["date"], "%Y-%m-%d").date()
        except (KeyError, ValueError):
            continue
        v_str = row.get("value", ".")
        v = None if v_str in (".", "", None) else float(v_str)
        out.append(Observation(obs_date=d, value=v))
    return out


# ============================================================================
# Output writers
# ============================================================================

def write_csv(observations: list[Observation], path: Path, series_id: str) -> None:
    """Write FRED observations as CSV — direct input for the v4 backtest workbook."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", series_id])
        for obs in observations:
            w.writerow([obs.obs_date.isoformat(), "" if obs.value is None else obs.value])


def write_typescript(
    observations: list[Observation],
    path: Path,
    *,
    series_id: str,
    label: str,
    unit_transform: str,
) -> None:
    """
    Write a TypeScript data file consumable by the React site.

    Canonical schema:
        export interface DailyDataPoint { date: string; value: number; }
        export const seriesName: DailyDataPoint[] = [...];
        export const seriesNameMeta = { fredSeriesId, label, units, ... };

    unit_transform options:
      - "raw" — value as-is (VIX, DGS10, yield curve, breakeven, DBAA)
      - "bps" — multiply percent by 100 (BAA10Y, AAA10Y, all ICE BofA OAS)
    """
    path.parent.mkdir(parents=True, exist_ok=True)

    clean = [o for o in observations if o.value is not None]

    if unit_transform == "bps":
        scale = 100.0
        units_label = "bps"
    elif unit_transform == "raw":
        scale = 1.0
        units_label = "percent"
    else:
        raise ValueError(f"Unknown unit_transform: {unit_transform}")

    var_name = path.stem
    last_updated = clean[-1].obs_date.isoformat() if clean else "n/a"
    last_value = clean[-1].value * scale if clean else "n/a"
    first_obs = clean[0].obs_date.isoformat() if clean else "n/a"

    lines: list[str] = []
    lines.append("// AUTO-GENERATED by scripts/fetch_fred_data.py — DO NOT EDIT BY HAND.")
    lines.append(f"// Source: FRED series {series_id} ({label})")
    lines.append(f"// Units: {units_label}")
    lines.append(f"// Coverage: {first_obs} → {last_updated} ({len(clean)} obs)")
    lines.append(f"// Generated: {datetime.utcnow().isoformat()}Z")
    lines.append("")
    lines.append('import type { DailyDataPoint } from "./types";')
    lines.append("")
    lines.append(f"export const {var_name}: DailyDataPoint[] = [")
    for obs in clean:
        v = obs.value * scale
        lines.append(f'  {{ date: "{obs.obs_date.isoformat()}", value: {v:.4f} }},')
    lines.append("];")
    lines.append("")
    lines.append(f"export const {var_name}Meta = {{")
    lines.append(f'  fredSeriesId: "{series_id}",')
    lines.append(f'  label: {json.dumps(label)},')
    lines.append(f'  units: "{units_label}",')
    lines.append(f'  firstObservation: "{first_obs}",')
    lines.append(f'  lastObservation: "{last_updated}",')
    lines.append(f'  observationCount: {len(clean)},')
    lines.append("} as const;")
    lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")


# ============================================================================
# Main pipeline
# ============================================================================

def run_pipeline(
    api_key: str,
    *,
    out_data_dir: Path,
    out_ts_dir: Path,
    long_lookback_days: int = DEFAULT_LONG_LOOKBACK_DAYS,
    series_filter: list[str] | None = None,
) -> dict[str, Any]:
    """Pull all configured series and emit CSV + TS. Returns a summary dict."""
    end = date.today()

    summary: dict[str, Any] = {
        "started_at": datetime.utcnow().isoformat() + "Z",
        "long_lookback_days": long_lookback_days,
        "end_date": end.isoformat(),
        "series": {},
    }

    # Build a unified iteration plan combining long-history and current-cycle
    all_series: dict[str, dict[str, Any]] = {}
    for sid, meta in LONG_HISTORY_SERIES.items():
        all_series[sid] = {**meta, "category": "long_history"}
    for sid, meta in CURRENT_CYCLE_SERIES.items():
        all_series[sid] = {**meta, "category": "current_cycle"}

    targets = series_filter or list(all_series.keys())

    for series_id in targets:
        if series_id not in all_series:
            print(f"⚠️  Unknown series: {series_id}, skipping", file=sys.stderr)
            continue

        meta = all_series[series_id]
        category = meta["category"]

        # Determine date range
        if category == "long_history":
            start = end - timedelta(days=long_lookback_days)
        else:  # current_cycle
            start = end - timedelta(days=meta["lookback_days"])

        print(f"  Fetching {series_id} ({meta['label']}, {category})...", flush=True)

        try:
            obs = fetch_series(series_id, api_key, start, end)
        except RuntimeError as e:
            print(f"❌ {series_id}: {e}", file=sys.stderr)
            summary["series"][series_id] = {"status": "error", "error": str(e)}
            continue

        if not obs:
            print(f"❌ {series_id}: no observations returned", file=sys.stderr)
            summary["series"][series_id] = {"status": "error", "error": "empty"}
            continue

        non_null = [o for o in obs if o.value is not None]
        if not non_null:
            print(f"❌ {series_id}: all values null", file=sys.stderr)
            summary["series"][series_id] = {"status": "error", "error": "all_null"}
            continue

        # Write CSV
        csv_path = out_data_dir / f"fred_{series_id}.csv"
        write_csv(obs, csv_path, series_id)

        # Write TypeScript
        ts_path = out_ts_dir / meta["site_file"]
        write_typescript(
            obs,
            ts_path,
            series_id=series_id,
            label=meta["label"],
            unit_transform=meta["unit_transform"],
        )

        last = non_null[-1]
        first = non_null[0]
        scale = 100.0 if meta["unit_transform"] == "bps" else 1.0
        last_display = last.value * scale
        unit_str = "bps" if meta["unit_transform"] == "bps" else ""

        years = (last.obs_date - first.obs_date).days / 365.25
        print(
            f"  ✓ {series_id}: {len(non_null):,} non-null rows over {years:.1f}y, "
            f"latest {last.obs_date.isoformat()} = {last_display:.2f}{unit_str}"
        )

        summary["series"][series_id] = {
            "status": "ok",
            "category": category,
            "row_count": len(obs),
            "non_null_count": len(non_null),
            "first_date": first.obs_date.isoformat(),
            "latest_date": last.obs_date.isoformat(),
            "latest_value": last_display,
            "years_coverage": round(years, 2),
            "csv_path": str(csv_path),
            "ts_path": str(ts_path),
        }

    summary["completed_at"] = datetime.utcnow().isoformat() + "Z"
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description="Fulcrum Memo v4 FRED data pipeline")
    parser.add_argument(
        "--api-key",
        default=os.environ.get("FRED_API_KEY") or os.environ.get("VITE_FRED_API_KEY"),
        help="FRED API key (defaults to FRED_API_KEY or VITE_FRED_API_KEY env var)",
    )
    parser.add_argument(
        "--long-lookback-days",
        type=int,
        default=DEFAULT_LONG_LOOKBACK_DAYS,
        help=f"Lookback for long-history series (default: {DEFAULT_LONG_LOOKBACK_DAYS} = ~50 years)",
    )
    parser.add_argument(
        "--data-dir",
        default="data",
        help="Where to write CSVs (default: data/)",
    )
    parser.add_argument(
        "--ts-dir",
        default="src/data",
        help="Where to write TypeScript files (default: src/data/)",
    )
    parser.add_argument(
        "--series",
        nargs="+",
        help="Limit to specific series IDs (default: all)",
    )
    parser.add_argument(
        "--summary-out",
        help="Write JSON summary to this path (for CI consumption)",
    )
    args = parser.parse_args()

    if not args.api_key:
        print(
            "❌ No FRED API key provided. Set FRED_API_KEY or VITE_FRED_API_KEY, "
            "or pass --api-key. Get a free key at https://fredaccount.stlouisfed.org/",
            file=sys.stderr,
        )
        return 2

    summary = run_pipeline(
        args.api_key,
        out_data_dir=Path(args.data_dir),
        out_ts_dir=Path(args.ts_dir),
        long_lookback_days=args.long_lookback_days,
        series_filter=args.series,
    )

    if args.summary_out:
        Path(args.summary_out).write_text(json.dumps(summary, indent=2))

    failures = [
        sid for sid, info in summary["series"].items()
        if info.get("status") != "ok"
    ]
    if failures:
        print(f"\n⚠ {len(failures)} series failed: {', '.join(failures)}", file=sys.stderr)
        # One retired or rate-limited series (ICE BofA access on FRED has
        # changed more than once) must not freeze the whole dataset. Only
        # fail the job when the primary signal or every series failed, so
        # the series that did update still get committed.
        if "BAA10Y" in failures or len(failures) == len(summary["series"]):
            return 1
        return 0

    print(f"\n✓ All {len(summary['series'])} series pulled successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
