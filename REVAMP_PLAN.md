# The Fulcrum Memo — Phase 5 Revamp Plan (v2)

**Updated:** September 30, 2026. Supersedes v1.
**Repo:** `zac-t-smith/TheFulcrumMemo` (renamed from `FulcrumMemo`). **Live URL:** `https://zac-t-smith.github.io/TheFulcrumMemo/`
**Executor:** Claude Code. Load the `fulcrum-memo` skill, **except its Visual Conventions section, which Phase 5D replaces** (the cream/Economist theme is retired).
**Workflow:** one sub-phase at a time; report what shipped, what changed, spot checks; screenshot to `quant/screenshots/5x_*.png`; **stop for sign-off**.
**Design reference:** the approved mockup canvas "The Fulcrum Memo — Site Redesign" (Home + Memo page artboards). Tokens are copied into 5D below so Claude Code doesn't need the canvas.

---

## Kickoff prompt for Claude Code (paste this)

> Read `REVAMP_PLAN.md` at the repo root and the `fulcrum-memo` skill. Execute **Phase 5A only**. Do not start 5B. When 5A's verification gate passes, report back and stop.

---

## Phase 0 — Decisions (locked)

| # | Decision | Answer |
|---|---|---|
| D1 | LinkedIn | `https://www.linkedin.com/in/zac-t-smith/` everywhere |
| D2 | X / Twitter `@TheFulcrumMemo` | Not Zac's. Remove the account link from the homepage. (Generic "share to X" buttons on memos may stay.) |
| D3 | `thefulcrummemo.com` | Not Zac's. Remove from every PDF footer and generator; use `zac-t-smith.github.io/TheFulcrumMemo` |
| D4 | Canonical URL | `https://zac-t-smith.github.io/TheFulcrumMemo/`. Old URLs redirect (5A-3). |
| D5 | Email | `zac.ty.smith@gmail.com` everywhere (replaces both `zac.t.smith@outlook.com` and the dead `financier.com` address) |
| D6 | Grades for Party City, the four April Positions, and each Iran call | **Open.** Zac supplies before 5E. Kirkland's and LYCRA = Resolved in line. |
| D7 | Home Depot (Operations) clearance | **Open.** Hard gate on 5F. |
| D8 | Iran coverage | **Consolidate and close, reopenable.** One series in Research, not a site theme. See 5E-4. |
| D9 | Visual design | **New system** (5D). Credit-desk professional, calm and warm; replaces cream/Economist. |

---

## Phase 5A — Rename emergency + link and file integrity

The repo rename means the deployed build (base `/FulcrumMemo/`) is now served from `/TheFulcrumMemo/`, so its JS and CSS requests 404 and the site is likely blank. Fix this first.

**5A-1. Repath for the rename.** Replace `/FulcrumMemo/` in all seven locations:
- `vite.config.ts` → `base: "/TheFulcrumMemo/"`
- `worldview-fm/vite.config.ts` → `base` and `CESIUM_BASE_URL` → `/TheFulcrumMemo/worldview-fm/…`
- `worldview-fm/index.html` → `window.CESIUM_BASE_URL`
- `public/404.html` → both redirect targets
- `src/components/Navbar.tsx` WorldView href → build from `import.meta.env.BASE_URL` instead of hardcoding
- `src/pages/Index.tsx` canonical → full new URL
- Docs: `CLAUDE.md`, `SITE_STRUCTURE_GUIDE.md`, `iran_analysis_complete.md` URL mentions
Also run `git remote set-url origin https://github.com/zac-t-smith/TheFulcrumMemo.git` locally.

**5A-2. Asset helper; fix every PDF link.** hrefs like `/memos/X.pdf` skip the base path and 404 in production.
```ts
// src/lib/asset.ts
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;
```
Use for every `public/` reference: `Memos.tsx` (6), `KirklandsMemo.tsx`, `LycraMemo.tsx`, `PartyCityMemo.tsx`, `Resume.tsx`. Rule for `CLAUDE.md`: no raw `/…` paths to `public/` assets, ever.

