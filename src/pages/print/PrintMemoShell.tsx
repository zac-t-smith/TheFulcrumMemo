import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import KirklandsMemo from '@/pages/memos/KirklandsMemo';
import LycraMemo from '@/pages/memos/LycraMemo';
import PartyCityMemo from '@/pages/memos/PartyCityMemo';
import IranMemoPartIFull from '@/pages/memos/IranMemoPartIFull';
import IranMemoPartIIFull from '@/pages/memos/IranMemoPartIIFull';
import IranMemoPartIIIFull from '@/pages/memos/IranMemoPartIIIFull';
import ShadowPartnerMemo from '@/pages/memos/ShadowPartnerMemo';

/**
 * /print/memos/:slug — chrome-less print layout.
 *
 * Each memo component is reused as-is. A document-level body class
 * (`tfm-print`) toggles print-specific CSS in src/styles/tokens.css:
 * hides Navbar, Footer, ArchiveBanner, ReadingProgress, TOC, injects
 * page-break hints on headings, and widens the reading column.
 *
 * The Playwright renderer in scripts/render-pdfs.ts navigates here
 * for each slug and saves a real PDF via Chromium print-to-PDF.
 */

const MEMO_MAP: Record<string, { Component: React.ComponentType; title: string; slug: string }> = {
  kirklands:        { Component: KirklandsMemo,       title: 'Kirklands',       slug: 'kirklands' },
  lycra:            { Component: LycraMemo,           title: 'LYCRA',           slug: 'lycra' },
  'party-city':     { Component: PartyCityMemo,       title: 'Party-City',      slug: 'party-city' },
  iran:             { Component: IranMemoPartIFull,   title: 'Iran-Part-I',     slug: 'iran' },
  'iran-part-ii':   { Component: IranMemoPartIIFull,  title: 'Iran-Part-II',    slug: 'iran-part-ii' },
  'iran-part-iii':  { Component: IranMemoPartIIIFull, title: 'Iran-Part-III',   slug: 'iran-part-iii' },
  'shadow-partner': { Component: ShadowPartnerMemo,   title: 'Shadow-Partner',  slug: 'shadow-partner' },
};

export const MEMO_SLUGS = Object.keys(MEMO_MAP);

const PrintMemoShell = () => {
  const { slug } = useParams<{ slug: string }>();

  // Toggle a body class so the print CSS block takes over.
  useEffect(() => {
    document.body.classList.add('tfm-print');
    document.documentElement.classList.add('tfm-print');
    return () => {
      document.body.classList.remove('tfm-print');
      document.documentElement.classList.remove('tfm-print');
    };
  }, []);

  if (!slug || !MEMO_MAP[slug]) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font-serif)' }}>
        <h1>Unknown memo slug: {slug}</h1>
        <p>Available: {MEMO_SLUGS.join(', ')}</p>
      </div>
    );
  }

  const { Component } = MEMO_MAP[slug];
  return <Component />;
};

export default PrintMemoShell;
