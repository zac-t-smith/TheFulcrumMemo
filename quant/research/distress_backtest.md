# Fulcrum v5 Phase 4 — Distress Radar backtest

_Generated 2026-11-14T04:44:27.520651+00:00 from 53,822 panel rows across 48 quarter-ends against 1,316 Chapter 11 filings._

## Universe-coverage sanity check

Of the 1,316 Chapter 11 filers in the label set, **419 (31.8%)** appear in the universe panel at least once in the 12 months before filing. The others are below the $250m debt threshold, in excluded SIC codes (financials / REITs), had no reported XBRL facts at the required precision, or filed before their first annual filing was on record.

### First 10 missing names:

- 2015-01-09  0000826773  UniTek Global Services, Inc.  (CIK 0000826773)  — not in universe panel in the 12 months before filing
- 2015-01-09  0001379246  BODY CENTRAL CORP  (CIK 0001379246)  — not in universe panel in the 12 months before filing
- 2015-01-12  0000357108  ISC8 INC. /DE  (CIK 0000357108)  — not in universe panel in the 12 months before filing
- 2015-01-15  0000858395  CAESARS ENTERTAINMENT OPERATING COMPANY, INC.  (CIK 0000858395)  — not in universe panel in the 12 months before filing
- 2015-01-16  0000863456  WET SEAL INC  (CIK 0000863456)  — not in universe panel in the 12 months before filing
- 2015-01-22  0001137204  HIPCRICKET, INC.  (CIK 0001137204)  — not in universe panel in the 12 months before filing
- 2015-01-22  0001541354  Twin Cities Power Holdings, LLC  (CIK 0001541354)  — not in universe panel in the 12 months before filing
- 2015-01-23  0001393631  Xhibit Corp.  (CIK 0001393631)  — not in universe panel in the 12 months before filing
- 2015-01-26  0000049534  LIFE PARTNERS HOLDINGS INC  (CIK 0000049534)  — not in universe panel in the 12 months before filing
- 2015-01-28  0001014763  AMARILLO BIOSCIENCES INC  (AIMD, AIMDW)  (CIK 0001014763)  — not in universe panel in the 12 months before filing

## Score metrics

| Score | n rows | AUC (12m) | AUC (6m) | Top-decile prec 12m | Top-decile prec 6m | Median lead 12m (mo) | Hits 12m | Hits 6m |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Altman Z'' | 32,717 | 0.740 | 0.769 | 0.050 | 0.037 | 3.1 | 579 | 352 |
| Coverage (EBIT / Interest) | 44,193 | 0.725 | 0.745 | 0.047 | 0.032 | 3.9 | 774 | 467 |
| Net leverage (NetDebt / EBITDA) | 43,702 | 0.605 | 0.626 | 0.018 | 0.012 | 4.1 | 463 | 257 |
| Liquidity runway (months) | 18,160 | 0.520 | 0.529 | 0.033 | 0.019 | 4.6 | 502 | 303 |
| 24m maturity pressure | 41,473 | 0.549 | 0.559 | 0.027 | 0.017 | 3.9 | 665 | 398 |

### Read conventions
- Sign on net leverage and maturity-pressure scores is flipped so "top decile" always means riskiest.
- AUC is standard ROC-AUC with Mann-Whitney U. 0.5 = no signal; 0.7-0.8 = usable; ≥0.8 = strong.
- Top-decile precision = share of the panel's riskiest 10% at a quarter-end that file Chapter 11 within the next 6 or 12 months. Base rate is tiny (a few hundred filers over tens of thousands of rows), so any precision above ~2-3% is informative.
- Median lead time is measured only on top-decile true positives.

### Caveats worth repeating
- Flow quantities use the most recent FY (10-K) observation, so LTM is stale up to ~12 months. Quarterly LTM aggregation is a follow-up improvement.
- Merton distance-to-default and CHS failure probability aren't scored here. Both need stock-price history; Yahoo doesn't carry most delisted bankrupt tickers. The live radar runs those as add-ons on names that still have price feeds.
- The universe test excludes the market-cap-below-debt branch (no price panel in backtest). That branch stays live in the production radar.
