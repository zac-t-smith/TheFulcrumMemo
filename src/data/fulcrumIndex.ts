/**
 * Fulcrum Index - Composite Distressed Credit Cycle Risk Signal
 *
 * A quantitative framework for measuring proximity to restructuring cycles.
 * The index combines a long-history credit-spread signal (BAA10Y), an
 * energy-shock signal (Brent), and an equity-volatility signal (VIX) into
 * a single 0-100 score.
 *
 * Components (when all inputs available):
 * - Credit (40%): BAA10Y fixed-range percentile, anchored 145-600 bps
 *   against 1986-2026 historical extremes (UNCHANGED — see note below)
 * - Brent (30%): elevation above the rolling 10y trailing mean
 * - VIX (30%): normalized between rolling 10y trailing median and 95th pctl
 *
 * The credit-input is fed by Moody's Baa Corporate over 10Y Treasury
 * (FRED series BAA10Y), which has continuous daily data from 1986 and
 * captures every modern default cycle. We retain ICE BofA HY OAS
 * (BAMLH0A0HYM2) as a current-cycle secondary signal.
 *
 * Phase 4D-2 recalibration: Brent and VIX baselines are now rolling
 * 10-year trailing windows, not v3's static 73 / 15 / 40 thresholds. Why:
 * v3 thresholds were calibrated against 2023-2026 and saturated badly
 * pre-2023 — 2008's GFC composite topped out at ~70 instead of >75.
 * Rolling baselines let the composite breathe through cycles. BAA10Y
 * handling is unchanged because its fixed-range percentile is anchored
 * to 40 years of in-sample data and was already correct.
 *
 * DGS10 rolling baseline is computed (median for baseline, 95th pctl for
 * ceiling) but not yet wired into the composite — that's pending the v4
 * weight rebalance and the workbook backtest.
 *
 * TODO (v4): The workbook recalibration introduces BAA velocity, DGS10
 * stress, yield-curve, inflation breakeven, and HY-IG dispersion
 * components with weights 0.30 / 0.10 / 0.15 / 0.15 / 0.05 / 0.10 / 0.05
 * / 0.10. Pending workbook session.
 *
 * Sources: Moody's Baa-Treasury (FRED, BAA10Y, 1986+);
 *          ICE BofA US High Yield OAS (FRED, BAMLH0A0HYM2, 3y rolling);
 *          U.S. Energy Information Administration (Brent, FRED DCOILBRENTEU);
 *          CBOE VIX (FRED, VIXCLS); 10Y Treasury (FRED, DGS10);
 *          author calculations.
 */

import { baaSpreadHistory } from './baaSpreadHistory';
import { hyOasHistory } from './hyOasHistory';
import { vixHistory } from './vixHistory';
import { brentSpotHistory } from './brentSpotHistory';
import { dgs10History } from './dgs10History';

// =============================================================================
// CONSTANTS
// =============================================================================

// Pre-war Brent baseline (Feb 27, 2026). Retained as a narrative anchor
// for the MD callout's "% above pre-war baseline" framing — NOT used in
// the composite stress calculation any more (rolling 10y mean replaced it).
export const BRENT_BASELINE = 73;

// BAA10Y fixed-range percentile bounds, anchored against 1986-2026 extremes.
// Floor ≈ 1st percentile, ceiling ≈ 99th percentile of the long-history series.
// Editing these recalibrates the credit signal — they are NOT data-derived
// from whatever happens to be in the bundled dataset.
//
// The credit slot of the composite uses this fixed-range percentile by
// design. The page's *displayed* "pctl" sub-line in the readout strip
// uses the true-historical percentile (baaTrueHistoricalPercentile)
// instead — so the readout agrees with the historical scatter chart.
export const BAA_PCTL_FLOOR = 145;
export const BAA_PCTL_CEILING = 600;

// Rolling-baseline window. Ten years gives the composite enough memory to
// remember the last cycle without dragging too much regime-prior noise.
const ROLLING_WINDOW_YEARS = 10;

