/**
 * HiddenStressGap — Fulcrum v5 Phase 2C
 *
 * Plots Market Stress (the v4 Fulcrum composite, 0-100) against Realized
 * Distress (average percentile of up to four realized-distress inputs,
 * scaled to 0-100). The gap is the v5 thesis in one picture: a positive
 * gap says defaults are running ahead of what spreads are pricing.
 *
 * All data comes from src/data/hiddenStressGap.ts. Component activation
 * is driven by what's actually available — unverified manual_inputs are
 * filtered out at import time by manualInputs.ts, so missing rows simply
 * don't contribute. When fewer than two realized-distress components
 * exist at a given date, the Realized Distress line goes NaN and the
 * chart renders a gap instead of a misleading single-component fallback.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { buildHiddenStressGap } from '@/data/hiddenStressGap';

export const HiddenStressGap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => buildHiddenStressGap(), []);

  // Two components or more must contribute at least once for the chart to be meaningful.
  const activeComponents = data.availability.filter(a => a.obsCount > 0);
  const hasEnoughSignal = activeComponents.length >= 2;

  // Shortest history among components that actually have data, for the caption.
  const shortest = activeComponents.length > 0
    ? activeComponents.reduce((min, a) => (a.historyYears < min.historyYears ? a : min))
    : null;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const cssW = container.clientWidth;
    const cssH = Math.round(cssW * (340 / 1040));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * DPR);
    canvas.height = Math.round(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const w = cssW, h = cssH;
    ctx.clearRect(0, 0, w, h);

    const PAD = { l: 56, r: 92, t: 36, b: 40 };
    const plotX = PAD.l;
    const plotY = PAD.t;
    const plotW = w - PAD.l - PAD.r;
    const plotH = h - PAD.t - PAD.b;

    // X-domain: last ~15 years so the chart focuses on the CCC-BB window
    // without dropping the long run of DRBLACBS context around it.
    const tMax = Date.parse(data.marketStress[data.marketStress.length - 1]?.date ?? '2026-01-01');
    const tMin = tMax - 15 * 365.25 * 86400000;

    const xOf = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;
    const yOf = (v: number) => plotY + plotH - (v / 100) * plotH;

    // Title.
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 12px Helvetica Neue, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Hidden-Stress Gap: Market Stress vs. Realized Distress', plotX, 8);
    ctx.font = 'italic 10.5px Georgia, serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText(
      'Positive gap = defaults running ahead of headline spreads (calm on top, concern at the bottom)',
      plotX,
      22,
    );

    // Y gridlines every 25 pctl.
    ctx.strokeStyle = 'rgba(26,26,26,0.06)';
    ctx.lineWidth = 1;
    ctx.font = 'bold 10px Georgia, serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (const v of [0, 25, 50, 75, 100]) {
      const y = yOf(v);
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillText(`${v}`, plotX - 6, y);
    }

    // Y-axis label.
    ctx.save();
    ctx.translate(14, plotY + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('Percentile (0-100)', 0, 0);
    ctx.restore();

    // X ticks: years.
    ctx.fillStyle = '#4a4a4a';
    ctx.font = '10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const startYear = new Date(tMin).getUTCFullYear() + 1;
    const endYear = new Date(tMax).getUTCFullYear();
    for (let y = startYear; y <= endYear; y++) {
      const t = Date.UTC(y, 0, 1);
      if (t < tMin || t > tMax) continue;
      const x = xOf(t);
      ctx.strokeStyle = 'rgba(26,26,26,0.18)';
      ctx.beginPath();
      ctx.moveTo(x, plotY + plotH);
      ctx.lineTo(x, plotY + plotH + 4);
      ctx.stroke();
      ctx.fillText(`${y}`, x, plotY + plotH + 7);
    }

    // Plot border.
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    const drawLine = (
      points: ReadonlyArray<{ date: string; value: number }>,
      color: string,
      lineWidth: number,
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let pen = false;
      for (const p of points) {
        const t = Date.parse(p.date);
        if (t < tMin || t > tMax) continue;
        if (!Number.isFinite(p.value)) {
          pen = false;
          continue;
        }
        const x = xOf(t);
        const y = yOf(p.value);
        if (!pen) {
          ctx.moveTo(x, y);
          pen = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    // Market Stress — ink, 1.4px.
    drawLine(data.marketStress, 'rgba(26,26,26,0.75)', 1.4);
    // Realized Distress — deep red, 2px, prominent.
    drawLine(data.realizedDistress, '#c8102e', 2);

    // Legend (upper-right).
    const legendX = plotX + plotW - 6;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.font = '11px Helvetica Neue, Arial, sans-serif';
    ctx.fillStyle = 'rgba(26,26,26,0.85)';
    ctx.fillText('— Market Stress (v4 composite)', legendX, plotY + 6);
    ctx.fillStyle = '#c8102e';
    ctx.fillText('— Realized Distress (avg pctl)', legendX, plotY + 20);

    // Latest-point markers (only if finite).
    const lastMs = data.marketStress[data.marketStress.length - 1];
    const lastRd = data.realizedDistress[data.realizedDistress.length - 1];
    if (lastMs && Number.isFinite(lastMs.value)) {
      const x = xOf(Date.parse(lastMs.date));
      const y = yOf(lastMs.value);
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (lastRd && Number.isFinite(lastRd.value)) {
      const x = xOf(Date.parse(lastRd.date));
      const y = yOf(lastRd.value);
      ctx.fillStyle = '#c8102e';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.75;
      ctx.stroke();
    }
  }, [data]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  return (
    <div className="mb-4">
      <div
        ref={containerRef}
        className="p-4"
        style={{
          background: '#fbf9f3',
          border: '1px solid #d9d4c7',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {hasEnoughSignal ? (
        <div
          className="mt-3 flex flex-col gap-1 text-[12.5px] text-[#4a4a4a] px-1"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {data.current.date && (
            <div>
              <strong style={{ color: '#1a1a1a' }}>Today ({data.current.date}):</strong>{' '}
              Market Stress {data.current.marketStress?.toFixed(0)} ·{' '}
              Realized Distress {data.current.realizedDistress?.toFixed(0)} ·{' '}
              Gap{' '}
              <span style={{ color: (data.current.gap ?? 0) >= 0 ? '#c8102e' : '#1f6b3a', fontWeight: 600 }}>
                {data.current.gap !== null ? (data.current.gap >= 0 ? '+' : '') + data.current.gap.toFixed(1) : '—'}
              </span>{' '}
              · {data.current.availableComponents.length} of {data.availability.length} components contributing.
            </div>
          )}
          <div className="italic">
            Realized Distress is the equal-weighted average percentile of its available components, each scored against its own history.
            {shortest && (
              <>
                {' '}Shortest contributing history: <strong>{shortest.label}</strong>{' '}
                ({shortest.historyYears.toFixed(1)} yr, {shortest.obsCount} obs).
              </>
            )}
            {activeComponents.length < data.availability.length && (
              <>
                {' '}Awaiting verified entries for{' '}
                {data.availability
                  .filter(a => a.obsCount === 0)
                  .map(a => a.label)
                  .join(', ')}
                {' '}(added once each figure is checked against its primary source).
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          className="mt-3 text-[12.5px] italic text-[#4a4a4a] px-1"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Hidden-Stress Gap requires at least two realized-distress components. Only{' '}
          <strong>{activeComponents.length}</strong> is currently available
          {activeComponents[0] && <> ({activeComponents[0].label})</>}. Fitch private-credit
          defaults and S&amp;P large-company bankruptcies are added once each figure is checked
          against its primary source.
        </div>
      )}
    </div>
  );
};

export default HiddenStressGap;
