# Iran Series — Closeout Audit

Audit date: 2026-11-04. Read-only — no files edited or created other than this one.

---

## 1. Inventory

### Narrative content

| Content | Path | Last git touch | Status |
|---|---|---|---|
| Part I: Asymmetric Restructuring | `src/pages/memos/IranMemoPartIFull.tsx` | 2026-10-25 (Phase 5 PDF pipeline; content unchanged since v4) | Live |
| Part II: Portfolio Contagion | `src/pages/memos/IranMemoPartIIFull.tsx` | 2026-10-25 (same) | Live |
| Part III: The Setup Nobody Priced | `src/pages/memos/IranMemoPartIIIFull.tsx` | 2026-10-25 (same) | Live |
| Shadow Partner | `src/pages/memos/ShadowPartnerMemo.tsx` | 2026-10-29 (`ArrowRight` crash fix) | Live |
| Part IV "Restructuring of the Global Order" | — | — | **Not in repo.** No file, no route, no reference in src. UNVERIFIED whether a draft exists outside git. |
| Field notes index | `src/pages/field-notes/FieldNotesIndex.tsx` | 2026-10-29 (Phase 4B archive language) | Archived banner live |
| Field note day page | `src/pages/field-notes/FieldNoteDay.tsx` | current | Live |
| Field note entries | `src/data/iranConflictData.ts` → `fieldNotes` map | 2026-10-25 (color/token work; **content frozen at day 58**) | 53 days present (6 → 58); days 1–5 absent from the map |
| Positions / Track Record | `src/pages/Positions.tsx` | 2026-10-29 | 3 positions, all `status: 'OPEN'` with TODO comments acknowledging Apr 26 archive |
| Fulcrum Index page | `src/pages/FulcrumIndex.tsx` | 2026-10-29 | Live; renders `ArchiveBanner` |

### Memo thesis summaries (2–3 sentences each)

- **Part I.** Iran's leverage in the conflict is structural, not operational: a ~100:1 drone-to-interceptor cost ratio and Lloyd's P&I insurance withdrawal (not a naval blockade) choke 20% of global oil at Hormuz. Leadership decapitation did not halt operations, which suggests the strike was anticipated; Iran's post-decapitation position is "the strongest in 45 years."
- **Part II.** The US political clock (Trump midterms 8 months out) collides with Iran's non-electoral interim council, forcing a protracted attrition base case. HY OAS entered the conflict at ~281 bps against a 525 bps 30-year average; the war is the catalyst that moves overleveraged corporates from stressed to distressed and ignites a restructuring cycle unmatched since 2008–09.
- **Part III.** The conflict is reframed as a sovereign-level distressed asset play: Venezuela acquired at $60 Brent with US operational control, tariffs pre-positioned with every major energy-importing ally before Hormuz closed, and Iran functionally performs a role inside someone else's capital structure. The US holds the only major relief valve.
- **Shadow Partner.** Russia is the uncredited beneficiary — SIGINT/satellite feed to Iran, ~$50–60B/year Urals windfall at $88+, attention arbitrage on Ukraine. Every day of Hormuz closure is worth ~$150M in incremental oil revenue to Russia, so Russia's rational move is to extend, not resolve.

### Data files (all static; no live pages call the live APIs)

