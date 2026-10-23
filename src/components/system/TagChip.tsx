/**
 * Small label chip — the one tag/pill style on the site.
 * Rectangular, hairline border, sans caps, tabular numerals.
 */
export function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="t-caption inline-block"
      style={{
        padding: "2px 8px",
        border: "1px solid var(--rule)",
        color: "var(--ink-muted)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}
