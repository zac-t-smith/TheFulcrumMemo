import { Download } from 'lucide-react';
import { Button } from './Button';

/**
 * Download-PDF button rendered under each memo header. The PDF files
 * are generated at build time by scripts/render-pdfs.ts (Playwright
 * print-to-PDF) and served from /TheFulcrumMemo/pdfs/.
 *
 * Hidden on print (via the body.tfm-print selectors in tokens.css).
 */
export function MemoDownload({ file }: { file: string }) {
  const href = `${import.meta.env.BASE_URL}pdfs/${file}`;
  return (
    <div className="mb-10 print:hidden">
      <Button
        as="a"
        href={href}
        download
        target="_blank"
        rel="noopener noreferrer"
        variant="secondary"
      >
        <Download size={14} />
        Download PDF
      </Button>
    </div>
  );
}
