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
  SequenceTimeline,
  VenezuelaTombstone,
  AlliedDependencyMatrix,
  OilPriceEventChart,
  InversionFeedbackLoop,
  ReliefValveFlow,
  ConflictTimeline,
} from '@/components/iran/charts';
import { conflictMetadata, formatShortDate, formatFullDate } from '@/data/iranConflictData';
import { getLatestOilPrice, EIA_SOURCE_ATTRIBUTION } from '@/data/oilPriceData';
import { generateMemoPdf } from '@/lib/generatePdf';

const tocItems: TOCItem[] = [
  { id: 'setup', title: 'The Setup Nobody Priced', level: 1 },
  { id: 'layer-1-venezuela', title: 'Layer 1: Venezuela Acquisition', level: 1 },
  { id: 'layer-2-tariffs', title: 'Layer 2: Tariff Pre-Positioning', level: 1 },
  { id: 'layer-3-detonation', title: 'Layer 3: Operation Epic Fury', level: 1 },
  { id: 'layer-4-inversion', title: 'Layer 4: The Inversion', level: 1 },
  { id: 'layer-5-endgame', title: 'Layer 5: The Endgame', level: 1 },
  { id: 'intentionality', title: 'The Intentionality Question', level: 1 },
  { id: 'positioning', title: 'Positioning Implications', level: 1 },
  { id: 'caveats', title: 'Caveats', level: 1 },
];

