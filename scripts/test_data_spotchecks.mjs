#!/usr/bin/env node
// Spot-check the three static FRED series files against known-good values.
// If any check fails, exits 1 so CI can block the merge. If a value fails
// here it means either the repo file drifted from FRED or the expected
// value is stale.
//
// Run locally:
//   node scripts/test_data_spotchecks.mjs
//
// How to add a new check:
//   1. Pull the value from FRED directly:
//      curl "https://fred.stlouisfed.org/graph/fredgraph.csv?id=VIXCLS&cosd=YYYY-MM-DD&coed=YYYY-MM-DD"
//   2. Add an entry below with the exact value, series file path, and date.
//   3. Re-run this script. Failing with "no match" means a date you expected
//      is missing from the repo file (data generator hasn't been re-run);
//      failing with "value mismatch" is the real integrity failure.

import * as fs from 'node:fs';

function readRepo(file) {
  const src = fs.readFileSync(file, 'utf8');
  const map = new Map();
  const re = /\{\s*date:\s*"(\d{4}-\d{2}-\d{2})",\s*value:\s*([\d.]+)\s*\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    map.set(m[1], parseFloat(m[2]));
  }
  return map;
}

const checks = [
  // VIX — VIXCLS. Spot values confirmed against fred.stlouisfed.org direct
  // CSV pull on 2026-11-04 (US-Iran Conflict archive window Feb–Apr 2026).
  { file: 'src/data/vixHistory.ts', date: '2026-02-27', expected: 19.86, tol: 0.02, label: 'VIX pre-conflict baseline' },
  { file: 'src/data/vixHistory.ts', date: '2026-03-03', expected: 23.57, tol: 0.02, label: 'VIX Mar 3 (conflict week 1)' },
  { file: 'src/data/vixHistory.ts', date: '2026-03-09', expected: 25.50, tol: 0.02, label: 'VIX Mar 9 close' },
  { file: 'src/data/vixHistory.ts', date: '2026-03-27', expected: 31.05, tol: 0.02, label: 'VIX Mar 27 — 2026 peak close' },
  { file: 'src/data/vixHistory.ts', date: '2026-03-31', expected: 25.25, tol: 0.02, label: 'VIX Mar 31 month-end close' },
  { file: 'src/data/vixHistory.ts', date: '2026-04-30', expected: 16.89, tol: 0.02, label: 'VIX Apr 30 last archived obs' },

  // HY OAS — BAMLH0A0HYM2. Repo stored in bps; FRED published in %. Factor 100.
  // Note: Part II narrative cites "HY OAS entered the conflict at ~281 bps"
  // but the actual FRED Feb 27 value is 310 bps. 281 is the Jan 2026 average,
  // not the pre-war close.
  { file: 'src/data/hyOasHistory.ts', date: '2026-02-27', expected: 310, tol: 1, label: 'HY OAS pre-conflict baseline (FRED close)' },
  { file: 'src/data/hyOasHistory.ts', date: '2026-03-09', expected: 319, tol: 1, label: 'HY OAS Mar 9 (early conflict)' },
  { file: 'src/data/hyOasHistory.ts', date: '2026-03-30', expected: 346, tol: 1, label: 'HY OAS Mar 30 — 2026 peak close' },
  { file: 'src/data/hyOasHistory.ts', date: '2026-04-30', expected: 283, tol: 1, label: 'HY OAS Apr 30 last archived obs' },

  // Brent spot — DCOILBRENTEU. Expect $71.32 Feb 27, confirmed in Part III memo.
  { file: 'src/data/brentSpotHistory.ts', date: '2026-02-27', expected: 71.32, tol: 0.02, label: 'Brent pre-conflict baseline' },
  { file: 'src/data/brentSpotHistory.ts', date: '2026-03-09', expected: 94.35, tol: 0.02, label: 'Brent Mar 9 (post-insurance expiry)' },
  { file: 'src/data/brentSpotHistory.ts', date: '2026-04-02', expected: 127.61, tol: 0.02, label: 'Brent Apr 2 (contrasts with narrative Dated-Brent $141)' },
  { file: 'src/data/brentSpotHistory.ts', date: '2026-04-27', expected: 113.89, tol: 0.02, label: 'Brent Apr 27 — repo file last obs' },
];

const cache = new Map();
function get(file) {
  if (!cache.has(file)) cache.set(file, readRepo(file));
  return cache.get(file);
}

let failed = 0;
for (const c of checks) {
  const data = get(c.file);
  const actual = data.get(c.date);
  if (actual === undefined) {
    console.error(`FAIL  [no date]   ${c.date}  ${c.label}  (${c.file})`);
    failed++;
    continue;
  }
  const diff = actual - c.expected;
  if (Math.abs(diff) > c.tol) {
    console.error(`FAIL  [mismatch]  ${c.date}  ${c.label}  expected=${c.expected}  actual=${actual}  Δ=${diff.toFixed(2)}  tol=${c.tol}`);
    failed++;
  } else {
    console.log(`OK    ${c.date}  ${c.label}  ${actual} (expected ${c.expected}, Δ=${diff.toFixed(2)})`);
  }
}

if (failed > 0) {
  console.error(`\n${failed}/${checks.length} spot-checks failed.`);
  process.exit(1);
} else {
  console.log(`\nAll ${checks.length} spot-checks passed.`);
}
