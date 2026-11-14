# Fulcrum Sector-Rotation Backtest — rebuild from committed data

_Generated 2026-11-14T17:38:20.178835+00:00._

## Rules

See the module docstring in `quant/scripts/backtest_sector_rotation.py`
for the full rule set. Summary:

- **Calm regimes** (Composite < 50 → Complacency, Latent Stress): 100% SPY.
- **Stress regimes** (Composite ≥ 50 → Transmission Active, Cycle Imminent):
  equal-weight ITA + USO + TLT (33.33% each).
- Rebalance on the first trading day of each month based on the prior
  month-end's regime (no look-ahead).
- Transaction cost 10 bps per side applied to turnover; no cash sleeve.
- Regime driven by credit-only composite (BAA10Y percentile against the
  145-600 bps fixed-range scale from `src/data/fulcrumIndex.ts`).

## Headline metrics

Window: **2006-05-05** to **2026-11-10** (20.52 years)

| Strategy | Sharpe (ann.) | Max drawdown | CAGR | $1 → $N |
|---|---:|---:|---:|---:|
| Fulcrum Rotation | 0.59 | -54.0% | 9.21% | $6.10 |
| SPY Buy & Hold | 0.63 | -55.2% | 10.82% | $8.23 |

## GFC sub-window (Oct 2007 → Mar 2010)

Actual trading-day window for Fulcrum: **2007-10-01** to **2010-03-31**.

Actual trading-day window for SPY:     **2007-10-01** to **2010-03-31**.

- Fulcrum Rotation: **-24.27%**
- SPY Buy & Hold:   **-19.80%**
