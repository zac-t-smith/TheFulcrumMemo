# Fulcrum Index v5 — When, Where, Who

Build spec for Claude Code. Written Nov 11, 2026 after a review of the live
`/#/fulcrum-index` page.

The v4 index answers one question well: how stressed are credit markets
right now, against 40 years of history. It cannot answer the three
questions an RX desk actually asks:

1. **When** does the default cycle turn? (leading, not coincident)
2. **Where** is distress concentrating? (sector)
3. **Who** is next? (company)

v5 keeps the v4 composite (renamed **Market Stress**) and adds a layer for
each question. Work in the phase order below. Each phase ships on its own.

---

## Why now: the v4 index is reading benign during a default cycle

`quant/DEFERRED.md` says to revisit the weights "if a credit cycle fires
without VIX or Brent participation, or the composite reads benign." That
has happened:

| Signal (latest found) | Reading | Source |
|---|---|---|
| Fulcrum Index (frozen Apr 30, 2026) | 26, "Latent Stress" | this site |
| ICE BofA HY OAS | 266 bps (Sep 21) → 331 bps (Oct 16, 2026) | convextrade.com, FRED BAMLH0A0HYM2 mirror |
| USD CCC–BB median OAS gap (iBoxx) | 677 bps, +260 bps YoY (Oct 2026) | fi-desk.com, Nov 4, 2026 |
| Large-company bankruptcies, H1 2026 | 372, highest H1 since 2010; May and June 72 each | S&P Global Market Intelligence |
| Bankruptcies by sector, H1 2026 | Industrials 50, consumer discretionary 35, healthcare 26 | S&P Global Market Intelligence |
| Commercial Chapter 11 filings, H1 2026 | 4,589, +28% YoY | Epiq AACER / ABI |
| Fitch US private credit default rate | 6.3% TTM Aug 2026 (record); above 6% since April; still "elevated" in Q3 | Fitch, via Webull / Newsquawk |
| How private credit defaults happen | 47% interest deferral / PIK, 41% maturity extension, 4% bankruptcy | Fitch, TTM Aug 2026 |
| Private credit default rate by sector | Healthcare providers 9.9%, industrial & mfg 9.9%, consumer 8.7%, software 0.6% | Fitch, Aug 2026 |
| Private credit, smallest borrowers | 12.0% for EBITDA < $25m | Fitch, Aug 2026 |
| Leveraged loan distress ratio | > 10% (Feb 28, 2026), tech 22% on AI-disruption fears | Bloomberg Intelligence |
| Brent | $98.29 (Nov 5, 2026); Dec futures briefly > $117 (Oct 30); freight ~$40/bbl | Nation Thailand / Al Jazeera |

The pattern is "calm on top, concern at the bottom": headline spreads near
post-crisis tights while the bottom of the stack defaults quietly through
PIK toggles and maturity extensions that never show up as a bankruptcy or
a spread blowout. A spread-and-VIX composite is structurally blind to that.
v5 has to see it.

Verify every number above against the primary source before it goes on
the page; several came through secondary reporting.

---

## Phase 0 — Unfreeze the data (Zac does steps 1–3)

Root cause: `update-fulcrum-data.yml` failed at "Pull FRED data" on every
scheduled run from May 4 to Jul 2 (44 straight failures), committed
nothing, and GitHub then disabled the schedule for inactivity. The site
has shown Apr 30 data since.

Already fixed in commit 8a7fec1:
- The workflow accepts either secret name (`FRED_API_KEY` or `VITE_FRED_API_KEY`).
- One failed series no longer blocks the rest. The job fails only if BAA10Y
  or every series fails.

Steps:
1. GitHub → Actions → "Update Fulcrum Data v4" → **Enable workflow**.
2. Settings → Secrets → Actions: confirm a FRED key exists under one of
   the two names.
