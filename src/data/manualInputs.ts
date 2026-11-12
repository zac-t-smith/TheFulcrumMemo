/**
 * manualInputs.ts — Fulcrum v5 Phase 2A.3
 *
 * Imports the hand-curated observations in quant/data/manual_inputs.json
 * and applies the render guard before anything downstream sees the data:
 *
 *   verified === true
 *   && typeof source_url === 'string'
 *   && source_url.startsWith('https://')
 *
 * Any row that doesn't pass is filtered out here, so the Hidden-Stress Gap
 * chart and the Sector Heat Map can never accidentally render an
 * unverified number. This is the only approved path for manual inputs to
 * reach the page.
 *
 * To add a real observation: edit quant/data/manual_inputs.json, set
 * verified: true, and paste a primary-source HTTPS URL. No restart or
 * build step is required beyond the normal Vite reload.
 */

import raw from '../../quant/data/manual_inputs.json';

export type ManualInputSeriesId =
  | 'fitch_pc_default_ttm_overall'
  | 'fitch_pc_default_ttm_by_sector'
  | 'sp_large_co_bankruptcies_monthly'
  | 'sp_large_co_bankruptcies_by_sector'
  | 'moody_hy_default_ttm'
  | 'moody_leveraged_loan_default_ttm'
  | 'epiq_commercial_ch11_monthly';

/** Row shape as stored in manual_inputs.json. `value` and sector-specific
 *  fields are optional because template rows ship with placeholders. */
export interface RawManualInput {
  series: ManualInputSeriesId | string;
  date: string;           // YYYY-MM-DD; template rows use the literal "YYYY-MM-DD"
  value: number | null;
  source_name?: string;
  source_url?: string;
  verified?: boolean;
  notes?: string;
  sector?: string;
  period_label?: string;
}

/** A verified observation. The render guard narrows RawManualInput to this. */
export interface VerifiedManualInput {
  series: ManualInputSeriesId | string;
  date: string;           // YYYY-MM-DD, real date (never the template literal)
  value: number;
  source_name: string;
  source_url: string;     // always starts with https://
  verified: true;
  notes?: string;
  sector?: string;
  period_label?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Render guard. A row is verified-and-renderable only if ALL of:
 *   - verified === true
 *   - source_url is a string that starts with "https://"
 *   - value is a finite number
 *   - date matches the ISO yyyy-mm-dd pattern (excludes the template literal)
 */
export function isVerified(row: RawManualInput): row is VerifiedManualInput {
  return (
    row.verified === true &&
    typeof row.source_url === 'string' &&
    row.source_url.startsWith('https://') &&
    typeof row.source_name === 'string' &&
    row.source_name.length > 0 &&
    typeof row.value === 'number' &&
    Number.isFinite(row.value) &&
    typeof row.date === 'string' &&
    ISO_DATE.test(row.date)
  );
}

interface ManualInputsJson {
  schema_version: number;
  description: string;
  observations: RawManualInput[];
  known_series: Record<string, {
    label: string;
    unit: string;
    frequency: string;
    used_by: string;
    additional_fields?: string[];
  }>;
}

const parsed = raw as unknown as ManualInputsJson;

/**
 * All verified observations across every series. Pre-filtered by the render
 * guard so consumers never see unverified rows. Sorted ascending by date.
 */
export const manualInputs: readonly VerifiedManualInput[] = parsed.observations
  .filter(isVerified)
  .slice()
  .sort((a, b) => a.date.localeCompare(b.date));

/** Grouped view keyed by series id, each list sorted ascending by date. */
export const manualInputsBySeries: Readonly<
  Record<string, readonly VerifiedManualInput[]>
> = (() => {
  const out: Record<string, VerifiedManualInput[]> = {};
  for (const row of manualInputs) {
    (out[row.series] ??= []).push(row);
  }
  return out;
})();

/** Metadata for display: label, unit, frequency, consumer tag. Pass-through
 *  from manual_inputs.json's `known_series` block; edit there, not here. */
export const manualInputsMeta = parsed.known_series;

/** How many verified observations exist for a given series id. UI can use
 *  this to decide whether to render "awaiting data" placeholders. */
export function seriesCount(seriesId: ManualInputSeriesId | string): number {
  return manualInputsBySeries[seriesId]?.length ?? 0;
}
