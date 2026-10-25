/**
 * Capital Structure Tier panel — four lines on a log scale showing the
 * spread evolution at each rung of the credit ladder.
 *
 * Tiers (top of stack down):
 *   BBB → IG floor (gray, the "where IG ends" reference)
 *   BB  → highest HY tier (gold, Memo brand)
 *   HY  → blended HY index (navy, the headline)
 *   CCC → bottom of HY (deep red, the canary)
 *
 * Log scale lets all four lines remain distinguishable even when BBB sits
 * around 100 bps and CCC is up at ~900 bps. Endpoint badges replace a
 * legend so each line is labeled at its current value without color
 * lookup overhead.
 */

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { bbbOasHistory } from '@/data/bbbOasHistory';
import { bbOasHistory } from '@/data/bbOasHistory';
import { hyOasHistory } from '@/data/hyOasHistory';
import { cccOasHistory } from '@/data/cccOasHistory';

type Tier = {
  key: 'bbb' | 'bb' | 'hy' | 'ccc';
  label: string;
  color: string;
  series: ReadonlyArray<{ date: string; value: number }>;
};

const TIERS: Tier[] = [
  { key: 'bbb', label: 'BBB', color: '#4a4a4a', series: bbbOasHistory },
  { key: 'bb',  label: 'BB',  color: '#c9a227', series: bbOasHistory },
  { key: 'hy',  label: 'HY',  color: '#1f4a6b', series: hyOasHistory },
  { key: 'ccc', label: 'CCC', color: '#8a1818', series: cccOasHistory },
];

export const CapitalStructureTierPanel = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive shared time bounds and y-axis log range.
  const bounds = useMemo(() => {
    let tMin = Infinity;
    let tMax = -Infinity;
    let vMin = Infinity;
    let vMax = -Infinity;
    for (const tier of TIERS) {
      for (const p of tier.series) {
        const t = new Date(p.date).getTime();
        if (t < tMin) tMin = t;
        if (t > tMax) tMax = t;
        if (p.value < vMin) vMin = p.value;
        if (p.value > vMax) vMax = p.value;
      }
    }
    // Round to clean log decade boundaries on the y-axis.
    const lo = Math.max(50, Math.floor(vMin / 25) * 25);
    const hi = Math.ceil(vMax / 100) * 100;
    return { tMin, tMax, vMin: lo, vMax: hi };
  }, []);

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

    const w = cssW;
    const h = cssH;
    ctx.clearRect(0, 0, w, h);

    const PAD = { l: 56, r: 90, t: 36, b: 40 };
    const plotX = PAD.l;
    const plotY = PAD.t;
    const plotW = w - PAD.l - PAD.r;
    const plotH = h - PAD.t - PAD.b;

    const { tMin, tMax, vMin, vMax } = bounds;
    const lnLo = Math.log(vMin);
    const lnHi = Math.log(vMax);

    const xOf = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;
    const yOf = (v: number) =>
      plotY + plotH - ((Math.log(Math.max(vMin, Math.min(vMax, v))) - lnLo) / (lnHi - lnLo)) * plotH;

    // Title.
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 12px Helvetica Neue, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Capital Structure Tiers', plotX, 8);
    ctx.font = 'italic 10.5px Georgia, serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText('OAS by tier — log scale, BBB / BB / HY / CCC', plotX, 22);

    // Y-axis grid + labels.
    ctx.strokeStyle = 'rgba(26,26,26,0.06)';
    ctx.lineWidth = 1;
    ctx.font = 'bold 10px Georgia, serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yTicks = [100, 200, 300, 500, 700, 1000, 1500].filter(v => v >= vMin && v <= vMax);
    yTicks.forEach(v => {
      const y = yOf(v);
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillText(`${v}`, plotX - 6, y);
    });

    ctx.save();
    ctx.translate(14, plotY + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('OAS (bps, log)', 0, 0);
    ctx.restore();

    // X-axis ticks (year + half-year labels).
    ctx.fillStyle = '#4a4a4a';
    ctx.font = '10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const startYear = new Date(tMin).getUTCFullYear();
    const endYear = new Date(tMax).getUTCFullYear();
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
        ctx.fillText(month === 0 ? `${y}` : `${y}-H2`, x, plotY + plotH + 7);
      }
    }

    // Plot border.
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // Tier lines.
    TIERS.forEach(tier => {
      ctx.strokeStyle = tier.color;
      ctx.lineWidth = 1.7;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let started = false;
      for (const p of tier.series) {
        const x = xOf(new Date(p.date).getTime());
        const y = yOf(p.value);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Endpoint badges (replace legend).
    TIERS.forEach(tier => {
      const last = tier.series[tier.series.length - 1];
      if (!last) return;
      const xL = xOf(new Date(last.date).getTime());
      const yL = yOf(last.value);

      ctx.fillStyle = tier.color;
      ctx.beginPath();
      ctx.arc(xL, yL, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
      const text = `${tier.label} ${Math.round(last.value)}`;
      const tw = ctx.measureText(text).width;
      const padX = 5;
      const bw = tw + padX * 2;
      const bh = 14;
      const bx = Math.min(xL + 6, plotX + plotW + PAD.r - bw - 4);
      const by = Math.max(plotY + 2, Math.min(yL - bh / 2, plotY + plotH - bh - 2));
      ctx.fillStyle = tier.color;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.75;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = tier.color === '#c9a227' ? '#1a1a1a' : '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bx + padX, by + bh / 2 + 0.5);
    });
  }, [bounds]);

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

export default CapitalStructureTierPanel;
