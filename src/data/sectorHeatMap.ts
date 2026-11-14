/**
 * sectorHeatMap.ts — Fulcrum v5 Phase 3
 *
 * Builds the sector heat map: one row per RX-watched sector, columns for
 * Market (ETF-derived), Fundamentals (Phase 4 placeholder), Realized
 * (from manual_inputs), and Shock exposure (static 1-5, oil/freight
 * sensitivity). Each column is scored 0-100 as the sector's trailing
 * percentile against its own history; the Composite is the mean of the
 * available columns. Columns without any data are left null — the
 * component shows a dash rather than a fake score.
 *
 * Software is the spec's example of what this view is designed to
 * surface: realized private-credit defaults are low (0.6%) while the
 * loan distress ratio is high on AI-disruption fears. That gap is a
 * finding, so the module also computes a disagreement spread.
 */

import type { DailyDataPoint } from './types';

import { xlvHistory } from './xlvHistory';
import { xliHistory } from './xliHistory';
import { xlyHistory } from './xlyHistory';
import { xrtHistory } from './xrtHistory';
import { xlbHistory } from './xlbHistory';
import { igvHistory } from './igvHistory';
import { xlcHistory } from './xlcHistory';
import { carzHistory } from './carzHistory';
import { iytHistory } from './iytHistory';
import { xhbHistory } from './xhbHistory';
import { crakHistory } from './crakHistory';
import { vnqHistory } from './vnqHistory';
import { xleHistory } from './xleHistory';

import { manualInputsBySeries, type VerifiedManualInput } from './manualInputs';

// =============================================================================
// Shared types
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

export interface ShockExposure {
  /** 1 (minimal) to 5 (maximum) oil/freight-cost sensitivity. */
  score: 1 | 2 | 3 | 4 | 5;
  sign: 'drag' | 'benefit' | 'mixed';
  rationale: string;
}

interface SectorDef {
  id: SectorId;
  label: string;
  etf: string | null;
  etfHistory: DailyDataPoint[] | null;
  manualInputSectorTag: string | null;  // matches `sector` field in manual_inputs.json
  shock: ShockExposure;
}

// -----------------------------------------------------------------------------
// Static sector definitions — single source of truth for the table.
// Shock-exposure rationales are the documentation the spec requires
// ("static, documented 1-5 score for oil and freight cost sensitivity").
// -----------------------------------------------------------------------------

const SECTORS: readonly SectorDef[] = [
  {
    id: 'healthcare_providers',
    label: 'Healthcare providers',
    etf: 'XLV',
    etfHistory: xlvHistory,
    manualInputSectorTag: 'healthcare_providers',
    shock: { score: 2, sign: 'drag', rationale: 'Thin direct energy exposure; wage and supply-cost pass-through limited.' },
  },
  {
    id: 'industrials_manufacturing',
    label: 'Industrials & manufacturing',
    etf: 'XLI',
    etfHistory: xliHistory,
    manualInputSectorTag: 'industrials_manufacturing',
    shock: { score: 3, sign: 'drag', rationale: 'Freight and energy inputs lift COGS; mixed order-book response to oil shocks.' },
  },
  {
    id: 'consumer_discretionary',
    label: 'Consumer discretionary',
    etf: 'XLY',
    etfHistory: xlyHistory,
    manualInputSectorTag: 'consumer_discretionary',
    shock: { score: 3, sign: 'drag', rationale: 'Gas-price drag on real household spending; big-ticket demand especially sensitive.' },
  },
  {
    id: 'retail',
    label: 'Retail',
    etf: 'XRT',
    etfHistory: xrtHistory,
    manualInputSectorTag: 'retail',
    shock: { score: 3, sign: 'drag', rationale: 'Logistics-cost pass-through hits margin; discretionary categories bear discretionary spend cuts.' },
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    etf: null,
    etfHistory: null,
    manualInputSectorTag: 'restaurants',
    shock: { score: 3, sign: 'drag', rationale: 'Commodity-food input inflation plus gas-price-driven traffic drop; no clean sector ETF.' },
  },
  {
    id: 'chemicals',
    label: 'Chemicals / materials',
    etf: 'XLB',
    etfHistory: xlbHistory,
    manualInputSectorTag: 'chemicals',
    shock: { score: 5, sign: 'drag', rationale: 'Direct feedstock cost from naphtha and natural gas; margin compresses fast on supply shocks.' },
  },
  {
    id: 'software',
    label: 'Software',
    etf: 'IGV',
    etfHistory: igvHistory,
    manualInputSectorTag: 'software',
    shock: { score: 1, sign: 'drag', rationale: 'Minimal energy or freight exposure; indirect only through customer IT budget cycles.' },
  },
  {
    id: 'telecom_media',
    label: 'Telecom / media',
    etf: 'XLC',
    etfHistory: xlcHistory,
    manualInputSectorTag: 'telecom_media',
    shock: { score: 1, sign: 'drag', rationale: 'Low direct exposure; ad-spend cyclicality dominates and runs on different cycle.' },
  },
  {
    id: 'autos_parts',
    label: 'Autos & parts',
    etf: 'CARZ',
    etfHistory: carzHistory,
    manualInputSectorTag: 'autos_parts',
    shock: { score: 4, sign: 'drag', rationale: 'Commodity inputs plus gas-price drag on discretionary big-ticket demand.' },
  },
  {
    id: 'transportation',
    label: 'Transportation (airlines + trucking)',
    etf: 'IYT',
    etfHistory: iytHistory,
    manualInputSectorTag: 'transportation',
    shock: { score: 5, sign: 'drag', rationale: 'Fuel is a direct first-line COGS. Airlines (JETS proxy) identical profile; captured in this row.' },
  },
  {
    id: 'building_products',
    label: 'Building / homebuilders',
    etf: 'XHB',
    etfHistory: xhbHistory,
    manualInputSectorTag: 'building_products',
    shock: { score: 3, sign: 'drag', rationale: 'Mortgage-rate transmission via Fed-trapped inflation is the dominant channel; direct energy exposure secondary.' },
  },
  {
    id: 'energy_ep',
    label: 'Energy — E&P',
    etf: 'XLE',
    etfHistory: xleHistory,
    manualInputSectorTag: 'energy_ep',
    shock: { score: 4, sign: 'benefit', rationale: 'Topline is oil price; E&P margins expand on supply shocks. Benefit, not drag.' },
  },
  {
    id: 'energy_refiners',
    label: 'Energy — refiners',
    etf: 'CRAK',
    etfHistory: crakHistory,
    manualInputSectorTag: 'energy_refiners',
    shock: { score: 3, sign: 'mixed', rationale: 'Crack spreads widen on supply shocks (benefit) but feedstock cost rises (drag). Net sign depends on refined-product tightness.' },
  },
  {
    id: 'commercial_real_estate',
    label: 'Commercial real estate / office',
    etf: 'VNQ',
    etfHistory: vnqHistory,
    manualInputSectorTag: 'commercial_real_estate',
    shock: { score: 2, sign: 'drag', rationale: 'Indirect transmission via rates and discount-rate re-pricing; office vacancies dominate the live story.' },
  },
] as const;

