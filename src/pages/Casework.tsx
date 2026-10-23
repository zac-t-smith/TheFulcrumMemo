import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { PageHeader } from '@/components/system';

/**
 * /casework — index page. Two cards: the restoration-company case study
 * (lived experience of distress operations) and the Falcon Airways live
 * strategy simulation.
 */
const Casework = () => {
  return (
    <PageLayout
      title="Casework"
      description="Restructuring engagements I have led or advised, as case studies."
    >
      <PageHeader
        kicker="Case work"
        title="Deals I have been inside."
        dek="One is a restructuring I lived through, from the operator's side. The other is a live classroom simulation I run with 20 students advising a disguised airline through three decision rounds."
      />

      <section className="grid md:grid-cols-2 gap-6">
        <CaseCard
          kicker="Lived case · 2024–2025"
          title="Best Option Restoration"
          summary="A $300K-raised restoration company that scaled from $0 to $100K in monthly revenue within 5 months, hit a 90–120 day collection crunch with insurance carriers, and spent 18 months managing creditors before returning most investor capital through an orderly wind-down."
          to="/casework/restoration"
          cta="Read the case →"
        />
        <CaseCard
          kicker="Live simulation · Nov 10, 2026"
          title="Falcon Airways"
          summary="Twenty students, three decision rounds, one disguised distressed airline. Students form firms and advise through three real inflection points — the first bid, the squeeze, the shock — against a sealed prediction committed before class."
          to="/strategy?demo=1"
          cta="Enter the demo →"
        />
      </section>
    </PageLayout>
  );
};

const CaseCard = ({
  kicker,
  title,
  summary,
  to,
  cta,
}: {
  kicker: string;
  title: string;
  summary: string;
  to: string;
  cta: string;
}) => (
  <Link
    to={to}
    className="block p-7 h-full flex flex-col hover:opacity-90 transition-opacity"
    style={{
      background: 'var(--paper-raised)',
      border: '1px solid var(--rule)',
      color: 'var(--ink)',
    }}
  >
    <div className="t-kicker mb-3" style={{ color: 'var(--red)' }}>
      {kicker}
    </div>
    <h2 className="t-h3 m-0 mb-4">{title}</h2>
    <p className="t-body mb-6 flex-1 m-0" style={{ color: 'var(--ink-muted)' }}>
      {summary}
    </p>
    <div className="t-kicker" style={{ color: 'var(--ink)' }}>
      {cta}
    </div>
  </Link>
);

export default Casework;
