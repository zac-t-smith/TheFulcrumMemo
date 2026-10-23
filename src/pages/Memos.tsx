import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/PageLayout';
import { PageHeader, SeriesCard, MemoCard } from '@/components/system';

/**
 * /memos (aliased at /research) — Research hub.
 * Phase 2 rebuild: two SeriesCard groups, one MemoCard per piece.
 * Everything token-driven, hairline-rule editorial look.
 */

type Memo = {
  slug: string;
  path: string;
  title: string;
  dek: string;
  date: string;
  readingTime?: string;
  tags: string[];
};

// The Asymmetric Restructuring Series — macro / sovereign distress arc.
const asymmetricSeries: Memo[] = [
  {
    slug: 'iran',
    path: '/memos/iran',
    title: 'The Asymmetric Restructuring of the Middle East',
    dek: "How Iran's infrastructure-targeting strategy exploits asymmetric cost dynamics to achieve leverage no conventional military campaign could deliver.",
    date: 'Mar 2026',
    readingTime: '28 min read',
    tags: ['Sovereign distress', 'Geopolitical strategy'],
  },
  {
    slug: 'iran-part-ii',
    path: '/memos/iran-part-ii',
    title: 'Second-Order Effects: Political Timeline, Sector Repricing, and the Coming Restructuring Cycle',
    dek: 'How the Iran conflict cascades from sovereign crisis to domestic political constraint to sector-level credit stress — and why the next 24 months will produce the largest restructuring cycle since 2008.',
    date: 'Mar 2026',
    readingTime: '24 min read',
    tags: ['Political economy', 'Credit cycle', 'Macro'],
  },
  {
    slug: 'iran-part-iii',
    path: '/memos/iran-part-iii',
    title: 'The Trojan Horse: The Largest Distressed Asset Play in History',
    dek: 'How the sequencing of Venezuela, tariffs, and Iran describes the construction of structural energy and trade dominance — a sovereign-level distressed asset play reframing the entire conflict.',
    date: 'Apr 2026',
    readingTime: '32 min read',
    tags: ['Geopolitical strategy', 'Sovereign distress', 'Energy'],
  },
  {
    slug: 'shadow-partner',
    path: '/memos/shadow-partner',
    title: 'The Shadow Partner: Russia as Unpriced Counterparty',
    dek: "How Russia's intelligence sharing, oil arbitrage, and attention capture make it the largest unacknowledged beneficiary of the Iran conflict.",
    date: 'Apr 2026',
    readingTime: '18 min read',
    tags: ['Addendum', 'Game theory', 'Energy'],
  },
];

// Single-company credit memos — the proof-of-work set.
const singleCompanyMemos: Memo[] = [
  {
    slug: 'kirklands',
    path: '/memos/kirklands',
    title: "Kirkland's — When Your White Knight Is Actually a Vulture",
    dek: 'The Beyond Inc. takeover demonstrates how creditor-friendly financing can achieve effective control without triggering takeover regulations.',
    date: 'Oct 2025',
    readingTime: '14 min read',
    tags: ['Corporate RX', 'Retail', 'Creditor control'],
  },
  {
    slug: 'lycra',
    path: '/memos/lycra',
    title: 'The LYCRA Company — Intercreditor Priority and Recovery Waterfall',
    dek: 'Specialty fiber manufacturer under capital structure pressure. Liability management, lender tiering, and recovery analysis.',
    date: '2025',
    readingTime: '16 min read',
    tags: ['Corporate RX', 'Liability management', 'Chemicals'],
  },
  {
    slug: 'party-city',
    path: '/memos/party-city',
    title: 'Party City — Anatomy of a Retail Liquidation',
    dek: 'Post-mortem through the secular retail decline, overleveraged balance sheet, and COVID-accelerated consumer shift. Recovery analysis across the capital structure.',
    date: '2025',
    readingTime: '12 min read',
    tags: ['Corporate RX', 'Retail', 'Post-mortem'],
  },
];

const MemosPage = () => {
  return (
    <PageLayout
      title="Research"
      description="Long-form credit, restructuring, and macro research. Memos on distressed situations, intercreditor priority, and sovereign-level asset plays."
    >
      <Helmet>
        <link rel="canonical" href="https://zac-t-smith.github.io/TheFulcrumMemo/#/memos" />
      </Helmet>

      <PageHeader
        kicker="Research"
        title="Memos"
        dek="Long-form theses on distressed credit, intercreditor priority, and sovereign-level restructuring. Each piece is written to the standard of the hiring desks I'm targeting."
      />

      <SeriesCard
        kicker="Series"
        title="Asymmetric Restructuring"
        dek="A four-part arc that applies restructuring frameworks to the 2026 Iran conflict — sovereign distress, political timeline, and the structural trade behind the shock. Series archived; data as of Apr 26, 2026."
      >
        {asymmetricSeries.map((m) => (
          <MemoCard
            key={m.slug}
            to={m.path}
            kicker="Asymmetric restructuring"
            title={m.title}
            dek={m.dek}
            date={m.date}
            readingTime={m.readingTime}
            tags={m.tags}
          />
        ))}
      </SeriesCard>

      <SeriesCard
        kicker="Single-company credit"
        title="Credit memos"
        dek="Deep-dive theses on individual distressed credits — the proof-of-work set."
      >
        {singleCompanyMemos.map((m) => (
          <MemoCard
            key={m.slug}
            to={m.path}
            kicker="Credit memo"
            title={m.title}
            dek={m.dek}
            date={m.date}
            readingTime={m.readingTime}
            tags={m.tags}
          />
        ))}
      </SeriesCard>
    </PageLayout>
  );
};

export default MemosPage;
