/**
 * The Fulcrum Index Page
 *
 * v4 architecture: a long-history credit signal (Moody's Baa-Treasury,
 * BAA10Y, 1986+) drives the composite under a fixed-range percentile
 * (145-600 bps), with Brent and VIX as overlay components. ICE BofA HY
 * OAS, BBB OAS, BB OAS, and CCC OAS are retained as current-cycle
 * secondary signals — they power the half-width companion chart, the
 * Capital Structure Tier panel, and the CCC-BB and HY-IG dispersion
 * panels. The regime-conditional Canary banner fires when the CCC-BB
 * ratio crosses 3.5× and stays mounted while the dispersion persists.
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArchiveBanner from '@/components/ArchiveBanner';
import { baaSpreadHistory } from '@/data/baaSpreadHistory';
import { hyOasHistory } from '@/data/hyOasHistory';
import { vixHistory } from '@/data/vixHistory';
import { brentSpotHistory } from '@/data/brentSpotHistory';
import { cccOasHistory } from '@/data/cccOasHistory';
import { bbOasHistory } from '@/data/bbOasHistory';
import { bbbOasHistory } from '@/data/bbbOasHistory';
import { interpolateETFData, calculateRegimePerformance } from '@/data/etfHistory';
import { CccBbDispersionChart, CCC_BB_CANARY_THRESHOLD } from '@/components/fulcrum/CccBbDispersionChart';
import { CapitalStructureTierPanel } from '@/components/fulcrum/CapitalStructureTierPanel';
import { HyIgDispersionChart } from '@/components/fulcrum/HyIgDispersionChart';
import { BaaHistoricalScatter } from '@/components/fulcrum/BaaHistoricalScatter';
import {
  buildIndexTimeSeries,
  calculate30DayTrend,
  getRiskRegime,
  generateMDCallout,
  getDatasetStats,
  baaTrueHistoricalPercentile,
  ALL_REGIMES,
  BAA_EVENT_MARKERS,
  FULCRUM_INDEX_ATTRIBUTION,
  BAA_30YR_MEAN_BPS,
  HY_OAS_3YR_MEAN_BPS,
  type FulcrumIndexPoint,
  type RiskRegimeInfo,
} from '@/data/fulcrumIndex';

// =============================================================================
// CHART CONSTANTS
// =============================================================================

// Log-scale anchors for the BAA10Y main chart (left axis).
// BAA10Y's actual 1986-2026 range is roughly 132-663 bps; we widen slightly
// to 100-700 so endpoints don't pin against the axis.
const BAA_LOG_LO = 100;
const BAA_LOG_HI = 700;
const BAA_LN_LO = Math.log(BAA_LOG_LO);
const BAA_LN_HI = Math.log(BAA_LOG_HI);

// Log-scale anchors for the companion HY OAS chart (current-cycle window).
const HY_LOG_LO = 250;
const HY_LOG_HI = 700;
const HY_LN_LO = Math.log(HY_LOG_LO);
const HY_LN_HI = Math.log(HY_LOG_HI);

// =============================================================================
// TYPES
// =============================================================================

// Convert a daily-percentage average into a 252-trading-day annualized
// intensity using the geometric form. Daily input is in percent units
// (e.g., 0.03 means +0.03% per day). The geometric form matters at the
// extremes — -0.26% daily linearizes to -65.5% but compounds to -47.8%.
function annualizePct(dailyPct: number): number {
  return (Math.pow(1 + dailyPct / 100, 252) - 1) * 100;
}

interface RiskBand {
  range: string;
  regime: string;
  description: string;
  posture: string;
  color: string;
  isActive: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

// =============================================================================
// PANEL 2 — POST-BACKTEST POSITION CARD
// =============================================================================
//
// Phase 4E-2: the previous 4-regime × 8-position lookup was replaced with
// a single backtest-validated framework. Positions are now categorized by
// what the 20-year sector-rotation backtest actually showed. Some former
// recommendations (gold long, airlines short) failed validation and are
// removed; others (HY credit short, treasuries long) survived only as
// regime-conditional.
//
// Source for both the position categorization and the headline metrics:
//   quant/data/fulcrum_sector_rotation_backtest.xlsx
// Numbers below are framework-level facts derived from that workbook,
// not live data. They will only change if the backtest is re-run.

interface BacktestPosition {
  asset: string;
  instrument: string;
  edge: string;        // What the backtest showed
  thesis: string;      // Memo-side thesis link label
  thesisLink: string;
}

const VALIDATED_POSITIONS: BacktestPosition[] = [
  {
    asset: 'Defense',
    instrument: 'ITA',
    edge: '+2.1% vs SPY in Active+Imminent — clean win',
    thesis: 'Part I',
    thesisLink: '/memos/asymmetric-restructuring#defense',
  },
  {
    asset: 'Crude Oil',
    instrument: 'USO',
    edge: '+2.8% vs SPY in stress — modest but consistent edge',
    thesis: 'Part I',
    thesisLink: '/memos/asymmetric-restructuring',
  },
  {
    asset: 'Distressed',
    instrument: 'Manual screening',
    edge: 'Not ETF-tradeable — framework claim',
    thesis: 'Part II',
    thesisLink: '/memos/portfolio-contagion#distressed',
  },
];

const CONDITIONAL_POSITIONS: BacktestPosition[] = [
  {
    asset: 'Treasuries',
    instrument: 'TLT',
    edge: '+1.4 pt edge in credit-led stress; fails during inflation cycles',
    thesis: 'Fed trap',
    thesisLink: '/memos/portfolio-contagion#rates',
  },
  {
    asset: 'HY Credit short',
    instrument: 'HYG puts',
    edge: '−22.4% vs SPY in stress — works only in credit-led regimes',
    thesis: 'Part II',
    thesisLink: '/memos/portfolio-contagion',
  },
  {
    asset: 'Long-vol overlay',
    instrument: 'PFIX',
    edge: 'Thesis-stage — PFIX inception 2021, insufficient cycle coverage',
    thesis: 'Field Notes',
    thesisLink: '/field-notes',
  },
];

const RETIRED_POSITIONS: Array<BacktestPosition & { reason: string }> = [
  {
    asset: 'Gold long during stress',
    instrument: 'GLD',
    edge: '−4.6% vs SPY in stress',
    reason: 'Failed backtest — GLD underperformed in stress vs calm; safe-haven thesis not supported',
    thesis: '',
    thesisLink: '',
  },
  {
    asset: 'Airlines short during stress',
    instrument: 'JETS short',
    edge: '−44.3% vs SPY',
    reason: 'Stimulus-era rally killed the short — backtest invalidated the thesis',
    thesis: '',
    thesisLink: '',
  },
];

// Backtest summary metrics. Source: quant/data/fulcrum_sector_rotation_backtest.xlsx
// Composite portfolio metrics sheet. Window: 2006-2026 (20 years).
const BACKTEST_METRICS = {
  window: '2006–2026 (20 years)',
  portfolio: { sharpe: 0.51, maxDD: -31, cagr: 9.6 },
  spy:       { sharpe: 0.41, maxDD: -55, cagr: 11.0 },
  ddEdgePts: 24,    // 55 - 31
  cagrCostPts: 1.4, // 11.0 - 9.6
  gfc: { fulcrum: 9.6, spy: -19.8, window: 'Oct 2007 → Mar 2010' },
};

const FulcrumIndexPage = () => {
  const baaCanvasRef = useRef<HTMLCanvasElement>(null);
  const baaContainerRef = useRef<HTMLDivElement>(null);
  const hyCanvasRef = useRef<HTMLCanvasElement>(null);
  const hyContainerRef = useRef<HTMLDivElement>(null);
  const correlationCanvasRef = useRef<HTMLCanvasElement>(null);
  const correlationContainerRef = useRef<HTMLDivElement>(null);

  // Composite index, fed by BAA10Y (credit) + Brent (energy) + VIX (vol).
  // Truncate to the last day all three series share — without this the
  // tail rows drop Brent (which lags by a couple of business days) and
  // the live readout reverts to a credit-only composite, which paints a
  // misleadingly low Complacency reading when the energy shock is still
  // active. Backfilling Brent would be cleaner but is a data hack;
  // truncation matches what the user can verify against FRED.
  const indexData = useMemo<FulcrumIndexPoint[]>(() => {
    const series = buildIndexTimeSeries(baaSpreadHistory, vixHistory, brentSpotHistory);
    const lastBaa = baaSpreadHistory[baaSpreadHistory.length - 1]?.date;
    const lastVix = vixHistory[vixHistory.length - 1]?.date;
    const lastBrent = brentSpotHistory[brentSpotHistory.length - 1]?.date;
    if (!lastBaa || !lastVix || !lastBrent) return series;
    const cutoff = [lastBaa, lastVix, lastBrent].sort()[0];
    return series.filter(p => p.date <= cutoff);
  }, []);

  // Filter to a recent window for ETF/regime overlays — the bundled HYG
  // history starts 2007-04-11; passing pre-2007 dates produces meaningless
  // zero rows that distort the regime averages.
  const recentIndexData = useMemo(() => {
    return indexData.filter(p => p.date >= '2007-04-11');
  }, [indexData]);

  const etfData = useMemo(() => {
    const dates = recentIndexData.map(p => p.date);
    return interpolateETFData(dates);
  }, [recentIndexData]);

  const regimePerformance = useMemo(() => {
    return calculateRegimePerformance(recentIndexData, etfData);
  }, [recentIndexData, etfData]);

  const latestData = indexData.length > 0 ? indexData[indexData.length - 1] : null;
  const stats = getDatasetStats(indexData);
  const trend = calculate30DayTrend(indexData);

  const currentIndex = latestData?.idx ?? 0;
  const currentBaa = latestData?.baa ?? 0;
  const currentVIX = latestData?.vix;
  const currentBrent = latestData?.brent;

  // Latest HY OAS and BBB OAS observations, read live from the bundled
  // histories. BBB feeds the HY-IG dispersion ratio in the MD callout.
  const latestHyOas = hyOasHistory.length > 0 ? hyOasHistory[hyOasHistory.length - 1] : null;
  const currentHyOas = latestHyOas?.value;
  const latestBbbOas = bbbOasHistory.length > 0 ? bbbOasHistory[bbbOasHistory.length - 1] : null;
  const currentBbbOas = latestBbbOas?.value;

  // CCC-BB ratio series, latest value, and live-computed median. The
  // flag copy uses both the latest reading and the median to frame the
  // current 5.2× as the upper end of a persistently elevated regime
  // rather than a fresh dislocation. cccOasHistory and bbOasHistory
  // share an identical date grid (verified pre-flight); we date-align
  // defensively in case a future pull desyncs them.
  const { latestCccBbRatio, medianCccBbRatio } = useMemo(() => {
    if (cccOasHistory.length === 0 || bbOasHistory.length === 0) {
      return { latestCccBbRatio: null, medianCccBbRatio: 0 };
    }
    const bbMap = new Map(bbOasHistory.map(p => [p.date, p.value]));
    const ratios: number[] = [];
    let latest: { date: string; ccc: number; bb: number; ratio: number } | null = null;
    for (const c of cccOasHistory) {
      const b = bbMap.get(c.date);
      if (b === undefined || b <= 0) continue;
      const r = c.value / b;
      ratios.push(r);
      latest = { date: c.date, ccc: c.value, bb: b, ratio: r };
    }
    const sorted = [...ratios].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length === 0 ? 0
      : sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    return { latestCccBbRatio: latest, medianCccBbRatio: median };
  }, []);

  const regime: RiskRegimeInfo = getRiskRegime(currentIndex);

  const mdCallout = latestData
    ? generateMDCallout(currentIndex, currentBaa, currentBrent, currentVIX, currentHyOas, currentBbbOas)
    : 'Loading data...';

  // =============================================================================
  // CANVAS DRAWING
  // =============================================================================

  const drawBaaChart = useCallback(() => {
    const canvas = baaCanvasRef.current;
    const container = baaContainerRef.current;
    if (!canvas || !container || indexData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const cssW = container.clientWidth;
    const cssH = Math.round(cssW * (550 / 1040));

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * DPR);
    canvas.height = Math.round(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const w = cssW;
    const h = cssH;

    ctx.clearRect(0, 0, w, h);

    const PAD = { l: 70, r: 70, t: 24, b: 50 };
    const plotX = PAD.l;
    const plotY = PAD.t;
    const plotW = w - PAD.l - PAD.r;
    const plotH = h - PAD.t - PAD.b;

    const data = indexData;
    const tMin = new Date(data[0].date).getTime();
    const tMax = new Date(data[data.length - 1].date).getTime();

    const xOf = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;
    const yLeftOf = (baa: number) =>
      plotY + plotH - ((Math.log(Math.max(BAA_LOG_LO, Math.min(BAA_LOG_HI, baa))) - BAA_LN_LO) / (BAA_LN_HI - BAA_LN_LO)) * plotH;
    const yRightOf = (idx: number) => plotY + plotH - (idx / 100) * plotH;

    // ---------- 1. RISK BAND BACKGROUND ----------
    const fillBand = (loIdx: number, hiIdx: number, color: string, alpha: number) => {
      const yTop = yRightOf(hiIdx);
      const yBot = yRightOf(loIdx);
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.fillRect(plotX, yTop, plotW, yBot - yTop);
    };

    const greenRGB = '47, 138, 77';
    for (let i = 0; i < 5; i++) {
      const lo = i * 10;
      const hi = (i + 1) * 10;
      const alpha = 0.28 - i * 0.045;
      fillBand(lo, hi, greenRGB, alpha);
    }

    const redRGB = '198, 66, 66';
    for (let i = 0; i < 5; i++) {
      const lo = 50 + i * 10;
      const hi = 60 + i * 10;
      const alpha = 0.10 + i * 0.06;
      fillBand(lo, hi, redRGB, alpha);
    }

    // ---------- 2. GRID ----------
    ctx.strokeStyle = 'rgba(26,26,26,0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) {
      const y = yRightOf(i * 10);
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
    }

    // ---------- 3. X-AXIS TICKS (every 5 years for the 40-year span) ----------
    ctx.fillStyle = '#4a4a4a';
    ctx.font = '11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const startYear = new Date(data[0].date).getUTCFullYear();
    const endYear = new Date(data[data.length - 1].date).getUTCFullYear();
    const tickStep = endYear - startYear > 12 ? 5 : 1;
    const firstTick = Math.ceil(startYear / tickStep) * tickStep;
    for (let year = firstTick; year <= endYear; year += tickStep) {
      const tickT = Date.UTC(year, 0, 1);
      if (tickT < tMin || tickT > tMax) continue;
      const xt = xOf(tickT);
      ctx.strokeStyle = 'rgba(26,26,26,0.18)';
      ctx.beginPath();
      ctx.moveTo(xt, plotY + plotH);
      ctx.lineTo(xt, plotY + plotH + 5);
      ctx.stroke();
      ctx.fillText(String(year), xt, plotY + plotH + 9);
    }

    // ---------- 4. LEFT Y-AXIS LABELS (BAA10Y log) ----------
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px Georgia, serif';
    const baaTicks = [100, 150, 200, 300, 500, 700];
    baaTicks.forEach((v) => {
      const yy = yLeftOf(v);
      if (yy < plotY - 1 || yy > plotY + plotH + 1) return;
      ctx.fillText(`${v}`, plotX - 8, yy);
      ctx.strokeStyle = 'rgba(26,26,26,0.18)';
      ctx.beginPath();
      ctx.moveTo(plotX - 4, yy);
      ctx.lineTo(plotX, yy);
      ctx.stroke();
    });

    ctx.save();
    ctx.translate(16, plotY + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('BAA10Y (bps, log)', 0, 0);
    ctx.restore();

    // ---------- 5. RIGHT Y-AXIS LABELS (Fulcrum Index 0-100) ----------
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 10px Georgia, serif';
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i <= 10; i++) {
      const v = i * 10;
      const yy = yRightOf(v);
      ctx.fillText(String(v), plotX + plotW + 8, yy);
      ctx.strokeStyle = 'rgba(26,26,26,0.18)';
      ctx.beginPath();
      ctx.moveTo(plotX + plotW, yy);
      ctx.lineTo(plotX + plotW + 4, yy);
      ctx.stroke();
    }

    // Right axis label
    ctx.save();
    ctx.translate(w - 16, plotY + plotH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
    ctx.fillText('Fulcrum Index (0-100)', 0, 0);
    ctx.restore();

    // ---------- 6. PLOT BORDER ----------
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // ---------- 7. EVENT MARKERS ----------
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(26,26,26,0.45)';
    ctx.lineWidth = 1;
    ctx.font = 'italic 10px Georgia, serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Track placed labels so adjacent markers (e.g. CPI shock + Hormuz closure)
    // don't overlap: if the new label's x-box collides with a previous one at
    // the same y row, bump this label down to the next row.
    const placedBoxes: Array<{ x1: number; x2: number; row: number }> = [];
    BAA_EVENT_MARKERS.forEach((ev) => {
      const t = new Date(ev.date).getTime();
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
      // Find lowest row (starting 0) with no horizontal overlap.
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
      const ly = plotY + 12 + row * 14;
      ctx.fillStyle = 'rgba(247,245,240,0.92)';
      ctx.fillRect(x1, ly - 10, x2 - x1, 12);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(ev.label, lx, ly);
    });
    ctx.setLineDash([]);

    // ---------- 8. FULCRUM INDEX LINE (right axis) ----------
    ctx.strokeStyle = 'rgba(26,26,26,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    data.forEach((r, i) => {
      const x = xOf(new Date(r.date).getTime());
      const y = yRightOf(r.idx);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // ---------- 9. BAA10Y LINE (left axis) — primary. Phase 2.75: ink (was gold). ----------
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((r, i) => {
      const x = xOf(new Date(r.date).getTime());
      const y = yLeftOf(r.baa);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // ---------- 10. CURRENT-VALUE MARKERS ----------
    const last = data[data.length - 1];
    const xLast = xOf(new Date(last.date).getTime());
    const yLastBaa = yLeftOf(last.baa);
    const yLastIdx = yRightOf(last.idx);

    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(xLast, yLastBaa, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#c8102e';
    ctx.beginPath();
    ctx.arc(xLast, yLastIdx, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Endpoint badges
    const drawBadge = (
      x: number,
      y: number,
      text: string,
      fill: string,
      textColor: string
    ) => {
      ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
      const tw = ctx.measureText(text).width;
      const padX = 5;
      const bw = tw + padX * 2;
      const bh = 14;
      const bx = Math.min(x + 6, plotX + plotW - bw - 2);
      const by = Math.max(plotY + 2, Math.min(y - bh / 2, plotY + plotH - bh - 2));
      ctx.fillStyle = fill;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.75;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bx + padX, by + bh / 2 + 0.5);
    };

    drawBadge(xLast, yLastIdx, `Idx ${last.idx}`, '#c8102e', '#fff');
    drawBadge(xLast, yLastBaa, `${Math.round(last.baa)} bps`, '#4a4a4a', '#1a1a1a');

    // ---------- 11. LEGEND ----------
    const legX = plotX + 10;
    const legY = plotY + 10;
    const legW = 180;
    const legH = 44;
    ctx.fillStyle = 'rgba(247,245,240,0.94)';
    ctx.fillRect(legX, legY, legW, legH);
    ctx.strokeStyle = 'rgba(26,26,26,0.55)';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(legX + 0.5, legY + 0.5, legW - 1, legH - 1);

    ctx.font = 'bold 10px Helvetica Neue, Arial, sans-serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legX + 8, legY + 14);
    ctx.lineTo(legX + 28, legY + 14);
    ctx.stroke();
    ctx.fillText('BAA10Y (left, log)', legX + 34, legY + 14);

    // Index swatch
    ctx.strokeStyle = 'rgba(26,26,26,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(legX + 8, legY + 30);
    ctx.lineTo(legX + 28, legY + 30);
    ctx.stroke();
    ctx.fillText('Fulcrum Index (right)', legX + 34, legY + 30);

    // ---------- 12. ZONE CALLOUTS ----------
    ctx.font = 'italic 9px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const zoneLabel = (idxCenter: number, text: string, color: string) => {
      const x = plotX + plotW - 6;
      const y = yRightOf(idxCenter);
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(247,245,240,0.78)';
      ctx.fillRect(x - tw - 4, y - 6, tw + 6, 12);
      ctx.fillStyle = color;
      ctx.fillText(text, x - 2, y);
    };

    // Labels derived from ALL_REGIMES so a rename in fulcrumIndex.ts
    // propagates here without a code change. Color pair flips on either
    // side of the 50 line for readability against the green/red bands.
    ALL_REGIMES.forEach(r => {
      const center = (r.bandMin + r.bandMax) / 2;
      const labelColor = r.bandMin >= 50 ? '#8a1818' : '#1f6b3a';
      zoneLabel(center, r.regime, labelColor);
    });
  }, [indexData]);

  // =============================================================================
  // HY OAS COMPANION CHART (current-cycle, half-width)
  // =============================================================================

  const drawHyOasChart = useCallback(() => {
    const canvas = hyCanvasRef.current;
    const container = hyContainerRef.current;
    if (!canvas || !container || hyOasHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const cssW = container.clientWidth;
    const cssH = Math.round(cssW * (320 / 520));

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * DPR);
    canvas.height = Math.round(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const w = cssW;
    const h = cssH;
    ctx.clearRect(0, 0, w, h);

    const PAD = { l: 50, r: 14, t: 32, b: 36 };
    const plotX = PAD.l;
    const plotY = PAD.t;
    const plotW = w - PAD.l - PAD.r;
    const plotH = h - PAD.t - PAD.b;

    const data = hyOasHistory;
    const tMin = new Date(data[0].date).getTime();
    const tMax = new Date(data[data.length - 1].date).getTime();

    const xOf = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;
    const yLeftOf = (oas: number) =>
      plotY + plotH - ((Math.log(Math.max(HY_LOG_LO, Math.min(HY_LOG_HI, oas))) - HY_LN_LO) / (HY_LN_HI - HY_LN_LO)) * plotH;

    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 11px Helvetica Neue, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('HY OAS (current cycle)', plotX, 8);
    ctx.font = 'italic 9.5px Georgia, serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText('ICE BofA US High Yield, 3-year FRED window', plotX, 22);

    ctx.strokeStyle = 'rgba(26,26,26,0.06)';
    ctx.lineWidth = 1;
    [300, 400, 500, 600].forEach(v => {
      const yy = yLeftOf(v);
      ctx.beginPath();
      ctx.moveTo(plotX, yy);
      ctx.lineTo(plotX + plotW, yy);
      ctx.stroke();
    });

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 9px Georgia, serif';
    [300, 400, 500, 600].forEach(v => {
      const yy = yLeftOf(v);
      ctx.fillText(`${v}`, plotX - 6, yy);
    });

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    ctx.fillStyle = '#4a4a4a';
    ctx.font = '10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const startYr = new Date(data[0].date).getUTCFullYear();
    const endYr = new Date(data[data.length - 1].date).getUTCFullYear();
    for (let year = startYr; year <= endYr; year++) {
      const tickT = Date.UTC(year, 0, 1);
      if (tickT < tMin || tickT > tMax) continue;
      const xt = xOf(tickT);
      ctx.fillText(String(year), xt, plotY + plotH + 6);
    }

    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((p, i) => {
      const x = xOf(new Date(p.date).getTime());
      const y = yLeftOf(p.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const last = data[data.length - 1];
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(xOf(new Date(last.date).getTime()), yLeftOf(last.value), 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, []);

  // =============================================================================
  // CORRELATION CHART DRAWING
  // =============================================================================

  const drawCorrelationChart = useCallback(() => {
    const canvas = correlationCanvasRef.current;
    const container = correlationContainerRef.current;
    if (!canvas || !container || recentIndexData.length === 0 || etfData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const cssW = container.clientWidth;
    const cssH = Math.round(cssW * (400 / 1040));

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * DPR);
    canvas.height = Math.round(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const w = cssW;
    const h = cssH;

    ctx.clearRect(0, 0, w, h);

    const PAD = { l: 60, r: 60, t: 40, b: 50 };
    const plotX = PAD.l;
    const plotY = PAD.t;
    const plotW = w - PAD.l - PAD.r;
    const plotH = h - PAD.t - PAD.b;

    const data = recentIndexData;
    const tMin = new Date(data[0].date).getTime();
    const tMax = new Date(data[data.length - 1].date).getTime();

    const hygValues = etfData.map(p => p.hyg);
    const usoValues = etfData.map(p => p.uso);
    const gldValues = etfData.map(p => p.gld);
    const vixValues = data.filter(p => p.vix !== undefined).map(p => p.vix as number);

    const hygMin = Math.min(...hygValues) * 0.95;
    const hygMax = Math.max(...hygValues) * 1.05;
    const usoMin = Math.min(...usoValues) * 0.9;
    const usoMax = Math.max(...usoValues) * 1.1;
    const gldMin = Math.min(...gldValues) * 0.95;
    const gldMax = Math.max(...gldValues) * 1.05;
    const vixMin = Math.min(...vixValues) * 0.9;
    const vixMax = Math.max(...vixValues) * 1.1;

    // Coordinate transforms
    const xOf = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;
    const yNorm = (val: number, min: number, max: number) =>
      plotY + plotH - ((val - min) / (max - min)) * plotH;

    // ---------- 1. REGIME COLOR BAR BACKGROUND ----------
    const barHeight = 20;
    const barY = plotY + plotH + 8;

    // Regime swatch color comes from getRiskRegime so the chart bar
    // can't drift from the rest of the page.
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = xOf(new Date(data[i].date).getTime());
      const x2 = xOf(new Date(data[i + 1].date).getTime());
      ctx.fillStyle = getRiskRegime(data[i].idx).swatchColor;
      ctx.fillRect(x1, barY, x2 - x1 + 1, barHeight);
    }

    // Color bar border
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, barY, plotW, barHeight);

    // ---------- 2. GRID ----------
    ctx.strokeStyle = 'rgba(26,26,26,0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = plotY + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
    }

    // ---------- 3. PLOT BORDER ----------
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // ---------- 4. PRICE LINES ----------
    const drawPriceLine = (
      getData: (i: number) => number | undefined,
      min: number,
      max: number,
      color: string,
      lineWidth: number
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < data.length; i++) {
        const val = getData(i);
        if (val === undefined) continue;
        const x = xOf(new Date(data[i].date).getTime());
        const y = yNorm(val, min, max);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    // HYG (blue) - inverted so drops when spreads widen
    drawPriceLine(
      (i) => etfData[i]?.hyg,
      hygMin, hygMax,
      '#2563eb', 2
    );

    // USO (orange)
    drawPriceLine(
      (i) => etfData[i]?.uso,
      usoMin, usoMax,
      '#ea580c', 2
    );

    // GLD (gold)
    drawPriceLine(
      (i) => etfData[i]?.gld,
      gldMin, gldMax,
      '#4a4a4a', 2
    );

    // VIX (purple, dashed)
    ctx.setLineDash([4, 4]);
    drawPriceLine(
      (i) => data[i]?.vix,
      vixMin, vixMax,
      '#7c3aed', 1.5
    );
    ctx.setLineDash([]);

    // ---------- 5. X-AXIS YEAR LABELS ----------
    ctx.fillStyle = '#4a4a4a';
    ctx.font = '11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const startYear = new Date(data[0].date).getUTCFullYear();
    const endYear = new Date(data[data.length - 1].date).getUTCFullYear();
    for (let year = startYear; year <= endYear; year++) {
      const tickT = Date.UTC(year, 0, 1);
      if (tickT < tMin || tickT > tMax) continue;
      const xt = xOf(tickT);
      ctx.strokeStyle = 'rgba(26,26,26,0.18)';
      ctx.beginPath();
      ctx.moveTo(xt, barY + barHeight);
      ctx.lineTo(xt, barY + barHeight + 5);
      ctx.stroke();
      ctx.fillText(String(year), xt, barY + barHeight + 8);
    }

    // ---------- 6. LEGEND ----------
    const legX = plotX + 8;
    const legY = plotY + 8;
    const legW = 200;
    const legH = 70;
    ctx.fillStyle = 'rgba(247,245,240,0.94)';
    ctx.fillRect(legX, legY, legW, legH);
    ctx.strokeStyle = 'rgba(26,26,26,0.55)';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(legX + 0.5, legY + 0.5, legW - 1, legH - 1);

    ctx.font = 'bold 9px Helvetica Neue, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const legendItems = [
      { label: 'HYG (HY bonds)', color: '#2563eb', dashed: false },
      { label: 'USO (crude oil)', color: '#ea580c', dashed: false },
      { label: 'GLD (gold)', color: '#4a4a4a', dashed: false },
      { label: 'VIX (volatility)', color: '#7c3aed', dashed: true },
    ];

    legendItems.forEach((item, i) => {
      const y = legY + 14 + i * 14;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      if (item.dashed) ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(legX + 8, y);
      ctx.lineTo(legX + 28, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(item.label, legX + 34, y);
    });

    // ---------- 7. TITLE ----------
    ctx.font = 'bold 12px Helvetica Neue, Arial, sans-serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('REGIME POSITIONING MAP', plotX, plotY - 28);

    ctx.font = 'italic 10px Georgia, serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText('Asset performance by Fulcrum Index regime (normalized)', plotX, plotY - 14);

    // Regime color bar label
    ctx.font = '9px Helvetica Neue, Arial, sans-serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('Regime →', plotX - 8, barY + barHeight / 2);

  }, [indexData, etfData]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (indexData.length > 0) {
      drawBaaChart();
      drawHyOasChart();
      drawCorrelationChart();
    }

    const handleResize = () => {
      if (indexData.length > 0) {
        drawBaaChart();
        drawHyOasChart();
        drawCorrelationChart();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawBaaChart, drawHyOasChart, drawCorrelationChart, indexData]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  // Derive the band table from ALL_REGIMES so band thresholds and active-
  // row detection both come from the single source-of-truth helper.
  const riskBands: RiskBand[] = ALL_REGIMES.map(r => ({
    range: `${r.bandMin} - ${r.bandMax}`,
    regime: r.regime,
    description: r.description,
    posture: r.posture,
    color: r.swatchColor,
    isActive: currentIndex >= r.bandMin && currentIndex < r.bandMax + (r.bandMax === 100 ? 1 : 0),
  }));

  const formattedDate = latestData
    ? new Date(latestData.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  // Single live-values object. Every JSX expression that displays one of
  // these live numbers must read it from `live` rather than recomputing.
  // Keeping this here makes the gut-check test simple: forcing `composite`
  // to a different value would propagate everywhere automatically.
  const live = {
    composite: currentIndex,
    regime,
    baa: { bps: currentBaa, pctl: baaTrueHistoricalPercentile(currentBaa) },
    hyOas: currentHyOas !== undefined ? { bps: currentHyOas } : null,
    bbb: currentBbbOas !== undefined ? { bps: currentBbbOas } : null,
    ccc: latestCccBbRatio !== null ? { bps: latestCccBbRatio.ccc } : null,
    bb: latestCccBbRatio !== null ? { bps: latestCccBbRatio.bb } : null,
    cccBbRatio: latestCccBbRatio?.ratio ?? null,
    cccBbMedian: medianCccBbRatio,
    hyBbbRatio: currentHyOas !== undefined && currentBbbOas !== undefined && currentBbbOas > 0
      ? currentHyOas / currentBbbOas
      : null,
    vix: currentVIX,
    brent: currentBrent,
    asOfDate: formattedDate,
    asOfDateRaw: latestData?.date,
    dataPoints: stats.dataPoints,
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <>
      <Helmet>
        <title>The Fulcrum Index | Distressed Credit Cycle Risk</title>
        <meta
          name="description"
          content="A composite signal for the next restructuring cycle, calibrated against four decades of investment-grade credit spread history (Moody’s Baa-Treasury, 1986+)."
        />
      </Helmet>

      {/* Economist-style light theme page */}
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
        <Navbar />
        <div className="pt-[64px]">
          <ArchiveBanner />
        </div>

        <div className="max-w-[1080px] mx-auto px-7 pb-12 pt-6 w-full">
          {/* Header */}
          <div
            className="flex items-stretch gap-3.5 pb-3.5 mb-4"
            style={{ borderBottom: '1px solid var(--ink)' }}
          >
            <div className="w-2 flex-shrink-0" style={{ background: 'var(--red)' }} />
            <div className="flex flex-col justify-center gap-1">
              <div
                className="text-[10px] tracking-[0.18em] uppercase text-[#4a4a4a] font-semibold"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                The Fulcrum Memo <span className="text-[#c8102e] mx-2">●</span> Distressed Credit
                Research <span className="text-[#c8102e] mx-2">●</span> Risk Frameworks
              </div>
              <h1
                className="text-[28px] leading-tight font-bold tracking-tight m-0"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
