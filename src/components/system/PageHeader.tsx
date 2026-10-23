import type { ReactNode } from "react";

/**
 * One consistent page header. Kicker (sans caps) + H1 (serif) + dek (serif muted) +
 * meta line. Hairline red rule under the kicker, hairline rule under the whole block.
 */
export function PageHeader({
  kicker,
  title,
  dek,
  meta,
}: {
  kicker?: string;
  title: ReactNode;
  dek?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-10 pt-4">
      {kicker && (
        <div className="t-kicker mb-3" style={{ color: "var(--red)" }}>
          {kicker}
        </div>
      )}
      <h1 className="t-h1 m-0" style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>
        {title}
      </h1>
      {dek && (
        <p
          className="t-body mt-3 max-w-[640px]"
          style={{ color: "var(--ink-muted)" }}
        >
          {dek}
        </p>
      )}
      {meta && (
        <div className="t-caption mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          {meta}
        </div>
      )}
      <hr className="rule mt-6" />
    </header>
  );
}
