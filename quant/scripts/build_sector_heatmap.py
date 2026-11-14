"""
build_sector_heatmap.py — Fulcrum v5 Phase 3 (build-time)
================================================================

Computes the Market column of the sector heat map and writes
src/data/sectorHeatMap.json. Moves the computation out of the browser
so the React page doesn't need to bundle thirteen daily ETF histories
(~2.5 MB uncompressed, ~500 KB gzipped).

For each sector ETF, at each daily observation after a 52-week warm-up:
  - drawdown  = price / 52w_high - 1
  - vol_3m    = annualized stdev of daily log returns, trailing 63 days
  - pctls are rank-average against the ETF's own trailing history
  - market_score = mean(drawdown_pctl, vol_pctl) × 100
  - change_3m    = market_score - market_score(63 trading days prior)

Shock column and sector metadata are STATIC — defined here as the single
source of truth. Realized and Fundamentals columns stay dynamic in the
browser so manual_inputs edits reflect without a pipeline run.

Inputs:  quant/data/etf_<TICKER>.csv (produced by fetch_etf_data.py)
Output:  src/data/sectorHeatMap.json
"""

from __future__ import annotations

import argparse
import bisect
import csv
import json
import math
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Iterable, Literal

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# =============================================================================
# CONFIG
# =============================================================================

TRADING_DAYS_52W = 252
TRADING_DAYS_3M = 63

ShockSign = Literal["drag", "benefit", "mixed"]

# Static sector definitions. Mirrors the TS SECTORS block exactly — this is
# the single source of truth; the TS file consumes this via sectorHeatMap.json.
SECTORS: list[dict] = [
    {
        "id": "healthcare_providers",
        "label": "Healthcare providers",
        "etf": "XLV",
        "manual_input_sector_tag": "healthcare_providers",
        "shock": {"score": 2, "sign": "drag",
                  "rationale": "Thin direct energy exposure; wage and supply-cost pass-through limited."},
    },
    {
        "id": "industrials_manufacturing",
        "label": "Industrials & manufacturing",
        "etf": "XLI",
        "manual_input_sector_tag": "industrials_manufacturing",
        "shock": {"score": 3, "sign": "drag",
                  "rationale": "Freight and energy inputs lift COGS; mixed order-book response to oil shocks."},
    },
    {
        "id": "consumer_discretionary",
        "label": "Consumer discretionary",
        "etf": "XLY",
        "manual_input_sector_tag": "consumer_discretionary",
        "shock": {"score": 3, "sign": "drag",
                  "rationale": "Gas-price drag on real household spending; big-ticket demand especially sensitive."},
    },
    {
        "id": "retail",
        "label": "Retail",
        "etf": "XRT",
        "manual_input_sector_tag": "retail",
        "shock": {"score": 3, "sign": "drag",
                  "rationale": "Logistics-cost pass-through hits margin; discretionary categories bear discretionary spend cuts."},
    },
    {
        "id": "restaurants",
        "label": "Restaurants",
        "etf": None,
        "manual_input_sector_tag": "restaurants",
        "shock": {"score": 3, "sign": "drag",
                  "rationale": "Commodity-food input inflation plus gas-price-driven traffic drop; no clean sector ETF."},
    },
    {
        "id": "chemicals",
        "label": "Chemicals / materials",
        "etf": "XLB",
        "manual_input_sector_tag": "chemicals",
        "shock": {"score": 5, "sign": "drag",
                  "rationale": "Direct feedstock cost from naphtha and natural gas; margin compresses fast on supply shocks."},
    },
    {
        "id": "software",
        "label": "Software",
        "etf": "IGV",
        "manual_input_sector_tag": "software",
        "shock": {"score": 1, "sign": "drag",
                  "rationale": "Minimal energy or freight exposure; indirect only through customer IT budget cycles."},
    },
    {
        "id": "telecom_media",
        "label": "Telecom / media",
        "etf": "XLC",
        "manual_input_sector_tag": "telecom_media",
        "shock": {"score": 1, "sign": "drag",
                  "rationale": "Low direct exposure; ad-spend cyclicality dominates and runs on different cycle."},
    },
    {
        "id": "autos_parts",
        "label": "Autos & parts",
        "etf": "CARZ",
        "manual_input_sector_tag": "autos_parts",
        "shock": {"score": 4, "sign": "drag",
                  "rationale": "Commodity inputs plus gas-price drag on discretionary big-ticket demand."},
    },
    {
        "id": "transportation",
        "label": "Transportation (airlines + trucking)",
        "etf": "IYT",
        "manual_input_sector_tag": "transportation",
        "shock": {"score": 5, "sign": "drag",
                  "rationale": "Fuel is a direct first-line COGS. Airlines (JETS proxy) identical profile; captured in this row."},
    },
    {
        "id": "building_products",
        "label": "Building / homebuilders",
        "etf": "XHB",
        "manual_input_sector_tag": "building_products",
        "shock": {"score": 3, "sign": "drag",
                  "rationale": "Mortgage-rate transmission via Fed-trapped inflation is the dominant channel; direct energy exposure secondary."},
    },
    {
        "id": "energy_ep",
        "label": "Energy — majors & E&P",
        "etf": "XLE",
        "manual_input_sector_tag": "energy_ep",
        "shock": {"score": 4, "sign": "benefit",
                  "rationale": "Topline is oil price; E&P margins expand on supply shocks. Benefit, not drag."},
    },
    {
        "id": "energy_refiners",
        "label": "Energy — refiners",
        "etf": "CRAK",
        "manual_input_sector_tag": "energy_refiners",
        "shock": {"score": 3, "sign": "mixed",
                  "rationale": "Crack spreads widen on supply shocks (benefit) but feedstock cost rises (drag). Net sign depends on refined-product tightness."},
    },
    {
        "id": "commercial_real_estate",
        "label": "Commercial real estate / office",
        "etf": "VNQ",
        "manual_input_sector_tag": "commercial_real_estate",
        "shock": {"score": 2, "sign": "drag",
                  "rationale": "Indirect transmission via rates and discount-rate re-pricing; office vacancies dominate the live story."},
    },
]