3. Actions → "Update Fulcrum Data v4" → **Run workflow**.
4. (Claude Code) Read `fred_pull_summary.json` from the run artifact. If
   the ICE BofA series (`BAMLH0A0HYM2`, `BAMLH0A3HYC`, `BAMLH0A1HYBB`,
   `BAMLC0A4CBBB`) are now erroring, FRED has narrowed access again: keep
   the last good values, mark those charts "paused," and say so on the page.
5. (Claude Code) Remove `<ArchiveBanner />` from `FulcrumIndex.tsx` once
   data is current. Replace it with a freshness badge driven by the
   latest observation date: green ≤ 3 business days, amber ≤ 10, red
   beyond that with the text "Data paused since {date}."

## Phase 1 — Fix what's wrong on the current page

1. **Percentile contradiction.** The readout says "pctl 20" while the MD
   read says "5th percentile" for the same 170 bps. The prose uses the
   fixed-range scaling (`BAA_PCTL_FLOOR/CEILING`), not a percentile. Use
   `baaTrueHistoricalPercentile` in the prose and call the fixed-range
   number "composite input" if it appears anywhere.
2. **Threshold contradiction.** The prose says 70 "has historically
   preceded default-rate inflections" and "each prior crossing of 70 has
   preceded a default-rate inflection within nine to fifteen months," but
   the band table puts Cycle Imminent at 75. Pick one number. Then either
   prove the claim with a table on the page (date of each crossing, then
   the change in C&I charge-off rate `CORBLACBS` over the next four
   quarters) or delete the sentence.
