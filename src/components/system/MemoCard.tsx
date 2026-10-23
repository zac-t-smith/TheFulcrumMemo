import { Link } from "react-router-dom";
import { TagChip } from "./TagChip";

/**
 * One memo card. Kicker (series or sector), serif title, dek, tag chips,
 * meta line (date · reading time). No decorative background; hairline rule
 * top and bottom. Click the whole card to navigate.
 */
export function MemoCard({
  to,
  kicker,
  title,
  dek,
  tags,
  date,
  readingTime,
}: {
  to: string;
  kicker?: string;
  title: string;
  dek?: string;
  tags?: string[];
  date?: string;
  readingTime?: string;
}) {
  return (
    <Link
      to={to}
      className="block py-6"
      style={{ borderBottom: "1px solid var(--rule)", color: "var(--ink)" }}
    >
      {kicker && (
        <div className="t-kicker mb-2" style={{ color: "var(--red)" }}>
          {kicker}
        </div>
      )}
      <h3 className="t-h3 m-0" style={{ color: "var(--ink)" }}>
        {title}
      </h3>
      {dek && (
        <p className="t-body mt-2 m-0" style={{ color: "var(--ink-muted)" }}>
          {dek}
        </p>
      )}
      {(tags?.length || date || readingTime) && (
        <div className="t-caption mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {date && <span style={{ color: "var(--ink-muted)" }}>{date}</span>}
          {readingTime && <span style={{ color: "var(--ink-muted)" }}>{readingTime}</span>}
          {tags?.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      )}
    </Link>
  );
}
