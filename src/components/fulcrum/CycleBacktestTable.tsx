/**
 * CycleBacktestTable — Fulcrum v5 Phase 2D
 *
 * Walk-forward backtest shown on the page because the v5 spec rule is
 * explicit: no accuracy claim without the table that supports it.
 *
 * Primary target: corblacbs_rise_onset (CORBLACBS rising >= 0.25pp over
 * the next 4Q, dropping months already in a rising run). Primary feature
 * set: EBP level + 18-month trailing minimum of T10Y3M.
 *
 * Three comparison rows surface the "is the simple model really better?"
 * question:
 *   - 7-feature  (for comparison)       — larger set, worse OOS AUC
 *   - yield curve only (Estrella-Mishkin) — classic 1-feature benchmark
 *   - Fed EBP est_prob (in-sample, flattering) — the Fed's own published
 *                                                recession probability,
 *                                                scored in-sample
 *
 * Events list each CORBLACBS onset with the probability at the onset
 * month and the max probability in the prior 6 months. False-alarm
 * stretches show every run where the model stayed above the threshold
 * while the label was a known 0 (in-event months end a run). The long
 * 2022–25 run stays visible on purpose.
 */

import cycleModel from '@/data/cycleModel.json';

interface BacktestEvent {
  date: string;
  p_at_onset: number;
  p_max_prior_6m: number;
}

interface BacktestFalseAlarm {
  start: string;
  end: string;
  peak_prob: number;
  ongoing?: boolean;
}

interface BacktestFeatureSetMetrics {
  auc: number | null;
  n_oos?: number;
  base_rate?: number;
  threshold?: number;
  tp_months?: number;
  fa_months?: number;
  events?: BacktestEvent[];
  false_alarms?: BacktestFalseAlarm[];
  note?: string;
  n?: number;
}

interface CycleModel {
  primary_target: string;
  robustness_targets: string[];
  backtest: Record<string, {
    train_label_lag_months: number;
    feature_sets: Record<string, BacktestFeatureSetMetrics>;
  }>;
}

const m = cycleModel as unknown as CycleModel;

const PRIMARY_SET_KEY = 'primary (EBP + YC)';
const COMPARISON_ROWS: Array<{
  key: string;
  label: string;
}> = [
  { key: 'primary (EBP + YC)', label: 'Primary: EBP + yield curve' },
  { key: 'full_7', label: '7-feature (for comparison)' },
  { key: 'yield_curve_only', label: 'Yield curve only (Estrella-Mishkin)' },
  { key: 'fed_est_prob_in_sample', label: 'Fed EBP est_prob (in-sample, flattering)' },
];

function formatPct(x: number | undefined | null, digits = 1): string {
  if (x === undefined || x === null || !Number.isFinite(x)) return '—';
  return `${(x * 100).toFixed(digits)}%`;
}

function formatAuc(x: number | undefined | null): string {
  if (x === undefined || x === null || !Number.isFinite(x)) return '—';
  return x.toFixed(3);
}

