import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import ArchiveBanner from '@/components/ArchiveBanner';
import { scorecardCalls } from '@/data/scorecardCalls';

// Thesis scorecard — 13 calls made across the Iran series, each with its
// source (field note day or memo) and the original confidence (if recorded
// at the time). Outcome + grade are intentionally placeholders; Zac writes
// the post-mortem copy.

export default function Scorecard() {
  return (
    <>
      <Helmet>
        <title>Scorecard | Iran Series | The Fulcrum Memo</title>
        <meta
          name="description"
          content="Honest post-mortem of the 13 calls made across the Iran-series memos and field notes. Outcomes and grades aged against reality."
        />
      </Helmet>

      <Navbar />

      <div className="pt-[64px]">
        <ArchiveBanner label="[ARCHIVE BANNER — ZAC TO WRITE]" />
      </div>

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--red)' }} />
              <span className="text-[10px] uppercase tracking-wider text-red-400">
                Archived · Iran Series · Scorecard
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Scorecard
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Every call made across the Iran-series memos and field notes, graded against
              what actually happened. The call text and source are frozen; outcomes and grades
              are being written as the audit closes out.
            </p>
          </header>

          <ol className="space-y-6">
            {scorecardCalls.map((c, i) => (
              <li
                key={c.id}
                className="p-5 surface-card border border-border rounded-lg"
              >
                <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Call #{i + 1}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {c.sourceHref ? (
                      <Link to={c.sourceHref} className="underline hover:text-primary">
                        {c.sourcePage}
                      </Link>
                    ) : (
                      <span>{c.sourcePage}</span>
                    )}{' '}
                    · {c.sourceDate}
                    {typeof c.initialConfidence === 'number' && (
                      <span> · initial confidence {c.initialConfidence}%</span>
                    )}
                  </div>
                </div>

                <p className="text-foreground text-sm mb-4">{c.call}</p>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                      Outcome
                    </dt>
                    <dd className="text-amber-500 italic">
                      {c.outcomePlaceholder ?? '[OUTCOME — ZAC TO WRITE]'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                      Grade
                    </dt>
                    <dd className="text-amber-500 italic">
                      {c.gradePlaceholder ?? '[GRADE — ZAC TO SET]'}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>

          <div className="mt-12 text-[11px] text-muted-foreground border-t border-border pt-4">
            13 calls total. Source material frozen at Apr 26, 2026; outcomes written Nov 2026.
          </div>
        </div>
      </main>
    </>
  );
}