# =============================================================================
# ETF loader
# =============================================================================

def load_etf_csv(path: Path) -> list[tuple[date, float]]:
    """Read a (date, <ticker>_close) CSV and return a sorted list of rows."""
    out: list[tuple[date, float]] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            return out
        value_col = next((c for c in reader.fieldnames if c.endswith("_close")), None)
        if value_col is None:
            return out
        for row in reader:
            try:
                d = datetime.strptime(row["date"], "%Y-%m-%d").date()
                v = float(row[value_col])
                if v > 0:
                    out.append((d, v))
            except (KeyError, ValueError):
                continue
    out.sort()
    return out

# =============================================================================
# Market-column math
# =============================================================================

def compute_signals(h: list[tuple[date, float]]) -> list[tuple[date, float, float]]:
    """Return (date, drawdown, vol_3m) for every observation after the 52w warm-up."""
    out: list[tuple[date, float, float]] = []
    if len(h) < TRADING_DAYS_52W + TRADING_DAYS_3M + 1:
        return out
    for i in range(TRADING_DAYS_52W, len(h)):
        # 52-week high ending at i (inclusive).
        hi = -math.inf
        for j in range(i - TRADING_DAYS_52W + 1, i + 1):
            if h[j][1] > hi:
                hi = h[j][1]
        if hi <= 0:
            continue
        drawdown = h[i][1] / hi - 1.0

        if i < TRADING_DAYS_3M + 1:
            continue
        # 3-month realized vol from daily log returns ending at i.
        rets: list[float] = []
        for j in range(i - TRADING_DAYS_3M + 1, i + 1):
            p0, p1 = h[j - 1][1], h[j][1]
            if p0 > 0 and p1 > 0:
                rets.append(math.log(p1 / p0))
        if len(rets) < 10:
            continue
        mean = sum(rets) / len(rets)
        variance = sum((r - mean) ** 2 for r in rets) / (len(rets) - 1)
        vol = math.sqrt(variance * 252)
        out.append((h[i][0], drawdown, vol))
    return out


