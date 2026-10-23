import { Link } from "react-router-dom";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

/**
 * Small crumbs row above the page title. The current page is the last item
 * and does NOT receive a `to`.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="t-caption mb-4">
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-x-2">
            {it.to ? (
              <Link
                to={it.to}
                className="hover:underline"
                style={{ color: "var(--ink-muted)" }}
              >
                {it.label}
              </Link>
            ) : (
              <span style={{ color: "var(--ink)" }}>{it.label}</span>
            )}
            {i < items.length - 1 && (
              <span aria-hidden="true" style={{ color: "var(--rule)" }}>
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