3. `Sources: Sources:` is printed twice (page line ~1749 plus the
   constant's own prefix).
4. Historical scatter: "CPI shock," "tight spreads" and "Hormuz closure"
   collide at the top right. Stagger the event labels.
5. Canary chart: "threshold 3.5×" is clipped at the right edge.

## Phase 2 — WHEN: Cycle Probability and the Hidden-Stress Gap

### New series (add to `fetch_fred_data.py`)

| FRED ID | What | Freq / start | Role |
|---|---|---|---|
| `DRTSCILM` | Net % of banks tightening C&I standards, large & mid firms | Q, 1990 | Leading |
| `DRTSCIS` | Same, small firms | Q, 1990 | Leading |
| `NFCI` | Chicago Fed National Financial Conditions Index | W, 1971 | Leading |
| `T10Y3M` | 10Y minus 3M Treasury | D, 1982 | Leading |
| `ICSA` | Initial jobless claims | W, 1967 | Leading |
| `CORBLACBS` | Charge-off rate, business loans, all banks | Q, 1985 | Target / realized |
| `DRBLACBS` | Delinquency rate, business loans | Q, 1987 | Realized |
| `USREC` | NBER recession indicator | M | Target |

Plus the **Excess Bond Premium** (Gilchrist–Zakrajšek, monthly, 1973+).
The Fed publishes it as a CSV alongside the FEDS Note "Updating the
Recession Risk and the Excess Bond Premium." Find the current link from
that note; don't guess the URL. This is the indicator the v4 README cites
as its methodology anchor but never uses.

### Manual monthly inputs

Create `quant/data/manual_inputs.json`. Each entry holds the value, date,
source name and URL. Never enter a value without a source.
- Fitch US private credit default rate (TTM), overall and by sector
- Moody's or Fitch US HY and leveraged loan default rates
- S&P Global large-company bankruptcy count, monthly and by sector
- Epiq commercial Chapter 11 count, monthly

### Models

**A. Market Stress** = the existing v4 composite, unchanged. Rename it
in the UI. It's coincident and that's fine.

**B. Cycle Probability (12 months).** Logistic regression on monthly
data.
- **Target:** a default-cycle upturn within 12 months, defined as
  `CORBLACBS` rising ≥ 0.25 pp over the next four quarters OR an NBER
  recession starting within 12 months. Test both definitions and report
  which one you use.
- **Features (standardized):**
  - EBP level
  - 6-month change in EBP
  - `DRTSCILM` and `DRTSCIS`
  - Minimum of `T10Y3M` over the prior 18 months (captures inversion, then un-inversion)
  - `NFCI`
  - Claims: 4-week average divided by the 52-week low, minus 1
  - BAA10Y true percentile
- **Keep it to 4–6 features.** There are only about five cycles since 1990, so overfitting is the main risk.
- **Validation:** walk-forward with an expanding window, out of sample from 2000 on. Report:
  - AUC
  - Hits
  - Lead time vs. each charge-off peak
  - False alarms (expect 1998, 2011, 2015–16 and 2022 to test it)

  Put the results table on the page. No accuracy claim goes on the page without that table.
- **Display:** the probability with a band from bootstrapped coefficients.

**C. Hidden-Stress Gap.** Realized Distress minus Market Stress.
- **Realized Distress** is the average percentile of:
  - The private credit default rate
  - The large-company bankruptcy count (S&P monthly, 2010+)
  - The CCC–BB ratio
  - The `DRBLACBS` delinquency rate
- Score each against its own available history, and say how short some histories are.
- **Reading it:** a positive gap means defaults are running ahead of spreads. That's the "calm on top" state and the core of the page's thesis. Chart both lines on one axis.

## Phase 3 — WHERE: Sector heat map

About 12 rows. Use the sectors RX desks actually staff:
- Healthcare providers
- Industrials & manufacturing
- Consumer discretionary / retail
- Restaurants
- Chemicals
- Software
- Telecom / media
- Autos & parts
- Transportation (airlines, trucking)
- Building products / homebuilders
- Energy (E&P vs. refiners)
- Commercial real estate / office

Columns are percentiles against each sector's own history, 0–100:
- **Market:** sector ETF 6-month drawdown from the 52-week high, plus 3-month realized volatility. Candidate ETFs (yfinance, already in the pipeline): XLV, XLI, XLY, XRT, XLB, IGV, XLC, CARZ, IYT, JETS, XHB, XLE, CRAK, VNQ.
- **Fundamentals:** median Phase 4 default probability and % of names flagged (once Phase 4 exists).
- **Realized:** Fitch private credit default rate by sector; S&P bankruptcy count by sector (manual inputs).
- **Shock exposure:** a static, documented 1–5 score for oil and freight cost sensitivity (high: airlines, chemicals, trucking, cruise; benefits: E&P, tankers). This is how the Iran war transmits into the sector read.

Show the composite plus a 3-month change arrow. Annotate disagreements.
Software is the live example: realized private credit defaults are low
(0.6%) while the loan distress ratio is high on AI-disruption fears. That
gap is a finding, not noise.

## Phase 4 — WHO: Distress Radar (company screen)

**Universe:** US-listed nonfinancial companies with total debt over
$250m and at least one of:
- Net debt / EBITDA > 4×
- EBIT / interest < 2×
- Market cap below total debt

Exclude banks, insurers and REITs (REITs could be a later, separate screen).

**Data:**
- Financials from SEC XBRL `companyfacts`. Send a User-Agent header with a contact email, stay under 10 requests per second, and prefer the nightly bulk zip.
- Prices from yfinance.
- **Point-in-time rule:** only use facts whose `filed` date is on or before the as-of date. Without that, the backtest has look-ahead bias and is worthless.

### Scores

1. **Altman Z″** (non-manufacturer version):
   `6.56·WC/TA + 3.26·RE/TA + 6.72·EBIT/TA + 1.05·BookEquity/TL`.
   Zones: above 2.6 safe, 1.1–2.6 grey, below 1.1 distress.
2. **Merton distance to default**, naive version (Bharath & Shumway 2008):
   - Inputs:
     - `F = short-term debt + 0.5 × long-term debt`
     - `V = E + F`
     - `σD = 0.05 + 0.25·σE`
     - `σV = (E/V)·σE + (F/V)·σD`
     - `μ` = trailing 12-month stock return
     - `T = 1`
   - Then `DD = [ln(V/F) + (μ − ½σV²)T] / (σV√T)` and `PD = N(−DD)`.
3. **CHS failure probability** (Campbell, Hilscher & Szilagyi 2008, 12-month horizon). Take the coefficients from the paper's published table and cite the table in code comments. Do not reconstruct them from memory.
4. **Coverage and leverage:**
   - Coverage = LTM `OperatingIncomeLoss / InterestExpense`
   - Net leverage = `(debt − cash) / (OperatingIncomeLoss + DepreciationDepletionAndAmortization)`
5. **Liquidity and maturity wall:**
   - Runway in months = `cash ÷ monthly burn`, where burn = −(CFO − capex) when that is negative.
   - 24-month maturity pressure = (`LongTermDebtMaturitiesRepaymentsOfPrincipalInNextTwelveMonths` + `…InYearTwo`) ÷ (cash + positive LTM FCF).
   - Revolver availability isn't a standard XBRL tag. Leave it as an optional manual field.
6. **EDGAR event flags.** These are the tells RX bankers watch:
   - 8-K Item 1.03 (bankruptcy)
   - 8-K Item 2.04 (triggering event / acceleration)
   - 8-K Item 3.01 (delisting notice)
   - 8-K Items 4.01 and 4.02 (auditor change, non-reliance)
   - NT 10-K / NT 10-Q (late filing)
   - **Form T-3** (indenture qualification for an exchange offer: the classic distressed-exchange tell)
   - SC TO-I (issuer tender or exchange offer)
   - Full-text search (efts.sec.gov) for "substantial doubt," "going concern," "forbearance agreement," "restructuring support agreement," "paid-in-kind"

### Tiers (with reason codes on every row)

- **Distressed:** any of:
  - Item 1.03, Item 2.04, forbearance, RSA or a going-concern flag
  - Merton PD > 20%
  - Coverage < 1× with runway < 12 months
- **Stressed:** any of:
  - Z″ < 1.1 and (coverage < 1.5×, or 24-month maturities exceed liquidity)
  - PD 5–20%
  - T-3 or exchange offer filed
- **Watch:** any of:
  - Z″ in the grey zone with leverage > 6×
  - Equity down > 60% from its high and market cap below debt

Map each flagged name to the likely mandate: **Refi / amend-and-extend
window**, **LME candidate**, or **In-court prep**. That turns the screen
into a pipeline view, which is the point for an RX audience.

**Output:** write `src/data/distressRadar.json` from a new weekly workflow
(`update-distress-radar.yml`, Sundays) that follows the same partial-failure
rules as the daily job.

### Backtest before publishing

- **Label set:** every public company that filed Chapter 11 from 2015 to 2026, found via EDGAR 8-K Item 1.03.
- **Test:** score each one at 12 and 6 months before filing, using point-in-time data, against the full universe on the same dates.
- **Report:**
  - AUC per score and for the tiering
  - Precision in the top decile
  - Median lead time
  - Names the screen missed, and why

Publish that table with the radar.

## Page layout (v5)

1. **Readout strip:** Market Stress · Cycle Probability (12m) · Hidden-Stress Gap · data freshness.
2. **"Calm on top, concern at the bottom":** Market Stress vs. Realized Distress, one chart.
3. **Cycle clock:** small multiples of the leading indicators, each with a dot showing where today sits relative to the same number of months before past charge-off peaks.
4. **Sector heat map.**
5. **Distress Radar:** top 25 names, filterable by sector and tier, with reason codes and links to the triggering EDGAR filing. Footer: "Quantitative screen of public filings and market data. Not a credit opinion or investment advice."
6. **The existing v4 charts** (scatter, composite path, capital-structure tiers, canary) and the position framework, below the new sections.
7. **Methodology and backtest tables.**

## Ground rules

- Every number on the page is computed from committed data or comes from a manual input with a source URL. No hardcoded prose numbers.
- No lead-time or accuracy claim without the backtest table that supports it.
- Keep the v4 composite math unchanged; v5 adds to it and doesn't re-tune it.
- `npx tsc --noEmit` should show no new errors (13 exist today, all outside the Fulcrum files).
