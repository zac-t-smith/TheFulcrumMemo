/**
 * CycleRiskVsNormalTile — Fulcrum v5 Phase 2D
 *
 * Compact readout for the Cycle Probability model. Deliberately does NOT
 * show a bare headline percentage or an accuracy claim: the primary
 * target's OOS AUC is 0.738, under the 0.75 bar we set for making
 * claims. The tile anchors the current probability against its own
 * base rate so the reader sees "normal" or "elevated" relative to the
 * series mean, not a false-precision number.
 *
 * Example rendering:
 *   Cycle Risk vs. Normal
 *   13.5% vs. 13.8% normal · range 4.5–30%
 *   Model fit Nov 12, 2026 · EBP + yield curve · 2026-09-30
 *
 * The full backtest table lives in CycleBacktestTable so the tile stays
 * compact enough to sit next to the Hidden-Stress Gap chart.
 */

import cycleModel from '@/data/cycleModel.json';

interface LatestSnapshot {
  date: string;
  probability: number;
  band_5pct: number;
  band_95pct: number;
  base_rate_primary_target: number;
}

interface CycleModel {
  fit_date: string;
  primary_target: string;
  primary_features: string[];
  latest_snapshot: LatestSnapshot;
}

const m = cycleModel as unknown as CycleModel;

function formatPct(x: number): string {
  return `${(x * 100).toFixed(1)}%`;
}

function formatFitDate(iso: string): string {
  // "2026-11-12" → "Nov 12, 2026"
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export const CycleRiskVsNormalTile = () => {
  const snap = m.latest_snapshot;
  const ratio = snap.base_rate_primary_target > 0
    ? snap.probability / snap.base_rate_primary_target
    : null;

  // Verbal anchor — matches how the user asked the tile to read.
  // < 0.85×: BELOW normal. 0.85-1.15: AT normal. 1.15-2×: ELEVATED. ≥ 2×: HIGH.
  let verbal: { text: string; color: string };
  if (ratio === null) {
    verbal = { text: 'n/a', color: '#4a4a4a' };
  } else if (ratio < 0.85) {
    verbal = { text: 'below normal', color: '#1f6b3a' };
  } else if (ratio <= 1.15) {
    verbal = { text: 'at normal', color: '#4a4a4a' };
  } else if (ratio < 2) {
    verbal = { text: 'elevated', color: '#b35a00' };
  } else {
    verbal = { text: 'high', color: '#c8102e' };
  }

  const featureLabels: Record<string, string> = {
    ebp_level: 'EBP',
    t10y3m_min_18m: 'yield curve',
  };
  const featureSummary = m.primary_features
    .map(f => featureLabels[f] ?? f)
    .join(' + ');

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
        Cycle Risk vs. Normal
      </div>

      <div
        className="text-[22px] font-bold text-[#1a1a1a] tracking-tight mb-0.5"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {formatPct(snap.probability)}
        <span
          className="text-[13.5px] font-normal ml-2"
          style={{ color: '#4a4a4a', fontFamily: 'var(--font-serif)' }}
        >
          vs. {formatPct(snap.base_rate_primary_target)} normal
        </span>
      </div>

      <div
        className="text-[12.5px] mb-2"
        style={{ color: '#4a4a4a', fontFamily: 'var(--font-sans)' }}
      >
        range {formatPct(snap.band_5pct)}–{formatPct(snap.band_95pct)}
        {verbal && (
          <>
            {' · '}
            <span style={{ color: verbal.color, fontWeight: 600 }}>
              {verbal.text}
            </span>
          </>
        )}
      </div>

      <div
        className="text-[10.5px] pt-2"
        style={{
          color: '#6a6a6a',
          fontFamily: 'var(--font-sans)',
          borderTop: '1px solid rgba(26,26,26,0.08)',
        }}
      >
        Model fit {formatFitDate(m.fit_date)} · {featureSummary} · as of {snap.date}
      </div>
    </div>
  );
};

export default CycleRiskVsNormalTile;