// =============================================================================
// ETF signal: 6-month drawdown from 52-week high + 3-month realized vol.
// =============================================================================

interface EtfSignalPoint {
  date: string;
  drawdown: number;   // price / 52w_high - 1, ≤ 0
  vol3m: number;      // annualized std of daily log returns, ≥ 0
}

const TRADING_DAYS_52W = 252;
const TRADING_DAYS_3M = 63;

function computeEtfSignals(h: DailyDataPoint[]): EtfSignalPoint[] {
  const out: EtfSignalPoint[] = [];
  if (h.length < TRADING_DAYS_52W + 1) return out;

  for (let i = TRADING_DAYS_52W; i < h.length; i++) {
    // 52-week high ending at i.
    let hi = -Infinity;
    for (let j = i - TRADING_DAYS_52W + 1; j <= i; j++) {
      if (h[j].value > hi) hi = h[j].value;
    }
    const drawdown = hi > 0 ? h[i].value / hi - 1 : 0;

    // 3-month realized vol from daily log returns ending at i.
    if (i < TRADING_DAYS_3M + 1) continue;
    const rets: number[] = [];
    for (let j = i - TRADING_DAYS_3M + 1; j <= i; j++) {
      if (h[j - 1].value > 0 && h[j].value > 0) {
        rets.push(Math.log(h[j].value / h[j - 1].value));
      }
    }
    if (rets.length < 10) continue;
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
    const variance = rets.reduce((a, r) => a + (r - mean) ** 2, 0) / (rets.length - 1);
    const vol = Math.sqrt(variance * 252);

    out.push({ date: h[i].date, drawdown, vol3m: vol });
  }
  return out;
}

// =============================================================================
// Rolling true-historical percentile (local copy; keeps module self-contained).
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

function rollingPctl(values: readonly number[]): number[] {
  const window: number[] = [];
  const out: number[] = [];
  for (const v of values) {
    const lo = bisectLeft(window, v);
    window.splice(lo, 0, v);
    const hi = bisectRight(window, v);
    out.push((lo + hi) / (2 * window.length));
  }
  return out;
}

// =============================================================================
// Row builder
// =============================================================================

