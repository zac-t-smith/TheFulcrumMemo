/**
 * hiddenStressGap.ts — Fulcrum v5 Phase 2C
 *
 * Realized Distress minus Market Stress.
 *
 * A positive gap means defaults are running ahead of what headline spreads
 * are pricing — the "calm on top, concern at the bottom" state the v5 spec
 * calls out as the core thesis. A negative gap means spreads are stressed
 * but defaults haven't materialized yet (the GFC run-in looked like this).
 *
 * Market Stress:
 *   The existing v4 Fulcrum composite (unchanged). Already 0-100.
 *
 * Realized Distress:
 *   Equal-weighted average of the trailing percentiles of up to four
 *   components, each scored against its own available history:
 *     - CCC-BB ratio                    (from cccOasHistory / bbOasHistory,
 *                                        3y window because FRED restricted
 *                                        ICE BofA series in April 2026)
 *     - DRBLACBS                        (business-loan delinquency rate,
 *                                        quarterly, 1987+)
 *     - Fitch PC default rate (TTM)     (manual_inputs.json, usually empty
 *                                        until the user seeds verified rows)
 *     - S&P large-company bankruptcies  (manual_inputs.json, same)
 *
 *   A component contributes at a given date only if it has at least one
 *   observation on or before that date. When fewer than two components
 *   are available, Realized Distress is NaN (the chart renders a gap).
 *
 * Histories are uneven — call out the shortest in the UI caption.
 */

import { cccOasHistory } from './cccOasHistory';
import { bbOasHistory } from './bbOasHistory';
import { delinquencyBusinessLoansHistory } from './delinquencyBusinessLoansHistory';
import { baaSpreadHistory } from './baaSpreadHistory';
import { vixHistory } from './vixHistory';
import { brentSpotHistory } from './brentSpotHistory';
import { buildIndexTimeSeries } from './fulcrumIndex';
import { manualInputsBySeries } from './manualInputs';

// =============================================================================
// Shared types
// =============================================================================

export interface DatePercentilePoint {
  date: string;      // YYYY-MM-DD
  value: number;     // raw observation (units vary by component)
  pctl: number;      // [0, 1], true-historical percentile against observations ≤ date
}

export interface DateValuePoint {
  date: string;
  value: number;     // 0-100 scale (percentile × 100 or composite index)
}

export type ComponentId =
  | 'ccc_bb_ratio'
  | 'drblacbs'
  | 'fitch_pc_default'
  | 'sp_bankruptcies';

export interface ComponentAvailability {
  componentId: ComponentId;
  label: string;
  firstDate: string | null;
  lastDate: string | null;
  obsCount: number;
  historyYears: number;   // (lastDate - firstDate) / 365.25, 0 if empty
}

export interface HiddenStressGapResult {
  marketStress: readonly DateValuePoint[];
  realizedDistress: readonly DateValuePoint[];
  components: Readonly<Record<ComponentId, readonly DatePercentilePoint[]>>;
  availability: readonly ComponentAvailability[];
  current: {
    date: string | null;
    marketStress: number | null;
    realizedDistress: number | null;
    gap: number | null;
    availableComponents: ComponentId[];
  };
}

// =============================================================================
// Rolling true-historical percentile
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

/**
 * Walk a sorted-by-date series and return each point's true percentile
 * against all observations ≤ its own date (inclusive). Rank-average rule
 * for ties.
 */
function rollingPercentiles(
  series: ReadonlyArray<{ date: string; value: number }>,
): DatePercentilePoint[] {
  if (series.length === 0) return [];
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));
  const window: number[] = [];  // kept sorted by value
  const out: DatePercentilePoint[] = [];
  for (const p of sorted) {
    const lo = bisectLeft(window, p.value);
    window.splice(lo, 0, p.value);
    const hi = bisectRight(window, p.value);
    // (lo + hi) / 2 is the average rank BEFORE accounting for the new insertion;
    // since we already inserted at index lo, hi reflects the end of the tied block,
    // and the natural [0,1] pctl under rank-average is (lo + hi) / (2 * N).
    const pctl = (lo + hi) / (2 * window.length);
    out.push({ date: p.date, value: p.value, pctl });
  }
  return out;
}

// =============================================================================
// Component builders
// =============================================================================

function buildCccBbRatioSeries(): Array<{ date: string; value: number }> {
  const bbMap = new Map(bbOasHistory.map(p => [p.date, p.value]));
  const out: Array<{ date: string; value: number }> = [];
  for (const p of cccOasHistory) {
    const bb = bbMap.get(p.date);
    if (bb === undefined || bb <= 0) continue;
    out.push({ date: p.date, value: p.value / bb });
  }
  return out;
}

