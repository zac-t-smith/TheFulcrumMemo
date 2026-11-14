# Fulcrum v5 Phase 4 — Distress Radar backtest (v3)

_Generated 2026-11-14T16:14:53.830602+00:00. Panel (before SIC filter): 232,994 rows; v2 SIC rule: 153,936 rows; v3 SIC rule: 160,440 rows (after in-case drop: 158,184; 2,256 dropped). Filings (2012-2026): 1,592 raw → after registrant-is-debtor filter and case-start collapse: **880 cases** (24 Chapter 22)._

## Label-set composition

Classifier output (all 1,665 Item 1.03 filings before case collapse):

- **Chapter 11:** 1,413
- **Chapter 15 (foreign proceedings):** 12
- **Chapter 7:** 87
- **Receivership:** 151
- **Registrant NOT debtor (parent about subsidiary):** 73 — dropped

After dropping parent-about-subsidiary filings, collapsing to case starts (first Item 1.03 per CIK, with Chapter 22 refilings opening a new case at ≥24-month gap), and the chapter-classifier:

- chapter_11: 710
- chapter_15: 7
- chapter_7: 73
- receivership: 89
- unknown: 1

## Coverage by company — both SIC exclusion rules side-by-side

### v2 rule — exclude SIC 6000-6799

Overall: **280 / 856 (32.7%)** of distinct bankrupt companies appear in the panel in the 24 months before their first petition.
Liabilities ≥ $250m subset: **215 / 247 (87.0%)** covered.

### v3 rule — exclude SIC 6000-6499 and 6798 only

Overall: **285 / 856 (33.3%)** of distinct bankrupt companies appear in the panel in the 24 months before their first petition.
Liabilities ≥ $250m subset: **220 / 247 (89.1%)** covered.

### v3 rule — misses with liabilities ≥ $250m (27 companies)

