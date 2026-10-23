/**
 * BAA Historical Scatter — 40-year distribution view.
 *
 * Each trading day is plotted as a single dot:
 *   • y position: BAA10Y in bps, log-inverted (top = tight, bottom = wide)
 *   • x position: linear time, 1990-present
 *   • color: BAA10Y percentile against the full historical distribution
 *           (red = tightest decile, green = widest decile, yellow = median)
 *   • size: VIX level scaled into 1.6 → 6.4 px
 *   • alpha: 0.65 — additive opacity exposes density
 *
 * The chart answers "where are we in the historical distribution?" in a way
 * the line+regime-band chart can't, because percentile coloring is anchored
 * to the BAA10Y data itself rather than to v3's static composite thresholds.
 *
 * Pre-1990 BAA10Y data is dropped because VIX data starts 1990-01-02;
 * rendering pre-VIX rows would make the dot-size encoding meaningless.
 */

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { baaSpreadHistory } from '@/data/baaSpreadHistory';
import { vixHistory } from '@/data/vixHistory';
import { BAA_EVENT_MARKERS } from '@/data/fulcrumIndex';

interface ScatterPoint {
  date: string;
  baa: number;
  vix: number;
  pctl: number;        // [0,1] percentile of baa within the full series
  ts: number;          // cached Date.parse for x-mapping
}

// Same 5-stop palette as the v3 reference HTML's tradingSignalColor.
// Stops at p ∈ {0.00, 0.25, 0.50, 0.75, 1.00}, RGB triples.
const COLOR_STOPS: Array<{ p: number; rgb: [number, number, number] }> = [
  { p: 0.00, rgb: [138, 24, 24] },
  { p: 0.25, rgb: [217, 132, 132] },
  { p: 0.50, rgb: [230, 200, 90] },
  { p: 0.75, rgb: [111, 180, 135] },
  { p: 1.00, rgb: [31, 107, 58] },
];

function tradingSignalColor(p: number): string {
  const t = Math.max(0, Math.min(1, p));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const lo = COLOR_STOPS[i];
    const hi = COLOR_STOPS[i + 1];
    if (t >= lo.p && t <= hi.p) {
      const span = hi.p - lo.p;
      const k = span > 0 ? (t - lo.p) / span : 0;
      const r = Math.round(lo.rgb[0] + (hi.rgb[0] - lo.rgb[0]) * k);
      const g = Math.round(lo.rgb[1] + (hi.rgb[1] - lo.rgb[1]) * k);
      const b = Math.round(lo.rgb[2] + (hi.rgb[2] - lo.rgb[2]) * k);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  const last = COLOR_STOPS[COLOR_STOPS.length - 1].rgb;
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

// Module-load cache: date-aligned series + sorted-by-baa array for O(log n)
// percentile lookup.
function buildScatterData(): { points: ScatterPoint[]; sortedBaa: number[] } {
  const vixMap = new Map(vixHistory.map(p => [p.date, p.value]));
  const aligned: Array<{ date: string; baa: number; vix: number; ts: number }> = [];
  for (const p of baaSpreadHistory) {
    const v = vixMap.get(p.date);
    if (v === undefined) continue; // drops pre-1990 (no VIX) and any sparse gaps
    aligned.push({ date: p.date, baa: p.value, vix: v, ts: Date.parse(p.date) });
  }
  const sortedBaa = aligned.map(r => r.baa).sort((a, b) => a - b);
  // Percentile via binary search on sorted-baa.
  function pctlOf(value: number): number {
    let lo = 0;
    let hi = sortedBaa.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sortedBaa[mid] < value) lo = mid + 1;
      else hi = mid;
    }
    let upper = lo;
    while (upper < sortedBaa.length && sortedBaa[upper] === value) upper += 1;
    return (lo + upper) / 2 / sortedBaa.length;
  }
  const points: ScatterPoint[] = aligned.map(r => ({
    date: r.date,
    baa: r.baa,
    vix: r.vix,
    ts: r.ts,
    // Percentile inverted relative to "wide is bad": we want green = wide
    // (high pctl) and red = tight (low pctl). Raw baa percentile already
    // points the right way — high baa value → high pctl rank → green.
    pctl: pctlOf(r.baa),
  }));
  return { points, sortedBaa };
}