function buildManualSeries(id: Extract<ComponentId, 'fitch_pc_default' | 'sp_bankruptcies'>): Array<{ date: string; value: number }> {
  const seriesId = id === 'fitch_pc_default'
    ? 'fitch_pc_default_ttm_overall'
    : 'sp_large_co_bankruptcies_monthly';
  const rows = manualInputsBySeries[seriesId] ?? [];
  return rows.map(r => ({ date: r.date, value: r.value }));
}

const COMPONENT_LABELS: Record<ComponentId, string> = {
  ccc_bb_ratio: 'CCC-BB OAS ratio',
  drblacbs: 'DRBLACBS (business-loan delinquency)',
  fitch_pc_default: 'Fitch private credit default (TTM)',
  sp_bankruptcies: 'S&P large-company bankruptcy count',
};

// =============================================================================
// Main builder
// =============================================================================

export function buildHiddenStressGap(): HiddenStressGapResult {
  // Component time series (raw).
  const raw: Record<ComponentId, Array<{ date: string; value: number }>> = {
    ccc_bb_ratio: buildCccBbRatioSeries(),
    drblacbs: delinquencyBusinessLoansHistory.map(p => ({ date: p.date, value: p.value })),
    fitch_pc_default: buildManualSeries('fitch_pc_default'),
    sp_bankruptcies: buildManualSeries('sp_bankruptcies'),
  };

  // Rolling percentiles per component.
  const components: Record<ComponentId, DatePercentilePoint[]> = {
    ccc_bb_ratio: rollingPercentiles(raw.ccc_bb_ratio),
    drblacbs: rollingPercentiles(raw.drblacbs),
    fitch_pc_default: rollingPercentiles(raw.fitch_pc_default),
    sp_bankruptcies: rollingPercentiles(raw.sp_bankruptcies),
  };

  const availability: ComponentAvailability[] = (Object.keys(components) as ComponentId[]).map(id => {
    const series = components[id];
    const firstDate = series[0]?.date ?? null;
    const lastDate = series[series.length - 1]?.date ?? null;
    const obsCount = series.length;
    const years = firstDate && lastDate
      ? Math.max(0, (Date.parse(lastDate) - Date.parse(firstDate)) / (365.25 * 86400000))
      : 0;
    return {
      componentId: id,
      label: COMPONENT_LABELS[id],
      firstDate,
      lastDate,
      obsCount,
      historyYears: Math.round(years * 10) / 10,
    };
  });

  // Realized Distress on a unified daily date axis: forward-fill each
  // component's latest percentile and average those that exist. Uses the
  // Market-Stress axis (BAA10Y daily) as the master grid — it's the longest
  // and densest. If < 2 components contribute at a date, emit NaN so the
  // UI can visibly leave gaps.
  const marketStressSeries = buildIndexTimeSeries(baaSpreadHistory, vixHistory, brentSpotHistory);
  const dateAxis = marketStressSeries.map(p => p.date);

  // Component → map date→pctl for forward-fill
  const ptrs: Record<ComponentId, number> = {
    ccc_bb_ratio: 0,
    drblacbs: 0,
    fitch_pc_default: 0,
    sp_bankruptcies: 0,
  };

  const realizedDistress: DateValuePoint[] = dateAxis.map(d => {
    const vals: number[] = [];
    for (const id of Object.keys(components) as ComponentId[]) {
      const arr = components[id];
      // Advance pointer while arr[ptr+1].date <= d
      while (ptrs[id] + 1 < arr.length && arr[ptrs[id] + 1].date <= d) {
        ptrs[id] += 1;
      }
      // Does the pointed observation actually precede d?
      if (arr.length > 0 && arr[ptrs[id]].date <= d) {
        vals.push(arr[ptrs[id]].pctl);
      }
    }
    if (vals.length < 2) {
      return { date: d, value: NaN };
    }
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { date: d, value: Math.round(avg * 100 * 10) / 10 };
  });

  const marketStress: DateValuePoint[] = marketStressSeries.map(p => ({
    date: p.date,
    value: p.idx,
  }));

  // Current readings: last date where marketStress is finite AND realized is finite.
  let current: HiddenStressGapResult['current'] = {
    date: null, marketStress: null, realizedDistress: null, gap: null, availableComponents: [],
  };
  for (let i = marketStress.length - 1; i >= 0; i--) {
    const ms = marketStress[i].value;
    const rd = realizedDistress[i].value;
    if (Number.isFinite(ms) && Number.isFinite(rd)) {
      const availableComponents = (Object.keys(components) as ComponentId[]).filter(id => {
        const arr = components[id];
        return arr.length > 0 && arr[arr.length - 1].date <= marketStress[i].date;
      });
      current = {
        date: marketStress[i].date,
        marketStress: ms,
        realizedDistress: rd,
        gap: Math.round((rd - ms) * 10) / 10,
        availableComponents,
      };
      break;
    }
  }

  return {
    marketStress,
    realizedDistress,
    components: components as unknown as Readonly<Record<ComponentId, readonly DatePercentilePoint[]>>,
    availability,
    current,
  };
}
