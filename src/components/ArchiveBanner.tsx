/**
 * Single-source archive banner for the Iran series and anything tied to its
 * April 2026 data snapshot. Phase A: data stopped moving; the site is a
 * research archive, not a live feed.
 *
 * The default label is the shared "Series archived · data as of {asOf}"
 * line used by Field Notes, Timeline, and Fulcrum Index. Pass a custom
 * `label` to render page-specific archive copy — the four long-form memo
 * pages (Part I, II, III, Shadow Partner) render a placeholder that Zac
 * will replace with memo-specific closing-out language.
 */
const ArchiveBanner = ({
  asOf = "Apr 26, 2026",
  label,
}: {
  asOf?: string;
  label?: string;
}) => {
  return (
    <div
      className="w-full"
      style={{
        background: "#1a1a1a",
        color: "#f7f5f0",
        borderBottom: "1px solid #d9d4c7",
      }}
      role="note"
    >
      <div className="max-w-[1080px] mx-auto px-7 py-2 flex items-center gap-3">
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "#c8102e" }}
          aria-hidden="true"
        />
        <p
          className="text-[11px] tracking-[0.14em] uppercase font-semibold"
          style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
        >
          {label ?? `Series archived · data as of ${asOf}`}
        </p>
      </div>
    </div>
  );
};

export default ArchiveBanner;
