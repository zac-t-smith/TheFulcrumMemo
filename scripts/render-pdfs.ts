#!/usr/bin/env tsx
/**
 * Playwright PDF renderer.
 *
 * Builds the site, serves dist/ on a local port, navigates to each
 * /#/print/memos/:slug route, and saves a real PDF via Chromium
 * print-to-PDF. PDFs are written to public/pdfs/ so the next build
 * includes them in dist/.
 *
 * Run via `npm run render:pdfs` after `npm run build`.
 * CI runs it as a workflow step; see .github/workflows/deploy.yml.
 */

import { chromium } from 'playwright';
import { spawn, ChildProcess } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import * as net from 'node:net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const BASE_URL_PATH = '/TheFulcrumMemo/';

// Keep in sync with src/pages/print/PrintMemoShell.tsx MEMO_MAP keys.
const MEMOS: Array<{ slug: string; filename: string }> = [
  { slug: 'kirklands',       filename: 'Fulcrum-Memo_Kirklands.pdf' },
  { slug: 'lycra',           filename: 'Fulcrum-Memo_LYCRA.pdf' },
  { slug: 'party-city',      filename: 'Fulcrum-Memo_Party-City.pdf' },
  { slug: 'iran',            filename: 'Fulcrum-Memo_Iran-Part-I.pdf' },
  { slug: 'iran-part-ii',    filename: 'Fulcrum-Memo_Iran-Part-II.pdf' },
  { slug: 'iran-part-iii',   filename: 'Fulcrum-Memo_Iran-Part-III.pdf' },
  { slug: 'shadow-partner',  filename: 'Fulcrum-Memo_Shadow-Partner.pdf' },
];

const OUT_DIR = resolve(ROOT, 'public', 'pdfs');

async function waitForPort(port: number, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise<boolean>((resolve) => {
      const s = net.createConnection({ port, host: '127.0.0.1' });
      s.once('connect', () => { s.end(); resolve(true); });
      s.once('error', () => resolve(false));
    });
    if (ok) return;
    await sleep(500);
  }
  throw new Error(`Timed out waiting for port ${port}`);
}

async function startPreview(): Promise<{ proc: ChildProcess; port: number }> {
  const port = 4173;
  const proc = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });
  proc.stdout?.on('data', (d) => process.stdout.write(`[preview] ${d}`));
  proc.stderr?.on('data', (d) => process.stderr.write(`[preview ERR] ${d}`));
  await waitForPort(port);
  return { proc, port };
}

async function renderOne(url: string, outPath: string): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    // Give any late-rendering charts a beat; our pages are mostly static.
    await page.waitForTimeout(1500);

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
        right: '0.75in',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size:9px;font-family:'IBM Plex Sans',Arial,sans-serif;color:#5A5650;width:100%;padding:0 0.75in;display:flex;justify-content:space-between;">
          <span>The Fulcrum Memo · zac.ty.smith@gmail.com</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
    });

    await writeFile(outPath, pdfBuffer);
    console.log(`  ✓ ${outPath}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const { proc, port } = await startPreview();
  const baseUrl = `http://127.0.0.1:${port}${BASE_URL_PATH}`;

  try {
    for (const memo of MEMOS) {
      const url = `${baseUrl}#/print/memos/${memo.slug}`;
      const outPath = resolve(OUT_DIR, memo.filename);
      console.log(`Rendering ${memo.slug} -> ${memo.filename}`);
      await renderOne(url, outPath);
    }
    console.log(`\n${MEMOS.length} PDFs written to ${OUT_DIR}`);
  } finally {
    proc.kill('SIGTERM');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
