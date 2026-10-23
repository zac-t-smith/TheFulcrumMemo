/**
 * Horizontal probability / allocation bar. One of the two "charts" in the
 * system (the other is DataTable). Takes a list of segments summing to 100.
 */
export type ScenarioSegment = {
  label: string;
  value: number;        // 0..100
  tone?: "pos" | "neg" | "neutral" | "warn" | "cat-1" | "cat-2" | "cat-3" | "cat-4" | "cat-5";
};

const TONE_VAR: Record<NonNullable<ScenarioSegment["tone"]>, string> = {
  pos: "var(--pos)",
  neg: "var(--neg)",
  neutral: "var(--neutral)",
  warn: "var(--warn)",
  "cat-1": "var(--cat-1)",
  "cat-2": "var(--cat-2)",
  "cat-3": "var(--cat-3)",
  "cat-4": "var(--cat-4)",
  "cat-5": "var(--cat-5)",
};

export function ScenarioBar({
  segments,
  label,
}: {
  segments: ScenarioSegment[];
  label?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="my-5">
      {label && (
        <div className="t-kicker mb-2" style={{ color: "var(--ink-muted)" }}>
          {label}
        </div>
      )}
      <div
        className="flex w-full overflow-hidden"
        style={{ height: 10, border: "1px solid var(--rule)" }}
      >
        {segments.map((s, i) => (
          <div
            key={i}
            style={{
              width: `${(s.value / total) * 100}%`,
              background: TONE_VAR[s.tone ?? "cat-1"],
            }}
            aria-label={`${s.label}: ${s.value}%`}
            title={`${s.label}: ${s.value}%`}
          />
        ))}
      </div>
      <div className="t-caption mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {segments.map((s, i) => (
          <span key={i} className="flex items-center gap-x-1.5">
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                background: TONE_VAR[s.tone ?? "cat-1"],
              }}
            />
            <span style={{ color: "var(--ink)" }}>{s.label}</span>
            <span className="mono" style={{ color: "var(--ink-muted)" }}>
              {s.value}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
