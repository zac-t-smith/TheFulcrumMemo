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
  /** Last archived Brent spot for the Iran series. Match the chart's final point. */
  lastArchived: null as number | null,   // populate when backfilling
  lastArchivedAsOf: 'Apr 26, 2026',
} as const;

export const CONFLICT_DAYS = {
  /**
   * Final conflict-day count rendered in prose + headers.
   * The field notes series ran up to day 58 by the archive date.
   */
  finalArchivedDay: 58,
  /** Day numbers that have published field notes (sourced via getAvailableFieldNoteDays). */
  availabilityNote: 'Live counts come from iranConflictData.ts; this constant is only used in top-of-page copy.',
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