**5A-3. Redirects for old URLs (Zac does this; Claude Code prepares the files).** Two old addresses are in circulation: `/FulcrumMemo/` (site canonical until today) and `/The-Fulcrum-Memo` (resume and email signature). Create two tiny public repos, `FulcrumMemo` and `The-Fulcrum-Memo`, each with Pages enabled and identical `index.html` and `404.html`:
```html
<!doctype html><meta charset="utf-8"><title>The Fulcrum Memo</title>
<link rel="canonical" href="https://zac-t-smith.github.io/TheFulcrumMemo/">
<meta http-equiv="refresh" content="0; url=https://zac-t-smith.github.io/TheFulcrumMemo/">
<script>location.replace("https://zac-t-smith.github.io/TheFulcrumMemo/" + location.hash);</script>
<p><a href="https://zac-t-smith.github.io/TheFulcrumMemo/">The Fulcrum Memo has moved here.</a></p>
```
Note: creating a new repo named `FulcrumMemo` ends GitHub's automatic git redirect from the old name, which is why the `set-url` in 5A-1 comes first. Claude Code writes these two files to `docs/redirect/` for Zac to copy.

**5A-4. Resume.** Replace `public/Smith_Zachary_Resume.pdf` with the new web version Zac provides (email fixed, new URL, internal pilot code name and store number removed). Point `Resume.tsx` to `asset("Smith_Zachary_Resume.pdf")`; the old `/resume/Zachary_Smith_Resume.pdf` path never existed. Delete the root duplicate `Smith, Zachary_Resume.pdf`.

**5A-5. Missing PDF.** `Iran_Sovereign_Distress_Analysis_Series_3.pdf` does not exist. Hide its button for now; 5E-4 decides whether to generate it.

**5A-6. Contact details.** Apply D1, D2, D3, D5 across `Index.tsx`, `Resume.tsx`, `Footer.tsx`, `Navigation.tsx`, `generatePdf.ts`, and the three Iran `*Full.tsx` footerText strings.

**5A-7. About/Contact anchors.** `/#about` and `/#contact` under `HashRouter` plus `ScrollToTop` likely land at page top. Verify; if broken, scroll to `location.hash` targets in `ScrollToTop`. (5D moves About to its own route anyway; the fix still matters for links already shared.)

**5A-8. Link previews.** `index.html` title/description/og tags still say "Iran Conflict Analysis & Live Tracking". Replace with: title "The Fulcrum Memo — Zac Smith", description "Independent research on restructurings, special situations and the credit cycle." Add `og:url` (new canonical) and a 1200×630 `og:image` in `public/` using the 5D palette and the stacked-bar logomark.

**Gate 5A:** `npm run build`, serve `dist/` under `/TheFulcrumMemo/`, crawl every route and every `.pdf` href, report any non-200. Push, confirm the Pages deploy succeeds, screenshot the live homepage and a working PDF download.

---

## Phase 5B — Revive the data pipeline

All series stop April 27 to May 1, 2026; the daily workflow hasn't committed since.

- **5B-1.** Report `Update Fulcrum Data v4` run history and last error before changing anything. GitHub auto-disables scheduled workflows after 60 days of repo inactivity; re-enable.
- **5B-2.** Confirm `FRED_API_KEY` secret exists; run via `workflow_dispatch`.
- **5B-3.** Bot commits made with `GITHUB_TOKEN` never trigger `deploy.yml`, so fresh data never reaches the live site. Add a `workflow_run` trigger on "Update Fulcrum Data v4" (types: completed) and guard the build job with `if: github.event_name != 'workflow_run' || github.event.workflow_run.conclusion == 'success'`.
- **5B-4.** Re-verify MD callout, regime pill, readout strip against the skill's single-source-of-truth rules. Log any regime change since April in `quant/DEFERRED.md`.

**Gate 5B:** Fulcrum Index as-of date within 3 trading days, live; link to green Actions run.

---

## Phase 5C — Hygiene and performance

The repo is public. The skill calls it private; Zac should correct the skill.

- **5C-1. Delete dead code** after confirming zero imports: `Navigation.tsx`, `ProtectedMemo.tsx` (client-side passcode, dead email), `MemoCard.tsx`, `PortfolioContext.tsx`, `pages/memos/IranMemo.tsx`, `pages/memos/IranMemoPartII.tsx`, `services/exportService.ts`, `services/geminiService.ts` (the only TypeScript errors), `services/liveCompanyData.ts`; trace `financialDataService`/`fmp`/`yahooFinance` and remove if only dead code reaches them. Keep `JargonContext`/`rxJargon.ts` for the RX field guide.
- **5C-2. Root clutter:** remove `Additions_Needed/` (the theme-migrated copies in `src/components/rx/` are canonical), `outputs/`, root `iran_analysis_complete.md`, `quant/scripts/__pycache__/` (gitignore it). Move `DAYS_32-34_REVIEW.md`, `SITE_STRUCTURE_GUIDE.md` to `docs/archive/`.
- **5C-3. Code-split.** Single 4.7 MB JS bundle (1.1 MB gzipped). `React.lazy` + `Suspense` per route. Target homepage initial JS under 300 KB gzipped; report before/after.
- **5C-4.** `npx tsc --noEmit -p tsconfig.app.json` clean.

