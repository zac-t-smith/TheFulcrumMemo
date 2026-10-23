import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "secondary" | "text";

const BASE_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontFamily: "var(--font-sans)",
  fontWeight: 600,
  fontSize: "13px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  padding: "10px 16px",
  borderRadius: "var(--radius)",
  border: "1px solid transparent",
  textDecoration: "none",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s, border-color 0.15s",
};

function variantStyle(variant: Variant): React.CSSProperties {
  switch (variant) {
    case "primary":
      return { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" };
    case "secondary":
      return { background: "transparent", color: "var(--ink)", borderColor: "var(--ink)" };
    case "text":
      return { background: "transparent", color: "var(--ink)", padding: "4px 0", borderColor: "transparent" };
  }
}

type CommonProps = {
  variant?: Variant;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };

type ButtonAsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a"; href: string };

type ButtonAsLink = CommonProps & Omit<LinkProps, "to"> & { as: "link"; to: string };

export function Button(props: ButtonAsButton | ButtonAsAnchor | ButtonAsLink) {
  const { variant = "primary", children, ...rest } = props as ButtonAsButton & { as?: unknown };
  const style = { ...BASE_STYLE, ...variantStyle(variant), ...(rest.style ?? {}) };

  if ((props as ButtonAsAnchor).as === "a") {
    const { as: _as, ...a } = props as ButtonAsAnchor;
    return (
      <a {...a} style={style}>
        {children}
      </a>
    );
  }
  if ((props as ButtonAsLink).as === "link") {
    const { as: _as, to, ...l } = props as ButtonAsLink;
    return (
      <Link to={to} {...l} style={style}>
        {children}
      </Link>
    );
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button {...b} style={style}>
      {children}
    </button>
  );
}