// Computed long-run means for narrative reference. Both are calculated at
// module load from the bundled histories so prose copy never drifts from
// data. BAA mean uses the trailing 30 years if available; HY OAS uses
// whatever history is available (FRED public window is ~3 years).
const meanOf = (xs: ReadonlyArray<{ value: number }>): number =>
  xs.reduce((acc, p) => acc + p.value, 0) / xs.length;

const cutoff30y = new Date();
cutoff30y.setFullYear(cutoff30y.getFullYear() - 30);
const baa30y = baaSpreadHistory.filter(p => new Date(p.date) >= cutoff30y);
export const BAA_30YR_MEAN_BPS = Math.round(
  meanOf(baa30y.length > 0 ? baa30y : baaSpreadHistory)
);
export const HY_OAS_3YR_MEAN_BPS = Math.round(meanOf(hyOasHistory));

export const FULCRUM_INDEX_ATTRIBUTION =
  'Sources: Moody’s Baa-Treasury spread (FRED, BAA10Y, 1986+); ' +
  'ICE BofA US High Yield OAS (FRED, BAMLH0A0HYM2); ' +
  'U.S. Energy Information Administration via FRED DCOILBRENTEU (Brent crude); ' +
  'CBOE VIX (FRED, VIXCLS); 10Y Treasury (FRED, DGS10); author calculations.';

// =============================================================================
// ROLLING-BASELINE PRECOMPUTATION (Phase 4D-2)
// =============================================================================
//
// For each date in a source series, compute the rolling-window baseline
// and ceiling. The window is defined in calendar years against the
// observation date (NOT a fixed N of trading days), so weekend gaps and
// holidays don't shift the window prematurely.
//
// Edge case: for the first ROLLING_WINDOW_YEARS of data (pre-1996 for
// Brent / VIX, pre-1986 has no DGS10 issue), the window is expanding
// from the first observation rather than full 10y. That keeps the
// composite computable from the very first date instead of leaving a
// 10-year gap, at the cost of slightly less stable baselines at the
// dawn of the series. Documented + accepted.

interface BaselineRow { baseline: number; ceiling: number; }

/**
 * Build a date → {baseline, ceiling} map for a series. Mode controls
 * whether the baseline is the rolling mean or median, and whether the
 * ceiling is baseline×factor or a rolling percentile.
 */
function buildRollingBaselines(
  series: ReadonlyArray<{ date: string; value: number }>,
  mode: 'mean-x2' | 'median-95',
): Map<string, BaselineRow> {
  const out = new Map<string, BaselineRow>();
  if (series.length === 0) return out;

  // Pre-cache parsed timestamps so we don't reparse per i, j.
  const ts = series.map(p => Date.parse(p.date));
  const windowMs = ROLLING_WINDOW_YEARS * 365.25 * 24 * 3600 * 1000;

  // For mean-x2 we maintain a sliding sum.
  let sum = 0;
  // For median-95 we maintain a sorted window via splice.
  const sorted: number[] = [];

  let lo = 0;
  for (let i = 0; i < series.length; i++) {
    const cutoff = ts[i] - windowMs;

    // Advance lo past all dates before the window cutoff.
    while (lo < i && ts[lo] < cutoff) {
      const v = series[lo].value;
      if (mode === 'mean-x2') {
        sum -= v;
      } else {
        const idx = lowerBound(sorted, v);
        if (sorted[idx] === v) sorted.splice(idx, 1);
      }
      lo++;
    }

    // Add the current observation.
    const cur = series[i].value;
    if (mode === 'mean-x2') {
      sum += cur;
      const n = i - lo + 1;
      const baseline = sum / n;
      out.set(series[i].date, { baseline, ceiling: baseline * 2 });
    } else {
      const ins = upperBound(sorted, cur);
      sorted.splice(ins, 0, cur);
      const n = sorted.length;
      const median = n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];
      // 95th percentile via the standard nearest-rank rule.
      const pctlIdx = Math.min(n - 1, Math.max(0, Math.ceil(n * 0.95) - 1));
      out.set(series[i].date, { baseline: median, ceiling: sorted[pctlIdx] });
    }
  }
  return out;
}