| File | Source series | Coverage | Last obs | Status |
|---|---|---|---|---|
| `src/data/hyOasHistory.ts` | FRED BAMLH0A0HYM2 (HY OAS, bps) | 2023-05-03 → 2026-04-30 | 283.0 bps | Static, API-faithful, stale by ~6 months |
| `src/data/bbOasHistory.ts` | FRED BAMLH0A1HYBB (BB OAS) | 2023-05-03 → 2026-04-30 | — | Static, stale |
| `src/data/bbbOasHistory.ts` | FRED BAMLC0A4CBBB (BBB OAS) | 2023-05-03 → 2026-04-30 | — | Static, stale |
| `src/data/cccOasHistory.ts` | FRED BAMLH0A3HYC (CCC OAS) | 2023-05-03 → 2026-04-30 | — | Static, stale |
| `src/data/aaaSpreadHistory.ts` | FRED AAA10Y | 1983-01-03 → 2026-04-30 | — | Static, stale |
| `src/data/baaSpreadHistory.ts` | FRED BAA10Y | 1986-01-02 → 2026-04-30 | — | Static, stale |
| `src/data/baaYieldHistory.ts` | FRED DBAA | 1986-01-02 → 2026-04-30 | — | Static, stale |
| `src/data/vixHistory.ts` | FRED VIXCLS (percent) | 1990-01-02 → 2026-04-30 | 16.89 | Static, stale |
| `src/data/dgs10History.ts` | FRED DGS10 | 1976-05-14 → 2026-04-30 | — | Static, stale |
| `src/data/yieldCurveHistory.ts` | FRED T10Y2Y | 1976-06-01 → 2026-05-01 | — | Static, stale |
| `src/data/breakevenHistory.ts` | FRED T10YIE | 2003-01-02 → 2026-05-01 | — | Static, stale |
| `src/data/brentSpotHistory.ts` | FRED DCOILBRENTEU | 1987-05-20 → 2026-04-27 | $113.89 | Static, stale |
| `src/data/gldHistory.ts` | Yahoo GLD | 2004-11-18 → 2026-05-01 | — | Static, stale |
| `src/data/hygHistory.ts` | Yahoo HYG | 2007-04-11 → 2026-05-01 | — | Static, stale |
| `src/data/usoHistory.ts` | Yahoo USO | 2006-04-10 → 2026-05-01 | — | Static, stale |
| `src/data/oilPriceData.ts` | EIA RBRTE/RWTC daily | daily series through late Apr | — | Static, stale |
| `src/data/iranConflictData.ts` | **narrative + market snapshots + scenarios** | days 6–58 | `conflictMetadata.lastUpdated = 2026-04-26` | Frozen |
| `src/data/iranMemoData.ts` | memo-specific chart data | — | — | Static, frozen |
| `src/data/fulcrumIndex.ts` | composite index logic | — | — | Logic only; drives Fulcrum Index page |

All historical series were generated by `scripts/fetch_fred_data.py` on 2026-05-02. **The script has not been re-run since.** The live FRED/EIA API wrappers (`src/data/fredApi.ts`, `src/data/eiaApi.ts`) exist but are **not imported by any component** — the whole site reads from the frozen static files.

### Scenario-probability surface area

- Defined: `src/data/iranConflictData.ts` → `scenarioUpdates: ScenarioUpdate[]`, 53 entries (one per field-note day), ending day 58.
- Final values (Apr 26, 2026): Quick Resolution 5% / Protracted Attrition 55% / Full Escalation 40%.
- Rendered in: `FieldNotesIndex.tsx` (latest card), each `FieldNoteDay` page, and anywhere consuming `getLatestScenario()`.

### Live tickers / API calls

- **FRED (`src/data/fredApi.ts`):** code exists, no component imports it. **Dead.**
- **EIA (`src/data/eiaApi.ts`):** code exists with the `sort: 'period:desc'` param bug (EIA v2 requires `sort[0][column]=period&sort[0][direction]=desc`); no component imports it. **Dead, but bug remains in-source.**
- **AIS vessel tracking (`src/components/maps/ConflictMap.tsx` line 378):** WebSocket to `wss://stream.aisstream.io/v0/stream`, gated on `apiKey` prop. If `VITE_AISSTREAM_API_KEY` is set in the deploy secrets it will attempt to connect; otherwise it falls back to a cached snapshot. UNVERIFIED whether live AIS is currently enabled in production; worth confirming.

### Positions page

Three positions, all `OPEN`:
1. `iran-nuclear-june` — Polymarket-style "US-Iran Nuclear Deal before June?" NO, entry 49.5¢.
2. `iran-nuclear-july` — similar, July cutoff.
3. `russia-crude-april` — "Russia Crude Exports Below 4.0 mbpd in April?" NO.

