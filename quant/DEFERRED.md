# Deferred work — Fulcrum Memo

Maintenance memory for things the project knows it needs to do later but
isn't doing now. Each entry should explain *what* to do, *why* it's
deferred (not just "future work"), and *what triggers* the work.

---

## Sector rotation backtest — original workbook LOST, rebuild scoped

**Status (2026-11-14):** the original sector-rotation workbook
(`quant/data/fulcrum_sector_rotation_backtest.xlsx`) and its driver
script (`quant/scripts/backtest_sector_rotation.py`) are **not present
on the author's machine and not in the repo history**. A home-directory
search across `C:\Users\Amber` returned no file matching
`*sector_rotation*`, `*rotation_backtest*`, or
`backtest_sector_rotation.py`. The only remaining `.xlsx` in the quant
tree is `v4_weight_backtest.xlsx`, which does NOT contain the
Sharpe / drawdown / CAGR / GFC-case-study numbers that previously
sat on the page.

The Panel 2 hardcoded constants (`BACKTEST_METRICS`) have been
**removed from `src/pages/FulcrumIndex.tsx`** rather than left to rot
without a reproducible source. The page copy for Panel 2 now reads
"Backtest being rebuilt from committed code" and shows only the
qualitative Validated / Conditional / Not retained position lists.

**Numbers previously displayed (for reference during rebuild):**
- Window: 2006–2026 (20 years)
- Fulcrum Rotation Portfolio: Sharpe 0.51 / Max DD -31% / CAGR 9.6%
- SPY Buy-and-Hold: Sharpe 0.41 / Max DD -55% / CAGR 11.0%
- GFC case study: Fulcrum +9.6% vs SPY -19.8% (Oct 2007 → Mar 2010)

These are documentation of what was there; the rebuild must re-derive
them from first principles, not target them.

**Rebuild scope.** Land `quant/scripts/backtest_sector_rotation.py`.
It should reconstruct the regime-rotation portfolio from committed
data (quant/data/etf_*.csv + the regime bands from the composite),
using the Validated / Conditional positions already on the page.
Document at the top of the file:

- which ETF is held in each regime (Complacency / Latent Stress /
  Transmission Active / Cycle Imminent)
- rebalance timing (e.g., end-of-month quarter-trigger, or
  immediately-on-regime-change)
- how cash sleeves and transaction costs are handled

Report Sharpe, max drawdown, CAGR, and the Oct 2007 → Mar 2010 window
performance against SPY, with the exact start and end dates driving
the numbers. Zac reviews before any number returns to the page.

**Why removed rather than frozen:** the page's old headline was
"Validated against 20-year backtest," an accuracy claim tied to a
workbook that no longer exists. Leaving the claim in place while
the numbers can't be reproduced is exactly the artifact that erodes
trust when a careful reader asks to see the workbook.

---

## v4 weight rebalance (workbook-pending)

The composite uses v3-style weights (0.40 credit / 0.30 Brent / 0.30 VIX)
with BAA10Y substituted for HY OAS. The v4 weight backtest at
`quant/data/v4_weight_backtest.xlsx` validated this choice against the
proposed alternative weights (0.30 baa / 0.10 baa-velocity / 0.15 brent
/ 0.15 vix / 0.05 dgs10 / 0.10 yield-curve / 0.05 inflation / 0.10
dispersion).

**Status:** v3-style retained based on backtest. The MD callout's
methodology footnote cites this finding.

**When to revisit:** if a new cycle reveals a structural failure of the
current weights (e.g., a credit cycle that fires without VIX or Brent
participation, or a regime where the credit slot saturates while the
composite reads benign), revisit the alternative weights with fresh
backtest evidence.

---

## DGS10 stress component (parked)

`DGS10_BASELINES` is computed (rolling 10y median + 95th percentile) and
exported from `src/data/fulcrumIndex.ts` but not consumed by the
composite calculation. Wiring it in would be a v4 weight rebalance,
which is out of scope per the workbook backtest.

**When to act:** if the v4 weight rebalance is ever revisited (see
above), DGS10 stress would naturally come along with it. Until then,
the export stays as a hook for downstream callers (e.g., the workbook
session) without changing live page behavior.

---

## CCC-BB structural finding (analytical project)

The CCC-BB ratio has sat above the 3.5× canary threshold for the entire
3-year FRED window (median 4.48×). Two competing explanations:

1. **Structural shift in HY composition** — reach-for-yield era diluted
   the BB tier with downgraded former-IG, narrowing BB beta and raising
   the ratio mechanically.
2. **Sustained early-warning of a default cycle that hasn't fully
   materialized** — the framework is correctly flagging stress that the
   headline index has not priced.

**Status:** the page acknowledges both possibilities in the Canary
banner copy. Resolving which is correct requires academic CDS-tier
data and DealStats — not bundled in the current pipeline.

**When to act:** during a workbook session that has access to the
extended data sources. Outcome would be a fifth Finding in the v4
backtest workbook, not a page change.

---

## Brent forward-fill in pipeline

`brentSpotHistory.ts` lags BAA10Y / VIX by 2–3 trading days. The page
truncates `indexData` to `min(latest BAA, latest VIX, latest Brent)` to
avoid a misleadingly low credit-only readout for the latest rows.

**Cleaner alternative:** add a forward-fill rule (≤2 trading days) in
`quant/scripts/fetch_fred_data.py` so Brent's last observation can be
carried into the next BAA observation date.

**Why deferred:** cosmetic. Current truncation handles the case
correctly; the page just shows "as of N-3" instead of "as of N." Not
worth a pipeline change today.