const IranMemoPartIIIFull = () => {
  const contentRef = useRef<HTMLElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const latestOilPrice = getLatestOilPrice();

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateMemoPdf(contentRef.current, {
        title: 'The Trojan Horse: The Largest Distressed Asset Play in History',
        filename: 'The_Iran_Trap_Part_III_Fulcrum_Memo.pdf',
        headerText: 'Zachary Smith | The Fulcrum Memo | April 2026',
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
        <title>The Trojan Horse: The Largest Distressed Asset Play in History | The Fulcrum Memo</title>
        <meta
          name="description"
          content="How the sequencing of Venezuela, tariffs, and Iran describes the construction of structural energy and trade dominance — a sovereign-level distressed asset play reframing the entire conflict."
        />
        <meta property="og:title" content="The Trojan Horse: The Largest Distressed Asset Play in History" />
        <meta property="og:description" content="How the sequencing of Venezuela, tariffs, and Iran describes the construction of structural energy and trade dominance — a sovereign-level distressed asset play." />
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
              <p className="text-muted-foreground text-sm">Part III of III</p>
            </div>
            <Link
              to="/memos/iran-part-ii"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
              Read Part II
            </Link>
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
              <span className="tag-pill">Geopolitical Strategy</span>
              <span className="tag-pill">Sovereign Distress</span>
              <span className="tag-pill">Energy & Commodities</span>
              <span className="tag-pill">Macro</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              The Trojan Horse: The Largest Distressed Asset Play in History
            </h1>
            <p className="text-muted-foreground text-base italic mb-6 leading-relaxed">
              How the sequencing of Venezuela, tariffs, and Iran describes the construction of
              structural energy and trade dominance — a sovereign-level distressed asset play
              reframing the entire conflict
            </p>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
              <span>April 2026</span>
              <span className="text-primary">|</span>
              <span>Zachary Smith</span>
              <span className="text-primary">|</span>
              <DataBadge status="confirmed" date={formatShortDate(conflictMetadata.lastUpdated)} />
            </div>
            <div className="mt-4">
              <ShareButtons
                title="The Trojan Horse: The Largest Distressed Asset Play in History"
                text="How the sequencing of Venezuela, tariffs, and Iran describes the construction of structural energy and trade dominance."
              />
            </div>
          </motion.header>

          <div className="gold-line mb-8" />

          {/* Series Context */}
          <Callout variant="info" title="Series Context">
            This is the third installment of The Fulcrum Memo's analysis of the 2026 Iran conflict. Part I (
            <Link to="/memos/iran" className="text-primary hover:underline">
              The Asymmetric Restructuring of the Middle East
            </Link>
            ) treated Iran as a distressed debtor leveraging Hormuz as its only negotiating asset. Part II (
            <Link to="/memos/iran-part-ii" className="text-primary hover:underline">
              Second-Order Effects
            </Link>
            ) mapped the macro transmission chain from supply shock to restructuring cycle.{' '}
            <strong className="text-foreground">Part III inverts both.</strong>
          </Callout>

          {/* Lead Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="memo-body text-zinc-200 text-lg leading-relaxed mb-8"
          >
            What follows is a framework — not a conspiracy theory. The distinction matters. Pattern
            recognition applied to observable policy sequencing is how credit analysts operate. We
            don't need to know what was on the whiteboard. We need to know what the capital structure
            looks like when the dust settles.
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
                  <strong className="text-foreground">Venezuela acquisition:</strong> 303 billion
                  barrels of proven reserves acquired at ~$60 Brent, with U.S. operational control
                  via DIP-style cash flow management. Zero financial cost.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Tariff pre-positioning:</strong> Every major
                  energy-importing ally was mid-tariff-negotiation when Hormuz closed — EU at 15%,
                  Japan at 15%, South Korea escalated to 25%, India at 18%.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Hormuz closure impact:</strong> ~16 million
                  bpd offline (80% decline from 20M average). Brent from $71 to ${latestOilPrice.brentSpot.toFixed(2)}.
                  Dated Brent hit $141 on April 2.{' '}
                  <span className="text-muted-foreground/70 text-[10px]">({EIA_SOURCE_ATTRIBUTION})</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">The inversion:</strong> Iran isn't playing
                  offense — it's performing a function in someone else's financial architecture.
                  Every Iranian retaliation deepens the crisis that makes U.S.-controlled supply
                  more valuable.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Endgame:</strong> The U.S. controls the only
                  major relief valve (Venezuelan + domestic production) while holding tariff
                  leverage over every energy-desperate ally.
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Section: The Setup */}
          <section id="setup" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              The Setup Nobody Priced
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                In restructuring, the most dangerous counterparty isn't the one screaming across the
                table. It's the one who bought your debt at 40 cents three months before the filing —
                the one who already owns the{' '}
                <GlossaryTooltip term="fulcrumsecurity">fulcrum security</GlossaryTooltip> before you
                knew you were distressed.
              </p>
              <p>
                That's the frame for everything that follows.
              </p>
              <p>
                Between January and February 2026, three apparently disconnected policy actions
                occurred in rapid sequence. Viewed independently, each had its own logic. Viewed
                together, they describe something else entirely: the sequential construction of a
                leverage architecture that positioned the United States as the sole relief valve in
                a global energy crisis it helped create — while simultaneously holding tariff leverage
                over every major energy-importing ally forced to negotiate from desperation.
              </p>
            </motion.div>

            <PullQuote>
              "If this was planned, it's the most sophisticated sovereign-level distressed asset play
              ever executed. If it wasn't — if the pieces simply fell into place through opportunistic
              improvisation — the structural outcome is identical."
            </PullQuote>

            {/* Sequence Timeline Chart */}
            <SequenceTimeline className="my-8" />

            {/* Interactive Conflict Timeline (Compact) */}
            <ConflictTimeline mode="compact" className="my-8" />
          </section>

          {/* Section: Layer 1 - Venezuela */}
          <section id="layer-1-venezuela" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              Layer 1: The Acquisition — Venezuela at Distressed Basis
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                <strong className="text-foreground">January 3, 2026.</strong> U.S. special forces
                launched Operation Absolute Resolve. Nicolás Maduro was seized from Caracas overnight.
                Within 72 hours, President Trump announced the United States would take operational
                control of Venezuela's oil sector — the largest proven crude reserves on the planet
                at 303 billion barrels.
              </p>
              <p>
                <strong className="text-primary">The timing is everything.</strong>
              </p>
              <p>
                Brent crude was trading around $60 per barrel. The global oil market was oversupplied —
                the IEA had projected supply exceeding demand by as much as 2 million barrels per day
                in 2026. OPEC+ was unwinding voluntary cuts. The market narrative was bearish. Nobody
                was bidding up distressed sovereign oil assets in January because nobody needed to.
              </p>
              <p className="text-primary font-semibold">That's when you buy.</p>
              <p>
                Venezuela's production had collapsed from 3.5 million barrels per day in the late 1990s
                to roughly 900,000-1,000,000 bpd by late 2025. The infrastructure was gutted — PDVSA's
                own assessment acknowledged pipelines hadn't been updated in 50 years, with restoration
                costs estimated at $58 billion. The asset was a classic distressed acquisition target:
                massive underlying value, collapsed operating performance, zero competitive bidding
                pressure, motivated seller (or in this case, no seller at all — just a seized debtor).
              </p>
            </motion.div>

            {/* Deal Structure Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8 p-6 surface-card border border-border rounded-lg"
            >
              <h4 className="text-lg font-semibold text-foreground mb-4">
                How the Deal Was Structured
              </h4>
              <div className="space-y-4">
                <div className="border-l-2 border-primary pl-4">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Cash Flow Control
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All proceeds from Venezuelan oil sales settle first in U.S.-controlled accounts.
                    Venezuela submits a monthly budget; the U.S. determines what the oil money can fund.
                    This is a <GlossaryTooltip term="dip">DIP facility</GlossaryTooltip> structure
                    applied to a sovereign nation.
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Operational Control
                  </p>
                  <p className="text-xs text-muted-foreground">
                    OFAC issued GL 46 (Jan 29), GL 47 (Feb 3), GL 49 and GL 50 (Feb 13) — sequencing
                    the restructuring to maximize control at every stage. Each license was a controlled
                    release of value.
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Exclusivity Clause
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Venezuela severed ties with China, Russia, Iran, and Cuba. 19 existing contracts
                    with private companies cancelled. Junior creditors stripped out; recovery
                    concentrated in senior secured tranche.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                First oil sold by January 14. A $500 million transaction. The Energy Secretary reported
                oil sales hitting $1 billion by February, with $5 billion projected in the following
                months. The U.S. was receiving 30% higher prices for Venezuelan crude than Maduro had
                been getting — the distressed seller's discount, eliminated overnight.
              </p>
              <p>
                <strong className="text-foreground">The acquisition cost?</strong> Effectively zero
                in financial terms. The U.S. spent months pre-positioning military assets — over
                15,000 service members, aircraft carriers, nuclear submarines — but the operation
                itself was completed with no U.S. fatalities. The asset: 303 billion barrels of
                proven reserves, acquired at a Brent price of ~$60, with production ramping under
                U.S. operational control.
              </p>
            </motion.div>

            <Callout variant="insight" title="Restructuring Framework">
              In restructuring, we call this "buying the company for the price of the debt."
            </Callout>

            {/* Venezuela Deal Tombstone */}
            <VenezuelaTombstone />
          </section>

          {/* Section: Layer 2 - Tariffs */}
          <section id="layer-2-tariffs" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              Layer 2: The Pre-Positioning — Tariffs as Leverage Architecture
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                While the Venezuela acquisition was consolidating through January, the tariff structure
                that had been building throughout 2025 was reaching maturity. This is the layer most
                analysts missed — because they were analyzing trade policy in isolation from energy policy.
              </p>
              <p>
                Here's what was already in place by the time Operation Epic Fury launched on February 28:
              </p>
            </motion.div>

            {/* Ally Tariff Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8 grid md:grid-cols-2 gap-4"
            >
              {[
                {
                  ally: 'European Union',
                  tariff: '15%',
                  hormuzDep: '12-14% LNG',
                  status: 'Framework agreement not legally binding. $600B investment pledges unenforceable.',
                  color: 'blue',
                },
                {
                  ally: 'Japan',
                  tariff: '15%',
                  hormuzDep: '95% crude imports (~1.6M bpd)',
                  status: 'Mid-negotiation when Hormuz closed. 87% fossil fuel import dependency.',
                  color: 'red',
                },
                {
                  ally: 'South Korea',
                  tariff: '25%',
                  hormuzDep: '68% crude imports (~1.7M bpd)',
                  status: 'Tariffs escalated Jan 26 — between Venezuela seizure and Iran strikes.',
                  color: 'orange',
                },
                {
                  ally: 'India',
                  tariff: '18%',
                  hormuzDep: '50% crude imports (~2.6M bpd)',
                  status: 'Trade deal linked to freeze on Russian oil imports.',
                  color: 'green',
                },
                {
                  ally: 'China',
                  tariff: '10% (truce)',
                  hormuzDep: '37.7% of Hormuz flows',
                  status: 'Truce expires Nov 2026. Receives 80% of Iranian oil.',
                  color: 'yellow',
                },
              ].map((item) => (
                <motion.div
                  key={item.ally}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-foreground">
                      {item.ally}
                    </h5>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] ">
                      {item.tariff} tariff
                    </span>
                  </div>
                  <p className="text-[10px] text-primary mb-2">
                    Hormuz Dependency: {item.hormuzDep}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.status}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>Now zoom out.</p>
              <p>
                Every major energy-importing ally was simultaneously: (a) dependent on Gulf oil
                transiting Hormuz for 50-95% of crude imports, (b) mid-negotiation or recently
                concluded tariff agreements with Washington, and (c) operating with strategic
                petroleum reserves covering weeks to months, not years.
              </p>
            </motion.div>

            {/* Allied Dependency Matrix */}
            <AlliedDependencyMatrix className="my-8" />

            <PullQuote>
              "The tariffs weren't just trade policy. In the context of a Hormuz closure, they became
              the second jaw of a vice. Allies couldn't simply pay the market price for alternative
              supply — they had to negotiate with Washington simultaneously for energy relief and
              tariff relief. The leverage compounded."
            </PullQuote>
          </section>

          {/* Section: Layer 3 - Detonation */}
          <section id="layer-3-detonation" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              Layer 3: The Detonation — Operation Epic Fury
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                <strong className="text-foreground">February 28, 2026.</strong> The United States and
                Israel launched coordinated strikes on Iran's military installations, nuclear sites,
                and senior leadership. Supreme Leader Ali Khamenei was killed. Within hours, the IRGC
                declared the Strait of Hormuz closed to Western-allied shipping.
              </p>
            </motion.div>

            {/* Impact Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8 p-6 surface-elevated border border-red-500/30 rounded-lg"
            >
              <h4 className="text-lg font-semibold text-red-400 mb-4">
                Immediate Impact
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase mb-2">
                    Tanker Traffic
                  </p>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Collapsed 70-80% within days</li>
                    <li>• 10 crossings over 4 days vs. normal 280-320</li>
                    <li>• By March 7: 1 vessel vs. 138/day average</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase mb-2">
                    Oil Prices
                  </p>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Brent: $71.32 → $94.35 by March 9</li>
                    <li>• Crossed $100 on March 12</li>
                    <li>• Peaked at $121.88 (March 30)</li>
                    <li>• Dated Brent hit $141 (April 2)</li>
                  </ul>
                  <p className="text-[9px] text-muted-foreground/70 mt-2">
                    {EIA_SOURCE_ATTRIBUTION}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                <strong className="text-foreground">What went offline:</strong> approximately 16
                million barrels per day of crude and products that had been flowing through Hormuz —
                an 80% decline from the 2025 average of 20 million bpd. This represents roughly 20%
                of global petroleum consumption and 25-27% of all seaborne oil trade, eliminated in
                a weekend.
              </p>
              <p>
                The bypass capacity — Saudi Arabia's East-West Petroline and the UAE's ADCOP pipeline —
                covers roughly 3.5 to 5.5 million bpd at maximum, against 20 million normally transiting.
                Iraq, Kuwait, Qatar, Bahrain, and Iran have zero pipeline bypass infrastructure.
                Approximately 14 million barrels per day are structurally locked to this single
                maritime passage with no alternative routing.
              </p>
            </motion.div>

            <Callout variant="warning" title="Supply Amputation">
              This is not a supply disruption. It's a supply amputation.
            </Callout>

            {/* Oil Price Event Chart */}
            <OilPriceEventChart className="my-8" />
          </section>

          {/* Section: Layer 4 - Inversion */}
          <section id="layer-4-inversion" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              Layer 4: The Inversion — Reframing Parts I and II
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>Here is where the previous analysis inverts.</p>
              <p>
                In Part I, I framed Iran as the savvy distressed debtor — a sovereign entity with a
                single high-leverage asset (Hormuz) deploying it as a negotiating weapon, creating
                cost asymmetry where every day of disruption costs the global economy billions while
                Iran's marginal cost of maintaining the blockade is low.
              </p>
              <p className="text-amber-400">
                That framing was technically correct and strategically incomplete.
              </p>
            </motion.div>

            {/* What Iran Actually Did */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8 p-6 surface-card border border-amber-500/30 rounded-lg"
            >
              <h4 className="text-lg font-semibold text-amber-400 mb-4">
                What Iran Actually Did by Closing Hormuz
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Zeroed Its Own Export Revenue
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Iran was shipping ~1.6 million bpd (10.6% of Hormuz flows) generating cash for
                    government, military, and proxy networks. By closing the strait, Iran cut its
                    own throat. The distressed debtor didn't just default — it burned the collateral.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Leadership Simultaneously Degraded
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Khamenei killed, IRGC command disrupted, military infrastructure degraded. The
                    entity making the "strategic" decision was already in free fall.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    No Credible Economic Backstop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Russia is fighting its own war. China permits some ships but hasn't provided
                    financial lifeline. Iran has no DIP lender, no emergency liquidity, no path
                    to restructuring.
                  </p>
                </div>
              </div>
            </motion.div>

            <PullQuote>
              "Iran isn't playing offense. Iran is performing a function in someone else's financial
              architecture. It's the distressed tenant who threatens to burn down the apartment
              building — which paradoxically justifies continued U.S. military presence, extends
              the supply disruption, and makes U.S.-controlled alternatives exponentially more
              valuable with each passing day."
            </PullQuote>

            {/* Inversion Feedback Loop */}
            <InversionFeedbackLoop className="my-8" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                Part II mapped the macro transmission chain: energy shock → inflation → Fed constraint
                → spread widening → defaults → restructuring cycle. That chain is now active — Brent
                above ${latestOilPrice.brentSpot.toFixed(0)}, U.S. gas prices past $4 per gallon — but
                the Part II framework assumed the shock was exogenous.
              </p>
              <p className="text-primary font-semibold">
                What if it's endogenous? What if the entity best positioned to profit from the
                restructuring cycle is the same entity that triggered the supply event?
              </p>
            </motion.div>
          </section>

          {/* Section: Layer 5 - Endgame */}
          <section id="layer-5-endgame" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              Layer 5: The Endgame — Permanent Restructuring of Global Energy
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                If you've followed this far, the next question is obvious: what does the post-war
                capital structure look like?
              </p>
            </motion.div>

            {/* Position Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8 grid md:grid-cols-2 gap-6"
            >
              {/* U.S. Position */}
              <div className="p-6 surface-elevated border border-emerald-500/30 rounded-lg">
                <h4 className="text-lg font-semibold text-emerald-400 mb-4">
                  U.S. Position Going In
                </h4>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    World's largest oil producer at 13.6M bpd
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    Net energy exporter — Hormuz imports only ~0.5M bpd
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    Operational control of Venezuela (303B barrels)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    Tariff leverage over every major ally
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    Dollar hegemony in oil settlements
                  </li>
                </ul>
              </div>

              {/* Allied Position */}
              <div className="p-6 surface-elevated border border-red-500/30 rounded-lg">
                <h4 className="text-lg font-semibold text-red-400 mb-4">
                  Allied Position Going In
                </h4>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    Japan: 87% fossil fuel import dependency
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    South Korea: 68% crude through Hormuz
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    India: 50% crude through Hormuz
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    EU: 15% tariff, non-binding framework
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    All: SPR reserves of weeks to months
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Relief Valve Flow Diagram */}
            <ReliefValveFlow className="my-8" />

            {/* Endgame Outcomes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <h4 className="text-lg font-semibold text-foreground">
                What the Endgame Produces
              </h4>
              <div className="space-y-4">
                <p>
                  <strong className="text-primary">Energy dependency becomes negotiating leverage.</strong>{' '}
                  Allies don't just need oil — they need oil from the only suppliers not constrained
                  by Hormuz. That's the U.S. (13.6M bpd), Canada (4.9M bpd), Brazil, Guyana — and now
                  Venezuela under U.S. operational control. Western Hemisphere supply, insulated from
                  Hormuz risk, with one country controlling the marginal barrel.
                </p>
                <p>
                  <strong className="text-primary">Venezuela transforms from distressed asset to strategic reserve.</strong>{' '}
                  At current production (~900K-1M bpd), Venezuela is marginal. But JPMorgan projects
                  1.3-1.4M bpd within two years; Morgan Stanley sees 2M bpd achievable with well workovers.
                  The U.S. acquired a call option on 303 billion barrels at Brent $60. That option is
                  now in the money at ${latestOilPrice.brentSpot.toFixed(0)}.
                </p>
                <p>
                  <strong className="text-primary">Oil prices are structurally repriced.</strong>{' '}
                  Even if Hormuz reopens tomorrow, the risk premium is permanently embedded. The EIA
                  forecasts Brent remaining above $95 through May. Goldman's extreme scenario puts
                  Brent at $135 if flows remain disrupted for six months. The days of $60 Brent may
                  be over for a cycle.
                </p>
                <p>
                  <strong className="text-primary">The restructuring cycle from Part II accelerates.</strong>{' '}
                  Higher-for-longer oil feeds directly into inflation, constraining the Fed's ability
                  to cut rates, widening credit spreads, and increasing default probability in
                  energy-sensitive sectors. The pipeline that Part II described as a 12-18 month
                  build is now on a 6-9 month timeline.
                </p>
              </div>
            </motion.div>
          </section>

          {/* Section: Intentionality */}
          <section id="intentionality" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              The Intentionality Question
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                The vulnerability of this framework is attribution of intent. Was this a sequenced
                strategy executed from a whiteboard, or three opportunistic moves that happened to
                interlock?
              </p>
              <p>I'll argue both sides — because the market implications are identical regardless.</p>
            </motion.div>

            {/* Two Cases */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8 grid md:grid-cols-2 gap-4"
            >
              <div className="p-5 surface-card border border-emerald-500/30 rounded-lg">
                <h5 className="text-sm font-semibold text-emerald-400 mb-3">
                  The Case for Design
                </h5>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Venezuela involved months of planning, secret talks, CIA ops</li>
                  <li>• 15,000+ service members pre-positioned</li>
                  <li>• Tariff architecture built throughout 2025</li>
                  <li>• South Korea tariff escalation timed between operations</li>
                  <li>• OFAC licensing sequence reads like restructuring plan</li>
                </ul>
              </div>
              <div className="p-5 surface-card border border-amber-500/30 rounded-lg">
                <h5 className="text-sm font-semibold text-amber-400 mb-3">
                  The Case for Opportunism
                </h5>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Venezuela targeted for independent reasons (drugs, Maduro)</li>
                  <li>• Tariffs predated any Iran timeline</li>
                  <li>• Iran escalation building since 2025 Geneva talks failure</li>
                  <li>• Epic Fury may have been triggered by specific intelligence</li>
                  <li>• Administration historically operates through parallel tracks</li>
                </ul>
              </div>
            </motion.div>

            <Callout variant="insight" title="Why the Distinction Doesn't Matter">
              Whether designed or emergent, the structural outcome is identical: (1) The U.S.
              controls the only major relief valve, (2) Every ally is negotiating tariffs AND
              energy access with Washington, (3) Iran's response deepens the crisis, (4) The
              longer the disruption, the more leverage compounds.
              <p className="mt-3 text-foreground">
                In credit analysis, we don't care whether the debtor's distress was engineered.
                We care about who holds the fulcrum security, who controls the DIP, and who owns
                the reorganized entity. The answer to all three is the same.
              </p>
            </Callout>
          </section>

          {/* Section: Positioning */}
          <section id="positioning" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              So What: Positioning Implications
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body"
            >
              <p className="mb-6">
                If this framework is correct — even partially — the implications cut across every
                asset class:
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4 mb-8"
            >
              {[
                {
                  asset: 'Oil',
                  view: 'Structurally higher',
                  detail: 'Even rapid Hormuz resolution leaves permanent risk premium. Venezuelan supply controlled, not free-market. Long the curve, particularly deferred contracts underpricing duration.',
                },
                {
                  asset: 'Allied Trade',
                  view: 'Leverage shifted decisively',
                  detail: 'Japan, South Korea, India negotiating tariffs while dependent on U.S. for energy access. Expect deeper concessions on defense, semiconductors, agriculture, investments.',
                },
                {
                  asset: 'Restructuring Cycle',
                  view: 'Accelerated',
                  detail: 'Higher energy costs feed through to margins in 1-2 quarters. Airlines, shipping, chemicals, agriculture first. LBOs assuming $70 oil in second tranche. 12-18 month timeline now 6-9 months.',
                },
                {
                  asset: "Iran's Position",
                  view: 'Far weaker than surface analysis',
                  detail: 'No revenue, degraded leadership, no DIP lender. Exit (reopening Hormuz) concedes leverage. Continuation deepens U.S. alternatives value. No configuration improves position.',
                },
                {
                  asset: 'Post-War Order',
                  view: 'Structural dominance compounding',
                  detail: 'Western Hemisphere supply insulated from Middle East chokepoint. Tariff leverage linking energy to trade. Dollar settlement unchallenged.',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.asset}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 surface-card border border-border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-foreground">{item.asset}</h5>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] ">
                      {item.view}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                The short-term cost is real: $4+ gas, 36% presidential approval, international
                condemnation, allies who will remember the leverage was applied when they were
                desperate.
              </p>
              <p>
                But restructurings are ugly. The question isn't whether the process is painful —
                it always is. The question is whether the entity that emerges from the restructuring
                owns the assets, controls the cash flows, and holds the leverage.
              </p>
            </motion.div>
          </section>

          {/* Section: Caveats */}
          <section id="caveats" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              Caveats
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p className="text-amber-400 font-semibold">
                This is a framework, not a prediction.
              </p>
              <p>
                I don't know what was on anyone's whiteboard. I know what the policy sequence was,
                what the structural outcomes are, and what the capital structure looks like. I've
                applied the same analytical framework I'd apply to a distressed corporation —
                identifying who bought the debt, when, at what basis, and who controls the
                reorganization.
              </p>
              <p>
                The framework's weakest point is that it attributes coherence to a policy apparatus
                that may simply be chaotic. The strongest counterargument is that the Trump
                administration has historically operated through parallel tracks — multiple actors
                pursuing different objectives — and what looks like a coordinated sequence may be
                the accidental alignment of independent initiatives that happened to interlock.
              </p>
              <p>
                I acknowledge that. And I'll note that in my experience running a business through
                a 19-month creditor negotiation, the distinction between "they planned this" and
                "they saw the opportunity and took it" is meaningless at the bargaining table.
                What matters is who holds the leverage when the room goes quiet.
              </p>
            </motion.div>

            <PullQuote>
              "Right now, one country is simultaneously the world's largest oil producer, the
              operational controller of the world's largest proved reserves, a net energy exporter
              insulated from the chokepoint disruption, and the tariff-setting authority over every
              energy-desperate ally. That's not a coincidence. And even if it is — it doesn't matter."
            </PullQuote>
          </section>

          {/* Download PDF Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-12 flex justify-center"
          >
            {/* Phase A: PDF button hidden until Phase 5 pipeline */}
          </motion.div>

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
                <ArrowRight size={16} className="text-primary" />
              </Link>
              <Link
                to="/memos/iran-part-ii"
                className="flex items-center justify-between p-3 border border-border hover:border-primary/50 transition-colors group"
              >
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                    Part II
                  </p>
                  <p className="text-foreground text-sm group-hover:text-primary transition-colors">
                    Second-Order Effects: Sector Repricing & The Coming Restructuring Cycle
                  </p>
                </div>
                <ArrowRight size={16} className="text-primary" />
              </Link>
              <div className="flex items-center justify-between p-3 border-2 border-primary bg-primary/5">
                <div>
                  <p className="text-primary text-[10px] uppercase tracking-wider mb-1">
                    Part III - You are here
                  </p>
                  <p className="text-foreground text-sm">
                    The Trojan Horse: The Largest Distressed Asset Play in History
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shadow Partner Addendum Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-8"
          >
            <Link
              to="/memos/shadow-partner"
              className="block p-6 surface-card border-2 border-amber-500/50 hover:border-amber-500 rounded-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] uppercase tracking-wider border border-amber-500/30 mb-3">
                    Addendum to Part III
                  </span>
                  <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    The Shadow Partner: Russia as Unpriced Counterparty
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    How Russia's intelligence sharing, oil arbitrage, and attention capture make it the largest unacknowledged
                    beneficiary of the Iran conflict — and why the coalition's cost-benefit calculus is missing a $50-60 billion line item.
                  </p>
                </div>
                <ArrowRight size={20} className="text-primary shrink-0 mt-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>

          {/* Field Notes Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-8 p-6 surface-card border border-primary/30 rounded-lg"
          >
            <p className="text-muted-foreground text-sm mb-3">
              Follow the daily <Link to="/field-notes" className="text-primary hover:underline">Field Notes</Link> for
              prediction tracking and updated analysis.
            </p>
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
              not constitute investment, military, or policy advice. All information is based on
              publicly available sources and estimates, which may prove incorrect. Data reflects
              publicly available sources as of {formatFullDate(conflictMetadata.lastUpdated)}.
            </p>
          </motion.footer>
        </article>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default IranMemoPartIIIFull;