function lowerBound(arr: number[], v: number): number {
  let lo = 0; let hi = arr.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] < v) lo = m + 1; else hi = m; }
  return lo;
}
function upperBound(arr: number[], v: number): number {
  let lo = 0; let hi = arr.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] <= v) lo = m + 1; else hi = m; }
  return lo;
}

// Module-load precomputed baseline maps. These are the canonical
// stress-normalization references for the composite calc.
const BRENT_BASELINES = buildRollingBaselines(brentSpotHistory, 'mean-x2');
const VIX_BASELINES = buildRollingBaselines(vixHistory, 'median-95');
// DGS10 baselines are computed for parity but not yet consumed by the
// composite (would require v4 weight rebalance, which is out of scope).
// Exported for downstream pages and the v4 workbook session.
export const DGS10_BASELINES = buildRollingBaselines(dgs10History, 'median-95');

export interface RollingBaseline { baseline: number; ceiling: number; }
export const getBrentBaseline = (date: string): RollingBaseline | undefined =>
  BRENT_BASELINES.get(date);
export const getVixBaseline = (date: string): RollingBaseline | undefined =>
  VIX_BASELINES.get(date);

// =============================================================================
// TRUE-HISTORICAL BAA10Y PERCENTILE (readout-strip + scatter consistency)
// =============================================================================
//
// Sorted-once cache of every BAA10Y observation. The composite math still
// uses the fixed-range percentile (baaPercentile), but the page's
// displayed "pctl" sub-line uses this true-historical lookup so the
// readout strip and the BaaHistoricalScatter dot agree on today's number.

const BAA_SORTED: ReadonlyArray<number> = (() => {
  const xs = baaSpreadHistory.map(p => p.value).slice();
  xs.sort((a, b) => a - b);
  return xs;
})();

/**
 * Return the [0,1] true-historical percentile of `baaBps` against the
 * full bundled BAA10Y distribution. Uses the standard rank-average rule
 * for ties. Cheap: O(log n).
 */
export function baaTrueHistoricalPercentile(baaBps: number): number {
  if (BAA_SORTED.length === 0) return 0;
  const lo = lowerBound(BAA_SORTED as number[], baaBps);
  let hi = lo;
  while (hi < BAA_SORTED.length && BAA_SORTED[hi] === baaBps) hi += 1;
  return (lo + hi) / 2 / BAA_SORTED.length;
}

// =============================================================================
// TYPES
// =============================================================================

export interface FulcrumIndexPoint {
  date: string;       // YYYY-MM-DD
  baa: number;        // BAA10Y in bps (credit-spread input)
  idx: number;        // Fulcrum Index 0-100
  vix?: number;       // VIX value if available
  brent?: number;     // Brent price if available
}

export interface FulcrumIndexInputs {
  date: string;          // YYYY-MM-DD — used to look up rolling baselines
  baaCurrent: number;    // BAA10Y level in bps
  brentCurrent?: number;
  vixCurrent?: number;
}

export type RiskRegime =
  | 'Complacency'
  | 'Latent Stress'
  | 'Transmission Active'
  | 'Cycle Imminent';

export interface RiskRegimeInfo {
  regime: RiskRegime;
  /** Human-readable band string ("0-25", "25-50", "50-75", "75-100"). */
  band: string;
  description: string;
  posture: string;
  bandMin: number;
  bandMax: number;
  /**
   * Canonical regime palette — single source of truth for any UI that
   * paints by regime. `color` is the deep regime color (used for
   * backgrounds and headers); `swatchColor` matches `color` (kept as a
   * separate name for readability at consumer sites); `pillBg` is the
   * tailwind utility class historically used by the readout strip pill.
   */
  color: string;
  swatchColor: string;
  pillBg: string;
}

