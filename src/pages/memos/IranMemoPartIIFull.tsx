import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ReadingProgress,
  TableOfContents,
  PullQuote,
  Callout,
  GlossaryTooltip,
  DataBadge,
  ShareButtons,
  TOCItem,
} from '@/components/iran';
import {
  CreditSpreadChart,
  MacroTransmissionFlow,
  SectorVulnerabilityChart,
} from '@/components/iran/charts';
import { creditMarketData, conflictMetadata, formatShortDate } from '@/data/iranConflictData';
import { generateMemoPdf } from '@/lib/generatePdf';

const tocItems: TOCItem[] = [
  { id: 'political-timeline', title: 'I. The Political Timeline', level: 1 },
  { id: '2028-landscape', title: 'II. 2028 Presidential Landscape', level: 1 },
  { id: 'macro-transmission', title: 'III. Macro Transmission Mechanism', level: 1 },
  { id: 'sector-impact', title: 'IV. Sector-Level Impact', level: 1 },
  { id: 'restructuring-thesis', title: 'V. Restructuring Cycle Thesis', level: 1 },
  { id: 'larijani-signal', title: 'VI. The Larijani Signal', level: 1 },
  { id: 'conclusion', title: 'VII. Conclusion', level: 1 },
];

const IranMemoPartIIFull = () => {
  const contentRef = useRef<HTMLElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateMemoPdf(contentRef.current, {
        title: 'Second-Order Effects: Sector Repricing & The Coming Restructuring Cycle',
        filename: 'The_Iran_Trap_Part_II_Fulcrum_Memo.pdf',
        headerText: 'Zachary Smith | The Fulcrum Memo | March 2026',
        footerText: 'The Fulcrum Memo | thefulcrummemo.com | © 2026 Zachary Smith',
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Second-Order Effects: Sector Repricing & The Coming Restructuring Cycle | The Fulcrum Memo</title>
        <meta
          name="description"
          content="How the Iran conflict cascades from sovereign crisis to domestic political constraint to sector-level credit stress — and why the next 12-18 months will produce the largest restructuring cycle since 2008."
        />
        <meta property="og:title" content="Second-Order Effects: The Coming Restructuring Cycle" />
        <meta property="og:description" content="How the Iran conflict cascades to sector-level credit stress and why the next 12-18 months will produce the largest restructuring cycle since 2008." />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <ReadingProgress />

      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="memo-page-wrapper">
          <TableOfContents items={tocItems} />

          <article ref={contentRef} className="memo-article">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Phase A: back link removed; global nav handles it */}
          </motion.div>

          {/* Series Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="surface-elevated border border-primary/30 p-4 mb-8 flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <p className="text-primary text-[10px] tracking-wider uppercase mb-1">
                The Iran Trap — Asymmetric Restructuring Series
              </p>
              <p className="text-muted-foreground text-sm">Part II of III</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/memos/iran"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                Part I
              </Link>
              <Link
                to="/memos/iran-part-iii"
                className="flex items-center gap-2 text-primary hover:text-foreground transition-colors text-sm group"
              >
                Part III
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <p className="text-primary text-[10px] tracking-[0.2em] uppercase mb-2">
              The Fulcrum Memo
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="tag-pill">Political Economy</span>
              <span className="tag-pill">Credit Cycle</span>
              <span className="tag-pill">Macro</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Second-Order Effects: Sector Repricing & The Coming Restructuring Cycle
            </h1>
            <p className="text-muted-foreground text-base italic mb-6 leading-relaxed">
              How the Iran conflict cascades from sovereign crisis to domestic political constraint
              to sector-level credit stress — and why the next 12-18 months will produce the largest
              restructuring cycle since 2008
            </p>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
              <span>March 2026</span>
              <span className="text-primary">|</span>
              <span>Zachary Smith</span>
              <span className="text-primary">|</span>
              <DataBadge status="confirmed" date={formatShortDate(conflictMetadata.lastUpdated)} />
            </div>
            <div className="mt-4">
              <ShareButtons
                title="Second-Order Effects: The Coming Restructuring Cycle"
                text="How the Iran conflict cascades to the largest restructuring cycle since 2008. Credit market setup, sector analysis, and investment thesis."
              />
            </div>
          </motion.header>

          <div className="gold-line mb-8" />

          {/* Series Context */}
          <Callout variant="info" title="Series Context">
            This memo is Part II of the Asymmetric Restructuring series. Part I (
            <Link to="/memos/iran" className="text-primary hover:underline">
              The Asymmetric Restructuring of the Middle East
            </Link>
            ) analyzed the conflict itself—Iran's leverage position, asymmetric cost dynamics, and
            recovery scenarios. This memo answers the next question:{' '}
            <strong className="text-foreground">
              what does this mean for capital allocation, credit cycles, and sector positioning over
              the next 2–5 years?
            </strong>{' '}
            Part I is strategic analysis. Part II is investment analysis.
          </Callout>

          {/* Lead Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="memo-body text-zinc-200 text-lg leading-relaxed mb-8"
          >
            The 2026 Iran conflict is not a contained military event. It is a macro transmission
            mechanism—a sovereign shock that propagates through energy markets, consumer prices,
            corporate margins, and credit spreads in a predictable sequence. The analysis below maps
            that cascade from its origin (Strait of Hormuz closure) through its political forcing
            function (U.S. election cycle constraints) to its terminal destination: a distressed
            credit cycle that will reshape the restructuring industry for the next half-decade.
          </motion.p>

          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="surface-elevated border-l-2 border-primary p-6 mb-8"
          >
            <h3 className="text-primary text-[10px] uppercase tracking-wider mb-4">
              Executive Summary
            </h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Political timeline is asymmetric:</strong>{' '}
                  Iran's interim council has no election cycle. Trump faces midterms in 8 months
                  with rising gas prices, U.S. casualties, and an unauthorized war. Every available
                  exit carries political cost.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Market impact accelerating:</strong> Brent
                  crude surged to $83.58 (+7.5%) on March 3. S&P 500 fell 2.34%. KOSPI crashed 7.2%.
                  VIX spiked to 25.40.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Credit cycle catalyst identified:</strong>{' '}
                  <GlossaryTooltip term="hyspread">HY spreads</GlossaryTooltip> entered the conflict
                  at historic lows (~281 bps vs. 525 bps 30-year average). Oil shock + inflation +
                  consumer compression = the trigger that moves overleveraged sectors from "stressed"
                  to "distressed."
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Restructuring cycle thesis:</strong>{' '}
                  War-triggered economic slowdown + supply chain disruption + compressed margins +{' '}
                  <GlossaryTooltip term="refinancingwall">refinancing wall</GlossaryTooltip> = more
                  distressed advisory work than at any point since 2008–2009.
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Section I: Political Timeline */}
          <section id="political-timeline" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              I. The Political Timeline: The Ultimate Asymmetry
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                Part I identified a cost asymmetry in the conflict—Iran imposes $11 in defensive
                cost for every $1 spent on offense. But there is a more fundamental asymmetry that
                makes the base case (protracted attrition) nearly inevitable: the political clock.
              </p>
              <p>
                Iran's interim leadership council does not face voters. Ali Larijani does not have
                a midterm. The <GlossaryTooltip term="irgc">IRGC</GlossaryTooltip> does not
                poll-test its strategy. They can sustain this posture indefinitely. Trump's clock
                is ticking. And every day that passes, the political cost of every available option
                increases.
              </p>
            </motion.div>

            <PullQuote>
              "Democratic leaders have time horizons dictated by election cycles. Authoritarian
              leaders don't. Iran can wait. Trump's clock is ticking. That's the ultimate
              asymmetry."
            </PullQuote>

            {/* Strategic Box: Four Doors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8"
            >
              <h4 className="text-lg font-semibold text-foreground mb-4">
                The Strategic Box: Four Doors, All Bad
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    number: 1,
                    title: 'Escalate: Commit Ground Troops',
                    content:
                      'American appetite for a ground war is essentially zero after Iraq and Afghanistan. Ground troops mean casualties at scale. Political poison heading into midterms.',
                    outcome: 'Worse version of Bush\'s 2006 midterm wipeout',
                  },
                  {
                    number: 2,
                    title: 'Sustain Air Campaign: Wait Iran Out',
                    content:
                      "But wait for what? Iran's burn rate is negligible compared to the economic damage it imposes. Every week the Strait stays contested, gas prices tick up.",
                    outcome: 'Slow bleeding',
                  },
                  {
                    number: 3,
                    title: 'Negotiate: Give Iran What It Wants',
                    content:
                      'Comprehensive sanctions relief and security guarantees. This hands Democrats the greatest attack ad in modern political history.',
                    outcome: 'Destroys his political brand',
                  },
                  {
                    number: 4,
                    title: 'Declare Victory and Leave',
                    content:
                      'Iran is actively denying this exit by continuing to shoot. You cannot hold a victory press conference while missiles are hitting U.S. bases.',
                    outcome: 'Iran controls the narrative',
                  },
                ].map((door) => (
                  <motion.div
                    key={door.number}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                        {door.number}
                      </span>
                      <h5 className="text-sm font-semibold text-foreground">
                        {door.title}
                      </h5>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{door.content}</p>
                    <p className="text-[10px] text-red-400">
                      Outcome: {door.outcome}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Section II: 2028 Landscape */}
          <section id="2028-landscape" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              II. The 2028 Presidential Landscape: Policy Regime Shift
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              If the conflict drags through summer—our base case—a Democratic trifecta in 2028
              becomes the most probable political outcome. The war gives Democrats a unifying issue
              (economic pain from unauthorized conflict), depresses Republican turnout in 2026
              midterms, and positions the eventual Democratic nominee to run on the most potent
              combination in American politics: anti-war economics.
            </motion.p>

            <Callout variant="insight" title="Investment Implication">
              The longer the Iran conflict persists, the less the Democratic primary fragmentation
              matters. Nobody debates foreign policy nuance when they're paying $5.50 for gas. The
              kitchen-table math overrides ideology and unifies opposition in a way that policy
              platforms cannot.
            </Callout>
          </section>

          {/* Section III: Macro Transmission */}
          <section id="macro-transmission" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              III. The Macro Transmission Mechanism
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              A sovereign conflict becomes a credit cycle catalyst through a predictable
              transmission chain. Each link is now active.
            </motion.p>

            <MacroTransmissionFlow />

            <CreditSpreadChart />

            <PullQuote>
              "Credit spreads at historic lows + oil shock + refinancing wall + compressed margins =
              the largest involuntary restructuring cycle since 2008. The work is coming."
            </PullQuote>
          </section>

          {/* Section IV: Sector Impact */}
          <section id="sector-impact" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              IV. Sector-Level Impact Analysis
            </motion.h2>

            {/* Market Response Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8 overflow-x-auto"
            >
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Immediate Market Response (Day 1-4)
              </h4>
              <table className="w-full border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      Index / Asset
                    </th>
                    <th className="p-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      Move (Mar 3)
                    </th>
                    <th className="p-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      Signal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { index: 'S&P 500', move: '-2.34%', signal: 'Broad risk-off', color: 'red' },
                    { index: 'Nikkei 225', move: '-6.65%', signal: 'Japan: Hormuz-dependent', color: 'red' },
                    { index: 'South Korea KOSPI', move: '-7.2%', signal: 'Largest single-day drop', color: 'red' },
                    { index: 'Brent Crude', move: '+7.5%', signal: 'Analysts project $100-$120', color: 'green' },
                    { index: 'Gold', move: '$5,041-$5,317/oz', signal: 'Haven bid', color: 'green' },
                    { index: 'VIX', move: '25.40 (+17%)', signal: 'Fear spike, not crisis levels', color: 'amber' },
                  ].map((row) => (
                    <tr key={row.index} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3 text-xs text-foreground font-semibold">
                        {row.index}
                      </td>
                      <td className={`p-3 text-xs font-semibold text-${row.color}-400`}>
                        {row.move}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{row.signal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <SectorVulnerabilityChart />
          </section>

          {/* Section V: Restructuring Thesis */}
          <section id="restructuring-thesis" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              V. The Restructuring Cycle Thesis
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-6"
            >
              This is where the analysis converges into a single investment thesis: the Iran
              conflict is the catalyst that tips the credit cycle from late-stage to distressed.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              The ingredients were already in place before a single missile was fired.{' '}
              <GlossaryTooltip term="hyspread">High-yield spreads</GlossaryTooltip> at historic
              lows. A growing population of{' '}
              <GlossaryTooltip term="zombiecompany">zombie companies</GlossaryTooltip> dependent on
              low rates. A <GlossaryTooltip term="refinancingwall">maturity wall</GlossaryTooltip>{' '}
              in 2026–2027. Leveraged loan default rates already elevated at 7.5%. The Iran
              conflict adds the accelerant: an energy shock that compresses margins, inflates input
              costs, constrains the Fed, and depletes consumer spending simultaneously.
            </motion.p>

            <Callout variant="thesis" title="Sectors Most Likely to Generate Restructuring Mandates (2026-2028)">
              <ul className="space-y-2 mt-2">
                <li>
                  <strong className="text-foreground">Retail:</strong> Already distressed subsectors
                  face accelerating consumer pullback as gas absorbs disposable income.
                </li>
                <li>
                  <strong className="text-foreground">Commercial Real Estate:</strong> Office, mall,
                  and hotel properties under pressure. Oil-driven inflation removes the Fed rate cut
                  lifeline.
                </li>
                <li>
                  <strong className="text-foreground">Airlines and Travel:</strong> Fuel cost spikes
                  compound post-pandemic leverage. Near-term maturities become restructuring
                  candidates.
                </li>
                <li>
                  <strong className="text-foreground">Speculative Tech:</strong> Pre-revenue
                  companies burning cash faster than they can raise it. Higher rates + risk-off =
                  dried-up funding.
                </li>
              </ul>
            </Callout>
          </section>

          {/* Section VI: Larijani Signal */}
          <section id="larijani-signal" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              VI. The Larijani Signal: Why the Base Case Is Holding
            </motion.h2>

            <Callout variant="critical" title="UPDATE: Larijani Killed — Day 18 (March 17, 2026)">
              Ali Larijani was killed in strikes on Day 18. He was the most credible negotiation
              partner remaining on the Iranian side — the pragmatic senior official who advanced
              the JCPOA in 2015 and was de facto leader after Khamenei's death. His death
              eliminates the diplomatic off-ramp entirely. Combined with Mojtaba Khamenei's
              hardline stance and Araghchi's explicit rejection of all negotiation, there is now
              literally no one authorized to negotiate a deal on the Iranian side. The analysis
              below, written before his death, explains why his refusal to negotiate was the
              critical signal. His elimination makes that signal permanent.
            </Callout>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                The single most important data point in this conflict is not a missile launch or a
                market move. It is Ali Larijani going on social media and stating, publicly, while
                his country is being bombed across 153 cities:{' '}
                <span className="text-primary font-semibold">
                  "We will not negotiate with the United States."
                </span>
              </p>
              <p>
                When a country loses its Supreme Leader, defense minister, chief of staff, and 40+
                senior officials in 72 hours, the normal response is panic. Back-channel ceasefire
                feelers. Every playbook from the last 50 years says the weaker party seeks an
                off-ramp. Larijani said no. Publicly. While being bombed. That is not bravado—that
                is a man who has done the math and knows he is holding the better hand.
              </p>
            </motion.div>

            <Callout variant="critical" title="The Investment Implication of Larijani's Death">
              If Iran cannot negotiate (because the person with authority to do so is dead), the
              conflict extends. If the conflict extends, oil stays elevated. If oil stays elevated,
              consumer spending compresses. If consumer spending compresses while the refinancing
              wall hits, defaults accelerate. If defaults accelerate with credit spreads at
              historic lows, spread widening is violent and sudden. Every link in this chain is
              now active. Larijani's death — combined with the Ras Laffan structural damage (5
              years to repair) — transforms the "protracted attrition" vs "full escalation"
              distinction into an academic question. The damage is already done and will outlast
              the war itself. <strong className="text-primary">Day 26 Update:</strong> Restructuring
              cycle timeline now revised to 12-15 months given structural damage acceleration from
              Hormuz sovereignty legislation and Iraq escalation adding new destabilization vectors.
            </Callout>
          </section>

          {/* Section VII: Conclusion */}
          <section id="conclusion" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              VII. Conclusion: Positioning for the Cycle
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              The Iran conflict is not a one-week market event to be faded on a dip-buy. It is a
              structural catalyst that exposes vulnerabilities building for years—tight spreads,
              zombie companies, a maturity wall, and consumer balance sheets already stretched by
              post-pandemic inflation. The war did not create these vulnerabilities. It activated
              them.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              Day 26 delivers the answer to Day 25's diplomatic hopes: Iran REJECTS the US 15-point
              plan and issues 5 counter-conditions including war reparations, protection of all proxy
              groups, and — critically — recognition of Iran's sovereignty over the Strait of Hormuz.
              These are maximalist demands, not final terms. But they confirm the base case: Protracted
              Attrition, now at 55%. Markets yo-yo on conflicting signals, oil hovering around $100.
            </motion.p>

            <Callout variant="critical" title="Day 26 Update: New Macro Transmission Vectors">
              <p>
                <strong className="text-primary">Iraq Escalation:</strong> Iraqi PM gave Iran-backed PMF
                "green light for self-defense" against US strikes after 7 Iraqi soldiers were killed in
                Anbar Province. Iraq summoned the US diplomat and filed a formal breach of international
                law complaint. The PMF is officially part of the Iraqi army. If Iraq formally opposes US
                military operations, the legal basis for 20+ years of US presence in Iraq collapses. This
                destabilizes the entire Gulf security architecture — a new transmission vector for
                geopolitical risk into markets.
              </p>
              <p className="mt-3">
                <strong className="text-primary">Food Security Dimension Expanding:</strong> 50% of global
                urea and sulfur exports remain disrupted. Sri Lanka cutting energy consumption 25%. China
                subsidizing gas prices. The global demand destruction your thesis predicted is now visible
                in peripheral economies before it hits developed markets. The macro transmission chain now
                extends from oil prices → consumer spending → food inflation → emerging market instability.
              </p>
              <p className="mt-3">
                <strong className="text-primary">Revised Timeline:</strong> Original estimate was 24 months.
                Day 15 revised to 12-18 months. Current assessment: <span className="text-primary">12-15 months</span>{' '}
                given structural damage acceleration. Iran's Hormuz sovereignty legislation (if passed) adds
                permanent uncertainty premium to all Gulf transit — this is structural, not cyclical.
              </p>
            </Callout>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              The IEA calls this the "greatest global energy and food security challenge in history."
              Even a successful ceasefire tomorrow won't instantly reopen Hormuz (mines need clearing,
              and now Iran is codifying sovereignty), won't repair Ras Laffan (5 years), won't unwind
              the maritime insurance repricing. Fed rate cuts remain priced out to 2027-2028.
              The restructuring cycle thesis holds regardless of diplomatic outcome.
            </motion.p>

            <PullQuote>
              "The first memo identified who holds leverage in the sovereign crisis. This one
              identifies who makes money from the fallout. The answer is restructuring."
            </PullQuote>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body"
            >
              The restructuring industry is about to enter its most productive period in nearly two
              decades. Firms like Evercore, Alvarez & Marsal, Lazard, and Houlihan Lokey will have
              more mandates than capacity. The coming restructuring cycle is not a risk. For those
              positioned to do the work, it is the opportunity of a generation.
            </motion.p>
          </section>

          {/* Phase A: entire Download CTA block hidden until Phase 5 pipeline */}

          {/* Series Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="memo-series-nav surface-card"
          >
            <h3 className="text-foreground font-semibold mb-4">
              The Iran Trap — Asymmetric Restructuring Series
            </h3>
            <div className="space-y-3">
              <Link
                to="/memos/iran"
                className="flex items-center justify-between p-3 border border-border hover:border-primary/50 transition-colors group"
              >
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                    Part I
                  </p>
                  <p className="text-foreground text-sm group-hover:text-primary transition-colors">
                    The Asymmetric Restructuring of the Middle East
                  </p>
                </div>
                <ArrowLeft size={16} className="text-primary" />
              </Link>
              <div className="flex items-center justify-between p-3 border-2 border-primary bg-primary/5">
                <div>
                  <p className="text-primary text-[10px] uppercase tracking-wider mb-1">
                    Part II - You are here
                  </p>
                  <p className="text-foreground text-sm">
                    Second-Order Effects: Sector Repricing & The Coming Restructuring Cycle
                  </p>
                </div>
              </div>
              <Link
                to="/memos/iran-part-iii"
                className="flex items-center justify-between p-3 border border-border hover:border-primary/50 transition-colors group"
              >
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                    Part III
                  </p>
                  <p className="text-foreground text-sm group-hover:text-primary transition-colors">
                    The Trojan Horse: The Largest Distressed Asset Play in History
                  </p>
                </div>
                <ArrowRight size={16} className="text-primary" />
              </Link>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-border"
          >
            <div className="text-muted-foreground text-sm mb-4">
              <p className="font-semibold text-foreground mb-2">About the Author</p>
              <p className="text-xs leading-relaxed mb-4">
                Zachary Smith is a U.S. Army veteran (4th Infantry Division, 2013-2017) who founded
                and scaled Best Option Restoration to $100K monthly revenue before navigating a
                19-month creditor negotiation and controlled liquidation—firsthand experience that
                became his MBA in distressed credit. Currently finishing his finance degree at
                University of Mobile (3.71 GPA, graduating December 2026), he targets restructuring
                analyst positions at firms like Evercore, Alvarez & Marsal, and Lazard.
              </p>
              <p className="font-semibold text-foreground mb-2">Contact</p>
              <p>Zachary Smith | zac.ty.smith@gmail.com</p>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              <strong>Disclaimer:</strong> This analysis is for educational purposes only and does
              not constitute investment advice. Political predictions and sector assessments
              represent the author's analysis of probable outcomes, not certainties. Data reflects
              publicly available sources as of March 3, 2026.
            </p>
          </motion.footer>
        </article>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default IranMemoPartIIFull;