export const CycleBacktestTable = () => {
  const primary = m.backtest[m.primary_target];
  if (!primary) return null;
  const primaryRow = primary.feature_sets[PRIMARY_SET_KEY];
  const events: BacktestEvent[] = primaryRow?.events ?? [];
  const falseAlarms: BacktestFalseAlarm[] = primaryRow?.false_alarms ?? [];
  const baseRate = primaryRow?.base_rate ?? 0;
  const threshold = primaryRow?.threshold ?? 0.3;

  return (
    <div
      className="p-4"
      style={{
        background: '#fbf9f3',
        border: '1px solid #d9d4c7',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className="text-[9.5px] tracking-[0.18em] uppercase font-bold mb-1"
        style={{ color: '#4a4a4a', fontFamily: 'var(--font-sans)' }}
      >
        Cycle Probability — walk-forward backtest
      </div>
      <div
        className="text-[11.5px] italic mb-3"
        style={{ color: '#4a4a4a', fontFamily: 'Georgia, serif' }}
      >
        Primary target: CORBLACBS rise onset (business-loan charge-offs rising ≥0.25pp
        over the next 4Q, dropping months already in a rising run). Expanding-window
        OOS from 2000-01. Alarm threshold {formatPct(threshold)}: the greater of 30% and 2× the{' '}
        {formatPct(baseRate)} base rate.
      </div>

      {/* Feature-set comparison */}
      <div className="overflow-x-auto mb-4">
        <table
          className="w-full text-[12px] border-collapse"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #d9d4c7' }}>
              <th className="text-left py-1.5 pr-3 font-semibold text-[#1a1a1a]">Feature set</th>
              <th className="text-right py-1.5 px-2 font-semibold text-[#1a1a1a]">AUC (OOS)</th>
              <th className="text-right py-1.5 px-2 font-semibold text-[#1a1a1a]">n</th>
              <th className="text-right py-1.5 pl-2 font-semibold text-[#1a1a1a]">Base rate</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map(row => {
              const r = primary.feature_sets[row.key];
              if (!r) return null;
              const isPrimary = row.key === PRIMARY_SET_KEY;
              return (
                <tr
                  key={row.key}
                  style={{
                    borderBottom: '1px solid rgba(217,212,199,0.5)',
                    background: isPrimary ? 'rgba(200, 16, 46, 0.04)' : 'transparent',
                  }}
                >
                  <td className="py-1.5 pr-3" style={{ fontWeight: isPrimary ? 600 : 400 }}>
                    {row.label}
                  </td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{formatAuc(r.auc)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">
                    {r.n_oos ?? r.n ?? '—'}
                  </td>
                  <td className="py-1.5 pl-2 text-right tabular-nums">
                    {formatPct(r.base_rate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div
          className="text-[10.5px] italic mt-2"
          style={{ color: '#6a6a6a', fontFamily: 'Georgia, serif' }}
        >
          Primary AUC sits under a 0.75 bar, so no accuracy claim is made on the page.
          Rows are published for scrutiny: the 2-feature model beats the 7-feature set
          (overfitting at ~5 cycles) and the yield-curve-only benchmark, and both
          operational rows beat the Fed's in-sample est_prob.
        </div>
      </div>

      {/* Onset events */}
      <div className="mb-4">
        <div
          className="text-[10.5px] tracking-[0.12em] uppercase font-bold mb-1.5"
          style={{ color: '#4a4a4a', fontFamily: 'var(--font-sans)' }}
        >
          Onset events (primary set)
        </div>
        <table
          className="w-full text-[12px] border-collapse"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #d9d4c7' }}>
              <th className="text-left py-1 pr-3 font-semibold text-[#1a1a1a]">Onset</th>
              <th className="text-right py-1 px-2 font-semibold text-[#1a1a1a]">P at onset</th>
              <th className="text-right py-1 pl-2 font-semibold text-[#1a1a1a]">Max P prior 6m</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-2 italic text-[#6a6a6a]">
                  No OOS onsets observed yet.
                </td>
              </tr>
            ) : (
              events.map(ev => {
                const flagged = ev.p_max_prior_6m >= threshold;
                return (
                  <tr key={ev.date} style={{ borderBottom: '1px solid rgba(217,212,199,0.5)' }}>
                    <td className="py-1 pr-3 tabular-nums">{ev.date}</td>
                    <td className="py-1 px-2 text-right tabular-nums">
                      {(ev.p_at_onset * 100).toFixed(1)}%
                    </td>
                    <td
                      className="py-1 pl-2 text-right tabular-nums"
                      style={{ color: flagged ? '#c8102e' : '#4a4a4a', fontWeight: flagged ? 600 : 400 }}
                    >
                      {(ev.p_max_prior_6m * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* False-alarm stretches */}
      <div>
        <div
          className="text-[10.5px] tracking-[0.12em] uppercase font-bold mb-1.5"
          style={{ color: '#4a4a4a', fontFamily: 'var(--font-sans)' }}
        >
          False-alarm stretches
        </div>
        <table
          className="w-full text-[12px] border-collapse"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #d9d4c7' }}>
              <th className="text-left py-1 pr-3 font-semibold text-[#1a1a1a]">Window</th>
              <th className="text-right py-1 pl-2 font-semibold text-[#1a1a1a]">Peak P</th>
            </tr>
          </thead>
          <tbody>
            {falseAlarms.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-2 italic text-[#6a6a6a]">
                  No false-alarm stretches above the threshold.
                </td>
              </tr>
            ) : (
              falseAlarms.map(fa => (
                <tr key={`${fa.start}-${fa.end}`} style={{ borderBottom: '1px solid rgba(217,212,199,0.5)' }}>
                  <td className="py-1 pr-3 tabular-nums">
                    {fa.start} → {fa.end}
                    {fa.ongoing && (
                      <span className="ml-1 text-[#c8102e] font-semibold">[ongoing]</span>
                    )}
                  </td>
                  <td className="py-1 pl-2 text-right tabular-nums">
                    {(fa.peak_prob * 100).toFixed(1)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div
          className="text-[10.5px] italic mt-2"
          style={{ color: '#6a6a6a', fontFamily: 'Georgia, serif' }}
        >
          A false alarm is a run of months where the probability sat at or above the
          threshold while the outcome was a known &ldquo;no&rdquo;: no charge-off onset in the
          next 12 months and not already inside a rising run. Months inside a downturn end
          a run rather than extend it, so the 2001 and 2008 downturns are not counted
          here. None of the six onsets crossed the threshold beforehand: the model ranks
          risk; it does not call turns. The 2022&ndash;25 run is the long yield-curve
          inversion, which never produced a new charge-off onset. That is why the
          Hidden-Stress Gap and sector views exist.
        </div>
      </div>
    </div>
  );
};

export default CycleBacktestTable;