export interface SectorMarketColumn {
  drawdown6m: number | null;
  drawdownPctl: number | null;
  vol3m: number | null;
  volPctl: number | null;
  score: number | null;            // 0-100, average of drawdownPctl and volPctl
  score3mAgo: number | null;
  change3m: number | null;         // score − score3mAgo
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
  market: SectorMarketColumn;
  fundamentals: SectorFundamentalsColumn;
  realized: SectorRealizedColumn;
  shock: SectorShockColumn;
  composite: number | null;        // 0-100, mean of available non-null column scores
  disagreement: {
    flag: boolean;
    spreadPctl: number | null;     // max − min across available column scores
    pair: [string, string] | null; // which columns are furthest apart
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

// Pctl spread (on a 0-100 scale) considered a notable disagreement.
const DISAGREEMENT_THRESHOLD = 40;

function buildMarketColumn(h: DailyDataPoint[] | null): SectorMarketColumn {
  if (!h || h.length < TRADING_DAYS_52W + TRADING_DAYS_3M + 1) {
    return {
      drawdown6m: null, drawdownPctl: null,
      vol3m: null, volPctl: null,
      score: null, score3mAgo: null, change3m: null, changeArrow: null,
    };
  }
  const signals = computeEtfSignals(h);
  if (signals.length < TRADING_DAYS_3M + 1) {
    return {
      drawdown6m: null, drawdownPctl: null,
      vol3m: null, volPctl: null,
      score: null, score3mAgo: null, change3m: null, changeArrow: null,
    };
  }
  // Score each signal day on its own trailing history.
  // Drawdown is ≤ 0; invert sign (more negative = bigger drawdown = higher stress pctl).
  const ddInverted = signals.map(s => -s.drawdown);
  const volVals = signals.map(s => s.vol3m);
  const ddPctls = rollingPctl(ddInverted);
  const volPctls = rollingPctl(volVals);
  const scores = ddPctls.map((d, i) => ((d + volPctls[i]) / 2) * 100);

  const lastIdx = scores.length - 1;
  const priorIdx = Math.max(0, lastIdx - TRADING_DAYS_3M);
  const score = scores[lastIdx];
  const score3mAgo = scores[priorIdx];
  const change3m = score - score3mAgo;
  let arrow: 'up' | 'down' | 'flat';
  if (Math.abs(change3m) < 3) arrow = 'flat';
  else if (change3m > 0) arrow = 'up';
  else arrow = 'down';

  return {
    drawdown6m: signals[lastIdx].drawdown,
    drawdownPctl: Math.round(ddPctls[lastIdx] * 1000) / 10,
    vol3m: signals[lastIdx].vol3m,
    volPctl: Math.round(volPctls[lastIdx] * 1000) / 10,
    score: Math.round(score * 10) / 10,
    score3mAgo: Math.round(score3mAgo * 10) / 10,
    change3m: Math.round(change3m * 10) / 10,
    changeArrow: arrow,
  };
}

function buildRealizedColumn(
  sectorTag: string | null,
  asOfDate: string | null,
): SectorRealizedColumn {
  if (!sectorTag) {
    return { score: null, contributors: [], note: 'No sector tag mapped.' };
  }
  // Pull verified manual inputs tagged for this sector across the two
  // by-sector series.
  const fitchRows: VerifiedManualInput[] = (manualInputsBySeries['fitch_pc_default_ttm_by_sector'] ?? [])
    .filter(r => (r.sector ?? '') === sectorTag);
  const spRows: VerifiedManualInput[] = (manualInputsBySeries['sp_large_co_bankruptcies_by_sector'] ?? [])
    .filter(r => (r.sector ?? '') === sectorTag);

  const contributors: string[] = [];
  if (fitchRows.length > 0) contributors.push('Fitch PC default (by sector)');
  if (spRows.length > 0) contributors.push('S&P bankruptcies (by sector)');

  if (contributors.length === 0) {
    return {
      score: null,
      contributors,
      note: 'Awaiting verified manual input.',
    };
  }

  // Simple approach while there is sparse history: score each group's latest
  // observation as its percentile within that group's own available values.
  const pctls: number[] = [];
  for (const group of [fitchRows, spRows]) {
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

function buildFundamentalsColumn(): SectorFundamentalsColumn {
  // Fundamentals column is driven by Phase 4 (median default probability
  // and % names flagged). Phase 4 isn't built yet, so we return null and
  // tell the reader where it will come from.
  return {
    score: null,
    note: 'Awaits Phase 4 distress radar (median PD + % names flagged).',
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
  let lo: [string, number] = cols[0];
  let hi: [string, number] = cols[0];
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
  // As-of date: latest common ETF date across contributing sectors.
  // Easiest approximation: the latest date among sectors with ETFs.
  let asOfDate: string | null = null;
  for (const s of SECTORS) {
    const h = s.etfHistory;
    if (h && h.length > 0) {
      const d = h[h.length - 1].date;
      if (asOfDate === null || d > asOfDate) asOfDate = d;
    }
  }

  const rows: SectorRow[] = SECTORS.map(s => {
    const market = buildMarketColumn(s.etfHistory);
    const fundamentals = buildFundamentalsColumn();
    const realized = buildRealizedColumn(s.manualInputSectorTag, asOfDate);
    const row: SectorRow = {
      id: s.id,
      label: s.label,
      etf: s.etf,
      market,
      fundamentals,
      realized,
      shock: {
        score: s.shock.score,
        sign: s.shock.sign,
        rationale: s.shock.rationale,
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

  return { asOfDate, rows, availability: avail };
}

