/**
 * Single source of truth for market figures referenced across pages.
 *
 * Any Brent spot, baseline price, day count, or snapshot date that appears
 * in prose, kickers, or stat blocks on more than one page should live here.
 * Charts continue to read from the full historical series files
 * (src/data/*.ts) — those are authoritative time-series data, not display
 * figures.
 *
 * If you update a number, bump the `asOf` field and re-check pages that
 * import it.
 */

export const SERIES_SNAPSHOT = {
  // The Iran series data is archived — this is the authoritative "as of" date
  // every page uses when labeling itself "data as of ...".
  asOf: 'Apr 26, 2026' as const,
};

export const BRENT = {
  /** Pre-war Brent close used across Iran-series charts and callouts. */
  preWar: 71.32,
  preWarAsOf: 'Feb 27, 2026',
  /** WTI pre-war close pair. */
  wtiPreWar: 66.96,
  /** Final archived Brent spot for the Iran series (EIA, Apr 26, 2026). */
  lastArchived: 124.60,
  wtiLastArchived: 113.90,
  lastArchivedAsOf: 'Apr 26, 2026',
} as const;

/**
 * Percentage change from pre-war Brent to the archive snapshot.
 * `((124.60 - 71.32) / 71.32) * 100` rounded.
 */
export const BRENT_CHANGE_PCT = Math.round(
  ((BRENT.lastArchived - BRENT.preWar) / BRENT.preWar) * 100
);

// HY_SPREAD is derived from the verified FRED series file (hyOasHistory.ts)
// so this constant can never drift from the authoritative data. The previous
// hand-authored value (525 bps) was a fabrication copied out of Part II's
// "30-year average" citation — the real last-archived reading per FRED
// BAMLH0A0HYM2 is in the ~280s bps range.
import { hyOasHistory } from '@/data/hyOasHistory';

const _lastHy = hyOasHistory[hyOasHistory.length - 1];
// Pre-war pivot: Feb 27, 2026 close. Earlier draft hardcoded 281 bps; the
// actual FRED Feb 27 close is 310 bps (281 was the Jan 2026 monthly average,
// not the close). Corrected Nov 2026 to derive from the series file.
const _preWarHy = hyOasHistory.find((p) => p.date === '2026-02-27');

export const HY_SPREAD = {
  /** Pre-war HY OAS (bps), FRED Feb 27 2026 close. */
  preWar: _preWarHy ? Math.round(_preWarHy.value) : 310,
  preWarAsOf: '2026-02-27',
  /** Archive-date HY OAS, derived from FRED BAMLH0A0HYM2 last observation. */
  lastArchived: Math.round(_lastHy.value),
  lastArchivedAsOf: _lastHy.date, // ISO; render pretty where used
} as const;

export const CONFLICT_DAYS = {
  /**
   * Final conflict-day count rendered in prose + headers.
   * The field notes series ran up to day 58 by the archive date.
   */
  finalArchivedDay: 58,
} as const;

export const FUEL_SHOCK = {
  /** Jet fuel price referenced in the Falcon strategy sim and Spirit case callouts. */
  plan: 2.24,
  shockPeak: 4.60,
  shockClose: 4.32,
} as const;

/**
 * Helper: format a value as a dollar figure with the given decimals.
 * `fmtUSD(71.32)` -> `"$71.32"`, `fmtUSD(100, 0)` -> `"$100"`.
 */
export function fmtUSD(value: number, decimals = 2): string {
  return `$${value.toFixed(decimals)}`;
}