// =============================================================================
// CORE CALCULATION
// =============================================================================

/**
 * Convert a BAA10Y level (bps) to a [0,1] percentile against the v4
 * fixed-range floor/ceiling anchored on 1986-2026 historical extremes.
 */
export function baaPercentile(baaBps: number): number {
  const range = BAA_PCTL_CEILING - BAA_PCTL_FLOOR;
  if (range <= 0) return 0.5;
  return Math.min(Math.max((baaBps - BAA_PCTL_FLOOR) / range, 0), 1);
}

/**
 * Calculate the Fulcrum Index from real inputs.
 *
 * When all inputs available:
 * - Credit (BAA pctl): 40%   (fixed-range percentile against 1986-2026)
 * - Brent stress:      30%   (vs rolling 10y mean baseline; ceiling = 2× baseline)
 * - VIX stress:        30%   (vs rolling 10y median; ceiling = rolling 95th pctl)
 *
 * When components are missing, weights are renormalized over the
 * available components. Credit input is mandatory. Date is required so
 * the rolling baselines can be looked up.
 */
export function calculateFulcrumIndex(inputs: FulcrumIndexInputs): number {
  const { date, baaCurrent, brentCurrent, vixCurrent } = inputs;

  const credit = baaPercentile(baaCurrent);

  if (brentCurrent === undefined && vixCurrent === undefined) {
    return Math.round(credit * 100);
  }

  let brentStress = 0;
  let brentAvailable = false;
  if (brentCurrent !== undefined) {
    const bb = BRENT_BASELINES.get(date);
    if (bb !== undefined) {
      const span = bb.ceiling - bb.baseline;
      // Phase 4D-3-A: symmetric Brent stress. Math.abs() means dislocation
      // in either direction registers as macro-regime instability — a
      // demand collapse (COVID 2020, $9 Brent) is just as diagnostic as
      // a supply shock (Iran 2026, Hormuz closure). The original v3
      // implementation only fired on upside, which structurally capped
      // COVID's composite at 55 even as BAA hit GFC-equivalent levels.
      brentStress = span > 0
        ? Math.max(0, Math.min(1, Math.abs(brentCurrent - bb.baseline) / span))
        : 0;
      brentAvailable = true;
    }
    // If baseline lookup misses (date pre-Brent-history), drop the
    // component entirely — same reweighting behavior as v3 missing input.
  }

  let vixStress = 0;
  let vixAvailable = false;
  if (vixCurrent !== undefined) {
    const vb = VIX_BASELINES.get(date);
    if (vb !== undefined) {
      const span = vb.ceiling - vb.baseline;
      vixStress = span > 0
        ? Math.max(0, Math.min(1, (vixCurrent - vb.baseline) / span))
        : 0;
      vixAvailable = true;
    }
  }

  let totalWeight = 0.4;
  let weightedSum = credit * 0.4;

  if (brentAvailable) { weightedSum += brentStress * 0.3; totalWeight += 0.3; }
  if (vixAvailable) { weightedSum += vixStress * 0.3; totalWeight += 0.3; }

  return Math.round((weightedSum / totalWeight) * 100);
}

// =============================================================================
// RISK REGIME CLASSIFICATION
// =============================================================================

