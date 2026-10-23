/**
 * One stat: big serif value, caps label, optional note under it.
 * Used in hero credential strips, Track Record aggregates, memo exhibit KPIs.
 */
export function StatBlock({
  value,
  label,
  note,
  tone,
}: {
  value: React.ReactNode;
  label: string;
  note?: string;
  tone?: "pos" | "neg" | "warn" | "default";
}) {
  const valueColor =
    tone === "pos"
      ? "var(--pos)"
      : tone === "neg"
      ? "var(--red)"
      : tone === "warn"
      ? "var(--warn)"
      : "var(--ink)";
  return (
    <div>
      <p
        className="nums-tabular m-0 serif"
        style={{
          fontSize: "28px",
          fontWeight: 600,
          lineHeight: 1.1,
          color: valueColor,
        }}
      >
        {value}
      </p>
      <p className="t-kicker mt-2" style={{ color: "var(--ink-muted)" }}>
        {label}
      </p>
      {note && (
        <p
          className="t-caption mt-1 m-0"
          style={{ color: "var(--ink-muted)", textTransform: "none", letterSpacing: 0 }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
