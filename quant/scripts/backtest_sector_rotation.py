"""
backtest_sector_rotation.py — Fulcrum v5 Position Framework rebuild
====================================================================

Reconstructs the regime-rotation portfolio from committed ETF + composite
data. The original workbook that previously backed the Panel 2 numbers
was lost, so this script reproduces the backtest from first principles
using the positions on the page.

Rules (printed in the output header for transparency)
------------------------------------------------------

Regime bands follow src/data/fulcrumIndex.ts getRiskRegime():
    0-24   Complacency
    25-49  Latent Stress
    50-74  Transmission Active
    75+    Cycle Imminent

Positions held in each regime:
    CALM     (Complacency, Latent Stress):     100% SPY
    STRESS   (Transmission Active, Cycle Imminent):
             equal-weight sleeve of ITA + USO + TLT, each 33.33%.

    - ITA  — defense  (Validated, Part I memo thesis)
    - USO  — crude oil (Validated, Part I)
    - TLT  — long duration (Conditional; works in credit-led stress,
             fails in inflation-led stress — kept because the stress
             regime being tested here is credit-led by construction)

    "Distressed" (manual screening) was listed on the page as a
    framework claim, not an ETF — excluded from the mechanical backtest.
    The retired positions (GLD long, JETS short) are also excluded.

Rebalance timing:
    - Portfolio marked daily.
    - The regime is observed on the last business day of month `m`.
    - If it differs from month `m-1`'s regime, the weights for month
      `m+1` flip to the new regime's sleeve. This one-month lag is the
      no-look-ahead version of "trade the regime change at close."
    - Weight drift between rebalances is allowed.

Transaction costs:
    - 10 bps per side applied to turnover at each rebalance (20 bps
      round-trip). Equal-weighted sleeves mean turnover at a regime
      flip is roughly 100% round-trip.

Cash:
    - None. Sleeves run fully invested.

Sample window:
    - Starts max of ETF inceptions in use (ITA 2006-05-05,
      USO 2006-04-10, TLT 2002-07-26, SPY 1993-01-29): 2006-05-05.
    - Ends on the latest common trading day across those four series.

Composite needed to drive the regime:
    - Uses the same v4 composite math as fulcrumIndex.ts:
      credit = baaPercentile(baa, floor=145, ceiling=600), scaled to 0-100.
    - Brent/VIX overlays are omitted for the long-history window
      (they clip pre-1990/2003 respectively). Credit-only composite is
      a defensible back-dated proxy and matches what the page's Panel 3
      regime-performance table is built from.

Metrics reported:
    - Sharpe (annualized), max drawdown, CAGR, final NAV vs starting $1.
    - Same for SPY buy-and-hold on the identical window.
    - GFC sub-window: Oct 2007 to Mar 2010 total returns with the exact
      trading-day start and end dates used for each.

Usage:
    python quant/scripts/backtest_sector_rotation.py \\
        --data-dir quant/data \\
        --out quant/research/sector_rotation_backtest.md
"""

from __future__ import annotations

import argparse
import csv
import math
import sys
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Iterable

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


# =============================================================================
# Config
# =============================================================================

# v4 composite credit-slot scaling. Kept in sync with src/data/fulcrumIndex.ts.
BAA_FLOOR = 145.0
BAA_CEILING = 600.0

# Regime bands (identical to getRiskRegime in fulcrumIndex.ts).
def regime_of(idx: float) -> str:
    if idx < 25:
        return "complacency"
    if idx < 50:
        return "latent_stress"
    if idx < 75:
        return "transmission_active"
    return "cycle_imminent"


CALM_REGIMES = {"complacency", "latent_stress"}
STRESS_REGIMES = {"transmission_active", "cycle_imminent"}

# Position weights per regime.
WEIGHTS_CALM = {"SPY": 1.00}
WEIGHTS_STRESS = {"ITA": 1 / 3, "USO": 1 / 3, "TLT": 1 / 3}

ETFS_USED = sorted({*WEIGHTS_CALM.keys(), *WEIGHTS_STRESS.keys()})

TRANSACTION_COST_BPS_PER_SIDE = 10
TRADING_DAYS_PER_YEAR = 252

# GFC sub-window — matches the number historically displayed on the page.
GFC_START = date(2007, 10, 1)
GFC_END = date(2010, 3, 31)


# =============================================================================
# Data loaders
# =============================================================================

@dataclass(frozen=True)
class DailyPoint:
    d: date
    v: float


