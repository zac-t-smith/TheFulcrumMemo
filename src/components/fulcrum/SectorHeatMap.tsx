/**
 * SectorHeatMap — Fulcrum v5 Phase 3
 *
 * One row per RX-watched sector. Columns are percentiles 0-100 against
 * the sector's own history, except Shock which is a static 1-5 score
 * with a direction (drag / benefit / mixed). Composite is the mean of
 * available non-null columns. A disagreement badge fires when the spread
 * between any two columns exceeds 40 points — that's what surfaces the
 * Software-style pattern the spec is designed to catch: realized quiet,
 * market worried.
 *
 * Data: src/data/sectorHeatMap.ts.
 */

import { useMemo } from 'react';
import { buildSectorHeatMap, type SectorRow } from '@/data/sectorHeatMap';

/** Map a 0-100 stress percentile to a background color. Diverging palette:
 *  green at low stress, muted beige at neutral (50), orange, red at high. */
function stressColor(p: number): string {
  if (p < 20) return 'rgba(31, 107, 58, 0.25)';
  if (p < 40) return 'rgba(140, 170, 100, 0.22)';
  if (p < 60) return 'rgba(217, 212, 199, 0.55)';
  if (p < 75) return 'rgba(179, 90, 0, 0.28)';
  if (p < 90) return 'rgba(200, 16, 46, 0.30)';
  return 'rgba(138, 24, 24, 0.45)';
}

function stressTextColor(p: number): string {
  // Keep text readable across the palette.
  return p < 60 ? '#1a1a1a' : '#1a1a1a';
}

function formatPctl(x: number | null): string {
  if (x === null || !Number.isFinite(x)) return '—';
  return x.toFixed(0);
}

function formatChange(x: number | null): string {
  if (x === null || !Number.isFinite(x)) return '';
  const sign = x > 0 ? '+' : '';
  return `${sign}${x.toFixed(0)}`;
}

function arrowGlyph(a: 'up' | 'down' | 'flat' | null): string {
  if (a === 'up') return '▲';
  if (a === 'down') return '▼';
  if (a === 'flat') return '→';
  return '';
}

function arrowColor(a: 'up' | 'down' | 'flat' | null): string {
  if (a === 'up') return '#c8102e';   // worsening stress = red
  if (a === 'down') return '#1f6b3a'; // improving = green
  return '#4a4a4a';
}

function shockLabel(sign: 'drag' | 'benefit' | 'mixed'): string {
  if (sign === 'drag') return 'drag';
  if (sign === 'benefit') return 'benefit';
  return 'mixed';
}

function shockColor(sign: 'drag' | 'benefit' | 'mixed', score: number): string {
  // Intensity scales with score 1-5.
  const alpha = 0.10 + (score - 1) * 0.08;
  if (sign === 'drag') return `rgba(200, 16, 46, ${alpha})`;
  if (sign === 'benefit') return `rgba(31, 107, 58, ${alpha})`;
  return `rgba(140, 100, 20, ${alpha * 0.9})`;
}

function headerCell(label: string, note: string, align: 'left' | 'right' = 'right') {
  return (
    <th
      className={`py-1.5 px-2 text-${align} font-semibold text-[#1a1a1a]`}
      title={note}
    >
      <div className="text-[11px]">{label}</div>
      <div className="text-[9.5px] font-normal italic text-[#6a6a6a] mt-0.5">{note}</div>
    </th>
  );
}

function CellPctl({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <td
        className="py-1.5 px-2 text-right tabular-nums text-[#6a6a6a]"
        style={{ background: 'transparent' }}
      >
        —
      </td>
    );
  }
  return (
    <td
      className="py-1.5 px-2 text-right tabular-nums"
      style={{ background: stressColor(value), color: stressTextColor(value), fontWeight: 600 }}
    >
      {formatPctl(value)}
    </td>
  );
}

