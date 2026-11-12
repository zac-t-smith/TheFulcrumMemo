/**
 * DataFreshnessBadge — replaces the archive banner on the Fulcrum Index.
 *
 * Driven by the latest BAA10Y observation (the index's primary input),
 * which the daily data workflow rewrites. Business days are counted from
 * the observation date to today in the reader's browser:
 *   green  ≤ 3 business days  "Live · data through {date}"
 *   amber  ≤ 10               "Data through {date} · update delayed"
 *   red    > 10               "Data paused since {date}"
 */
import { baaSpreadHistoryMeta } from '@/data/baaSpreadHistory';

const MS_DAY = 86_400_000;

/** Weekdays strictly after `from` up to and including `to` (UTC dates). */
export function businessDaysBetween(from: Date, to: Date): number {
  let n = 0;
  for (let t = from.getTime() + MS_DAY; t <= to.getTime(); t += MS_DAY) {
    const d = new Date(t).getUTCDay();
    if (d !== 0 && d !== 6) n++;
  }
  return n;
}

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

const DataFreshnessBadge = ({ lastObservation = baaSpreadHistoryMeta.lastObservation }: { lastObservation?: string }) => {
  const obs = new Date(`${lastObservation}T00:00:00Z`);
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const lag = businessDaysBetween(obs, today);
  const date = fmt(lastObservation);

  const state =
    lag <= 3
      ? { dot: '#2e7d4f', label: `Live · data through ${date}` }
      : lag <= 10
        ? { dot: '#d4a017', label: `Data through ${date} · update delayed` }
        : { dot: '#c8102e', label: `Data paused since ${date}` };

  return (
    <div
      style={{ background: '#1a1a1a', color: '#f7f5f0', borderBottom: '1px solid #d9d4c7' }}
      role="status"
      aria-label="Data freshness"
    >
      <div className="max-w-[1080px] mx-auto px-7 py-2 flex items-center gap-3">
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: state.dot }}
          aria-hidden="true"
        />
        <p
          className="text-[11px] tracking-[0.14em] uppercase font-semibold"
          style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
        >
          {state.label}
        </p>
      </div>
    </div>
  );
};

export default DataFreshnessBadge;