def _load_date_value_csv(path: Path, value_col: str) -> list[DailyPoint]:
    out: list[DailyPoint] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                d = datetime.strptime(row["date"], "%Y-%m-%d").date()
                v = float(row[value_col])
                if not math.isfinite(v) or v == 0:
                    continue
                out.append(DailyPoint(d, v))
            except (KeyError, ValueError):
                continue
    out.sort(key=lambda p: p.d)
    return out


def load_etf(data_dir: Path, ticker: str) -> list[DailyPoint]:
    """ETF CSVs have columns `date` and `<TICKER>_close`."""
    return _load_date_value_csv(data_dir / f"etf_{ticker}.csv", f"{ticker}_close")


def load_baa(data_dir: Path) -> list[DailyPoint]:
    rows = _load_date_value_csv(data_dir / "fred_BAA10Y.csv", "BAA10Y")
    # FRED reports as percent; convert to bps.
    return [DailyPoint(r.d, r.v * 100.0) for r in rows]


# =============================================================================
# Composite + regime time-series
# =============================================================================

def baa_pctl(bps: float) -> float:
    span = BAA_CEILING - BAA_FLOOR
    if span <= 0:
        return 0.5
    return max(0.0, min(1.0, (bps - BAA_FLOOR) / span))


def build_regime_series(baa: list[DailyPoint]) -> dict[date, str]:
    """
    One regime per trading day. Composite is credit-only (see docstring).
    """
    out: dict[date, str] = {}
    for p in baa:
        idx = baa_pctl(p.v) * 100
        out[p.d] = regime_of(idx)
    return out


# =============================================================================
# Portfolio simulation
# =============================================================================

@dataclass
class Portfolio:
    """Tracks holdings as per-ETF dollar notional. NAV = sum of notionals."""
    holdings: dict[str, float]  # {ticker: notional}

    def nav(self) -> float:
        return sum(self.holdings.values())


def _last_business_day_of_month(dates: list[date]) -> list[date]:
    """Return the last date from `dates` in each distinct (year, month)."""
    by_ym: dict[tuple[int, int], date] = {}
    for d in dates:
        by_ym[(d.year, d.month)] = d  # dates are sorted ascending
    return sorted(by_ym.values())


def simulate(
    etf_px: dict[str, list[DailyPoint]],
    regime_by_date: dict[date, str],
) -> dict[str, list[tuple[date, float]]]:
    """
    Return {name: [(date, value), ...]} for:
      portfolio     — regime-rotation NAV
      spy           — SPY buy-and-hold NAV on the same days
    Both start at $1.00 on the first common date.
    """
    # Join all ETFs to a common daily grid, keeping only days where every ETF
    # used (plus BAA for the regime) has a price.
    etf_maps = {t: {p.d: p.v for p in etf_px[t]} for t in ETFS_USED}
    all_dates = sorted(
        set.intersection(*[set(m.keys()) for m in etf_maps.values()])
        & set(regime_by_date.keys())
    )
    if not all_dates:
        return {"portfolio": [], "spy": []}

    # Forward-fill regime to turn trading-day set into a regime-per-day series.
    regime_on: dict[date, str] = {}
    last_r: str | None = None
    all_quoted_dates = sorted(regime_by_date.keys())
    j = 0
    for d in all_dates:
        while j + 1 < len(all_quoted_dates) and all_quoted_dates[j + 1] <= d:
            j += 1
        last_r = regime_by_date[all_quoted_dates[j]] if all_quoted_dates else None
        regime_on[d] = last_r

    # Month-end rebalance points. The regime observed at month m's last
    # trading day sets the weights for all trading days INSIDE month m+1.
    month_ends = _last_business_day_of_month(all_dates)
    regime_for_following_month: dict[tuple[int, int], str] = {}
    for me in month_ends:
        y, m = (me.year + 1, 1) if me.month == 12 else (me.year, me.month + 1)
        regime_for_following_month[(y, m)] = regime_on[me]
    # First month has no prior month-end — use the first available regime.
    first = all_dates[0]
    regime_for_following_month.setdefault(
        (first.year, first.month), regime_on[first]
    )

    pf = Portfolio(holdings={t: 0.0 for t in ETFS_USED})
    # Seed with $1 at the first day's weights.
    seed_r = regime_for_following_month.get((first.year, first.month))
    seed_w = WEIGHTS_STRESS if seed_r in STRESS_REGIMES else WEIGHTS_CALM
    for t, w in seed_w.items():
        pf.holdings[t] = w  # $1 total

    cost_bps = TRANSACTION_COST_BPS_PER_SIDE / 10000.0
    last_m: tuple[int, int] = (first.year, first.month)

    portfolio_nav: list[tuple[date, float]] = []
    spy_nav: list[tuple[date, float]] = []
    spy_shares = 1.0 / etf_maps["SPY"][first]  # buy $1 worth of SPY

    for i, d in enumerate(all_dates):
        ym = (d.year, d.month)
        if ym != last_m:
            # Entering a new month: rebalance to the regime observed at the
            # prior month's close.
            target_r = regime_for_following_month.get(ym, regime_on[d])
            target_w = WEIGHTS_STRESS if target_r in STRESS_REGIMES else WEIGHTS_CALM
            total = pf.nav()
            target = {t: total * target_w.get(t, 0.0) for t in ETFS_USED}
            # Turnover = sum |target - current| / total; apply cost per side
            # (so a full rebalance between two disjoint sleeves costs ~2 x bps).
            turnover = sum(abs(target[t] - pf.holdings[t]) for t in ETFS_USED)
            cost = turnover * cost_bps
            # Scale all target holdings down to pay the cost from NAV.
            scale = (total - cost) / total if total > 0 else 0.0
            pf.holdings = {t: target[t] * scale for t in ETFS_USED}
            last_m = ym
        # Mark-to-market: scale each holding by its ETF's return relative to
        # its prior close.
        if i > 0:
            prev_d = all_dates[i - 1]
            for t in ETFS_USED:
                r = etf_maps[t][d] / etf_maps[t][prev_d]
                pf.holdings[t] *= r
        portfolio_nav.append((d, pf.nav()))
        spy_nav.append((d, spy_shares * etf_maps["SPY"][d]))

    return {"portfolio": portfolio_nav, "spy": spy_nav}