Each carries a `TODO(zac)` comment noting Apr 26 archive and reminding you to resolve.

---

## 2. Last published field note and gap

- **First entry:** Day 6 — March 5, 2026 — "P&I Expiration Day: The Insurance Chokepoint Arrives"
- **Last entry:** Day 58 — April 26, 2026 — "The Hormuz Doctrine: Iran Declares Permanent Sovereignty"
- **Gap:** days 1–5 never shipped; days 59+ never shipped.
- **Elapsed since last field note:** ~192 days (6.3 months) to 2026-11-04.

---

## 3. Integrity findings (ranked by credibility risk)

### 🔴 CRITICAL — scenario numbers presented as market snapshots

Every `fieldNotes[n].marketSnapshot` object inside `src/data/iranConflictData.ts` contains hand-authored "market" values that diverge sharply from the real FRED/EIA series kept in the same repo:

| Indicator | Narrative range in field-note marketSnapshots (late Apr 2026) | Actual FRED/EIA (same window, stored in repo) |
|---|---|---|
| HY OAS | **420–590 bps** across late-April day entries | **282–287 bps** per `hyOasHistory.ts` |
| VIX | **29–37** across late-April day entries | **17–19** per `vixHistory.ts` |
| Brent spot | $115–$125 at the top end | $98–$118 per `brentSpotHistory.ts` (overlaps the low end of the narrative range but trends lower overall) |

These `marketSnapshot` objects **render as "Market snapshot" stat tiles on every field-note day page** (`FieldNoteDay.tsx:199–227`) **and on the Field Notes index** (`FieldNotesIndex.tsx:270–286`). A reader sees "HY spread 575 bps" on April 23 as if it were a market quote; the authoritative FRED series file in the same bundle shows 286 bps that day. This is the single largest credibility risk on the site.

### 🔴 CRITICAL — the "archive snapshot" HY spread is fabricated

`src/content/marketFigures.ts`:
```
HY_SPREAD = { preWar: 281, lastArchived: 525, lastArchivedAsOf: 'Apr 26, 2026' }
```

The real last-archived value in `hyOasHistory.ts` is **283 bps on 2026-04-30**. The 525 figure — identical to the Part II "30-year average" citation — appears to have been copied from the historical-average sentence into the archive-snapshot slot.

Rendered in:
- `src/pages/field-notes/FieldNotesIndex.tsx:130` (top-of-page stat block, right next to the archive banner)
- `src/components/iran/charts/CreditSpreadChart.tsx:47` (embedded in Part II memo; the "current spread" marker in the historical chart)

So the Part II memo's own chart is pinned to a wrong "current" bps value that readers see as the archive's definitive HY reading.

### 🟡 MEDIUM — fabricated 655 bps spike: *not currently present*

The previously-flagged 655 bps fabricated spike in OAS data was checked:
- `hyOasHistory.ts`: max 2026 value is **346 bps** (early April spike), min 264 bps. No value ≥ 500 anywhere.
- `vixHistory.ts`: 2026 range 14.49 – 31.05. No anomalous spikes.
- All six FRED/Yahoo/EIA static files are faithful to their declared API sources at the cutoff dates.

The fabrication risk has **moved** from the API-sourced historical files to the hand-authored `marketSnapshot` tiles inside `iranConflictData.ts` (see the two CRITICAL items above). Those tiles render directly in the site's "market snapshot" UI without any API source attribution.

### 🟡 MEDIUM — EIA API `sort` parameter bug

`src/data/eiaApi.ts` lines 81, 130, 179 all pass `sort: 'period:desc'` as a flat string. EIA v2 requires:
```
sort[0][column]=period
sort[0][direction]=desc
```
Harmless right now because nothing imports the module, but any future "re-enable live oil" work will silently 400 until this is fixed.

### 🟢 LOW — hardcoded market numbers inside the memos themselves