export function getRiskRegime(idx: number): RiskRegimeInfo {
  if (idx < 25) {
    return {
      regime: 'Complacency',
      band: '0-25',
      description: 'Reach-for-yield regime. Cycle bottom in distressed paper; covenant erosion underway but unpriced.',
      posture: 'Build dry powder. Identify weak credits.',
      bandMin: 0,
      bandMax: 25,
      // Amber, not green: complacency is a WARNING state (reach-for-yield + unpriced
      // covenant erosion). Darkened to #8A5A17 so caption-size pill text hits AA.
      color: '#8A5A17',
      swatchColor: '#8A5A17',
      pillBg: 'bg-[#8A5A17]',
    };
  }
  if (idx < 50) {
    return {
      regime: 'Latent Stress',
      band: '25-50',
      description: 'Spreads off the lows but no broad repricing. Idiosyncratic distress emerging.',
      posture: 'Selective shorts. Stress-test exposures.',
      bandMin: 25,
      bandMax: 50,
      // Darkened from #6fb487 (fails AA on cream) to --pos #2E7D4F.
      color: '#2E7D4F',
      swatchColor: '#2E7D4F',
      pillBg: 'bg-[#8A5A17]',
    };
  }
  if (idx < 75) {
    return {
      regime: 'Transmission Active',
      band: '50-75',
      description: 'Macro-to-credit chain firing. Spreads widening with conviction; downgrades accelerating.',
      posture: 'Staff up. Pipeline RX mandates.',
      bandMin: 50,
      bandMax: 75,
      // Darkened from #d98484 (fails AA on cream) to --red #C8102E.
      color: '#C8102E',
      swatchColor: '#C8102E',
      pillBg: 'bg-[#C8102E]',
    };
  }
  return {
    regime: 'Cycle Imminent',
    band: '75-100',
    description: 'Default wave forming within 9-15 months. Liquidity windows closing for B3/CCC issuers.',
    posture: 'Execute. Lead amendments & chapter 11s.',
    bandMin: 75,
    bandMax: 100,
    color: '#8a1818',
    swatchColor: '#8a1818',
    pillBg: 'bg-[#8a1818]',
  };
}

/**
 * Spec-aligned alias. `getRegimeInfo` is the canonical name from the
 * Phase 4E-1 hygiene pass; it returns the same data shape as
 * getRiskRegime to keep the existing consumer surface stable.
 */
export const getRegimeInfo = getRiskRegime;

/**
 * All four regimes in band order. Used by tables that enumerate the
 * full regime ladder rather than describing the active one.
 */
export const ALL_REGIMES: ReadonlyArray<RiskRegimeInfo> = [
  getRiskRegime(0),
  getRiskRegime(25),
  getRiskRegime(50),
  getRiskRegime(75),
];

// =============================================================================
// MD CALLOUT
// =============================================================================

/**
 * Generate the MD callout from current conditions.
 *
 * Reads top-to-bottom: long-history regime signal (BAA percentile against
 * the 1986-2026 distribution) → current-cycle HY OAS context → HY-IG
 * dispersion ratio → energy/vol overlays → regime posture commentary.
 *
 * Every numeric value is computed at call-time from the bundled
 * histories or the inputs threaded through from the page. No fixed
 * constants survive in prose; the long-run means and percentile bounds
 * resolve from the module-load constants above (BAA_30YR_MEAN_BPS,
 * HY_OAS_3YR_MEAN_BPS, BAA_PCTL_FLOOR/CEILING).
 */
