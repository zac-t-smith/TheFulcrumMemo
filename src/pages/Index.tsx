import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button, TagChip } from '@/components/system';
import {
  AUTHOR_NAME,
  EMAIL,
  EMAIL_MAILTO,
  LINKEDIN_URL,
  RESUME_PDF,
  SITE_URL,
} from '@/content/bio';

/**
 * /  Home — Phase 3 recruiting funnel.
 *
 * Reader → one of three outcomes: (1) opens a proof-of-work memo,
 * (2) downloads the resume, (3) emails. Everything above the fold
 * is in service of those three. No decorative chrome.
 */

type Lens = {
  id: string;
  title: string;
  tag: string;
  blurb: string;
  pieces: Array<{ to: string; label: string }>;
};

const LENSES: Lens[] = [
  {
    id: 'rx-banking',
    title: 'RX Banking',
    tag: 'For Evercore · PJT · Houlihan · Lazard',
    blurb:
      'Intercreditor priority, liability management, recovery waterfalls. The indenture reading.',
    pieces: [
      { to: '/memos/lycra', label: 'LYCRA — intercreditor + recovery' },
      { to: '/memos/kirklands', label: "Kirkland's — creditor control" },
    ],
  },
  {
    id: 'rx-consulting',
    title: 'RX Consulting',
    tag: 'For A&M · AlixPartners · FTI',
    blurb:
      'Operator inside a distressed company. Thirteen-week cash flow, vendor terms, wind-down discipline.',
    pieces: [
      { to: '/casework/restoration', label: 'Restoration case — lived distress' },
      { to: '/memos/party-city', label: 'Party City — restructuring post-mortem' },
    ],
  },
  {
    id: 'credit',
    title: 'Credit / Direct Lending',
    tag: 'For credit funds, BDCs, direct lenders',
    blurb:
      'Signal construction, cycle calling, credit-document reading. Four decades of BAA10Y back-tested.',
    pieces: [
      { to: '/fulcrum-index', label: 'The Fulcrum Index — cycle signal' },
      { to: '/memos/kirklands', label: "Kirkland's — rescue-financing read" },
    ],
  },
  {
    id: 'pe-distressed',
    title: 'PE / Distressed',
    tag: 'For distressed credit, special sits, event-driven',
    blurb:
      'Positioning that was published before the trade, resolution-aware recovery analysis.',
    pieces: [
      { to: '/positions', label: 'Track Record — resolved + open' },
      { to: '/memos/lycra', label: 'LYCRA — recovery-based pricing' },
    ],
  },
  {
    id: 'strategy-ops',
    title: 'Strategy & Ops',
    tag: 'For strategy / corporate development',
    blurb:
      'Teaching + facilitating a live multi-firm restructuring simulation at the University of Mobile.',
    pieces: [
      { to: '/strategy?demo=1', label: 'Falcon Airways — live sim' },
      { to: '/memos', label: 'Asymmetric Restructuring Series' },
    ],
  },
];

