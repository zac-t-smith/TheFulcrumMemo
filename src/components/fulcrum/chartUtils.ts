/**
 * chartUtils.ts — Fulcrum v5 mobile-first chart primitives
 *
 * Every canvas chart on the page follows the same sizing pattern (CSS
 * width × DPR for the backing store, ResizeObserver on the container so
 * mobile rotations and drawer collapses re-fit the canvas) and the same
 * palette conventions. Factoring both out of each individual chart
 * ensures the readout is consistent — and lets a single tweak reach
 * every surface.
 *
 * Conventions (per v5 UI audit):
 *   - calm = cool / neutral; stress = warm / red. One diverging scale
 *     across charts, tables, and badges.
 *   - in-chart text ≥ 11px for mobile legibility.
 *   - every canvas respects a minimum height of 240px.
 *   - legends live below the plot; the plot gets the full container
 *     width (the hook reserves bottom padding when a legend is
 *     requested).
 */

import { useEffect, useRef, useState } from 'react';

// =============================================================================
// Breakpoints + tick density
// =============================================================================

export const BREAKPOINT_NARROW = 640; // Tailwind sm.

/** Maximum axis-tick count that stays readable at the given canvas width. */
export function maxTicksForWidth(w: number, cap: number = 12): number {
  if (w < 400) return Math.min(cap, 4);
  if (w < BREAKPOINT_NARROW) return Math.min(cap, 6);
  if (w < 900) return Math.min(cap, 8);
  return cap;
}

// =============================================================================
// Shared font stack + minimum sizes
// =============================================================================

/** Minimum in-chart text size (px). Covers axis ticks, inline labels,
 *  legend captions. Titles and callouts may be larger. */
export const MIN_CHART_FONT_PX = 11;

export const FONT_SANS = 'Helvetica Neue, Arial, sans-serif';
export const FONT_SERIF = 'Georgia, serif';

// =============================================================================
// Diverging stress palette
// =============================================================================

/** Map a 0-100 stress percentile to a background color. `rgba(…)` strings
 *  so callers can request translucent fills via opacity. 0 = calm/cool,
 *  100 = stress/red. Same scale used by SectorHeatMap and the regime
 *  gauge. */
export function stressColor(pctl: number, alpha: number = 0.55): string {
  const p = Math.max(0, Math.min(100, pctl));
  if (p < 20) return `rgba(31, 107, 58, ${alpha * 0.45})`;
  if (p < 40) return `rgba(140, 170, 100, ${alpha * 0.40})`;
  if (p < 60) return `rgba(217, 212, 199, ${alpha})`;
  if (p < 75) return `rgba(179, 90, 0, ${alpha * 0.50})`;
  if (p < 90) return `rgba(200, 16, 46, ${alpha * 0.55})`;
  return `rgba(138, 24, 24, ${alpha * 0.75})`;
}

/** Solid-ink color for the same stress scale, for text or line fills. */
export function stressInk(pctl: number): string {
  const p = Math.max(0, Math.min(100, pctl));
  if (p < 20) return '#1f6b3a';
  if (p < 40) return '#4a7a2a';
  if (p < 60) return '#6a6a6a';
  if (p < 75) return '#b35a00';
  if (p < 90) return '#c8102e';
  return '#8a1818';
}

/**
 * Diverging color for a BAA10Y percentile. This is the one the scatter
 * uses: tight spreads (low pctl) are the complacency end of the cycle
 * and get a MUTED-RED warning; wide spreads (high pctl) are realized
 * credit stress and get the FULL-RED signal. The in-between is calm/
 * neutral. v4 UI audit called the previous legend "reversed" because
 * tight spreads were labeled green — they are NOT a calm state in a
 * RX context.
 */
export function baaPctlColor(pctl01: number): string {
  // pctl01 in [0, 1]. Convert to 0-100 for stressColor, but map so both
  // tails are "stressed" (tight AND wide spreads are warnings).
  const p = Math.max(0, Math.min(1, pctl01));
  // U-shaped: distance from 0.5 drives stress.
  const centered = Math.abs(p - 0.5) * 2; // 0 at 50th pctl, 1 at 0/100
  return stressColor(centered * 100);
}

// =============================================================================
// Canvas sizing hook
// =============================================================================

export interface CanvasDims {
  cssW: number;      // CSS pixel width of the canvas
  cssH: number;      // CSS pixel height of the canvas
  dpr: number;       // devicePixelRatio
  isNarrow: boolean; // cssW < BREAKPOINT_NARROW
}

export interface UseCanvasSizeOptions {
  /** Target aspect ratio (height / width). Defaults to 0.35 (about 3:1). */
  aspectRatio?: number;
  /** Minimum CSS height in pixels. Defaults to 240 per the v5 UI audit. */
  minHeightPx?: number;
  /** Maximum CSS height in pixels. Defaults to 520. */
  maxHeightPx?: number;
  /** Extra height to reserve for a below-plot legend. */
  legendHeightPx?: number;
}

/**
 * Observe a container's width and return CSS dims + DPR for a canvas
 * inside it. Callers set `canvas.width/height = cssW*dpr, cssH*dpr`,
 * `canvas.style.width/height = cssW+'px', cssH+'px'`, then
 * `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`.
 *
 * Replaces the per-chart `window.addEventListener('resize', …)` pattern
 * so the canvas resizes on orientation changes, drawer open/close, and
 * any parent layout shift — not only on window resize.
 */
export function useCanvasSize(
  containerRef: React.RefObject<HTMLElement>,
  {
    aspectRatio = 0.35,
    minHeightPx = 240,
    maxHeightPx = 520,
    legendHeightPx = 0,
  }: UseCanvasSizeOptions = {},
): CanvasDims {
  const [dims, setDims] = useState<CanvasDims>({
    cssW: 0, cssH: minHeightPx, dpr: 1, isNarrow: true,
  });
  const lastWidth = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const w = Math.max(240, el.clientWidth);
      if (w === lastWidth.current) return;
      lastWidth.current = w;
      const target = Math.round(w * aspectRatio) + legendHeightPx;
      const cssH = Math.max(minHeightPx, Math.min(maxHeightPx, target));
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      setDims({ cssW: w, cssH, dpr, isNarrow: w < BREAKPOINT_NARROW });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    // Still listen for pixel-ratio changes (DPR can change on display switch).
    const onWinResize = () => compute();
    window.addEventListener('resize', onWinResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  }, [containerRef, aspectRatio, minHeightPx, maxHeightPx, legendHeightPx]);

  return dims;
}

// =============================================================================
// Date formatter — single global format
// =============================================================================

/** Format a YYYY-MM-DD or ISO string as "Mon D, YYYY" (US). */
export function formatAsOf(iso: string | null | undefined): string {
  if (!iso) return '—';
  const s = iso.length >= 10 ? iso.substring(0, 10) : iso;
  const d = new Date(s + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}
