import type { ReactNode } from "react";

type Variant = "note" | "insight" | "warning" | "stress";

const VARIANT_STYLE: Record<Variant, { border: string; label: string; labelText: string }> = {
  note:    { border: "var(--rule)",    label: "Note",     labelText: "var(--ink-muted)" },
  insight: { border: "var(--cat-1)",   label: "Insight",  labelText: "var(--cat-1)" },
  warning: { border: "var(--warn)",    label: "Caution",  labelText: "var(--warn)" },
  stress:  { border: "var(--red)",     label: "Stress",   labelText: "var(--red)" },
};

/**
 * Replaces every colored info box in the memos (blue / pink / red / yellow).
 * Four variants, each carrying a defined meaning. Border-left hairline + a
 * caps kicker; body is serif at the reading size.
 */
export function Callout({
  variant = "note",
  label,
  children,
}: {
  variant?: Variant;
  label?: string;
  children: ReactNode;
}) {
  const v = VARIANT_STYLE[variant];
  return (
    <aside
      className="my-6 pl-5"
      role="note"
      style={{ borderLeft: `3px solid ${v.border}` }}
    >
      <div
        className="t-kicker mb-2"
        style={{ color: v.labelText }}
      >
        {label ?? v.label}
      </div>
      <div className="t-body" style={{ color: "var(--ink)" }}>
        {children}
      </div>
    </aside>
  );
}