| Petition | Chapter | Name | CIK | Liabilities | Last debt / source | SIC | Reason |
|---|---|---|---|---:|---|---:|---|
| 2015-03-02 | receivership | DORAL FINANCIAL CORP  (CIK 0000840889) | 0000840889 | $7.8B | $7.4B / total | 6029 | excluded SIC 6029 |
| 2015-09-17 | receivership | AFFIRMATIVE INSURANCE HOLDINGS INC  (CIK 0001282543) | 0001282543 | $448M | $287M / instruments(secured_debt+notes_payable+debt_instrument_carrying) | 6331 | excluded SIC 6331 |
| 2016-02-04 | chapter_11 | RCS Capital Corp  (CIK 0001568832) | 0001568832 | $1.4B | $785M / total | 6211 | excluded SIC 6211 |
| 2017-04-24 | chapter_11 | ADAMS RESOURCES & ENERGY, INC.  (AE)  (CIK 0000002178) | 0000002178 | $291M | — / — | 5172 | no row in 24m pre-petition window |
| 2017-05-04 | receivership | First NBC Bank Holding Co  (CIK 0001496631) | 0001496631 | $4.4B | $302M / total+st | 6022 | excluded SIC 6022 |
| 2017-12-01 | chapter_11 | WALTER INVESTMENT MANAGEMENT CORP  (CIK 0001040719) | 0001040719 | $15.7B | $2.7B / instruments(secured_debt+debt_instrument_carrying) | 6162 | excluded SIC 6162 |
| 2017-12-12 | chapter_11 | J.G. Wentworth Co  (CIK 0001580185) | 0001580185 | $5.1B | — / — | 6199 | excluded SIC 6199 |
| 2018-12-14 | chapter_11 | EMERGENT CAPITAL, INC.  (CIK 0001494448) | 0001494448 | $466M | $167M / instruments(secured_debt+notes_payable)+st | 6311 | excluded SIC 6311 |
| 2019-07-25 | chapter_11 | LendingTree, Inc.  (TREE)  (CIK 0001434621) | 0001434621 | $640M | $439M / split | 6163 | excluded SIC 6163 |
| 2019-09-03 | chapter_11 | RAIT Financial Trust  (CIK 0001045425) | 0001045425 | $665M | $643M / instruments(debt_instrument_carrying) | 6798 | excluded SIC 6798 |
| 2020-11-03 | chapter_11 | PENNSYLVANIA REAL ESTATE INVESTMENT TRUST  (CIK 0000077281) | 0000077281 | $2.0B | $1.0B / instruments(convertible_notes+secured_debt) | 6798 | excluded SIC 6798 |
| 2021-05-19 | chapter_11 | Hospitality Investors Trust, Inc.  (CIK 0001583077) | 0001583077 | $1.4B | $3.7B / instruments(secured_debt+debt_instrument_carrying)+st | 6798 | excluded SIC 6798 |
| 2021-06-14 | chapter_11 | WASHINGTON PRIME GROUP INC.  (CIK 0001594686) | 0001594686 | $3.5B | $5.3B / instruments(senior_notes+secured_debt+notes_payable+debt_instrument_carrying) | 6798 | excluded SIC 6798 |
| 2021-08-12 | chapter_11 | CBL & ASSOCIATES PROPERTIES INC  (CBL)  (CIK 0000910612) | 0000910612 | $4.0B | $3.4B / instruments(debt_instrument_carrying) | 6798 | excluded SIC 6798 |
| 2022-03-01 | chapter_15 | Atlas Financial Holdings, Inc.  (AFHIF)  (CIK 0001539894) | 0001539894 | $406M | $67M / instruments(notes_payable+debt_instrument_carrying)+st | 6331 | excluded SIC 6331 |
| 2022-04-20 | chapter_11 | GWG Holdings, Inc.  (CIK 0001522690) | 0001522690 | $2.1B | $2.4B / instruments(senior_notes+secured_debt+notes_payable)+st | 6311 | excluded SIC 6311 |
| 2022-12-12 | chapter_11 | FedNat Holding Co  (CIK 0001069996) | 0001069996 | $1.2B | $126M / instruments(debt_instrument_carrying)+st | 6331 | excluded SIC 6331 |
| 2022-12-21 | chapter_11 | Core Scientific, Inc./tx  (CORZ, CORZR, CORZW, CORZZ)  (CIK 0001839341) | 0001839341 | $1.4B | — / — | 6199 | excluded SIC 6199 |
| 2023-03-10 | receivership | SVB FINANCIAL GROUP  (SIVBQ)  (CIK 0000719739) | 0000719739 | $197.1B | $16.9B / total+st | 6022 | excluded SIC 6022 |
| 2023-10-13 | chapter_11 | RVL Pharmaceuticals plc  (RVLPQ)  (CIK 0001739426) | 0001739426 | $267M | $434M / split | 2834 | no row in 24m pre-petition window |
| 2024-02-26 | chapter_11 | CorEnergy Infrastructure Trust, Inc.  (CIK 0001347652) | 0001347652 | $254M | $326M / instruments(secured_debt+debt_instrument_carrying) | 6798 | excluded SIC 6798 |
| 2024-03-25 | chapter_11 | CURO Group Holdings Corp.  (CIK 0001711291) | 0001711291 | $2.2B | $2.6B / instruments(debt_instrument_carrying) | 6199 | excluded SIC 6199 |
| 2024-04-29 | receivership | REPUBLIC FIRST BANCORP INC  (FRBK, FRBKQ)  (CIK 0000834285) | 0000834285 | $5.8B | $646M / st_only | 6022 | excluded SIC 6022 |
| 2024-12-03 | chapter_11 | Independence Contract Drilling, Inc.  (ICDI)  (CIK 0001537028) | 0001537028 | $251M | $150M / instruments(debt_instrument_carrying)+st | 1381 | no row in 24m pre-petition window |
| 2024-12-30 | chapter_11 | BIORA THERAPEUTICS, INC.  (BIOR)  (CIK 0001580063) | 0001580063 | $275M | $1M / instruments(other_ltd_noncurrent) | 2834 | no row in 24m pre-petition window |
| 2025-09-17 | receivership | SPI Energy Co., Ltd.  (SPIEF)  (CIK 0001210618) | 0001210618 | $415M | $178M / total+st | 3674 | no row in 24m pre-petition window |
| 2026-06-23 | chapter_11 | SANGAMO THERAPEUTICS, INC  (SGMO)  (CIK 0001001233) | 0001001233 | $268M | — / — | 2836 | no row in 24m pre-petition window |

## Score metrics — v3 SIC rule, full sample

| Score | n rows | base 12m | AUC 12m | AUC 6m | Top-10% prec 12m | Lift 12m | Top-10% prec 6m | Lift 6m | Co. flagged | Median lead (mo) | ≥6m ahead |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Altman Z'' | 92,222 | 0.82% | 0.807 | 0.827 | 3.22% | 3.93× | 1.90% | 4.44× | 108 | 11.4 | 66.67% |
| Coverage (EBIT / Interest) | 102,066 | 0.77% | 0.811 | 0.823 | 2.61% | 3.37× | 1.40% | 3.45× | 102 | 15.4 | 83.33% |
| Net leverage (NetDebt / EBITDA) | 79,752 | 0.48% | 0.785 | 0.825 | 1.87% | 3.87× | 1.06% | 4.61× | 91 | 15.0 | 71.43% |
| Liquidity runway (months) | 19,433 | 2.59% | 0.583 | 0.582 | 2.97% | 1.15× | 1.46% | 1.14× | 33 | 14.2 | 78.79% |
| 24m maturity pressure | 98,058 | 0.73% | 0.586 | 0.600 | 1.22% | 1.67× | 0.62% | 1.65× | 55 | 14.8 | 81.82% |

## Score metrics — v3 SIC rule, common 4-score subset (30,612 rows where altman + coverage + net leverage + maturity pressure are all finite)

Runway excluded from the common subset per spec — it only exists for cash-burners, so requiring it would bias the subset.