def rolling_pctl(values: Iterable[float]) -> list[float]:
    """Rank-average rolling true-historical percentile at each step."""
    window: list[float] = []
    out: list[float] = []
    for v in values:
        lo = bisect.bisect_left(window, v)
        window.insert(lo, v)
        hi = bisect.bisect_right(window, v)
        out.append((lo + hi) / (2 * len(window)))
    return out


def market_column(etf_history: list[tuple[date, float]]) -> dict | None:
    signals = compute_signals(etf_history)
    if not signals:
        return None
    dd_inverted = [-s[1] for s in signals]  # more negative drawdown → higher stress pctl
    vol_vals = [s[2] for s in signals]
    dd_pctls = rolling_pctl(dd_inverted)
    vol_pctls = rolling_pctl(vol_vals)
    scores = [((d + v) / 2) * 100 for d, v in zip(dd_pctls, vol_pctls)]

    last = len(scores) - 1
    prior = max(0, last - TRADING_DAYS_3M)
    change = scores[last] - scores[prior]
    if abs(change) < 3:
        arrow = "flat"
    elif change > 0:
        arrow = "up"
    else:
        arrow = "down"

    return {
        "drawdown_6m": signals[last][1],
        "drawdown_pctl": round(dd_pctls[last] * 1000) / 10,
        "vol_3m": signals[last][2],
        "vol_pctl": round(vol_pctls[last] * 1000) / 10,
        "score": round(scores[last] * 10) / 10,
        "score_3m_ago": round(scores[prior] * 10) / 10,
        "change_3m": round(change * 10) / 10,
        "change_arrow": arrow,
    }

# =============================================================================
# Driver
# =============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(description="Fulcrum v5 sector heat map builder")
    parser.add_argument("--data-dir", default="quant/data", help="CSV source dir")
    parser.add_argument("--out", default="src/data/sectorHeatMap.json", help="JSON output")
    parser.add_argument("--summary-out", help="Optional summary JSON")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)

    print(f"  Building sector heat map from {data_dir} …", flush=True)
    as_of_date: date | None = None
    rows: list[dict] = []

    for sector in SECTORS:
        market: dict | None = None
        history_start: str | None = None
        if sector["etf"]:
            csv_path = data_dir / f"etf_{sector['etf']}.csv"
            if not csv_path.exists():
                print(f"  ⚠  {sector['etf']}: CSV not found at {csv_path}", file=sys.stderr)
            else:
                h = load_etf_csv(csv_path)
                if h:
                    history_start = h[0][0].isoformat()
                    last_date = h[-1][0]
                    if as_of_date is None or last_date > as_of_date:
                        as_of_date = last_date
                    market = market_column(h)
                    if market is None:
                        print(f"  ⚠  {sector['etf']}: insufficient history for signals", file=sys.stderr)

        rows.append({
            "id": sector["id"],
            "label": sector["label"],
            "etf": sector["etf"],
            "history_start": history_start,
            "manual_input_sector_tag": sector["manual_input_sector_tag"],
            "market": market,
            "shock": sector["shock"],
        })
        if market:
            print(
                f"  ✓ {sector['id']:28s} {sector['etf'] or '—':6s} "
                f"score={market['score']:>5.1f} (3m {market['change_arrow']}, "
                f"since {history_start})"
            )
        else:
            print(f"  · {sector['id']:28s} {sector['etf'] or '—':6s} (no market data)")

    out = {
        "schema_version": 1,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "as_of_date": as_of_date.isoformat() if as_of_date else None,
        "config": {
            "trading_days_52w": TRADING_DAYS_52W,
            "trading_days_3m": TRADING_DAYS_3M,
            "disagreement_threshold_pctl": 40,
        },
        "rows": rows,
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2))
    print(f"  ✓ Wrote {out_path}")

    if args.summary_out:
        Path(args.summary_out).write_text(json.dumps({
            "generated_at": out["generated_at"],
            "as_of_date": out["as_of_date"],
            "rows_with_market": sum(1 for r in rows if r["market"] is not None),
            "rows_total": len(rows),
        }, indent=2))

    return 0


if __name__ == "__main__":
    sys.exit(main())