# =============================================================================
# Metrics
# =============================================================================

@dataclass
class Metrics:
    start: date
    end: date
    years: float
    cagr: float
    sharpe: float
    max_dd: float
    final_nav: float


def _returns(nav: list[tuple[date, float]]) -> list[float]:
    out = []
    for i in range(1, len(nav)):
        prev = nav[i - 1][1]
        if prev <= 0:
            continue
        out.append(nav[i][1] / prev - 1.0)
    return out


def metrics(nav: list[tuple[date, float]]) -> Metrics:
    if len(nav) < 2:
        return Metrics(date.min, date.min, 0, 0, 0, 0, 0)
    start_d = nav[0][0]
    end_d = nav[-1][0]
    years = (end_d - start_d).days / 365.25
    final = nav[-1][1] / nav[0][1]
    cagr = final ** (1 / years) - 1 if years > 0 and final > 0 else 0.0

    rets = _returns(nav)
    if not rets:
        return Metrics(start_d, end_d, years, cagr, 0, 0, final)
    mean = sum(rets) / len(rets)
    var = sum((r - mean) ** 2 for r in rets) / max(1, len(rets) - 1)
    sd = math.sqrt(var)
    sharpe = (mean * TRADING_DAYS_PER_YEAR) / (sd * math.sqrt(TRADING_DAYS_PER_YEAR)) if sd > 0 else 0.0

    peak = -math.inf
    max_dd = 0.0
    for _, v in nav:
        if v > peak:
            peak = v
        if peak > 0:
            dd = v / peak - 1.0
            if dd < max_dd:
                max_dd = dd

    return Metrics(start_d, end_d, years, cagr, sharpe, max_dd, final)


def window_return(
    nav: list[tuple[date, float]], start: date, end: date,
) -> tuple[date, date, float] | None:
    """Return ((actual_start, actual_end), total_return)."""
    first = next((p for p in nav if p[0] >= start), None)
    last = next((p for p in reversed(nav) if p[0] <= end), None)
    if first is None or last is None or first[0] >= last[0]:
        return None
    return first[0], last[0], last[1] / first[1] - 1.0