Scanned all four long-form memos. Two instances only, both in Part II line 202 and 210:
- "VIX spiked to 25.40" — plausibly accurate for March 3, 2026; narrative scoped to that date.
- "~281 bps vs. 525 bps 30-year average" — 281 is the pre-war snapshot, 525 is labelled as the 30-year AVERAGE (not a snapshot), which is a defensible use of the figure.

No other hardcoded indices/spreads/VIX readings in the memo prose. Memos are mostly clean; the mess is in the field-note market tiles.

### 🟢 LOW — Fulcrum Index subtitle string

`src/pages/FulcrumIndex.tsx:1520`:
```
{Math.round(recentIndexData.length / 252)}-year backtest, ETF window 2007+
```
`recentIndexData` is filtered to `date >= '2007-04-11'`. For the current ~19-year window this renders `19-year backtest`, which is fine. If `indexData` ever shrinks below ~377 trading days Math.round yields 1 and you get "1-year backtest" (hyphenated-singular — not the "1 years" grammar bug the audit brief described). The literal string "1 years" is **not present anywhere in `src/`**; could not reproduce the bug as described. May have already been fixed, or may live in a different subtitle not surfaced in this pass. UNVERIFIED.

### 🟢 LOW — Shadow Partner crash

Fixed. `ArrowLeft, ArrowRight` import restored at `src/pages/memos/ShadowPartnerMemo.tsx:2`; `ArrowRight` used at line 1056. Matches commit `Phase 5.1`.

### 🟢 LOW — 404 / routing flashes

No obvious source for the flash. HashRouter + `public/404.html` are both in a good state after the custom-domain cutover. UNVERIFIED whether a transient flash remains on cold loads of deep links; worth a browser pass.

### 🟢 LOW — archive banner coverage

`ArchiveBanner` renders on: `FieldNotesIndex`, `FieldNoteDay`, `FulcrumIndex`, `TimelinePage`, `PrintMemoShell` (PDF only). It does **NOT** render on the four live memo pages (Part I, Part II, Part III, Shadow Partner). A reader landing on a memo from search sees the piece as if it were current. Minor inconsistency, not a correctness bug.

---

## 4. Thesis scorecard

Calls pulled from `CLAUDE.md` (tracked-thesis table) and from the day-58 thesis block. "Outcome" column is strictly what you flagged in the brief — I did not invent market readings.