export const SectorHeatMap = () => {
  const data = useMemo(() => buildSectorHeatMap(), []);

  const realizedActive = data.availability.realized.active > 0;
  const fundamentalsActive = data.availability.fundamentals.active > 0;

  return (
    <div className="mb-4">
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
          Sector heat map
        </div>
        <div
          className="text-[11.5px] italic mb-3"
          style={{ color: '#4a4a4a', fontFamily: 'Georgia, serif' }}
        >
          Each column is a percentile against the sector&rsquo;s own history (0 = calm,
          100 = stressed). Market = 6-month drawdown from the 52-week high plus
          3-month realized volatility. Shock is a static 1&ndash;5 score for
          oil/freight sensitivity, colored by sign. Composite is the mean of the
          available columns. Disagreement flag fires when any pair of columns
          spreads &gt;40 points &mdash; that&rsquo;s the &ldquo;calm on top, concern
          at the bottom&rdquo; pattern surfaced row-by-row.
          {data.asOfDate && <> As of {data.asOfDate}.</>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px] border-collapse" style={{ fontFamily: 'var(--font-sans)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #d9d4c7' }}>
                <th className="py-1.5 pr-3 text-left font-semibold text-[#1a1a1a]">Sector</th>
                {headerCell('Market', 'drawdown + 3m vol pctl')}
                {headerCell('Fundamentals', fundamentalsActive ? 'median PD + % flagged' : 'awaits Phase 4')}
                {headerCell('Realized', realizedActive ? 'manual-input pctl' : 'awaits manual_inputs')}
                {headerCell('Shock', '1-5, oil/freight sensitivity')}
                {headerCell('Composite', 'avg of available cols · 3m change')}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row: SectorRow) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid rgba(217,212,199,0.5)',
                  }}
                >
                  <td className="py-1.5 pr-3">
                    <div className="font-medium text-[#1a1a1a]">{row.label}</div>
                    <div className="text-[10.5px] text-[#6a6a6a]">
                      {row.etf ? row.etf : <span className="italic">no sector ETF</span>}
                    </div>
                  </td>

                  <CellPctl value={row.market.score} />

                  <CellPctl value={row.fundamentals.score} />

                  <CellPctl value={row.realized.score} />

                  {/* Shock cell — static 1-5 with sign-colored background */}
                  <td
                    className="py-1.5 px-2 text-right tabular-nums"
                    style={{
                      background: shockColor(row.shock.sign, row.shock.score),
                      fontWeight: 600,
                      color: '#1a1a1a',
                    }}
                    title={row.shock.rationale}
                  >
                    {row.shock.score}
                    <span className="ml-1 text-[10px] font-normal italic text-[#4a4a4a]">
                      {shockLabel(row.shock.sign)}
                    </span>
                  </td>

                  {/* Composite cell with 3m change arrow */}
                  <td
                    className="py-1.5 px-2 text-right tabular-nums"
                    style={{
                      background: row.composite !== null ? stressColor(row.composite) : 'transparent',
                      fontWeight: 700,
                      color: row.composite !== null ? stressTextColor(row.composite) : '#6a6a6a',
                    }}
                  >
                    {formatPctl(row.composite)}
                    {row.market.changeArrow && (
                      <span
                        className="ml-1.5 text-[10.5px] font-semibold"
                        style={{ color: arrowColor(row.market.changeArrow) }}
                        title={`3-month Market change: ${formatChange(row.market.change3m)} pts`}
                      >
                        {arrowGlyph(row.market.changeArrow)}
                      </span>
                    )}
                    {row.disagreement.flag && row.disagreement.pair && (
                      <span
                        className="ml-1.5 text-[10.5px] font-semibold"
                        style={{ color: '#8a1818' }}
                        title={`${row.disagreement.pair[0]} and ${row.disagreement.pair[1]} disagree by ${row.disagreement.spreadPctl} pts`}
                      >
                        ⚠
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="text-[10.5px] italic mt-3"
          style={{ color: '#6a6a6a', fontFamily: 'Georgia, serif' }}
        >
          {realizedActive ? (
            <>
              Realized column is live for{' '}
              <strong>{data.availability.realized.active}</strong> of{' '}
              {data.availability.realized.total} sectors.
            </>
          ) : (
            <>
              Realized column awaits verified sector entries in{' '}
              <code>manual_inputs.json</code> (<code>fitch_pc_default_ttm_by_sector</code>,{' '}
              <code>sp_large_co_bankruptcies_by_sector</code>). Market and Shock
              columns are live now.
            </>
          )}
          {' '}Fundamentals column fills in once the Phase 4 distress radar ships.
          Disagreement flags (⚠) will activate once more than one column is populated.
        </div>
      </div>
    </div>
  );
};

export default SectorHeatMap;
