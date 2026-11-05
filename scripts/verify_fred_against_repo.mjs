// Cross-check the three FRED/EIA historical files in src/data against a fresh
// FRED CSV download. Reports, for each series:
//   - counts: repo obs, fresh obs, intersecting dates
//   - mismatches: dates where repo value differs from fresh value (any tolerance)
//   - dates in fresh but not in repo
//   - dates in repo but not in fresh
//
// Run: node scripts/verify_fred_against_repo.mjs <freshCsvDir>
//
// Fresh CSV files expected:
//   <freshCsvDir>/VIXCLS.csv
//   <freshCsvDir>/BAMLH0A0HYM2.csv
//   <freshCsvDir>/DCOILBRENTEU.csv

import * as fs from 'node:fs';
import * as path from 'node:path';

const freshDir = process.argv[2] || '/tmp/fred_fresh';

const SERIES = [
  { repoFile: 'src/data/vixHistory.ts',       csv: 'VIXCLS.csv',        tol: 0.005, label: 'VIX (VIXCLS)' },
  { repoFile: 'src/data/hyOasHistory.ts',     csv: 'BAMLH0A0HYM2.csv',  tol: 0.5,   label: 'HY OAS (BAMLH0A0HYM2) — repo in bps, FRED in %' },
  { repoFile: 'src/data/brentSpotHistory.ts', csv: 'DCOILBRENTEU.csv',  tol: 0.005, label: 'Brent Spot (DCOILBRENTEU)' },
];

function readRepo(file) {
  // Match lines like `  { date: "2026-03-05", value: 23.5700 },`
  const src = fs.readFileSync(file, 'utf8');
  const map = new Map();
  const re = /\{\s*date:\s*"(\d{4}-\d{2}-\d{2})",\s*value:\s*([\d.]+)\s*\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    map.set(m[1], parseFloat(m[2]));
  }
  return map;
}

function readCsv(file) {
  const src = fs.readFileSync(file, 'utf8');
  const map = new Map();
  const lines = src.trim().split(/\r?\n/).slice(1); // skip header
  for (const line of lines) {
    const [date, raw] = line.split(',');
    if (!date || raw === undefined || raw === '.') continue;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) continue;
    map.set(date, n);
  }
  return map;
}

function fmt(n, d = 4) { return typeof n === 'number' ? n.toFixed(d) : String(n); }

for (const s of SERIES) {
  console.log(`\n===== ${s.label} =====`);
  console.log(`  repo: ${s.repoFile}  fresh: ${freshDir}/${s.csv}`);
  const repo = readRepo(s.repoFile);
  const fresh = readCsv(path.join(freshDir, s.csv));

  const repoDates = new Set(repo.keys());
  const freshDates = new Set(fresh.keys());

  const common = [...repoDates].filter(d => freshDates.has(d)).sort();
  const onlyRepo = [...repoDates].filter(d => !freshDates.has(d)).sort();
  const onlyFresh = [...freshDates].filter(d => !repoDates.has(d)).sort();

  console.log(`  repo obs: ${repoDates.size}  fresh obs: ${freshDates.size}  common: ${common.length}`);
  console.log(`  only-in-repo: ${onlyRepo.length}  only-in-fresh: ${onlyFresh.length}`);

  // Attempt scale detection: compare medians of first few common dates.
  // HY OAS from FRED is in %; repo file in bps. factor = 100.
  // If median ratio (repo/fresh) across first 10 common ~= 100, auto-rescale fresh for comparison.
  const sample = common.slice(0, 50).map(d => ({ d, r: repo.get(d), f: fresh.get(d) }));
  const ratios = sample.map(x => x.r / x.f).filter(Number.isFinite).sort((a,b) => a-b);
  const medianRatio = ratios[Math.floor(ratios.length / 2)];
  let scale = 1;
  if (medianRatio > 50 && medianRatio < 200) {
    scale = 100;
    console.log(`  median ratio ${medianRatio.toFixed(2)} suggests FRED→repo scale factor ${scale} (percent→bps).`);
  }

  // Compare every common date.
  const mismatches = [];
  for (const d of common) {
    const r = repo.get(d);
    const fScaled = fresh.get(d) * scale;
    if (Math.abs(r - fScaled) > s.tol) {
      mismatches.push({ d, repo: r, fresh: fresh.get(d), freshScaled: fScaled, diff: r - fScaled });
    }
  }
  console.log(`  mismatches (|diff| > ${s.tol}): ${mismatches.length}`);
  if (mismatches.length > 0) {
    console.log('  first 10 mismatches:');
    for (const m of mismatches.slice(0, 10)) {
      console.log(`    ${m.d}  repo=${fmt(m.repo)}  fresh=${fmt(m.fresh)} (scaled ${fmt(m.freshScaled)})  Δ=${fmt(m.diff)}`);
    }
  }

  if (onlyRepo.length > 0) {
    console.log('  first 5 only-in-repo dates:');
    for (const d of onlyRepo.slice(0, 5)) console.log(`    ${d}  repo=${fmt(repo.get(d))}`);
  }
  if (onlyFresh.length > 0) {
    console.log('  first 5 only-in-fresh dates:');
    for (const d of onlyFresh.slice(0, 5)) console.log(`    ${d}  fresh=${fmt(fresh.get(d))}`);
    console.log(`  (last only-in-fresh: ${onlyFresh[onlyFresh.length - 1]})`);
  }
}
console.log('\nDone.');
