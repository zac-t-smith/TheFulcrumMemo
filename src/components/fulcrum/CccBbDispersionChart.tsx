/**
 * CCC-BB Dispersion Chart — the canary signal for capital structure stress.
 *
 * Plots the CCC-OAS ÷ BB-OAS ratio across the available current-cycle window
 * with two reference lines:
 *   • Solid red at 3.5× — the canary threshold above which junk-of-junk is
 *     breaking ahead of the rest of HY (the "is this dislocated?" line).
 *   • Faint dashed at the live long-run median across the available data
 *     (the "is this elevated?" line).
 *
 * Dates are pre-aligned: cccOasHistory and bbOasHistory both come from the
 * same FRED auto-pull and run on identical trading-day grids. We still
 * date-align defensively in case a future pull desynchronizes them.
 */

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { cccOasHistory } from '@/data/cccOasHistory';
import { bbOasHistory } from '@/data/bbOasHistory';

// Canary threshold: above 3.5× CCC is breaking ahead of BB. Below 3.5×
// the cross-tier relationship is within historic norms. The number is
// inherited from credit-strategy desk practice and the v4 workbook.
export const CCC_BB_CANARY_THRESHOLD = 3.5;

interface RatioPoint {
  date: string;
  ccc: number;
  bb: number;
  ratio: number;
}

function buildRatioSeries(): RatioPoint[] {
  const bbMap = new Map(bbOasHistory.map(p => [p.date, p.value]));
  const out: RatioPoint[] = [];
  for (const p of cccOasHistory) {
    const bb = bbMap.get(p.date);
    if (bb === undefined || bb <= 0) continue;
    out.push({ date: p.date, ccc: p.value, bb, ratio: p.value / bb });
  }
  return out;
}

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export const CccBbDispersionChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const series = useMemo(() => buildRatioSeries(), []);
  const median = useMemo(() => computeMedian(series.map(p => p.ratio)), [series]);
  const latest = series.length > 0 ? series[series.length - 1] : null;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || series.length === 0) return;

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

    const w = cssW;
    const h = cssH;
    ctx.clearRect(0, 0, w, h);

    // Right padding holds the median/threshold tags that sit just outside
    // the plot (anchored at plotX+plotW+6, textAlign 'left'). 'threshold 3.5×'
    // at bold 10px Helvetica Neue is ~78px wide, so PAD.r needs ~90 of room.
    const PAD = { l: 56, r: 92, t: 36, b: 40 };
    const plotX = PAD.l;
    const plotY = PAD.t;
    const plotW = w - PAD.l - PAD.r;
    const plotH = h - PAD.t - PAD.b;

    const tMin = new Date(series[0].date).getTime();
    const tMax = new Date(series[series.length - 1].date).getTime();

    // Y range — slightly above the latest reading so endpoint dot doesn't pin.
    const ratios = series.map(p => p.ratio);
    const dataMax = Math.max(...ratios, CCC_BB_CANARY_THRESHOLD, median);
    const dataMin = Math.min(...ratios);
    const yMin = Math.max(0, Math.floor(dataMin * 2) / 2 - 0.5);
    const yMax = Math.ceil(dataMax * 2) / 2 + 0.5;

    const xOf = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;
    const yOf = (r: number) => plotY + plotH - ((r - yMin) / (yMax - yMin)) * plotH;

    // Title block.
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 12px Helvetica Neue, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('CCC-BB Dispersion (the canary)', plotX, 8);
    ctx.font = 'italic 10.5px Georgia, serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText('CCC OAS ÷ BB OAS — junk-of-junk breaking ahead of the rest of HY', plotX, 22);

    // Grid (half-step ticks).
    ctx.strokeStyle = 'rgba(26,26,26,0.06)';
    ctx.lineWidth = 1;
    ctx.font = 'bold 10px Georgia, serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const tickStep = (yMax - yMin) > 4 ? 1 : 0.5;
    for (let v = Math.ceil(yMin / tickStep) * tickStep; v <= yMax; v += tickStep) {
      const y = yOf(v);
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillText(`${v.toFixed(tickStep < 1 ? 1 : 0)}×`, plotX - 6, y);
    }

    // Y-axis label.
    ctx.save();
    ctx.translate(14, plotY + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('Ratio (CCC OAS ÷ BB OAS)', 0, 0);
    ctx.restore();

    // X-axis ticks (months / quarters).
    ctx.fillStyle = '#4a4a4a';
    ctx.font = '10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const startYear = new Date(series[0].date).getUTCFullYear();
    const endYear = new Date(series[series.length - 1].date).getUTCFullYear();
    for (let y = startYear; y <= endYear; y++) {
      for (const month of [0, 6]) {
        const t = Date.UTC(y, month, 1);
        if (t < tMin || t > tMax) continue;
        const x = xOf(t);
        ctx.strokeStyle = 'rgba(26,26,26,0.18)';
        ctx.beginPath();
        ctx.moveTo(x, plotY + plotH);
        ctx.lineTo(x, plotY + plotH + 4);
        ctx.stroke();
        const label = month === 0 ? `${y}` : `${y}-H2`;
        ctx.fillText(label, x, plotY + plotH + 7);
      }
    }

    // Plot border.
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // Median reference line — faint dashed.
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(26,26,26,0.45)';
    ctx.lineWidth = 1;
    const yMedian = yOf(median);
    ctx.beginPath();
    ctx.moveTo(plotX, yMedian);
    ctx.lineTo(plotX + plotW, yMedian);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = 'italic 10px Georgia, serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`median ${median.toFixed(2)}×`, plotX + plotW + 6, yMedian);

    // Threshold reference line — solid red.
    ctx.strokeStyle = '#c8102e';
    ctx.lineWidth = 1.4;
    const yThreshold = yOf(CCC_BB_CANARY_THRESHOLD);
    ctx.beginPath();
    ctx.moveTo(plotX, yThreshold);
    ctx.lineTo(plotX + plotW, yThreshold);
    ctx.stroke();
    ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
    ctx.fillStyle = '#c8102e';
    ctx.fillText(`threshold ${CCC_BB_CANARY_THRESHOLD.toFixed(1)}×`, plotX + plotW + 6, yThreshold);

    // Ratio line.
    ctx.strokeStyle = '#1f4a6b';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    series.forEach((p, i) => {
      const x = xOf(new Date(p.date).getTime());
      const y = yOf(p.ratio);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Endpoint dot.
    if (latest) {
      const xL = xOf(new Date(latest.date).getTime());
      const yL = yOf(latest.ratio);
      ctx.fillStyle = latest.ratio >= CCC_BB_CANARY_THRESHOLD ? '#c8102e' : '#1f4a6b';
      ctx.beginPath();
      ctx.arc(xL, yL, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Endpoint badge.
      ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
      const text = `${latest.ratio.toFixed(2)}×`;
      const tw = ctx.measureText(text).width;
      const padX = 5;
      const bw = tw + padX * 2;
      const bh = 14;
      const bx = Math.min(xL + 6, plotX + plotW - bw - 2);
      const by = Math.max(plotY + 2, Math.min(yL - bh / 2, plotY + plotH - bh - 2));
      ctx.fillStyle = '#c8102e';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.75;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bx + padX, by + bh / 2 + 0.5);
    }
  }, [series, median, latest]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className="p-4 mb-4"
      style={{
        background: '#fbf9f3',
        border: '1px solid #d9d4c7',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CccBbDispersionChart;