| # | Call | Date / peak confidence | Outcome (per brief) | Status |
|---|---|---|---|---|
| 1 | Protracted Attrition base case | Day 58 — 95% confirmed | Islamabad MOU signed Jun 17, 2026; Hormuz re-closed within days citing Israel strikes in Lebanon; ceasefire later collapsed. 5-month arc fits "protracted" not "quick." | **Validated.** |
| 2 | Hormuz goes PERMANENT / sovereignty codified | Day 58 — "under no circumstances return to previous state" (Nikzad) | Hormuz "never returned to normal" through at least Oct 2026 (~60/day 7-day avg on IMF PortWatch, below the pre-war ~90+/day). But the "codified sovereignty" framing was overstated — Iran *did* reopen briefly post-MOU before re-closing, so permanence is behavioural not legislative. | **Validated directionally, overstated as policy.** |
| 3 | Part II restructuring cycle fires | Day 58 — 98% "confirmed" | HY OAS widened ~60 bps summer → late Oct 2026 but never broke out. The credit transmission chain is **moving but has not fired**. | **Early / overcalled.** The directional read is correct; the magnitude ("most distressed advisory work since 2008–09") is not supported by the ~60 bps widening you flagged. |
| 4 | Diplomatic channel damaged / no credible interlocutor | Day 58 — 80% developing (Larijani killed D18, Kharazi wounded D33) | MOU was signed June 17. Someone credible was in the room. | **Wrong / early.** |
| 5 | Russia-Iran intelligence sharing | Day 58 — 90% confirmed (Zelensky confirmation on March 27) | Shadow Partner's base factual claim. Not contradicted by anything in the brief. | **Validated.** (Still relies on Zelensky public statement — no post-April update captured in-repo.) |
| 6 | Coalition fracturing (UK out, Austria rejected overflights) | Day 58 — 85% confirmed | Not in the brief's outcome list. | **UNVERIFIED post-April.** |
| 7 | Iraq drawn into conflict (PMF deployed inside Iran) | Day 58 — 90% confirmed | Not in the brief's outcome list. | **UNVERIFIED post-April.** |
| 8 | April worse than March (IEA "worst energy crisis in history") | Day 58 — 95% confirmed | Hormuz didn't normalize; oil stayed structurally elevated through the summer per the brief. | **Partially validated on direction.** The "worst in history" framing is an April-vintage claim that the post-April data in-repo can't speak to. |
| 9 | Great power involvement expanding (China/Russia shaping outcome) | Day 58 — 80% developing | Islamabad MOU suggests Pakistan + external pressure played the shaping role. | **Validated directionally.** |
| 10 | US midterms political pressure (Part II core asymmetry) | Nov 3, 2026 midterms | Control of both chambers changed. Trump's political clock ran out exactly as Part II predicted. | **Validated.** |
| 11 | Credit catalyst from "stressed to distressed" (Part II) | 2026+ | HY OAS widened ~60 bps summer → late Oct; never broke out. Catalyst hasn't materialised at the magnitude the memo described. | **Partial / timing wrong.** |
| 12 | Insurance-driven leverage (Lloyd's P&I withdrawal as the real weapon — Part I) | Early April 2026 | Not in the brief's outcome list, but Hormuz never-returned-to-normal is consistent with structural insurance friction. | **Validated by implication.** |
| 13 | Sovereign-level distressed asset play (Part III: US controls the only relief valve via Venezuela + tariff leverage) | Part III framing | Can't adjudicate from the brief alone. UNVERIFIED. | **Open.** |

**Summary:** of 13 tracked calls, 6 clearly validated (Protracted Attrition, Hormuz behavioural disruption, Russia intel pipeline, midterms, great-power shaping, insurance leverage), 2 clearly overcalled (diplomatic channel dead; restructuring cycle magnitude), 3 partially validated with timing/magnitude issues (Hormuz framed as codified, Part II cycle magnitude, April "worst ever"), and 3 unverifiable from in-repo content alone (coalition, Iraq, Part III endgame). The series' **direction** was mostly right; its **magnitude and timing** were systematically early.

---

## 5. Proposed closeout plan

Five options below, sized S/M/L. Not all are additive — the recommendation at the bottom picks a bundle.

### Option A — "Closing Dispatch" field note (S, ~2 hrs)

One final entry, slotted as Day **TBD-closeout** (NOT back-dated; stamped 2026-11-04 or similar), that:
- Acknowledges the gap and the series freeze.
- Reconciles the June 17 MOU → Hormuz re-close → ceasefire collapse arc in the same tone the earlier entries used.
- Names the three big calls that held (Protracted Attrition, structural Hormuz, midterms-as-political-forcing-function) and the two that were overcalled (diplomatic-channel-dead, restructuring-cycle magnitude).
- No new market numbers in prose; if quantitative context is needed, point readers to the Fulcrum Index page or the FRED series file dates.

Delivers closure without 190 days of backfill.

### Option B — Post-mortem / scorecard page (M, ~4–6 hrs)

New route `/#/scorecard` (or `/#/iran/scorecard`). Reuses the existing `ThesisScorecard` type. One card per call, each with:
- The original call (date, confidence).
- The outcome (text only, no fabricated numbers).
- Status: Validated / Overcalled / Partial / Open.

Keeps the thesis-tracking methodology visible as a recruiting artifact: "here are the calls we made, here is how they aged, scored honestly."

### Option C — Fix the Part II credit-lag framing (M, ~2 hrs narrative + chart)

Part II's "most distressed advisory work since 2008–09" line is the most falsifiable claim on the site. Add a short addendum section — **inside Part II itself** — that acknowledges:
- Direction (spreads widening) validated; magnitude was premature.
- Why: name 2–3 real reasons (Fed cushion held, high-cash-balance corporate sector, refi-wall partially addressed, etc. — pick what you actually believe).
- What would have to be true for the cycle to still fire.

Don't rewrite the memo. Add an "Addendum 2026-Q4" box after Executive Summary.

### Option D — Data hygiene: fix the fabricated `marketSnapshot` tiles (S–M, 1–3 hrs)

Pick one:
- **D1 (S)** — Hide the market-snapshot stat tiles entirely on field-note pages. Keep narrative text; drop the brentCrude/hySpread/vix/vlccRate chrome that reads as if it were real data.
- **D2 (M)** — Rewrite each day's `marketSnapshot` to match the authoritative series by looking up the corresponding date in `hyOasHistory.ts` / `vixHistory.ts` / `brentSpotHistory.ts`. Same number of tiles, but every value is a FRED/EIA-sourced quote with an inline attribution.
- **D3 (S)** — Fix only `HY_SPREAD.lastArchived` in `marketFigures.ts` (525 → 283 bps). Least invasive; fixes the most visible number on FieldNotesIndex + the Part II CreditSpreadChart marker.

**I'd recommend D1 + D3** together: cheap, kills the biggest credibility risk, no need to touch 53 day entries.

### Option E — Freeze the series properly (S, ~1 hr)

- Add `ArchiveBanner` to the four memo pages that currently lack it (Part I, II, III, Shadow Partner).
- Delete or gate the dead FRED/EIA API code (`src/data/fredApi.ts`, `src/data/eiaApi.ts`) — not imported anywhere, just noise. Keep `oilPriceData.ts` since it's referenced.
- Turn the AIS WebSocket off in production (unset `VITE_AISSTREAM_API_KEY` secret), or gate it behind an explicit prop so cold loads don't try to connect.
- Keep all data pages live; mark `scripts/fetch_fred_data.py` as intentionally not run post-archive in a one-line comment at the top of the file.

### Option F — Part IV "Restructuring of the Global Order" as capstone (L, ~1–2 weeks)

Framework exists per brief, not in repo. Writing it is the biggest piece. Suggest treating this as a Q1-2027 project, separate from closeout:
- Core argument: the structural shifts that *did* fire (reserve architecture, trade route re-routing, energy capital reallocation) even though the acute credit cycle did not.
- Pairs naturally with the scorecard (Option B): "here is what survived the test."

Don't block the closeout on this. Ship closeout first, Part IV later.

### Recommended order

1. **E first** (~1 hr). Freeze the series properly: archive banners, kill dead code, disable live AIS. Zero narrative risk.
2. **D1 + D3** (~1–2 hr). Fix the single worst credibility problem (fabricated spreads rendered as snapshots). No new numbers written into the narrative — tiles hidden, one constant corrected against the FRED series file.
3. **A** (~2 hr). Closing Dispatch field note. Delivers the intellectual closeout.
4. **B** (~4–6 hr). Scorecard page. Highest ROI for recruiting — turns the honest "we were right directionally, early on magnitude" admission into an artifact.
5. **C** (~2 hr). Part II addendum. Addresses the one memo call that has falsifiable gap.
6. **F** later. Part IV is its own project.

Estimated total through step 5: ~12 hours. Can land as 4–5 commits and one deploy.

---

## 6. Open items I could not verify from the repo alone

- Whether `VITE_AISSTREAM_API_KEY` is currently set in GitHub secrets (would make the ConflictMap WebSocket attempt live-connect on every page load).
- Whether a Part IV draft exists anywhere outside the repo.
- Whether the "1 years" subtitle bug still reproduces live; the literal string is not in `src/`.
- Whether the 404/routing-flash bug still reproduces; no obvious code smell in `App.tsx` / `404.html` / `ScrollToTop`.
- Precise "ceasefire collapse" date range and the post-October Hormuz series — the in-repo data stops April 30, so the brief's October readings (3.30–3.40% HY OAS, Hormuz ~60/day) are inputs to the audit but not independently verifiable from source.

Stopping here. Awaiting your go-ahead before touching anything else.