**Gate 5C:** size table, clean typecheck, crawl green.

---

## Phase 5D — New design system and information architecture

### Design tokens (replace cream/Economist everywhere)

Concept: an engraved bond certificate, modernized. Evergreen on a cool white page reads as credit-desk professional and calm; brass marks the fulcrum. The one signature element is the hero's capital-structure graphic; everything else stays quiet.

```css
:root {
  --paper:      #F3F5F2;  /* page background (cool, not cream) */
  --surface:    #FFFFFF;  /* panels, research band, call boxes */
  --ink:        #15231F;  /* headings, body */
  --ink-soft:   #43534D;  /* secondary text (≥7:1 on paper) */
  --ink-mute:   #6B7A74;  /* meta text, dates (≥4.5:1 on paper) */
  --evergreen:  #1E5A4C;  /* primary accent, links, buttons, "resolved in line" */
  --evergreen-deep: #123B31; /* hover */
  --sage:       #D9E4DD;  /* fills, pills, out-of-the-money tranches */
  --brass:      #A8732A;  /* the fulcrum line, "what happened" rule, partial grades */
  --brick:      #8C3A2B;  /* "resolved, missed" only */
  --rule:       #C9D3CD;  /* hairlines */
}
```
- **Type:** Newsreader (Google Fonts, opsz 6–72) for headlines and long-form memo body; IBM Plex Sans for UI, nav, tables, figures. `font-variant-numeric: tabular-nums` globally. No monospace except code.
- **Scale:** hero 68/1.04, page title 60/1.06, section 44–48, sub 26–32, memo body 20/1.7 serif, UI body 16–17/1.6, meta 14–15.
- **Shape:** 6px buttons, 8–10px panels, pills fully rounded. Hairline rules for lists; 2px ink top-rule to open a column. No drop shadows, no gradients.
- **Copy conventions:** sentence case everywhere, no all-caps labels, no arrow glyphs on links, no middle-dot meta strings.
- **Logomark:** four stacked bars (evergreen, evergreen, brass, rule-grey), i.e. a capital stack with the fulcrum marked.
- **Charts:** Fulcrum Index regime colors and tier palette are data semantics; leave them unchanged in 5D. Only chart chrome (backgrounds, gridlines, axis text) moves to the new tokens.

Implement as CSS variables in `src/index.css` mapped into `tailwind.config.ts`, replace hardcoded cream hexes (`#f7f5f0`, `#1a1a1a`, `#c8102e`, `#c9a227`, etc.) repo-wide, and rewrite the Visual Conventions section of `CLAUDE.md`. Zac updates the skill file himself.

### Information architecture

| Nav | Route | Contents |
|---|---|---|
| Research | `/research` (`/memos` redirects) | Corporate credit shelf, then Sovereign and macro shelf |
| Fulcrum Index | `/fulcrum-index` | Unchanged route, restyled |
| Operations | `/operations` | Case studies (5F) |
| Track record | `/track-record` | Every call and former position, graded |
| About | `/about` | Bio, headshot, resume download, contact |

Footer "Archive": Iran field notes, conflict timeline, WorldView map, RX field guide (`/lab/rx-field-guide`, from `src/components/rx/*`).

- **5D-1.** Build the homepage to match the mockup's Home artboard: hero with capital-structure figure and caption; three columns (Credit calls, graded / A live read on the credit cycle / Operating experience); Research band; About band; footer. Live values (composite, regime, as-of) pull from `live` in `fulcrumIndex.ts`, never hardcoded.
- **5D-2.** Remove "Current Focus: Evercore, Alvarez & Marsal, and Lazard."
- **5D-3.** Every existing URL keeps working (redirects, not deletions).

**Gate 5D:** screenshots of Home at 1440px and 390px, nav on mobile, redirect table, crawl green, contrast check on `--ink-mute` and pill text.

---

## Phase 5E — Research, memo template, Track Record, Iran consolidation

