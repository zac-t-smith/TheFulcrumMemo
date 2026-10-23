type Tone = "pos" | "neg" | "neutral" | "warn" | "open";

const TONE: Record<Tone, { bg: string; fg: string; border: string }> = {
  pos:     { bg: "rgba(46,125,79,0.08)",  fg: "var(--pos)",     border: "var(--pos)" },
  neg:     { bg: "rgba(200,16,46,0.08)",  fg: "var(--red)",     border: "var(--red)" },
  neutral: { bg: "transparent",           fg: "var(--ink-muted)", border: "var(--rule)" },
  warn:    { bg: "rgba(183,121,31,0.1)",  fg: "var(--warn)",    border: "var(--warn)" },
  open:    { bg: "rgba(31,58,95,0.08)",   fg: "var(--cat-1)",   border: "var(--cat-1)" },
};

/**
 * Status pill with semantic tone. Replaces every ad-hoc colored
 * span/badge pattern (Positions status, memo tag chips, etc.).
 */
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  const t = TONE[tone];
  return (
    <span
      className="inline-block"
      style={{
        padding: "2px 8px",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "11px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: t.fg,
        background: t.bg,
        border: `1px solid ${t.border}`,
      }}
    >
      {children}
    </span>
  );
}
