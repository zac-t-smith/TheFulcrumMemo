import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SITE_URL } from "@/content/bio";

type PageLayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  ogImage?: string;
  // Set true for pages that render their own wide container (e.g., Field Notes map).
  bare?: boolean;
};

/**
 * Standard page frame: Navbar + Helmet meta + main container + Footer.
 * Every non-strategy route wraps its content in this.
 */
const PageLayout = ({
  children,
  title,
  description,
  ogImage,
  bare = false,
}: PageLayoutProps) => {
  const fullTitle = title
    ? `${title} | The Fulcrum Memo`
    : "The Fulcrum Memo | Independent credit research";
  const desc =
    description ??
    "Independent research on distressed credit, restructuring situations, and special situations.";
  const img = ogImage ?? `${SITE_URL}/profile.jpg`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f7f5f0", color: "#1a1a1a" }}
    >
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={img} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={img} />
      </Helmet>

      <Navbar />

      <main className={bare ? "flex-1 pt-24" : "flex-1 pt-24 pb-16"}>
        {bare ? (
          children
        ) : (
          <div className="max-w-[1080px] mx-auto px-7 w-full">{children}</div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PageLayout;
