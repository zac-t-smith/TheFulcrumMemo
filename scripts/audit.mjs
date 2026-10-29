// Lighthouse accessibility + axe + console-error audit for 8 non-strategy
// routes. Serves dist/ via `vite preview` on 4177, drives each route in
// headless Chromium, prints a plain-text report. Run after `npm run build`.
//
//   node scripts/audit.mjs

import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import * as net from 'node:net';

const ROUTES = [
  { name: 'Home',           path: '/#/' },
  { name: 'Research',       path: '/#/memos' },
  { name: 'Memo (LYCRA)',   path: '/#/memos/lycra' },
  { name: 'Fulcrum Index',  path: '/#/fulcrum-index' },
  { name: 'Track Record',   path: '/#/positions' },
  { name: 'Casework',       path: '/#/casework' },
  { name: 'About',          path: '/#/about' },
  { name: 'Contact',        path: '/#/contact' },
];

const BASE = '/TheFulcrumMemo/';
const PORT = 4177;

async function waitForPort(port, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const s = net.createConnection({ port, host: '127.0.0.1' });
      s.once('connect', () => { s.end(); resolve(true); });
      s.once('error', () => resolve(false));
    });
    if (ok) return;
    await sleep(500);
  }
  throw new Error(`Timed out waiting for port ${port}`);
}

async function startPreview() {
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });
  await waitForPort(PORT);
  return proc;
}

async function auditRoute(route, browser) {
  const url = `http://127.0.0.1:${PORT}${BASE}${route.path.replace(/^\//, '')}`;

  const consoleErrors = [];
  const pageErrors = [];
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(1500);

  const axe = await new AxeBuilder({ page }).analyze();
  const axeViolations = axe.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.length,
    firstNode: v.nodes[0]?.html?.substring(0, 160),
  }));

  await context.close();

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--disable-gpu'] });
  let lhrScore = null;
  try {
    const lhr = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['accessibility'],
    });
    lhrScore = Math.round((lhr.lhr.categories.accessibility.score || 0) * 100);
  } finally {
    await chrome.kill();
  }

  return { route, lhrScore, axeViolations, consoleErrors, pageErrors };
}

async function main() {
  console.log('Starting vite preview on', PORT);
  const preview = await startPreview();

  try {
    const browser = await chromium.launch();
    const results = [];
    for (const route of ROUTES) {
      process.stdout.write(`Auditing ${route.name.padEnd(16)} ... `);
      try {
        const r = await auditRoute(route, browser);
        console.log(`A11y=${r.lhrScore}  axe=${r.axeViolations.length}  console=${r.consoleErrors.length}  pageErrors=${r.pageErrors.length}`);
        results.push(r);
      } catch (e) {
        console.log('FAILED', e.message);
        results.push({ route, error: e.message });
      }
    }
    await browser.close();

    console.log('\n' + '='.repeat(72));
    console.log('DETAIL');
    console.log('='.repeat(72));

    for (const r of results) {
      console.log(`\n--- ${r.route.name} (${r.route.path}) ---`);
      if (r.error) {
        console.log('  ERROR:', r.error);
        continue;
      }
      console.log(`  Lighthouse accessibility: ${r.lhrScore}`);
      if (r.axeViolations.length) {
        console.log(`  axe violations (${r.axeViolations.length}):`);
        for (const v of r.axeViolations) {
          console.log(`    [${v.impact}] ${v.id}: ${v.help} (${v.nodes} nodes)`);
          if (v.firstNode) console.log(`      first: ${v.firstNode}`);
        }
      } else {
        console.log('  axe violations: none');
      }
      if (r.consoleErrors.length) {
        console.log(`  console errors (${r.consoleErrors.length}):`);
        for (const e of r.consoleErrors) console.log('    ' + e.substring(0, 250));
      }
      if (r.pageErrors.length) {
        console.log(`  page errors (${r.pageErrors.length}):`);
        for (const e of r.pageErrors) console.log('    ' + e.substring(0, 250));
      }
    }
  } finally {
    preview.kill('SIGTERM');
  }
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