const Index = () => {
  return (
    <PageLayout
      title="Zachary T. Smith"
      description="Independent credit research on distressed situations, restructuring, and special situations. Written to the standard of the Evercore / PJT / A&M desks I'm recruiting for."
    >
      <Helmet>
        <link rel="canonical" href={SITE_URL} />
      </Helmet>

      {/* ===============================================================
          Hero
          =============================================================== */}
      <section className="pt-6 pb-14" style={{ borderBottom: '1px solid var(--rule)' }}>
        <div
          className="t-kicker mb-5"
          style={{ color: 'var(--red)' }}
        >
          Independent credit research · Restructuring &amp; special situations
        </div>

        <h1
          className="t-hero m-0"
          style={{ fontSize: 'clamp(40px, 6vw, 56px)' }}
        >
          {AUTHOR_NAME}
        </h1>

        <p
          className="serif mt-5 mb-6"
          style={{
            fontSize: 'clamp(18px, 2vw, 22px)',
            lineHeight: 1.45,
            maxWidth: 720,
            color: 'var(--ink)',
          }}
        >
          Restructuring analyst candidate who has sat on the debtor's side of the table.
        </p>

        <p
          className="t-small sans"
          style={{
            color: 'var(--ink-muted)',
            marginBottom: 32,
            letterSpacing: '0.02em',
          }}
        >
          Finance, University of Mobile · Dec 2026
          <span style={{ color: 'var(--rule)', margin: '0 10px' }}>·</span>
          U.S. Army veteran
          <span style={{ color: 'var(--rule)', margin: '0 10px' }}>·</span>
          <a
            href={EMAIL_MAILTO}
            style={{ color: 'var(--ink-muted)' }}
            className="hover:underline"
          >
            {EMAIL}
          </a>
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button as="a" href={RESUME_PDF} download target="_blank" rel="noopener noreferrer">
            Download Resume
          </Button>
          <Button as="link" to="/memos/lycra" variant="secondary">
            Read the flagship memo — LYCRA →
          </Button>
          <Button
            as="a"
            href={LINKEDIN_URL}
            variant="text"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Button>
        </div>
      </section>

      {/* ===============================================================
          Pick your lens
          =============================================================== */}
      <section className="py-14" style={{ borderBottom: '1px solid var(--rule)' }}>
        <header className="mb-8">
          <div className="t-kicker" style={{ color: 'var(--red)' }}>
            Pick your lens
          </div>
          <h2 className="t-h2 mt-2 m-0">What are you hiring for?</h2>
          <p className="t-body mt-2 m-0" style={{ color: 'var(--ink-muted)', maxWidth: 640 }}>
            Each lens routes to the two proof pieces most relevant to that seat. Everything on
            this site is written to one of these.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LENSES.map((l) => (
            <LensCard key={l.id} lens={l} />
          ))}
        </div>
      </section>

      {/* ===============================================================
          Featured
          =============================================================== */}
      <section className="py-14" style={{ borderBottom: '1px solid var(--rule)' }}>
        <header className="mb-8">
          <div className="t-kicker" style={{ color: 'var(--red)' }}>Featured</div>
          <h2 className="t-h2 mt-2 m-0">What's live.</h2>
        </header>
        <div className="grid md:grid-cols-3 gap-5">
          <FeaturedTile
            kicker="Latest memo"
            title="The Shadow Partner"
            dek="Russia as the unpriced counterparty in the Iran conflict. Intelligence, oil arbitrage, attention capture — a $50-60B line item missing from the coalition's math."
            to="/memos/shadow-partner"
          />
          <FeaturedTile
            kicker="Fulcrum Index"
            title="Four decades of BAA10Y"
            dek="A composite credit signal calibrated against the full 1986–2026 BAA10Y history, with Brent + VIX overlays. Snapshot archived Apr 26, 2026."
            to="/fulcrum-index"
          />
          <FeaturedTile
            kicker="Track Record"
            title="Published before the trade"
            dek="Positions on Kalshi, each preceded by a timestamped memo. Open positions marked open; resolved marked with outcome. No fabricated results."
            to="/positions"
          />
        </div>
      </section>

      {/* ===============================================================
          Credibility strip
          =============================================================== */}
      <section className="py-10">
        <div
          className="t-kicker flex flex-wrap items-center gap-x-5 gap-y-2"
          style={{ color: 'var(--ink-muted)' }}
        >
          <span>U.S. Army veteran</span>
          <span style={{ color: 'var(--rule)' }} aria-hidden="true">·</span>
          <span>Founder &amp; operator — restoration company, wind-down 2024–25</span>
          <span style={{ color: 'var(--rule)' }} aria-hidden="true">·</span>
          <span>Research letter in continuous publication</span>
        </div>
      </section>

      {/* ===============================================================
          Anchor landing zones — kept for /#about and /#contact deep links.
          Full pages live at /#/about and /#/contact.
          =============================================================== */}
      <section
        id="about"
        className="py-10"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <div className="t-kicker" style={{ color: 'var(--red)' }}>About</div>
        <h2 className="t-h2 mt-2 m-0">The short version.</h2>
        <p className="t-body mt-3" style={{ color: 'var(--ink-muted)', maxWidth: 640 }}>
          After the Army and a run through IB / PE / S&amp;T programs that COVID froze in 2020,
          I built a restoration company, raised $300K, scaled from $0 to $100K monthly revenue in
          5 months, hit a 90–120 day insurance-collection crunch, and spent 18 months inside the
          workout. The lessons there run every memo and every position on this site.
        </p>
        <div className="mt-5">
          <Link
            to="/about"
            className="t-kicker"
            style={{ color: 'var(--ink)' }}
          >
            Full story →
          </Link>
        </div>
      </section>

      <section
        id="contact"
        className="py-10"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <div className="t-kicker" style={{ color: 'var(--red)' }}>Contact</div>
        <h2 className="t-h2 mt-2 m-0">The fastest way is email.</h2>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button as="a" href={EMAIL_MAILTO}>
            {EMAIL}
          </Button>
          <Button
            as="a"
            href={LINKEDIN_URL}
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Button>
          <Button as="link" to="/contact" variant="text">
            Full contact page →
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

const LensCard = ({ lens }: { lens: Lens }) => (
  <article
    className="p-6 flex flex-col h-full"
    style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)' }}
  >
    <div className="mb-3">
      <TagChip>{lens.tag}</TagChip>
    </div>
    <h3 className="t-h3 m-0">{lens.title}</h3>
    <p className="t-body mt-2 flex-1" style={{ color: 'var(--ink-muted)' }}>
      {lens.blurb}
    </p>
    <ul className="mt-4 space-y-2">
      {lens.pieces.map((p) => (
        <li key={p.to}>
          <Link
            to={p.to}
            className="t-small sans"
            style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            {p.label}
          </Link>
        </li>
      ))}
    </ul>
  </article>
);

const FeaturedTile = ({
  kicker,
  title,
  dek,
  to,
}: {
  kicker: string;
  title: string;
  dek: string;
  to: string;
}) => (
  <Link
    to={to}
    className="block p-6 h-full flex flex-col hover:opacity-90 transition-opacity"
    style={{ background: 'var(--paper-raised)', border: '1px solid var(--rule)', color: 'var(--ink)' }}
  >
    <div className="t-kicker" style={{ color: 'var(--red)' }}>{kicker}</div>
    <h3 className="t-h4 mt-2 m-0">{title}</h3>
    <p className="t-small serif mt-2 flex-1" style={{ color: 'var(--ink-muted)' }}>
      {dek}
    </p>
    <div className="t-kicker mt-4" style={{ color: 'var(--ink)' }}>Read →</div>
  </Link>
);

export default Index;
