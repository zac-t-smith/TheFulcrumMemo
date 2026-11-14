"""
fetch_etf_data.py — Fulcrum Memo v4 ETF data pipeline (yfinance side)
======================================================================

Pulls ETF historical data via yfinance from inception through today.

Two tiers:
  - Page tickers (HYG / USO / GLD): emit BOTH a CSV under data/ AND a
    TypeScript file under src/data/ for the React site to bundle.
  - Research tickers (SPY / TLT / ITA / JETS / XLE / PFIX): emit CSV
    only. These feed the v4 backtest workbook, not the page. Marked by
    site_file=None in the ETFS dict.

Critical lesson from the v3 session: the previous Yahoo CSV downloads
contained scenario-augmented prices for early 2026 (USO at $138, GLD at
$495). Those were *real* prices reflecting the actual Iran conflict —
this confused the previous Claude session into calling them fictional.

The yfinance library pulls live data directly from Yahoo Finance,
bypassing any cache or contamination. Run fresh; verify the latest
values match what you can independently see on the Yahoo Finance
website. If your environment has a stale yfinance cache, `pip install
--upgrade yfinance` and clear `~/.cache/py-yfinance/` first.

Inception dates:
  Page tickers:
  - HYG : April 4, 2007  (iShares iBoxx $ High Yield Corporate Bond)
  - USO : April 10, 2006 (United States Oil Fund)
  - GLD : November 18, 2004 (SPDR Gold Shares)

  Research tickers:
  - SPY : January 29, 1993 (S&P 500 benchmark)
  - TLT : July 26, 2002 (long Treasuries — Fed-trap thesis)
  - ITA : May 5, 2006 (defense ETF)
  - JETS: April 30, 2015 (airlines ETF)
  - XLE : December 22, 1998 (energy producers)
  - PFIX: May 10, 2021 (long-vol / interest-rate hedge proxy)

Run locally:
    pip install -r requirements.txt
    python scripts/fetch_etf_data.py

Run in CI: see .github/workflows/update-fulcrum-data.yml
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from dataclasses import dataclass

# Match fetch_fred_data.py — force UTF-8 stdout so checkmarks render on Windows.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any


@dataclass
class EtfRow:
    obs_date: date
    close: float


# ETF configuration — single source of truth for what we pull and how
# it gets emitted.
ETFS: dict[str, dict[str, Any]] = {
    "HYG": {
        "label": "iShares iBoxx $ High Yield Corporate Bond ETF",
        "site_file": "hygHistory.ts",
        "inception": "2007-04-04",
        "role": "credit_etf_proxy",
    },
    "USO": {
        "label": "United States Oil Fund LP",
        "site_file": "usoHistory.ts",
        "inception": "2006-04-10",
        "role": "oil_proxy",
    },
    "GLD": {
        "label": "SPDR Gold Shares",
        "site_file": "gldHistory.ts",
        "inception": "2004-11-18",
        "role": "gold_proxy",
    },
    # Sector / thesis ETFs — research-side only. site_file=None means
    # CSV-only (no TS emission, no React-app bundling). These feed the
    # backtest workbook, not the page.
    "SPY": {
        "label": "SPDR S&P 500 ETF Trust",
        "site_file": None,
        "inception": "1993-01-29",
        "role": "market_proxy",
    },
    "TLT": {
        "label": "iShares 20+ Year Treasury Bond ETF",
        "site_file": None,
        "inception": "2002-07-26",
        "role": "rates_proxy",
    },
    "ITA": {
        "label": "iShares U.S. Aerospace & Defense ETF",
        "site_file": None,
        "inception": "2006-05-05",
        "role": "defense_proxy",
    },
    "JETS": {
        "label": "U.S. Global Jets ETF",
        "site_file": None,
        "inception": "2015-04-30",
        "role": "airlines_proxy",
    },
    "XLE": {
        "label": "Energy Select Sector SPDR Fund",
        "site_file": None,
        "inception": "1998-12-22",
        "role": "energy_producer_proxy",
    },
    "PFIX": {
        "label": "Simplify Interest Rate Hedge ETF",
        "site_file": None,
        "inception": "2021-05-10",
        "role": "long_vol_proxy",
    },
    # Sector ETFs for the v5 Phase 3 sector heat map. site_file set so each
    # lands in src/data/ for the React consumer. Inception dates are the
    # ETF's actual first trading date; yfinance returns the full history.
    "XLV": {
        "label": "Health Care Select Sector SPDR Fund",
        "site_file": "xlvHistory.ts",
        "inception": "1998-12-16",
        "role": "sector_proxy_healthcare",
    },
    "XLI": {
        "label": "Industrial Select Sector SPDR Fund",
        "site_file": "xliHistory.ts",
        "inception": "1998-12-16",
        "role": "sector_proxy_industrials",
    },
    "XLY": {
        "label": "Consumer Discretionary Select Sector SPDR Fund",
        "site_file": "xlyHistory.ts",
        "inception": "1998-12-16",
        "role": "sector_proxy_consumer_discretionary",
    },
    "XRT": {
        "label": "SPDR S&P Retail ETF",
        "site_file": "xrtHistory.ts",
        "inception": "2006-06-19",
        "role": "sector_proxy_retail",
    },
    "XLB": {
        "label": "Materials Select Sector SPDR Fund",
        "site_file": "xlbHistory.ts",
        "inception": "1998-12-16",
        "role": "sector_proxy_chemicals_materials",
    },
    "IGV": {
        "label": "iShares Expanded Tech-Software Sector ETF",
        "site_file": "igvHistory.ts",
        "inception": "2001-07-10",
        "role": "sector_proxy_software",
    },
    "XLC": {
        "label": "Communication Services Select Sector SPDR Fund",
        "site_file": "xlcHistory.ts",
        "inception": "2018-06-18",
        "role": "sector_proxy_telecom_media",
    },
    "CARZ": {
        "label": "First Trust NASDAQ Global Auto Index Fund",
        "site_file": "carzHistory.ts",
        "inception": "2011-05-10",
        "role": "sector_proxy_autos",
    },
    "IYT": {
        "label": "iShares U.S. Transportation ETF",
        "site_file": "iytHistory.ts",
        "inception": "2003-10-06",
        "role": "sector_proxy_transportation",
    },
    "XHB": {
        "label": "SPDR S&P Homebuilders ETF",
        "site_file": "xhbHistory.ts",
        "inception": "2006-01-31",
        "role": "sector_proxy_homebuilders",
    },
    "CRAK": {
        "label": "VanEck Oil Refiners ETF",
        "site_file": "crakHistory.ts",
        "inception": "2015-07-30",
        "role": "sector_proxy_refiners",
    },
    "VNQ": {
        "label": "Vanguard Real Estate ETF",
        "site_file": "vnqHistory.ts",
        "inception": "2004-09-23",
        "role": "sector_proxy_reits",
    },
}


def fetch_etf_via_yfinance(ticker: str, start: date, end: date) -> list[EtfRow]:
    """
    Pull daily Close data via yfinance. Imports yfinance lazily so the
    module loads even if yfinance isn't installed (the import fails only
    when this function is called).

    Returns sorted-ascending list of EtfRow with non-null Close values.
    """
    try:
        import yfinance as yf
    except ImportError as e:
        raise RuntimeError(
            "yfinance not installed. Run: pip install -r requirements.txt"
        ) from e

    # auto_adjust=True applies dividend/split adjustments. For HYG (which
    # pays monthly distributions) this matters a lot. For USO/GLD it's
    # essentially a no-op.
    df = yf.download(
        ticker,
        start=start.isoformat(),
        end=(end + timedelta(days=1)).isoformat(),  # yfinance end is exclusive
        progress=False,
        auto_adjust=True,
        actions=False,
    )

    if df is None or df.empty:
        raise RuntimeError(f"yfinance returned empty data for {ticker}")

    # yfinance can return a multi-index column structure when given a
    # single ticker — flatten it.
    if hasattr(df.columns, "nlevels") and df.columns.nlevels > 1:
        df.columns = df.columns.get_level_values(0)

    if "Close" not in df.columns:
        raise RuntimeError(
            f"{ticker}: 'Close' column not found in yfinance response. "
            f"Got columns: {list(df.columns)}"
        )

    out: list[EtfRow] = []
    for ts, row in df.iterrows():
        try:
            d = ts.date() if hasattr(ts, "date") else ts
            close_val = row["Close"]
            if close_val is None or (isinstance(close_val, float) and close_val != close_val):
                continue  # skip NaN
            out.append(EtfRow(obs_date=d, close=float(close_val)))
        except (KeyError, AttributeError, ValueError):
            continue

    out.sort(key=lambda r: r.obs_date)
    return out


def write_csv(rows: list[EtfRow], path: Path, ticker: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", f"{ticker}_close"])
        for r in rows:
            w.writerow([r.obs_date.isoformat(), f"{r.close:.4f}"])


def write_typescript(
    rows: list[EtfRow],
    path: Path,
    *,
    ticker: str,
    label: str,
) -> None:
    """
    Write a TypeScript data file consumable by the React site.
    Same canonical schema as the FRED pipeline.
    """
    path.parent.mkdir(parents=True, exist_ok=True)

    var_name = path.stem
    last_date = rows[-1].obs_date.isoformat() if rows else "n/a"
    last_close = rows[-1].close if rows else "n/a"
    first_date = rows[0].obs_date.isoformat() if rows else "n/a"

    lines: list[str] = []
    lines.append("// AUTO-GENERATED by scripts/fetch_etf_data.py — DO NOT EDIT BY HAND.")
    lines.append(f"// Source: Yahoo Finance via yfinance — ticker {ticker} ({label})")
    lines.append("// Units: USD (split- and dividend-adjusted close)")
    lines.append(f"// Coverage: {first_date} → {last_date} ({len(rows)} obs)")
    lines.append(f"// Generated: {datetime.utcnow().isoformat()}Z")
    lines.append("")
    lines.append('import type { DailyDataPoint } from "./types";')
    lines.append("")
    lines.append(f"export const {var_name}: DailyDataPoint[] = [")
    for r in rows:
        lines.append(f'  {{ date: "{r.obs_date.isoformat()}", value: {r.close:.4f} }},')
    lines.append("];")
    lines.append("")
    lines.append(f"export const {var_name}Meta = {{")
    lines.append(f'  ticker: "{ticker}",')
    lines.append(f'  label: {json.dumps(label)},')
    lines.append('  units: "USD (adjusted close)",')
    lines.append(f'  firstObservation: "{first_date}",')
    lines.append(f'  lastObservation: "{last_date}",')
    lines.append(f'  observationCount: {len(rows)},')
    lines.append("} as const;")
    lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")


def run_pipeline(
    *,
    out_data_dir: Path,
    out_ts_dir: Path,
    tickers_filter: list[str] | None = None,
) -> dict[str, Any]:
    end = date.today()
    summary: dict[str, Any] = {
        "started_at": datetime.utcnow().isoformat() + "Z",
        "end_date": end.isoformat(),
        "etfs": {},
    }

    targets = tickers_filter or list(ETFS.keys())

    for ticker in targets:
        if ticker not in ETFS:
            print(f"⚠️  Unknown ETF: {ticker}, skipping", file=sys.stderr)
            continue

        meta = ETFS[ticker]
        start = datetime.strptime(meta["inception"], "%Y-%m-%d").date()

        print(f"  Fetching {ticker} ({meta['label']})...", flush=True)

        try:
            rows = fetch_etf_via_yfinance(ticker, start, end)
        except RuntimeError as e:
            print(f"❌ {ticker}: {e}", file=sys.stderr)
            summary["etfs"][ticker] = {"status": "error", "error": str(e)}
            continue

        if not rows:
            print(f"❌ {ticker}: no rows returned", file=sys.stderr)
            summary["etfs"][ticker] = {"status": "error", "error": "empty"}
            continue

        csv_path = out_data_dir / f"etf_{ticker}.csv"
        write_csv(rows, csv_path, ticker)

        # Research-side tickers (site_file=None) emit CSV only.
        ts_path: Path | None = None
        if meta.get("site_file"):
            ts_path = out_ts_dir / meta["site_file"]
            write_typescript(rows, ts_path, ticker=ticker, label=meta["label"])

        years = (rows[-1].obs_date - rows[0].obs_date).days / 365.25
        print(
            f"  ✓ {ticker}: {len(rows):,} rows over {years:.1f}y, "
            f"latest {rows[-1].obs_date.isoformat()} = ${rows[-1].close:.2f}"
        )

        summary["etfs"][ticker] = {
            "status": "ok",
            "row_count": len(rows),
            "first_date": rows[0].obs_date.isoformat(),
            "latest_date": rows[-1].obs_date.isoformat(),
            "latest_value": rows[-1].close,
            "years_coverage": round(years, 2),
            "csv_path": str(csv_path),
            "ts_path": str(ts_path) if ts_path else None,
        }

    summary["completed_at"] = datetime.utcnow().isoformat() + "Z"
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description="Fulcrum Memo v4 ETF data pipeline")
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
        "--tickers",
        nargs="+",
        help="Limit to specific tickers (default: all configured in ETFS)",
    )
    parser.add_argument(
        "--summary-out",
        help="Write JSON summary to this path (for CI consumption)",
    )
    args = parser.parse_args()

    summary = run_pipeline(
        out_data_dir=Path(args.data_dir),
        out_ts_dir=Path(args.ts_dir),
        tickers_filter=args.tickers,
    )

    if args.summary_out:
        Path(args.summary_out).write_text(json.dumps(summary, indent=2))

    failures = [t for t, info in summary["etfs"].items() if info.get("status") != "ok"]
    if failures:
        print(f"\n⚠ {len(failures)} ETF(s) failed: {', '.join(failures)}", file=sys.stderr)
        if len(failures) == len(summary["etfs"]):
            return 1

    print(f"\n✓ All {len(summary['etfs'])} ETFs pulled successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