- **5E-1. Research page.** Corporate credit shelf first (Kirkland's, LYCRA, Party City), then Sovereign and macro (one entry: the Iran Conflict Series). Row: serif title, one-line dek, date, status.
- **5E-2. `src/data/calls.ts`** is the single source for status: `{id, memoId, dateCalled, claim, status, resolvedDate, evidence, sourceUrl}` with status `resolved-in-line | resolved-partial | resolved-missed | open | superseded`. Colors: evergreen / brass / brick / outline / outline. No hardcoded status prose.
- **5E-3. Memo template** (mockup's Memo page artboard): breadcrumb, title, dek, meta; **The call** box (evergreen top rule); **What happened** box (brass top rule, dated, sourced, appended, original text never edited); serif body at 720px measure; right rail with PDF button, contents, related memos. Apply to Kirkland's, LYCRA, Party City first, then the Iran parts.
- **5E-4. Iran consolidation (D8).**
  - One hub at `/research/iran-series`: series intro, Parts I to III and The Shadow Partner in order, links to field notes, timeline, WorldView.
  - A closing note, visibly dated, from Zac: "Coverage ran Feb 28 to Apr 2, 2026" plus a short retrospective on which calls held (Zac writes, ~600 words; placeholder until then).
  - Field notes, timeline, WorldView get an archive banner pointing to the hub. Headers stop implying "Day 34" is current.
  - Iran appears nowhere in primary nav or on the homepage beyond its single Research row.
  - **Reopenable:** the hub's status comes from one flag in `src/data/iranSeries.ts` (`status: 'closed' | 'active'`). Reopening = flip the flag and add Part V; nothing is deleted.
  - Series 3 PDF: generate from the Part III page with `generatePdf.ts` if clean; otherwise leave hidden.
- **5E-5. Track Record page.** Table of every call plus the four former Positions: date, claim, status, evidence. Misses shown. Positions page redirects here.

**Gate 5E:** screenshots of Research, Kirkland's memo with both boxes, Iran hub, Track Record.

---

## Phase 5F — Operations (Home Depot), gated

**Nothing in 5F merges to `main` until Zac confirms D7:** checked Home Depot's Business Code of Conduct / social media guidance, ran the concept past Justin Keller, and the inventory framework has been through the Chris Ayotte meeting. The repo is public, so merging is publishing. Build on a branch.

**Rule: methods yes, Home Depot data no.**

| Publish | Never publish |
|---|---|
| The problem, framed as any large retailer has it | Store number, sales, shrink %, any figure from HD data |
| Zac's role and the method's design principles | Internal tool, program, or pilot names or code names |
| Demos on synthetic data, labeled synthetic | Screenshots, SOP text, leader-guide formulas, labor standards |
| Public facts (10-K shrink language, retail inventory method) | Names of associates, managers, SSC contacts; anyone's performance |
| Outcomes as Zac's own actions | Adoption claims not confirmed in writing; workbook downloads |

The front-end metrics pilot is excluded entirely, even at the method level.

**Case study template:** problem, constraint, method, synthetic interactive demo (canvas chart, "Synthetic data" label always visible), what it shows.

**Candidates (Zac approves each):**
1. Where to spend count-prep hours: pre-count prioritization, priority = value × difficulty, pre-registered validation. Demo: 200 synthetic locations, concentration curve.
2. A scorecard that survives scrutiny: goal-relative scoring, outliers as diagnostics, data-quality checks, robustness across weightings. Demo: synthetic team with weight sliders.
3. When the denominator lies: multi-shift labor productivity attribution, generic, no tool names. Hold until the related community post has played out.
4. Inventory audits through an ROIC lens: cage audit to shrink to GMROI, generic retail math.
5. Best Option Restoration: growth, 90–120 day collections, 13-week cash flow, creditor negotiation, wind-down, and what an ABL and cash-conversion discipline would have changed. No counterparty names.

**Gate 5F:** Zac reviews each page against the table line by line. Claude Code greps the branch for `0801`, `D90`, the freight tool name, `SSC`, contact surnames, and `%` in Operations pages; reports every hit.

---

## Phase 5G — About and Resume pages

- **5G-1. About page:** bio from the mockup's About band, including the Home Depot chapter; real headshot (`src/assets/headshot.jpg`); contact list per Phase 0. Zac approves final copy.
- **5G-2. Resume page:** mirrors the web resume PDF; download button via `asset()`.

**Gate 5G:** full-site screenshots desktop and mobile, final crawl, Lighthouse for Home and Research (report only).

---

## Out of scope (log in `quant/DEFERRED.md`)
- WorldView-FM backend issues (live oil panel, sitrep 500, ephemeral events, globe click crash, military flights). Archived surface.
- Custom domain.
- Any change to v4 composite weights without re-running the backtest.