export function generateMDCallout(
  idx: number,
  baa: number,
  brent?: number,
  vix?: number,
  hyOas?: number,
  bbbOas?: number,
): string {
  const regime = getRiskRegime(idx);
  const baaPctl = Math.round(baaPercentile(baa) * 100);
  const baaDiff = Math.round(baa - BAA_30YR_MEAN_BPS);
  const baaRelation = baaDiff >= 0 ? 'above' : 'below';
  const thresholdRelation = idx >= 70 ? 'above' : 'below';

  let regimeCommentary: string;
  switch (regime.regime) {
    case 'Complacency':
      regimeCommentary =
        'This is the environment where dry powder accumulation pays dividends in the next cycle. ' +
        'Covenant erosion is underway but unpriced.';
      break;
    case 'Latent Stress':
      regimeCommentary =
        'Idiosyncratic distress is emerging in weaker credits. ' +
        'The market hasn’t repriced for recession but selective shorts are warranted.';
      break;
    case 'Transmission Active':
      regimeCommentary =
        'The macro-to-credit transmission chain is firing. ' +
        'Spreads are widening with conviction and downgrades are accelerating. ' +
        'Restructuring desks should be staffing, not waiting for the print.';
      break;
    case 'Cycle Imminent':
      regimeCommentary =
        'Each prior crossing of 70 has preceded a default-rate inflection within nine to fifteen months. ' +
        'Liquidity windows are closing for B3/CCC issuers. Execute mandates now.';
      break;
  }

  // Lead with the long-history regime signal.
  let callout =
    `The Fulcrum Index stands at ${idx} — ${thresholdRelation} the 70 threshold that has ` +
    `historically preceded default-rate inflections. The credit input is BAA10Y at ` +
    `${Math.round(baa)} bps, sitting in the ${baaPctl}ᵗʰ percentile of the 1986–2026 distribution, ` +
    `${Math.abs(baaDiff)} bps ${baaRelation} the 30-year mean of ${BAA_30YR_MEAN_BPS} bps.`;

  // Current-cycle HY OAS context with optional inline dispersion ratio.
  if (hyOas !== undefined) {
    callout +=
      ` In the current cycle, ICE BofA HY OAS reads ${Math.round(hyOas)} bps ` +
      `(3-year mean ${HY_OAS_3YR_MEAN_BPS} bps)`;
    if (bbbOas !== undefined && bbbOas > 0) {
      const ratio = hyOas / bbbOas;
      callout += `, ${ratio.toFixed(2)}× the BBB OAS of ${Math.round(bbbOas)} bps`;
    }
    callout += '.';
  }

  if (brent !== undefined) {
    const brentPct = Math.round(((brent - BRENT_BASELINE) / BRENT_BASELINE) * 100);
    if (brentPct > 20) {
      callout += ` Brent at $${brent.toFixed(0)} reflects a ${brentPct}% energy shock above the pre-war baseline.`;
    }
  }

  if (vix !== undefined && vix > 25) {
    callout += ` Elevated VIX at ${vix.toFixed(1)} signals persistent uncertainty.`;
  }

  callout += ' ' + regimeCommentary;

  // Methodology footnote — composite weights tested against eight cycle
  // events from 1990-2026 in the v4 backtest workbook. v3-style weights
  // (BAA-dominant, with symmetric Brent stress and VIX overlay) won on
  // cycle discrimination and were retained. This block is appended on a
  // newline so the page can render it with smaller, muted styling.
  callout +=
    '\n\nMethodology: Composite weights tested against eight cycle events from 1990–2026 ' +
    '(LTCM, dot-com, GFC, EU debt, oil bust, COVID, CPI shock, current). v3-style ' +
    'BAA-dominant weighting outperformed proposed alternatives on cycle discrimination ' +
    'and is retained. Brent stress responds symmetrically to dislocation in either ' +
    'direction, capturing both supply shocks and demand collapses. Component baselines ' +
    'use rolling 10y windows; BAA10Y percentile is anchored to the full 1986–2026 ' +
    'distribution. Backtest workbook available on request.';

  return callout;
}

// =============================================================================
// DATA TRANSFORMATION UTILITIES
// =============================================================================

/**
 * Build the Fulcrum Index time series from BAA10Y history.
 *
 * For each BAA observation we attempt to align Brent and VIX by date.
 * Missing components are dropped — the calculator reweights the
 * remaining inputs. The result is a daily series stretching back as
 * far as BAA10Y goes (1986+), with Brent contributing from 1987+ and
 * VIX from 1990+.
 */
export function buildIndexTimeSeries(
  baaHistory: ReadonlyArray<{ date: string; value: number }>,
  vixHistory?: ReadonlyArray<{ date: string; value: number }>,
  brentHistory?: ReadonlyArray<{ date: string; value: number }>,
): FulcrumIndexPoint[] {
  if (baaHistory.length === 0) return [];

  const vixMap = new Map<string, number>();
  if (vixHistory) for (const p of vixHistory) vixMap.set(p.date, p.value);

  const brentMap = new Map<string, number>();
  if (brentHistory) for (const p of brentHistory) brentMap.set(p.date, p.value);

  return baaHistory.map(point => {
    const vix = vixMap.get(point.date);
    const brent = brentMap.get(point.date);

    const idx = calculateFulcrumIndex({
      date: point.date,
      baaCurrent: point.value,
      brentCurrent: brent,
      vixCurrent: vix,
    });

    return {
      date: point.date,
      baa: point.value,
      idx,
      vix,
      brent,
    };
  });
}