// Translate a [0,1] percentile into a human band label. Decile=10%, etc.
// Boundaries are inclusive on the lower end; we round generously so a
// 19.5% reading still reads as "tightest quintile" rather than going
// up to "tightest 30%."
function ordinalLabel(pctl: number): string {
  if (pctl <= 0.10) return 'tightest decile';
  if (pctl <= 0.20) return 'tightest quintile';
  if (pctl <= 0.30) return 'tightest 30%';
  if (pctl <= 0.50) return 'tighter half';
  if (pctl >= 0.90) return 'widest decile';
  if (pctl >= 0.80) return 'widest quintile';
  if (pctl >= 0.70) return 'widest 30%';
  return 'middle of the distribution';
}

// VIX-to-radius mapping. Use sample min/max so the smallest dot is
// 1.6px (calmest day in sample) and the largest is 6.4px.
function buildSizeMapper(points: ScatterPoint[]): (vix: number) => number {
  let vMin = Infinity;
  let vMax = -Infinity;
  for (const p of points) {
    if (p.vix < vMin) vMin = p.vix;
    if (p.vix > vMax) vMax = p.vix;
  }
  const range = vMax - vMin;
  return (vix: number) => {
    if (range <= 0) return 3.0;
    const t = (vix - vMin) / range;
    return 1.6 + Math.max(0, Math.min(1, t)) * (6.4 - 1.6);
  };
}

