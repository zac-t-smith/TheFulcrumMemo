import type { ReactNode } from "react";

export type DataTableColumn<Row> = {
  key: keyof Row & string;
  header: ReactNode;
  // Right-align numeric columns. Non-numeric defaults to left.
  numeric?: boolean;
  // Optional cell renderer.
  render?: (row: Row) => ReactNode;
};

/**
 * Hairline-rule editorial table. Tabular numerals, bordered rows, sans caps
 * headers. Numeric columns right-aligned. The one table style on the site.
 */
export function DataTable<Row>({
  columns,
  rows,
  caption,
  className = "",
}: {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  caption?: string;
  className?: string;
}) {
  return (
    <div className={className} style={{ overflowX: "auto" }}>
      <table
        className="w-full border-collapse nums-tabular"
        style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-small)" }}
      >
        {caption && (
          <caption
            className="t-kicker text-left mb-2"
            style={{ color: "var(--ink-muted)" }}
          >
            {caption}
          </caption>
        )}
        <thead>
          <tr style={{ borderBottom: "1px solid var(--ink)" }}>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className="py-2"
                style={{
                  textAlign: c.numeric ? "right" : "left",
                  fontWeight: 600,
                  color: "var(--ink)",
                  textTransform: "uppercase",
                  fontSize: "var(--fs-caption)",
                  letterSpacing: "0.1em",
                  paddingLeft: 8,
                  paddingRight: 8,
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--rule)" }}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className="py-2"
                  style={{
                    textAlign: c.numeric ? "right" : "left",
                    color: "var(--ink)",
                    paddingLeft: 8,
                    paddingRight: 8,
                  }}
                >
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
