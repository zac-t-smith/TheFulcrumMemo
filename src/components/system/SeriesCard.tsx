import type { ReactNode } from "react";

/**
 * Series grouping card for the Research page. Header rule, caps kicker,
 * serif title + dek, then children (MemoCards).
 */
export function SeriesCard({
  kicker,
  title,
  dek,
  children,
}: {
  kicker: string;
  title: string;
  dek?: string;
  children: ReactNode;
}) {
  return (
    <section className="py-10" style={{ borderTop: "1px solid var(--ink)" }}>
      <header className="mb-6">
        <div className="t-kicker" style={{ color: "var(--red)" }}>
          {kicker}
        </div>
        <h2 className="t-h2 mt-2 m-0">{title}</h2>
        {dek && (
          <p className="t-body mt-2 m-0" style={{ color: "var(--ink-muted)" }}>
            {dek}
          </p>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}
