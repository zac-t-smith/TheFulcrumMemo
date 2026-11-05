import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import ArchiveBanner from '@/components/ArchiveBanner';
import { closingDispatch } from '@/data/closingDispatch';

// Closing Dispatch — the final field-note entry. Dedicated page rather than
// a numeric /field-notes/:day slot, since the archive explicitly does NOT
// backfill Days 59+. Narrative only; no marketSnapshot tile.

export default function ClosingDispatch() {
  const d = closingDispatch;
  return (
    <>
      <Helmet>
        <title>{d.title} | Field Notes | The Fulcrum Memo</title>
        <meta name="description" content={d.lede.slice(0, 200)} />
      </Helmet>

      <Navbar />

      <div className="pt-[64px]">
        <ArchiveBanner kind="paragraph" hideSelfLink="closing-dispatch" />
      </div>

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          <nav className="mb-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Link to="/field-notes" className="hover:text-primary">Field Notes</Link>
            <span className="mx-2">·</span>
            <span>Closing Dispatch</span>
          </nav>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--red)' }} />
              <span className="text-[10px] uppercase tracking-wider text-red-400">
                Closing Dispatch · {d.date}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {d.title}
            </h1>
            <p className="text-muted-foreground text-lg italic">{d.lede}</p>
          </header>

          <article className="space-y-5 text-foreground text-base leading-relaxed">
            {d.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </article>

          <div className="mt-12 flex gap-4 text-[11px] uppercase tracking-[0.18em]">
            <Link to="/scorecard" className="underline hover:text-primary">
              → Scorecard
            </Link>
            <Link to="/field-notes" className="underline hover:text-primary">
              ← Field Notes archive
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