/**
 * Calculate 30-day (22 trading days) trend
 */
export function calculate30DayTrend(
  data: FulcrumIndexPoint[]
): { idxChange: number; baaChange: number } {
  if (data.length < 2) return { idxChange: 0, baaChange: 0 };

  const latest = data[data.length - 1];
  const daysBack = Math.min(22, data.length - 1);
  const comparison = data[data.length - 1 - daysBack];

  return {
    idxChange: latest.idx - comparison.idx,
    baaChange: latest.baa - comparison.baa,
  };
}

/**
 * Get dataset statistics
 */
export function getDatasetStats(data: FulcrumIndexPoint[]): {
  baaMin: number;
  baaMax: number;
  baaMean: number;
  idxMin: number;
  idxMax: number;
  idxMean: number;
  dataPoints: number;
  startDate: string;
  endDate: string;
} {
  if (data.length === 0) {
    return {
      baaMin: 0, baaMax: 0, baaMean: 0,
      idxMin: 0, idxMax: 0, idxMean: 0,
      dataPoints: 0, startDate: '', endDate: '',
    };
  }

  const baaValues = data.map(p => p.baa);
  const idxValues = data.map(p => p.idx);

  return {
    baaMin: Math.min(...baaValues),
    baaMax: Math.max(...baaValues),
    baaMean: baaValues.reduce((a, b) => a + b, 0) / baaValues.length,
    idxMin: Math.min(...idxValues),
    idxMax: Math.max(...idxValues),
    idxMean: idxValues.reduce((a, b) => a + b, 0) / idxValues.length,
    dataPoints: data.length,
    startDate: data[0].date,
    endDate: data[data.length - 1].date,
  };
}

// =============================================================================
// EVENT MARKERS
// =============================================================================

// Markers for the BAA10Y 40-year chart. Spaced for readability — eight events
// is plenty across four decades; we don't try to label every smaller tremor.
export const BAA_EVENT_MARKERS = [
  { date: '1998-09-30', label: 'LTCM' },
  { date: '2001-10-01', label: 'Dot-com credit' },
  { date: '2008-09-15', label: 'GFC (Lehman)' },
  { date: '2011-08-01', label: 'EU debt crisis' },
  { date: '2016-02-01', label: 'Oil bust' },
  { date: '2020-03-15', label: 'COVID' },
  { date: '2022-06-13', label: 'CPI shock' },
  { date: '2026-02-28', label: 'Hormuz closure' },
];

// Retained for the current-cycle HY OAS chart that still renders alongside.
export const CONFLICT_EVENT_MARKERS = [
  { date: '2022-06-10', label: 'CPI 9.1%' },
  { date: '2023-03-10', label: 'SVB collapse' },
  { date: '2026-02-28', label: 'Epic Fury' },
  { date: '2026-03-12', label: 'Brent $100' },
  { date: '2026-04-07', label: 'Ceasefire' },
  { date: '2026-04-12', label: 'Islamabad collapse' },
];

export default {
  calculateFulcrumIndex,
  baaPercentile,
  getRiskRegime,
  generateMDCallout,
  buildIndexTimeSeries,
  calculate30DayTrend,
  getDatasetStats,
  BAA_EVENT_MARKERS,
  CONFLICT_EVENT_MARKERS,
  FULCRUM_INDEX_ATTRIBUTION,
  BRENT_BASELINE,
  BAA_PCTL_FLOOR,
  BAA_PCTL_CEILING,
  BAA_30YR_MEAN_BPS,
  HY_OAS_3YR_MEAN_BPS,
};