export const BaaHistoricalScatter = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { points } = useMemo(() => buildScatterData(), []);
  const sizeOf = useMemo(() => buildSizeMapper(points), [points]);
  const latest = points.length > 0 ? points[points.length - 1] : null;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || points.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const cssW = container.clientWidth;
    const cssH = Math.round(cssW * (980 / 2080));

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * DPR);
    canvas.height = Math.round(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const w = cssW;
    const h = cssH;
    ctx.clearRect(0, 0, w, h);

    const PAD = { l: 70, r: 70, t: 28, b: 50 };
    const plotX = PAD.l;
    const plotY = PAD.t;
    const plotW = w - PAD.l - PAD.r;
    const plotH = h - PAD.t - PAD.b;

    // Y-axis: log-inverted. Anchors 100 (top) → 700 (bottom).
    const Y_LO = 100;
    const Y_HI = 700;
    const lnLo = Math.log(Y_LO);
    const lnHi = Math.log(Y_HI);
    const yOf = (baa: number) => {
      const v = Math.max(Y_LO, Math.min(Y_HI, baa));
      // Inverted: tight (low bps) at top, wide (high bps) at bottom.
      return plotY + ((Math.log(v) - lnLo) / (lnHi - lnLo)) * plotH;
    };

    const tMin = points[0].ts;
    const tMax = points[points.length - 1].ts;
    const xOf = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;

    // Y-axis grid + tick labels.
    ctx.strokeStyle = 'rgba(26,26,26,0.06)';
    ctx.lineWidth = 1;
    ctx.font = 'bold 10px Georgia, serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yTicks = [100, 150, 200, 300, 400, 500, 600, 700];
    yTicks.forEach(v => {
      const y = yOf(v);
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillText(`${v}`, plotX - 8, y);
    });

    // Direction labels (top-left "TIGHTER ▲" / bottom-left "WIDER ▼").
    ctx.font = 'bold 9px Helvetica Neue, Arial, sans-serif';
    ctx.fillStyle = 'rgba(26,26,26,0.45)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('▲ TIGHTER', plotX + 6, plotY + 4);
    ctx.textBaseline = 'bottom';
    ctx.fillText('▼ WIDER', plotX + 6, plotY + plotH - 4);

    // Y-axis label (rotated).
    ctx.save();
    ctx.translate(18, plotY + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('BAA10Y (bps, log, inverted)', 0, 0);
    ctx.restore();

    // X-axis: every 5 years.
    ctx.fillStyle = '#4a4a4a';
    ctx.font = '11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const startYear = new Date(tMin).getUTCFullYear();
    const endYear = new Date(tMax).getUTCFullYear();
    const firstTick = Math.ceil(startYear / 5) * 5;
    for (let year = firstTick; year <= endYear; year += 5) {
      const t = Date.UTC(year, 0, 1);
      if (t < tMin || t > tMax) continue;
      const x = xOf(t);
      ctx.strokeStyle = 'rgba(26,26,26,0.18)';
      ctx.beginPath();
      ctx.moveTo(x, plotY + plotH);
      ctx.lineTo(x, plotY + plotH + 5);
      ctx.stroke();
      ctx.fillText(String(year), x, plotY + plotH + 9);
    }

    // Plot border.
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // Event markers (dashed verticals + label boxes at top of plot).
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(26,26,26,0.30)';
    ctx.lineWidth = 1;
    ctx.font = 'italic 11px Georgia, serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    // Collision-dodging label placement so CPI shock + Hormuz closure
    // (and any other closely-spaced marker pair) don't overlap.
    const placedBoxes: Array<{ x1: number; x2: number; row: number }> = [];
    BAA_EVENT_MARKERS.forEach(ev => {
      const t = Date.parse(ev.date);
      if (t < tMin || t > tMax) return;
      const x = xOf(t);
      ctx.beginPath();
      ctx.moveTo(x, plotY);
      ctx.lineTo(x, plotY + plotH);
      ctx.stroke();
      const padX = 4;
      const tw = ctx.measureText(ev.label).width;
      const lx = x;
      const x1 = lx - tw / 2 - padX;
      const x2 = lx + tw / 2 + padX;
      let row = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const collides = placedBoxes.some(
          (b) => b.row === row && !(x2 < b.x1 || x1 > b.x2)
        );
        if (!collides) break;
        row += 1;
      }
      placedBoxes.push({ x1, x2, row });
      const ly = plotY + 14 + row * 15;
      ctx.fillStyle = 'rgba(247,245,240,0.92)';
      ctx.fillRect(x1, ly - 11, x2 - x1, 13);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(ev.label, lx, ly);
    });
    ctx.setLineDash([]);

    // Zone anchor labels (corner italics, in-plot).
    ctx.font = 'italic 10.5px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(138, 24, 24, 0.55)';
    ctx.fillText('exit zone · tight spreads', plotX + plotW - 8, plotY + 6);
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(31, 107, 58, 0.55)';
    ctx.fillText('buy zone · wide spreads', plotX + plotW - 8, plotY + plotH - 6);

    // The dots themselves. Render in source order (chronological); recent
    // dots paint over older ones, which is what we want — the latest-day
    // emphasis lives on top.
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = 'rgba(26,26,26,0.35)';
    for (const pt of points) {
      const x = xOf(pt.ts);
      const y = yOf(pt.baa);
      const r = sizeOf(pt.vix);
      const fill = tradingSignalColor(pt.pctl);
      // Apply 0.65 alpha by parsing rgb back out — cheaper than re-string-formatting.
      // tradingSignalColor returns 'rgb(r, g, b)' so substring-replace into rgba.
      ctx.fillStyle = fill.replace('rgb(', 'rgba(').replace(')', ', 0.65)');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Latest-day emphasis.
    if (latest) {
      const x = xOf(latest.ts);
      const y = yOf(latest.baa);
      const fill = tradingSignalColor(latest.pctl);

      // Halo.
      ctx.fillStyle = fill.replace('rgb(', 'rgba(').replace(')', ', 0.20)');
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      // Solid dot.
      ctx.fillStyle = fill;
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Endpoint badge.
      const pctlPct = Math.round(latest.pctl * 100);
      const badgeText = `today · ${Math.round(latest.baa)} bps · vix ${Math.round(latest.vix)} · pctl ${pctlPct}`;
      ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
      const tw = ctx.measureText(badgeText).width;
      const padX = 6;
      const bw = tw + padX * 2;
      const bh = 16;

      // Prefer right of dot; flip to left if it would overflow.
      let bx = x + 10;
      if (bx + bw > plotX + plotW - 4) bx = x - 10 - bw;
      const by = Math.max(plotY + 2, Math.min(y - bh / 2, plotY + plotH - bh - 2));

      ctx.fillStyle = fill;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.75;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

      // Yellow-band readability rule: dark text in the 0.40–0.62 band, white outside.
      const useDarkText = latest.pctl >= 0.40 && latest.pctl <= 0.62;
      ctx.fillStyle = useDarkText ? '#1a1a1a' : '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, bx + padX, by + bh / 2 + 0.5);
    }
  }, [points, sizeOf, latest]);

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
      <p
        className="text-[12.5px] leading-relaxed text-[#4a4a4a] italic mt-3 px-1"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        Forty years of BAA-Treasury spreads, plotted with each day as a dot — color encoding where
        that day sits in the historical distribution (red = tightest decile, green = widest decile),
        size encoding VIX. Density reveals time spent: the long red cluster from 2003–2007 = “tight
        spreads sustained for years before GFC”; the brief deep-green cluster in late 2008 = “the
        dislocation that didn’t last.”{' '}
        {latest && (
          <>
            Today sits in the {ordinalLabel(latest.pctl)} of forty years
            ({Math.round(latest.pctl * 100)}ᵗʰ percentile) — historically, the tight end of this
            distribution has been a setup, not an end state.
          </>
        )}
      </p>
    </div>
  );
};

export default BaaHistoricalScatter;
