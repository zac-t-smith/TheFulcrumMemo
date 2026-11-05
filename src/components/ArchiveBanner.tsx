import { Link } from 'react-router-dom';

/**
 * Archive banner for every Iran-series surface. Two variants:
 *
 *  - Default / short form — "Series archived · data as of {asOf}" used by
 *    the Field Notes index / Field Note Day / Timeline / Fulcrum Index.
 *    Pass a custom `label` to override the body.
 *
 *  - `kind="paragraph"` — the long archive paragraph with inline links to
 *    the Closing Dispatch and the Scorecard. Used on the four long-form
 *    memo pages (Part I, II, III, Shadow Partner) and on the Scorecard /
 *    Closing Dispatch pages themselves. On the Scorecard page pass
 *    `hideSelfLink="scorecard"`; on the Closing Dispatch page pass
 *    `hideSelfLink="closing-dispatch"` — the matching link is rendered as
 *    plain text so the banner doesn't point back at the page you're on.
 */
type Props =
  | { kind?: 'short'; asOf?: string; label?: string; hideSelfLink?: never }
  | { kind: 'paragraph'; asOf?: string; label?: never; hideSelfLink?: 'closing-dispatch' | 'scorecard' };

const ArchiveBanner = (props: Props) => {
  const asOf = props.asOf ?? 'Apr 26, 2026';

  if (props.kind === 'paragraph') {
    const closingDispatchLink =
      props.hideSelfLink === 'closing-dispatch' ? (
        <span>the Closing Dispatch</span>
      ) : (
        <>
          the{' '}
          <Link
            to="/field-notes/closing-dispatch"
            className="underline hover:text-white"
            style={{ color: '#f7f5f0' }}
          >
            Closing Dispatch
          </Link>
        </>
      );

    const scorecardLink =
      props.hideSelfLink === 'scorecard' ? (
        <span>the Scorecard</span>
      ) : (
        <>
          the{' '}
          <Link
            to="/scorecard"
            className="underline hover:text-white"
            style={{ color: '#f7f5f0' }}
          >
            Scorecard
          </Link>
        </>
      );

    return (
      <div
        className="w-full"
        style={{
          background: '#1a1a1a',
          color: '#f7f5f0',
          borderBottom: '1px solid #d9d4c7',
        }}
        role="note"
      >
        <div className="max-w-[1080px] mx-auto px-7 py-3 flex items-start gap-3">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0 mt-[6px]"
            style={{ background: '#c8102e' }}
            aria-hidden="true"
          />
          <p
            className="text-[12.5px] leading-snug"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          >
            <strong className="tracking-[0.1em] uppercase text-[11px]">
              Archived series.
            </strong>{' '}
            Published in real time from February 28 to {asOf}, and preserved as
            written, apart from marked data corrections. For how these calls
            played out, see {closingDispatchLink} and {scorecardLink}.
          </p>
        </div>
      </div>
    );
  }

  // Short form (default).
  return (
    <div
      className="w-full"
      style={{
        background: '#1a1a1a',
        color: '#f7f5f0',
        borderBottom: '1px solid #d9d4c7',
      }}
      role="note"
    >
      <div className="max-w-[1080px] mx-auto px-7 py-2 flex items-center gap-3">
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: '#c8102e' }}
          aria-hidden="true"
        />
        <p
          className="text-[11px] tracking-[0.14em] uppercase font-semibold"
          style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
        >
          {props.label ?? `Series archived · data as of ${asOf}`}
        </p>
      </div>
    </div>
  );
};

export default ArchiveBanner;
