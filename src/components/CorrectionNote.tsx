// Corrections-note banner, shown on the Field Notes index and on Part II.
// Dated 2026-11-04 (Phase 1 audit). The body is a clearly-marked placeholder
// — Zac supplies the final wording.

const CorrectionNote = ({
  dateLabel = 'November 4, 2026',
  context,
}: {
  dateLabel?: string;
  context?: string;
}) => {
  return (
    <aside
      role="note"
      aria-label="Corrections note"
      className="w-full"
      style={{
        borderLeft: '3px solid var(--warn, #8A5A17)',
        background: 'rgba(183, 121, 31, 0.08)',
        padding: '0.875rem 1.1rem',
        margin: '1rem 0',
      }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.18em] mb-1 font-semibold"
        style={{ color: 'var(--warn, #8A5A17)' }}
      >
        Correction · {dateLabel}{context ? ` · ${context}` : ''}
      </div>
      <p className="text-[13px] leading-snug" style={{ color: 'var(--ink, #1a1a1a)' }}>
        [CORRECTION NOTE — ZAC TO WRITE]
      </p>
    </aside>
  );
};

export default CorrectionNote;
