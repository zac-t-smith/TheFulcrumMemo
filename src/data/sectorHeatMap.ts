/**
 * sectorHeatMap.ts — Fulcrum v5 Phase 3 (thin JSON reader)
 *
 * The Market column, static shock scores, and sector metadata are
 * pre-computed by quant/scripts/build_sector_heatmap.py and committed to
 * src/data/sectorHeatMap.json. This module just reads that JSON, adds
 * the dynamic Realized column from manual_inputs (render-guard applied),
 * computes the Composite and disagreement flag, and exposes the result
 * in the same SectorRow / SectorHeatMapResult shape the component
 * already consumes.
 *
 * Why the split: bundling thirteen daily ETF histories into the page
 * added ~2.5 MB to the dist. Doing the Market math build-time keeps the
 * bundle small while leaving the "verified-manual-input" path dynamic so
 * manual_inputs edits reflect on reload.
 */

import raw from './sectorHeatMap.json';
import { manualInputsBySeries, type VerifiedManualInput } from './manualInputs';

// =============================================================================
// Shared types — unchanged from the previous TS implementation.
// =============================================================================

export type SectorId =
  | 'healthcare_providers'
  | 'industrials_manufacturing'
  | 'consumer_discretionary'
  | 'retail'
  | 'restaurants'
  | 'chemicals'
  | 'software'
  | 'telecom_media'
  | 'autos_parts'
  | 'transportation'
  | 'building_products'
  | 'energy_ep'
  | 'energy_refiners'
  | 'commercial_real_estate';

export interface SectorMarketColumn {
  drawdown6m: number | null;
  drawdownPctl: number | null;
  vol3m: number | null;
  volPctl: number | null;
  score: number | null;
  score3mAgo: number | null;
  change3m: number | null;
  changeArrow: 'up' | 'down' | 'flat' | null;
}

export interface SectorFundamentalsColumn {
  score: number | null;
  note: string;
}

export interface SectorRealizedColumn {
  score: number | null;
  contributors: string[];
  note: string;
}

export interface SectorShockColumn {
  score: 1 | 2 | 3 | 4 | 5;
  sign: 'drag' | 'benefit' | 'mixed';
  rationale: string;
}

export interface SectorRow {
  id: SectorId;
  label: string;
  etf: string | null;
  historyStart: string | null;
  market: SectorMarketColumn;
  fundamentals: SectorFundamentalsColumn;
  realized: SectorRealizedColumn;
  shock: SectorShockColumn;
  composite: number | null;
  disagreement: {
    flag: boolean;
    spreadPctl: number | null;
    pair: [string, string] | null;
  };
}

export interface SectorHeatMapResult {
  asOfDate: string | null;
  rows: readonly SectorRow[];
  availability: {
    market: { active: number; total: number };
    fundamentals: { active: number; total: number };
    realized: { active: number; total: number };
  };
}

// =============================================================================
// JSON schema (matches build_sector_heatmap.py output).
// =============================================================================

interface JsonMarket {
  drawdown_6m: number;
  drawdown_pctl: number;
  vol_3m: number;
  vol_pctl: number;
  score: number;
  score_3m_ago: number;
  change_3m: number;
  change_arrow: 'up' | 'down' | 'flat';
}

interface JsonShock {
  score: 1 | 2 | 3 | 4 | 5;
  sign: 'drag' | 'benefit' | 'mixed';
  rationale: string;
}

interface JsonRow {
  id: SectorId;
  label: string;
  etf: string | null;
  history_start: string | null;
  manual_input_sector_tag: string | null;
  market: JsonMarket | null;
  shock: JsonShock;
}

interface JsonDoc {
  schema_version: number;
  generated_at: string;
  as_of_date: string | null;
  config: {
    trading_days_52w: number;
    trading_days_3m: number;
    disagreement_threshold_pctl: number;
  };
  rows: JsonRow[];
}

const doc = raw as unknown as JsonDoc;
const DISAGREEMENT_THRESHOLD = doc.config?.disagreement_threshold_pctl ?? 40;

// =============================================================================
// Realized column — dynamic, honors the manual_inputs render guard.
// =============================================================================