| Score | n rows | base 12m | AUC 12m | AUC 6m | Top-10% prec 12m | Lift 12m | Top-10% prec 6m | Lift 6m | Co. flagged | Median lead (mo) | ≥6m ahead |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Altman Z'' | 30,612 | 0.41% | 0.799 | 0.814 | 1.61% | 3.89× | 0.89% | 4.69× | 30 | 13.5 | 70.00% |
| Coverage (EBIT / Interest) | 30,612 | 0.41% | 0.827 | 0.860 | 1.81% | 4.36× | 1.02% | 5.38× | 36 | 13.9 | 75.00% |
| Net leverage (NetDebt / EBITDA) | 30,612 | 0.41% | 0.811 | 0.857 | 2.01% | 4.84× | 1.09% | 5.73× | 37 | 14.5 | 70.27% |
| Liquidity runway (months) | 3,496 | 1.43% | 0.517 | 0.527 | 1.83% | 1.28× | 0.61% | 0.93× | 4 | 15.9 | 100.00% |
| 24m maturity pressure | 30,612 | 0.41% | 0.680 | 0.720 | 0.82% | 1.98× | 0.43% | 2.26× | 17 | 12.0 | 64.71% |

## Score metrics — v2 SIC rule (comparison)

| Score | n rows | base 12m | AUC 12m | AUC 6m | Top-10% prec 12m | Lift 12m | Top-10% prec 6m | Lift 6m | Co. flagged | Median lead (mo) | ≥6m ahead |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Altman Z'' | 91,175 | 0.81% | 0.808 | 0.829 | 3.13% | 3.86× | 1.87% | 4.40× | 105 | 11.5 | 65.71% |
| Coverage (EBIT / Interest) | 99,922 | 0.78% | 0.812 | 0.825 | 2.64% | 3.40× | 1.42% | 3.50× | 100 | 15.4 | 83.00% |
| Net leverage (NetDebt / EBITDA) | 78,067 | 0.49% | 0.787 | 0.827 | 1.99% | 4.07× | 1.14% | 4.93× | 92 | 15.2 | 70.65% |
| Liquidity runway (months) | 18,862 | 2.61% | 0.578 | 0.579 | 2.90% | 1.11× | 1.50% | 1.16× | 31 | 14.2 | 77.42% |
| 24m maturity pressure | 95,663 | 0.72% | 0.581 | 0.596 | 1.18% | 1.63× | 0.62% | 1.65× | 54 | 14.3 | 77.78% |

## Tier rules (v3 SIC rule, full sample)

Filing-only signals the backtest has access to. Merton PD and EDGAR event flags stay as live-only adds.

| Tier | Rule | Rows fired | Prec 12m | Prec 6m | Co. flagged | Co. in universe | Recall (companies) |
|---|---|---:|---:|---:|---:|---:|---:|
| distressed | `coverage < 1.0 AND runway < 12m` | 3,383 | 6.00% | 3.16% | 81 | 287 | 28.22% |
| stressed | `Altman Z'' < 1.1 AND (coverage < 1.5 OR maturity_pressure > 1.0)` | 24,197 | 2.18% | 1.19% | 156 | 287 | 54.36% |
| watch | `1.1 <= Altman Z'' <= 2.6 AND net_leverage > 6.0` | 2,904 | 0.72% | 0.31% | 10 | 287 | 3.48% |
| any_tier | `Distressed OR Stressed OR Watch` | 28,077 | 2.13% | 1.16% | 182 | 287 | 63.41% |

## Combined score — year-by-year logistic regression

Features: Altman Z'', Coverage, Net leverage. Trained strictly on prior-year rows with closed 12m labels; predicted OOS for each scoring year. Compared with Altman Z'' alone on the full sample.

| Score | n scored | AUC 12m | AUC 6m | Top-10% prec 12m | Lift 12m | Base rate 12m |
|---|---:|---:|---:|---:|---:|---:|
| Altman Z'' alone (full sample) | 92,222 | 0.807 | 0.827 | 3.22% | 3.93× | 0.82% |
| Logistic (Altman + Cov + Lev) | 35,994 | 0.541 | 0.610 | 0.56% | 1.25× | 0.44% |

**Verdict:** combined score does not beat Altman on OOS AUC (12m).

### Read conventions / caveats

- Sign on net leverage and maturity-pressure is flipped so "top decile" always means riskiest.
- `Base 12m/6m` = share of panel rows for the score whose CIK files a bankruptcy within the forward window.
- `Lift` = top-decile precision ÷ base rate. 1× is random.
- `Recall (companies)` = fraction of distinct bankrupt companies present in the panel's 24m pre-petition windows whose score crossed the tier rule at any quarter-end there.
- Tier rules include only signals the backtest has. Merton PD (>20% → Distressed, 5-20% → Stressed) and EDGAR event flags (Item 1.03 / 2.04 / going concern / RSA / T-3) go on the live radar, not here.
- Debt coverage was improved by expanding the tag chain — Hertz, Peabody, Caesars Operating, Diebold Nixdorf, Enviva, EFH and others are now captured. Weatherford and Wolfspeed stay partial (their pre-petition filings tagged debt only under atypical tags that aren't in the chain).
