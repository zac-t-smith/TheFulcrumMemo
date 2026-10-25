/**
 * HY-IG Dispersion Chart — overlay of HY OAS and BBB OAS with the gap
 * between them shaded. Shows which side of the cap structure is widening
 * faster: when HY pulls away, the headline credit cycle is taking the
 * blame; when BBB closes the gap, it's IG-driven downgrade risk leaking
 * across the boundary.
 *
 * Math is like-for-like — both series are ICE BofA OAS expressed in bps,
 * so the dispersion (HY − BBB) and ratio (HY ÷ BBB) are directly
 * comparable through time. (We do NOT subtract HY OAS from BAA10Y as a
 * prior draft proposed; BAA10Y is a different methodology and would
 * introduce a method-mismatch artifact.)
 */

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { hyOasHistory } from '@/data/hyOasHistory';
import { bbbOasHistory } from '@/data/bbbOasHistory';

interface AlignedRow {
  date: string;
  hy: number;
  bbb: number;
  gap: number;
  ratio: number;
}

function buildAligned(): AlignedRow[] {
  const bbbMap = new Map(bbbOasHistory.map(p => [p.date, p.value]));
  const out: AlignedRow[] = [];
  for (const p of hyOasHistory) {
    const bbb = bbbMap.get(p.date);
    if (bbb === undefined || bbb <= 0) continue;
    out.push({ date: p.date, hy: p.value, bbb, gap: p.value - bbb, ratio: p.value / bbb });
  }
  return out;
}

export const HyIgDispersionChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => buildAligned(), []);
  const latest = data.length > 0 ? data[data.length - 1] : null;

  const meanRatio = useMemo(() => {
    if (data.length === 0) return 0;
    return data.reduce((acc, p) => acc + p.ratio, 0) / data.length;
  }, [data]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length === 0) return;

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

    const PAD = { l: 56, r: 88, t: 36, b: 40 };
    const plotX = PAD.l;
    const plotY = PAD.t;
    const plotW = w - PAD.l - PAD.r;
    const plotH = h - PAD.t - PAD.b;

    const tMin = new Date(data[0].date).getTime();
    const tMax = new Date(data[data.length - 1].date).getTime();

    const allValues = data.flatMap(p => [p.hy, p.bbb]);
    const vMax = Math.ceil(Math.max(...allValues) / 50) * 50;
    const vMin = Math.max(0, Math.floor(Math.min(...allValues) / 50) * 50 - 50);

    const xOf = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;
    const yOf = (v: number) => plotY + plotH - ((v - vMin) / (vMax - vMin)) * plotH;

    // Title.
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 12px Helvetica Neue, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('HY–IG Dispersion', plotX, 8);
    ctx.font = 'italic 10.5px Georgia, serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText('HY OAS vs BBB OAS — like-for-like ICE BofA series', plotX, 22);

    // Y-axis grid + labels.
    ctx.strokeStyle = 'rgba(26,26,26,0.06)';
    ctx.lineWidth = 1;
    ctx.font = 'bold 10px Georgia, serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yStep = (vMax - vMin) > 400 ? 100 : 50;
    for (let v = vMin; v <= vMax; v += yStep) {
      const y = yOf(v);
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillText(`${v}`, plotX - 6, y);
    }

    ctx.save();
    ctx.translate(14, plotY + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('OAS (bps)', 0, 0);
    ctx.restore();

    // X-axis ticks.
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

    // Shaded gap between HY and BBB.
    ctx.fillStyle = 'rgba(31, 74, 107, 0.10)';
    ctx.beginPath();
    data.forEach((p, i) => {
      const x = xOf(new Date(p.date).getTime());
      const y = yOf(p.hy);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let i = data.length - 1; i >= 0; i--) {
      const p = data[i];
      const x = xOf(new Date(p.date).getTime());
      const y = yOf(p.bbb);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Plot border.
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // HY line (navy).
    ctx.strokeStyle = '#1f4a6b';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((p, i) => {
      const x = xOf(new Date(p.date).getTime());
      const y = yOf(p.hy);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // BBB line (gray).
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    data.forEach((p, i) => {
      const x = xOf(new Date(p.date).getTime());
      const y = yOf(p.bbb);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Endpoint badges.
    if (latest) {
      const xL = xOf(new Date(latest.date).getTime());
      const drawBadge = (val: number, color: string, label: string) => {
        const yL = yOf(val);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(xL, yL, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
        const text = `${label} ${Math.round(val)}`;
        const tw = ctx.measureText(text).width;
        const padX = 5;
        const bw = tw + padX * 2;
        const bh = 14;
        const bx = Math.min(xL + 6, plotX + plotW + PAD.r - bw - 4);
        const by = Math.max(plotY + 2, Math.min(yL - bh / 2, plotY + plotH - bh - 2));
        ctx.fillStyle = color;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 0.75;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, bx + padX, by + bh / 2 + 0.5);
      };
      drawBadge(latest.hy, '#1f4a6b', 'HY');
      drawBadge(latest.bbb, '#4a4a4a', 'BBB');
    }
  }, [data, latest]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  return (
    <div
      className="p-4 mb-4"
      style={{
        background: '#fbf9f3',
        border: '1px solid #d9d4c7',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
      {latest && (
        <div
          className="grid grid-cols-3 gap-3 mt-3 pt-3"
          style={{ borderTop: '1px solid #e5e2db' }}
        >
          <Stat label="HY − BBB gap" value={`${Math.round(latest.gap)} bps`} />
          <Stat label="HY ÷ BBB ratio" value={`${latest.ratio.toFixed(2)}×`} />
          <Stat label="3y mean ratio" value={`${meanRatio.toFixed(2)}×`} />
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <div
      className="text-[9.5px] tracking-[0.16em] uppercase text-[#4a4a4a] font-semibold"
      style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
    >
      {label}
    </div>
    <div
      className="text-[15px] font-bold text-[#1a1a1a] tracking-tight"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {value}
    </div>
  </div>
);

export default HyIgDispersionChart;