The Fulcrum Index
              </h1>
              <p
                className="text-[15px] text-[#4a4a4a] italic m-0"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                A composite signal for the next restructuring cycle, calibrated against four decades of investment-grade credit spread history (Moody’s Baa-Treasury, 1986+)
              </p>
            </div>
          </div>

          {/* Main content */}
          {latestData && (
            <>
              {/* Live readout strip */}
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-4"
                style={{
                  borderTop: '1px solid var(--rule)',
                  borderBottom: '1px solid var(--rule)',
                }}
              >
                <div
                  className="py-3 px-3.5 flex flex-col gap-1"
                  style={{ borderRight: '1px solid var(--rule)' }}
                >
                  <div
                    className="text-[9.5px] tracking-[0.16em] uppercase text-[#4a4a4a] font-semibold"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Fulcrum Index
                  </div>
                  <div
                    className="text-[22px] font-bold text-[#1a1a1a] tracking-tight"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {live.composite}
                  </div>
                  <div
                    className={`text-[11px] ${trend.idxChange >= 0 ? 'text-[#8a1818]' : 'text-[#1f6b3a]'}`}
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {trend.idxChange >= 0 ? '+' : ''}
                    {trend.idxChange} pts (30d)
                  </div>
                </div>

                <div
                  className="py-3 px-3.5 flex flex-col gap-1"
                  style={{ borderRight: '1px solid var(--rule)' }}
                >
                  <div
                    className="text-[9.5px] tracking-[0.16em] uppercase text-[#4a4a4a] font-semibold"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Credit Spreads
                  </div>
                  <div
                    className="text-[22px] font-bold text-[#1a1a1a] tracking-tight"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Baa {Math.round(live.baa.bps)} bps
                  </div>
                  <div
                    className="text-[11px] text-[#4a4a4a]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {live.hyOas
                      ? `HY OAS ${Math.round(live.hyOas.bps)} bps · pctl ${Math.round(live.baa.pctl * 100)}`
                      : `pctl ${Math.round(live.baa.pctl * 100)}`}
                  </div>
                </div>

                <div
                  className="py-3 px-3.5 flex flex-col gap-1"
                  style={{ borderRight: '1px solid var(--rule)' }}
                >
                  <div
                    className="text-[9.5px] tracking-[0.16em] uppercase text-[#4a4a4a] font-semibold"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Regime
                  </div>
                  <div
                    className={`inline-block px-2 py-0.5 text-white text-[10px] font-bold tracking-[0.08em] uppercase w-fit ${live.regime.pillBg}`}
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {live.regime.regime}
                  </div>
                  <div
                    className="text-[11px] text-[#4a4a4a]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {live.regime.posture}
                  </div>
                </div>

                <div className="py-3 px-3.5 flex flex-col gap-1">
                  <div
                    className="text-[9.5px] tracking-[0.16em] uppercase text-[#4a4a4a] font-semibold"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    As of
                  </div>
                  <div
                    className="text-[16px] font-bold text-[#1a1a1a] tracking-tight"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {live.asOfDate}
                  </div>
                  <div
                    className="text-[11px] text-[#4a4a4a]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {live.dataPoints} data points
                  </div>
                </div>
              </div>

              {/* Regime-conditional flag — fires only when the CCC-BB
                  ratio crosses the canary threshold. Reads live; auto-hides
                  below the threshold. Sits between the readout strip and
                  the MD callout so it disrupts the visual flow when active. */}
              {live.cccBbRatio !== null && live.cccBbRatio >= CCC_BB_CANARY_THRESHOLD && live.ccc && live.bb && (
                <div
                  className="py-2.5 px-3.5 my-4 flex items-start gap-3"
                  style={{
                    background: 'var(--red-deep)',
                    color: 'var(--paper)',
                    boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    className="text-[9.5px] tracking-[0.18em] uppercase font-bold pt-0.5 flex-shrink-0"
                    style={{ fontFamily: 'var(--font-sans)', color: 'var(--paper)', opacity: 0.85 }}
                  >
                    Canary
                  </div>
                  <p
                    className="text-[13.5px] leading-relaxed m-0"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Composite reads {live.regime.regime}, but the CCC-BB ratio at{' '}
                    <strong>{live.cccBbRatio!.toFixed(2)}×</strong> sits at the upper end of an
                    elevated regime that has persisted since mid-2023 (median {live.cccBbMedian.toFixed(2)}×,
                    well above the textbook {CCC_BB_CANARY_THRESHOLD.toFixed(1)}× canary threshold).
                    The bottom of the capital structure has been fracturing for three years; the
                    headline index has not priced it. CCC OAS at {Math.round(live.ccc!.bps)} bps
                    vs BB at {Math.round(live.bb!.bps)} bps.
                  </p>
                </div>
              )}

              {/* MD callout — main read on top, methodology footnote at the
                  bottom in smaller, muted styling. generateMDCallout returns
                  a single string with the methodology block separated by
                  \n\n so we split here for visual hierarchy. */}
              <div
                className="py-2.5 px-3.5 my-4"
                style={{
                  borderLeft: '3px solid #c8102e',
                  background: 'rgba(200, 16, 46, 0.04)',
                }}
              >
                <div
                  className="text-[9.5px] tracking-[0.18em] uppercase text-[#c8102e] font-bold mb-1"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  MD Read
                </div>
                {(() => {
                  const parts = mdCallout.split('\n\n');
                  const main = parts[0];
                  const method = parts.slice(1).join('\n\n');
                  return (
                    <>
                      <p
                        className="text-[14px] leading-relaxed text-[#1a1a1a] m-0"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {main}
                      </p>
                      {method && (
                        <p
                          className="text-[11.5px] leading-relaxed text-[#4a4a4a] italic mt-2 mb-0 pt-2"
                          style={{
                            fontFamily: 'var(--font-serif)',
                            borderTop: '1px solid rgba(200, 16, 46, 0.12)',
                          }}
                        >
                          {method}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Sub-section header — historical-distribution scatter */}
              <div className="mt-2 mb-3">
                <div
                  className="text-[10px] tracking-[0.18em] uppercase text-[#4a4a4a] font-semibold"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
The Fulcrum Signal — Historical Distribution
                </div>
                <div
                  className="text-[12.5px] text-[#4a4a4a] italic mt-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Forty years of BAA-Treasury spreads, dot size by VIX, color by percentile
                </div>
              </div>

              <BaaHistoricalScatter />

              {/* Sub-section header — composite line chart */}
              <div className="mt-6 mb-3">
                <div
                  className="text-[10px] tracking-[0.18em] uppercase text-[#4a4a4a] font-semibold"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
The Fulcrum Index — Composite Path
                </div>
                <div
                  className="text-[12.5px] text-[#4a4a4a] italic mt-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  BAA10Y (left, log) overlaid with the 0–100 composite (right) and regime bands
                </div>
              </div>

              {/* Main BAA10Y 40-year chart */}
              <div
                ref={baaContainerRef}
                className="p-4 mb-4"
                style={{
                  background: 'var(--paper-raised)',
                  border: '1px solid var(--rule)',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                }}
              >
                <canvas ref={baaCanvasRef} />
              </div>

              {/* Current-cycle row: HY OAS half-width companion paired
                  with the Capital Structure Tier panel. They read as a
                  unit — index level vs intra-index dispersion. */}
              <div
                ref={hyContainerRef}
                className="p-3 mb-4"
                style={{
                  background: 'var(--paper-raised)',
                  border: '1px solid var(--rule)',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                }}
              >
                <canvas ref={hyCanvasRef} />
              </div>

              {/* Capital Structure Tier panel — BBB / BB / HY / CCC overlay */}
              <CapitalStructureTierPanel />

              {/* CCC-BB Dispersion (the canary) */}
              <CccBbDispersionChart />

              {/* HY-IG Dispersion — HY OAS vs BBB OAS, like-for-like */}
              <HyIgDispersionChart />

              {/* ================================================================= */}
              {/* PANEL 1: Historical Price Overlay Chart */}
              {/* ================================================================= */}
              <div
                ref={correlationContainerRef}
                className="p-4 mb-4"
                style={{
                  background: 'var(--paper-raised)',
                  border: '1px solid var(--rule)',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                }}
              >
                <canvas ref={correlationCanvasRef} />
              </div>

              {/* ================================================================= */}
              {/* PANEL 2: Backtest-Validated Position Framework */}
              {/* Phase 4E-2 — restructured from regime-conditional to backtest-
                  conditional. Positions are categorized by what the 20-year
                  sector-rotation backtest actually showed; failed theses are
                  surfaced rather than hidden. */}
              {/* ================================================================= */}
              <div
                className="mb-4 overflow-hidden"
                style={{
                  border: '1px solid var(--rule)',
                  background: 'var(--paper-raised)',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                }}
              >
                {/* Card header */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    background: 'var(--ink)',
                    borderBottom: '1px solid var(--rule)',
                  }}
                >
                  <div>
                    <div
                      className="text-[10px] tracking-[0.16em] uppercase text-white/80 font-semibold"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Position Framework
                    </div>
                    <div
                      className="text-[18px] font-bold text-white tracking-tight"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Validated against {BACKTEST_METRICS.window} backtest
                    </div>
                  </div>
                  <div className="text-white/90 text-right">
                    <div
                      className="text-[11px] italic"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Current regime: {live.regime.regime} ({live.composite})
                    </div>
                  </div>
                </div>

                {/* Backtest summary metrics card */}
                <div
                  className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-4"
                  style={{ borderBottom: '1px solid var(--rule)', background: 'rgba(0,0,0,0.02)' }}
                >
                  <div>
                    <div
                      className="text-[9.5px] tracking-[0.16em] uppercase text-[#4a4a4a] font-semibold mb-1"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Fulcrum Rotation Portfolio
                    </div>
                    <div
                      className="text-[12.5px] text-[#1a1a1a] leading-relaxed"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Sharpe <strong>{BACKTEST_METRICS.portfolio.sharpe.toFixed(2)}</strong>{' '}
                      · Max DD <strong className="text-[#1f6b3a]">{BACKTEST_METRICS.portfolio.maxDD}%</strong>{' '}
                      · CAGR <strong>{BACKTEST_METRICS.portfolio.cagr.toFixed(1)}%</strong>
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-[9.5px] tracking-[0.16em] uppercase text-[#4a4a4a] font-semibold mb-1"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      SPY Buy-and-Hold
                    </div>
                    <div
                      className="text-[12.5px] text-[#1a1a1a] leading-relaxed"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Sharpe <strong>{BACKTEST_METRICS.spy.sharpe.toFixed(2)}</strong>{' '}
                      · Max DD <strong className="text-[#c8102e]">{BACKTEST_METRICS.spy.maxDD}%</strong>{' '}
                      · CAGR <strong>{BACKTEST_METRICS.spy.cagr.toFixed(1)}%</strong>
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-[9.5px] tracking-[0.16em] uppercase text-[#4a4a4a] font-semibold mb-1"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Edge
                    </div>
                    <div
                      className="text-[12.5px] text-[#1a1a1a] italic leading-relaxed"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Regime-aware allocation reduces drawdowns by{' '}
                      <strong>{BACKTEST_METRICS.ddEdgePts} pts</strong>;
                      trades <strong>{BACKTEST_METRICS.cagrCostPts.toFixed(1)} pts</strong> of CAGR for risk reduction.
                    </div>
                  </div>
                </div>

                {/* GFC case study one-liner */}
                <div
                  className="px-4 py-2 text-[12px] text-[#1a1a1a]"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    borderBottom: '1px solid var(--rule)',
                    background: 'rgba(200, 16, 46, 0.03)',
                  }}
                >
                  <span className="text-[9.5px] tracking-[0.16em] uppercase text-[#c8102e] font-bold mr-2">GFC case study</span>
                  Fulcrum {BACKTEST_METRICS.gfc.fulcrum > 0 ? '+' : ''}{BACKTEST_METRICS.gfc.fulcrum.toFixed(1)}%{' '}
                  vs SPY {BACKTEST_METRICS.gfc.spy.toFixed(1)}% ({BACKTEST_METRICS.gfc.window})
                </div>

                {/* Three-category position list */}
                <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                  <PositionCategory
                    label="Validated"
                    badge="✓"
                    color="#1f6b3a"
                    positions={VALIDATED_POSITIONS}
                  />
                  <PositionCategory
                    label="Conditional"
                    badge="⚠"
                    color="#B7791F"
                    positions={CONDITIONAL_POSITIONS}
                  />
                  <PositionCategory
                    label="Not retained"
                    badge="✗"
                    color="#8a1818"
                    positions={RETIRED_POSITIONS}
                    showReason
                  />
                </div>

                {/* Methodology footnote */}
                <div
                  className="px-4 py-2 text-[11px] text-[#4a4a4a] italic leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    borderTop: '1px solid var(--rule)',
                    background: 'rgba(0,0,0,0.02)',
                  }}
                >
                  Position theses validated against a 20-year sector-rotation backtest. Methodology
                  workbook available on request. Some positions revised or removed based on backtest
                  findings; framework updated to reflect what the data actually showed.
                </div>
              </div>

              {/* ================================================================= */}
              {/* PANEL 3: Historical Regime Performance Table */}
              {/* ================================================================= */}
              <div
                className="mb-4 overflow-hidden"
                style={{
                  border: '1px solid var(--rule)',
                  background: 'var(--paper-raised)',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{ borderBottom: '1px solid var(--rule)' }}
                >
                  <div
                    className="text-[10px] tracking-[0.16em] uppercase text-[#4a4a4a] font-bold mb-1"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Historical Regime Performance
                  </div>
                  <div
                    className="text-[13px] text-[#1a1a1a] italic"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Average daily returns by asset class during each Fulcrum Index regime ({Math.round(recentIndexData.length / 252)}-year backtest, ETF window 2007+)
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--ink)' }}>
                        <th
                          className="px-4 py-2 text-left text-[10px] tracking-[0.14em] uppercase text-[#4a4a4a] font-bold"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          Regime
                        </th>
                        <th
                          className="px-4 py-2 text-center text-[10px] tracking-[0.14em] uppercase font-bold"
                          style={{ fontFamily: 'var(--font-sans)', color: '#2563eb' }}
                        >
                          HYG <span className="text-[#4a4a4a] font-normal normal-case tracking-normal">(daily / ann.)</span>
                        </th>
                        <th
                          className="px-4 py-2 text-center text-[10px] tracking-[0.14em] uppercase font-bold"
                          style={{ fontFamily: 'var(--font-sans)', color: '#ea580c' }}
                        >
                          USO <span className="text-[#4a4a4a] font-normal normal-case tracking-normal">(daily / ann.)</span>
                        </th>
                        <th
                          className="px-4 py-2 text-center text-[10px] tracking-[0.14em] uppercase font-bold"
                          style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-muted)' }}
                        >
                          GLD <span className="text-[#4a4a4a] font-normal normal-case tracking-normal">(daily / ann.)</span>
                        </th>
                        <th
                          className="px-4 py-2 text-center text-[10px] tracking-[0.14em] uppercase font-bold"
                          style={{ fontFamily: 'var(--font-sans)', color: '#7c3aed' }}
                        >
                          VIX Δ
                        </th>
                        <th
                          className="px-4 py-2 text-right text-[10px] tracking-[0.14em] uppercase text-[#4a4a4a] font-bold"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          Sample
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {regimePerformance.map((perf, i) => {
                        const isCurrentRegime = perf.regimeMin === live.regime.bandMin;
                        return (
                          <tr
                            key={perf.regime}
                            style={{
                              borderBottom: i === 3 ? 'none' : '1px solid #e5e2db',
                              background: isCurrentRegime
                                ? 'rgba(200, 16, 46, 0.06)'
                                : i % 2 === 0
                                ? 'transparent'
                                : 'rgba(0,0,0,0.015)',
                            }}
                          >
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                {isCurrentRegime && (
                                  <span className="text-[#c8102e] text-[9px]">▶</span>
                                )}
                                <span
                                  className="inline-block w-3 h-3 rounded-sm"
                                  style={{ background: getRiskRegime(perf.regimeMin).swatchColor }}
                                />
                                <span
                                  className="text-[11px] font-bold tracking-[0.04em] uppercase"
                                  style={{ fontFamily: 'var(--font-sans)' }}
                                >
                                  {perf.regimeMin}-{perf.regimeMax}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`px-4 py-2.5 text-center ${
                                perf.hygReturn > 0 ? 'text-[#1f6b3a]' : perf.hygReturn < 0 ? 'text-[#c8102e]' : 'text-[#4a4a4a]'
                              }`}
                              style={{ fontFamily: 'var(--font-serif)' }}
                            >
                              <div className="text-[13px] font-medium">
                                {perf.hygReturn > 0 ? '+' : ''}{perf.hygReturn.toFixed(2)}%
                              </div>
                              {perf.sampleDays > 0 && (
                                <div className="text-[11px] opacity-70">
                                  {annualizePct(perf.hygReturn) > 0 ? '+' : ''}{annualizePct(perf.hygReturn).toFixed(1)}% ann.
                                </div>
                              )}
                            </td>
                            <td
                              className={`px-4 py-2.5 text-center ${
                                perf.usoReturn > 0 ? 'text-[#1f6b3a]' : perf.usoReturn < 0 ? 'text-[#c8102e]' : 'text-[#4a4a4a]'
                              }`}
                              style={{ fontFamily: 'var(--font-serif)' }}
                            >
                              <div className="text-[13px] font-medium">
                                {perf.usoReturn > 0 ? '+' : ''}{perf.usoReturn.toFixed(2)}%
                              </div>
                              {perf.sampleDays > 0 && (
                                <div className="text-[11px] opacity-70">
                                  {annualizePct(perf.usoReturn) > 0 ? '+' : ''}{annualizePct(perf.usoReturn).toFixed(1)}% ann.
                                </div>
                              )}
                            </td>
                            <td
                              className={`px-4 py-2.5 text-center ${
                                perf.gldReturn > 0 ? 'text-[#1f6b3a]' : perf.gldReturn < 0 ? 'text-[#c8102e]' : 'text-[#4a4a4a]'
                              }`}
                              style={{ fontFamily: 'var(--font-serif)' }}
                            >
                              <div className="text-[13px] font-medium">
                                {perf.gldReturn > 0 ? '+' : ''}{perf.gldReturn.toFixed(2)}%
                              </div>
                              {perf.sampleDays > 0 && (
                                <div className="text-[11px] opacity-70">
                                  {annualizePct(perf.gldReturn) > 0 ? '+' : ''}{annualizePct(perf.gldReturn).toFixed(1)}% ann.
                                </div>
                              )}
                            </td>
                            <td
                              className={`px-4 py-2.5 text-center text-[12px] font-medium ${
                                perf.vixChange > 0 ? 'text-[#c8102e]' : perf.vixChange < 0 ? 'text-[#1f6b3a]' : 'text-[#4a4a4a]'
                              }`}
                              style={{ fontFamily: 'var(--font-serif)' }}
                            >
                              {perf.vixChange > 0 ? '+' : ''}
                              {perf.vixChange.toFixed(1)}
                            </td>
                            <td
                              className="px-4 py-2.5 text-right text-[11px] text-[#4a4a4a]"
                              style={{ fontFamily: 'var(--font-sans)' }}
                            >
                              {perf.sampleDays}d
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div
                  className="px-4 py-2 text-[11px] text-[#4a4a4a] italic leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    borderTop: '1px solid var(--rule)',
                    background: 'rgba(0,0,0,0.02)',
                  }}
                >
                  Annualized figures convert daily averages to a 252-trading-day intensity for cross-regime
                  comparability. They are NOT forecasts — Active and Imminent regimes typically last 1–3 months
                  historically, not a full year. Read annualized columns as “intensity scaled to comparable units,”
                  not as projected annual returns. VIX Δ shows average daily point change.
                </div>
              </div>

              {/* Risk band reference table */}
              <div
                className="mb-4 overflow-x-auto"
                style={{
                  border: '1px solid var(--rule)',
                  background: 'var(--paper-raised)',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  className="grid grid-cols-[60px_1fr_1.4fr_1fr] md:grid-cols-[80px_1fr_1.4fr_1fr] gap-0 py-2.5 px-3.5 text-[10px] tracking-[0.16em] uppercase text-[#4a4a4a] font-bold min-w-[600px]"
                  style={{
                    borderBottom: '1px solid var(--ink)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div>Band</div>
                  <div>Range · Regime</div>
                  <div>Interpretation</div>
                  <div>Restructuring Posture</div>
                </div>
                {riskBands.map((band) => (
                  <div
                    key={band.range}
                    className={`grid grid-cols-[60px_1fr_1.4fr_1fr] md:grid-cols-[80px_1fr_1.4fr_1fr] gap-0 py-2.5 px-3.5 text-[13px] items-center min-w-[600px] ${
                      band.isActive ? 'bg-[rgba(200,16,46,0.06)]' : ''
                    }`}
                    style={{ borderBottom: '1px solid var(--rule)' }}
                  >
                    <div>
                      {band.isActive && (
                        <span className="text-[#c8102e] mr-1 text-[9px]">▶</span>
                      )}
                      <span
                        className="inline-block w-10 md:w-14 h-3.5 align-middle"
                        style={{ background: band.color }}
                      />
                    </div>
                    <div
                      className="text-[10px] md:text-[11px] font-bold tracking-[0.06em] uppercase"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {band.range} {band.regime}
                    </div>
                    <div
                      className="text-[11px] md:text-[12.5px] text-[#4a4a4a] italic"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {band.description}
                    </div>
                    <div
                      className="text-[10px] md:text-[11.5px] text-[#1a1a1a]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {band.posture}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="flex flex-col md:flex-row justify-between items-baseline gap-4 pt-2.5"
                style={{ borderTop: '1px solid var(--ink)' }}
              >
                <div
                  className="text-[10px] text-[#4a4a4a] tracking-[0.04em] max-w-full md:max-w-[75%]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  <strong>Sources:</strong> {FULCRUM_INDEX_ATTRIBUTION}
                </div>
                <div
                  className="text-[12px] text-[#1a1a1a] italic"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  The Fulcrum Memo
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

// Renders one of the three Panel 2 categories (Validated / Conditional /
// Not retained). Header gets the category color; positions list under it.
// `showReason` adds the explanatory line that makes a retired thesis read
// as honest disclosure rather than a deletion.
interface PositionCategoryProps {
  label: string;
  badge: string;
  color: string;
  positions: ReadonlyArray<BacktestPosition & { reason?: string }>;
  showReason?: boolean;
}

const PositionCategory = ({
  label,
  badge,
  color,
  positions,
  showReason,
}: PositionCategoryProps) => (
  <div className="flex flex-col gap-2">
    <div
      className="text-[10px] tracking-[0.16em] uppercase font-bold flex items-center gap-1.5"
      style={{ fontFamily: 'var(--font-sans)', color }}
    >
      <span aria-hidden="true">{badge}</span>
      {label}
    </div>
    <div className="flex flex-col gap-1.5">
      {positions.map(pos => (
        <div key={pos.asset} className="flex flex-col gap-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className="text-[12.5px] font-semibold text-[#1a1a1a]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {pos.asset}
            </span>
            <span
              className="text-[11px] text-[#4a4a4a] italic"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {pos.instrument}
            </span>
          </div>
          <div
            className="text-[11.5px] text-[#4a4a4a] leading-snug"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {pos.edge}
          </div>
          {showReason && pos.reason && (
            <div
              className="text-[10.5px] italic mt-0.5"
              style={{ fontFamily: 'var(--font-serif)', color }}
            >
              {pos.reason}
            </div>
          )}
          {!showReason && pos.thesisLink && (
            <Link
              to={pos.thesisLink}
              className="text-[10.5px] text-[#2563eb] hover:underline w-fit"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {pos.thesis} →
            </Link>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default FulcrumIndexPage;