function bisectLeft(sorted: number[], x: number): number {
  let lo = 0, hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
function bisectRight(sorted: number[], x: number): number {
  let lo = 0, hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function buildRealizedColumn(
  sectorTag: string | null,
  asOfDate: string | null,
): SectorRealizedColumn {
  if (!sectorTag) {
    return { score: null, contributors: [], note: 'No sector tag mapped.' };
  }
  const fitch: VerifiedManualInput[] = (manualInputsBySeries['fitch_pc_default_ttm_by_sector'] ?? [])
    .filter(r => (r.sector ?? '') === sectorTag);
  const sp: VerifiedManualInput[] = (manualInputsBySeries['sp_large_co_bankruptcies_by_sector'] ?? [])
    .filter(r => (r.sector ?? '') === sectorTag);

  const contributors: string[] = [];
  if (fitch.length > 0) contributors.push('Fitch PC default (by sector)');
  if (sp.length > 0) contributors.push('S&P bankruptcies (by sector)');

  if (contributors.length === 0) {
    return { score: null, contributors, note: 'Awaiting verified manual input.' };
  }

  const pctls: number[] = [];
  for (const group of [fitch, sp]) {
    if (group.length === 0) continue;
    const sorted = group.map(r => r.value).sort((a, b) => a - b);
    const latest = group
      .filter(r => asOfDate === null || r.date <= asOfDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .pop();
    if (!latest) continue;
    const lo = bisectLeft(sorted, latest.value);
    const hi = bisectRight(sorted, latest.value);
    pctls.push(((lo + hi) / (2 * sorted.length)) * 100);
  }
  if (pctls.length === 0) {
    return { score: null, contributors, note: 'No observation on or before as-of date.' };
  }
  const avg = pctls.reduce((a, b) => a + b, 0) / pctls.length;
  return {
    score: Math.round(avg * 10) / 10,
    contributors,
    note: `${pctls.length} input${pctls.length === 1 ? '' : 's'} contributing.`,
  };
}

function fundamentalsColumn(): SectorFundamentalsColumn {
  return {
    score: null,
    note: 'Awaits Phase 4 distress radar (median PD + % names flagged).',
  };
}

// =============================================================================
// Row + composite + disagreement
// =============================================================================

function mapMarket(m: JsonMarket | null): SectorMarketColumn {
  if (m === null) {
    return {
      drawdown6m: null, drawdownPctl: null, vol3m: null, volPctl: null,
      score: null, score3mAgo: null, change3m: null, changeArrow: null,
    };
  }
  return {
    drawdown6m: m.drawdown_6m,
    drawdownPctl: m.drawdown_pctl,
    vol3m: m.vol_3m,
    volPctl: m.vol_pctl,
    score: m.score,
    score3mAgo: m.score_3m_ago,
    change3m: m.change_3m,
    changeArrow: m.change_arrow,
  };
}

function composite(row: {
  market: SectorMarketColumn;
  fundamentals: SectorFundamentalsColumn;
  realized: SectorRealizedColumn;
}): number | null {
  const parts: number[] = [];
  if (row.market.score !== null) parts.push(row.market.score);
  if (row.fundamentals.score !== null) parts.push(row.fundamentals.score);
  if (row.realized.score !== null) parts.push(row.realized.score);
  if (parts.length === 0) return null;
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 10) / 10;
}

function disagreement(row: SectorRow): SectorRow['disagreement'] {
  const cols: Array<[string, number]> = [];
  if (row.market.score !== null) cols.push(['Market', row.market.score]);
  if (row.fundamentals.score !== null) cols.push(['Fundamentals', row.fundamentals.score]);
  if (row.realized.score !== null) cols.push(['Realized', row.realized.score]);
  if (cols.length < 2) return { flag: false, spreadPctl: null, pair: null };
  let lo = cols[0], hi = cols[0];
  for (const c of cols) {
    if (c[1] < lo[1]) lo = c;
    if (c[1] > hi[1]) hi = c;
  }
  const spread = hi[1] - lo[1];
  return {
    flag: spread >= DISAGREEMENT_THRESHOLD,
    spreadPctl: Math.round(spread * 10) / 10,
    pair: [lo[0], hi[0]],
  };
}

export function buildSectorHeatMap(): SectorHeatMapResult {
  const rows: SectorRow[] = doc.rows.map(j => {
    const market = mapMarket(j.market);
    const realized = buildRealizedColumn(j.manual_input_sector_tag, doc.as_of_date);
    const fundamentals = fundamentalsColumn();
    const row: SectorRow = {
      id: j.id,
      label: j.label,
      etf: j.etf,
      historyStart: j.history_start,
      market,
      fundamentals,
      realized,
      shock: {
        score: j.shock.score,
        sign: j.shock.sign,
        rationale: j.shock.rationale,
      },
      composite: null,
      disagreement: { flag: false, spreadPctl: null, pair: null },
    };
    row.composite = composite(row);
    row.disagreement = disagreement(row);
    return row;
  });

  const avail = {
    market: {
      active: rows.filter(r => r.market.score !== null).length,
      total: rows.length,
    },
    fundamentals: {
      active: rows.filter(r => r.fundamentals.score !== null).length,
      total: rows.length,
    },
    realized: {
      active: rows.filter(r => r.realized.score !== null).length,
      total: rows.length,
    },
  };

  return { asOfDate: doc.as_of_date, rows, availability: avail };
}
