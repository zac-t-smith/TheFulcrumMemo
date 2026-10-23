import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';

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
      <header className="mb-10 pt-4">
        <div
          className="text-[10.5px] tracking-[0.18em] uppercase font-semibold text-[#4a4a4a] mb-3"
          style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
        >
          Case work
        </div>
        <h1
          className="text-[40px] md:text-[52px] leading-[1.08] font-bold tracking-tight m-0"
          style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}
        >
          Deals I have been inside.
        </h1>
        <p
          className="mt-4 text-[18px] leading-[1.6] text-[#4a4a4a] max-w-[640px]"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          One is a restructuring I lived through, from the operator's side.
          The other is a live classroom simulation I run with 20 students
          advising a disguised airline through three decision rounds.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <CaseCard
          kicker="Lived case · 2024–2025"
          title="Best Option Restoration"
          summary="How a $300K-raised restoration company scaled to $100K monthly revenue in 5 months, hit a 90-120 day collection crunch with insurance carriers, and spent 18 months managing creditors before returning most investor capital through an orderly wind-down."
          to="/casework/restoration"
          external={false}
        />
        <CaseCard
          kicker="Live simulation · Nov 10, 2026"
          title="Falcon Airways"
          summary="Twenty students, three decision rounds, one disguised distressed airline. Students form firms and advise through three real inflection points — the first bid, the squeeze, the shock — against a sealed prediction committed before class. Play the demo now."
          to="/strategy?demo=1"
          external={false}
          cta="Enter the sim →"
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
  external,
  cta = 'Read the case →',
}: {
  kicker: string;
  title: string;
  summary: string;
  to: string;
  external: boolean;
  cta?: string;
}) => {
  const inner = (
    <div
      className="h-full p-7 flex flex-col"
      style={{
        background: '#fffdf8',
        border: '1px solid #d9d4c7',
      }}
    >
      <div
        className="text-[10.5px] tracking-[0.18em] uppercase font-semibold text-[#c8102e] mb-3"
        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
      >
        {kicker}
      </div>
      <h2
        className="text-[28px] md:text-[32px] leading-[1.1] font-bold text-[#1a1a1a] mb-4"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {title}
      </h2>
      <p
        className="text-[16px] leading-[1.65] text-[#4a4a4a] mb-6 flex-1"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {summary}
      </p>
      <div
        className="text-[11px] tracking-[0.18em] uppercase font-semibold text-[#1a1a1a]"
        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
      >
        {cta}
      </div>
    </div>
  );

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
        {inner}
      </a>
    );
  }
  return (
    <Link to={to} className="block hover:opacity-90 transition-opacity">
      {inner}
    </Link>
  );
};

export default Casework;