# =============================================================================
# Driver
# =============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(description="Fulcrum sector-rotation backtest rebuild")
    parser.add_argument("--data-dir", default="quant/data")
    parser.add_argument("--out", default="quant/research/sector_rotation_backtest.md")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)

    print("  Loading ETFs:", ", ".join(ETFS_USED))
    etf_px = {t: load_etf(data_dir, t) for t in ETFS_USED}
    for t, p in etf_px.items():
        if not p:
            print(f"ERROR: no data for {t}", file=sys.stderr)
            return 2
        print(f"    {t}: {p[0].d} to {p[-1].d} ({len(p):,} days)")

    print("  Loading BAA10Y...")
    baa = load_baa(data_dir)
    print(f"    BAA10Y: {baa[0].d} to {baa[-1].d} ({len(baa):,} days)")

    regime = build_regime_series(baa)
    print("  Simulating...")
    sim = simulate(etf_px, regime)

    pf_metrics = metrics(sim["portfolio"])
    spy_metrics = metrics(sim["spy"])

    gfc_pf = window_return(sim["portfolio"], GFC_START, GFC_END)
    gfc_spy = window_return(sim["spy"], GFC_START, GFC_END)

    print()
    print(f"  Window: {pf_metrics.start} to {pf_metrics.end} ({pf_metrics.years:.2f} years)")
    print(f"  Fulcrum Rotation: Sharpe {pf_metrics.sharpe:.2f} | MaxDD {pf_metrics.max_dd*100:.1f}% | CAGR {pf_metrics.cagr*100:.2f}%")
    print(f"  SPY Buy & Hold:   Sharpe {spy_metrics.sharpe:.2f} | MaxDD {spy_metrics.max_dd*100:.1f}% | CAGR {spy_metrics.cagr*100:.2f}%")
    if gfc_pf and gfc_spy:
        print(f"  GFC sub-window Fulcrum: {gfc_pf[0]} to {gfc_pf[1]}, return {gfc_pf[2]*100:+.2f}%")
        print(f"  GFC sub-window SPY:     {gfc_spy[0]} to {gfc_spy[1]}, return {gfc_spy[2]*100:+.2f}%")

    # Markdown
    md = [
        "# Fulcrum Sector-Rotation Backtest — rebuild from committed data\n",
        f"_Generated {datetime.now(timezone.utc).isoformat()}._\n",
        "## Rules\n",
        "See the module docstring in `quant/scripts/backtest_sector_rotation.py`",
        "for the full rule set. Summary:\n",
        "- **Calm regimes** (Composite < 50 → Complacency, Latent Stress): 100% SPY.",
        "- **Stress regimes** (Composite ≥ 50 → Transmission Active, Cycle Imminent):",
        "  equal-weight ITA + USO + TLT (33.33% each).",
        "- Rebalance on the first trading day of each month based on the prior",
        "  month-end's regime (no look-ahead).",
        "- Transaction cost 10 bps per side applied to turnover; no cash sleeve.",
        "- Regime driven by credit-only composite (BAA10Y percentile against the",
        "  145-600 bps fixed-range scale from `src/data/fulcrumIndex.ts`).\n",
        "## Headline metrics\n",
        f"Window: **{pf_metrics.start.isoformat()}** to **{pf_metrics.end.isoformat()}** ({pf_metrics.years:.2f} years)\n",
        "| Strategy | Sharpe (ann.) | Max drawdown | CAGR | $1 → $N |",
        "|---|---:|---:|---:|---:|",
        f"| Fulcrum Rotation | {pf_metrics.sharpe:.2f} | {pf_metrics.max_dd*100:.1f}% | {pf_metrics.cagr*100:.2f}% | ${pf_metrics.final_nav:.2f} |",
        f"| SPY Buy & Hold | {spy_metrics.sharpe:.2f} | {spy_metrics.max_dd*100:.1f}% | {spy_metrics.cagr*100:.2f}% | ${spy_metrics.final_nav:.2f} |",
        "",
        "## GFC sub-window (Oct 2007 → Mar 2010)\n",
    ]
    if gfc_pf and gfc_spy:
        md.extend([
            f"Actual trading-day window for Fulcrum: **{gfc_pf[0].isoformat()}** to "
            f"**{gfc_pf[1].isoformat()}**.\n",
            f"Actual trading-day window for SPY:     **{gfc_spy[0].isoformat()}** to "
            f"**{gfc_spy[1].isoformat()}**.\n",
            f"- Fulcrum Rotation: **{gfc_pf[2]*100:+.2f}%**",
            f"- SPY Buy & Hold:   **{gfc_spy[2]*100:+.2f}%**",
        ])
    else:
        md.append("Window outside sample — no result.")
    md.append("")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(md), encoding="utf-8")
    print(f"  wrote {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
