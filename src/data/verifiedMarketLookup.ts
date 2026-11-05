// Verified market-data lookup for Iran-series pages.
//
// Returns Brent / HY OAS / VIX by exact-date match against the FRED/EIA
// series files in this repo. No interpolation, no prior-close fallback,
// no scenario numbers. If a given field+date has no published value, the
// lookup returns undefined for that field and the renderer drops the tile.
//
// This is the single source for the "Market snapshot" tiles on each field
// note, the Part II "current spread" chart marker, and the macro-
// transmission chain's auto-computed metrics strings.

import { hyOasHistory } from './hyOasHistory';
import { vixHistory } from './vixHistory';
import { brentSpotHistory } from './brentSpotHistory';

const hyByDate = new Map(hyOasHistory.map((p) => [p.date, p.value]));
const vixByDate = new Map(vixHistory.map((p) => [p.date, p.value]));
const brentByDate = new Map(brentSpotHistory.map((p) => [p.date, p.value]));

const MONTHS: Record<string, string> = {
  January: '01', February: '02', March: '03',    April: '04',
  May:     '05', June:     '06', July:  '07',    August: '08',
  September: '09', October: '10', November: '11', December: '12',
};

/**
 * "March 5, 2026" -> "2026-03-05". Returns null for unparseable strings.
 */
export function parseFieldNoteDateToISO(prettyDate: string): string | null {
  const m = prettyDate.trim().match(/^(\w+)\s+(\d+),\s+(\d{4})$/);
  if (!m) return null;
  const [, month, day, year] = m;
  const mm = MONTHS[month];
  if (!mm) return null;
  return `${year}-${mm}-${day.padStart(2, '0')}`;
}

export type VerifiedMarketTiles = {
  isoDate: string | null;
  brentCrude?: number;
  hySpread?: number;
  vix?: number;
};

/**
 * Exact-date lookup. Returns tiles only for dates present in the
 * verified series. Weekends / holidays / missing dates -> no tile.
 */
export function lookupVerifiedMarket(prettyDate: string): VerifiedMarketTiles {
  const iso = parseFieldNoteDateToISO(prettyDate);
  if (!iso) return { isoDate: null };
  return {
    isoDate: iso,
    brentCrude: brentByDate.get(iso),
    hySpread: hyByDate.get(iso),
    vix: vixByDate.get(iso),
  };
}

/**
 * Last published value for each series. Used by Part II's archive-snapshot
 * marker ("current HY spread") and by the FieldNotes index headline stat.
 * Derived from the FRED files so it can't drift from the authoritative data.
 */
export function latestVerifiedMarket(): {
  brentCrude: { value: number; date: string };
  hySpread: { value: number; date: string };
  vix: { value: number; date: string };
} {
  const b = brentSpotHistory[brentSpotHistory.length - 1];
  const h = hyOasHistory[hyOasHistory.length - 1];
  const v = vixHistory[vixHistory.length - 1];
  return {
    brentCrude: { value: b.value, date: b.date },
    hySpread: { value: h.value, date: h.date },
    vix: { value: v.value, date: v.date },
  };
}

export const VERIFIED_MARKET_ATTRIBUTION =
  'Source: FRED (BAMLH0A0HYM2, VIXCLS, DCOILBRENTEU). Exact-date match; no interpolation.';
