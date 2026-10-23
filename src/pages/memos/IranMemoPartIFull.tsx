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
  CostAsymmetryChart,
  ShippingDisruptionChart,
  ScenarioProbabilityMatrix,
} from '@/components/iran/charts';
import {
  casualtyData,
  conflictTimeline,
  gccWaterData,
  conflictMetadata,
  formatShortDate,
  formatFullDate,
  hormuzTimeline,
  casualtyTimeline,
  getLatest,
  shippingDisruptionData,
  warCostEstimate,
} from '@/data/iranConflictData';
import { generateMemoPdf } from '@/lib/generatePdf';

const tocItems: TOCItem[] = [
  { id: 'situation-overview', title: 'I. Situation Overview', level: 1 },
  { id: 'balance-sheet', title: 'II. Sovereign Balance Sheet', level: 1 },
  { id: 'cost-asymmetry', title: 'III. Asymmetric Cost Thesis', level: 1 },
  { id: 'queen-sacrifice', title: 'IV. Queen Sacrifice Hypothesis', level: 1 },
  { id: 'stakeholder-analysis', title: 'V. Stakeholder Analysis', level: 1 },
  { id: 'leverage-map', title: 'VI. Strategic Leverage Map', level: 1 },
  { id: 'alliance-portfolio', title: 'VII. Alliance Portfolio', level: 1 },
  { id: 'recovery-scenarios', title: 'VIII. Recovery Scenarios', level: 1 },
  { id: 'conclusion', title: 'IX. Conclusion', level: 1 },
];

const IranMemoPartIFull = () => {
  const contentRef = useRef<HTMLElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateMemoPdf(contentRef.current, {
        title: 'The Asymmetric Restructuring of the Middle East',
        filename: 'The_Iran_Trap_Part_I_Fulcrum_Memo.pdf',
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
        <title>The Asymmetric Restructuring of the Middle East | The Fulcrum Memo</title>
        <meta
          name="description"
          content="How Iran's infrastructure-targeting strategy exploits asymmetric cost dynamics to achieve leverage no conventional military campaign could deliver."
        />
        <meta property="og:title" content="The Asymmetric Restructuring of the Middle East" />
        <meta property="og:description" content="How Iran's infrastructure-targeting strategy exploits asymmetric cost dynamics to achieve leverage no conventional military campaign could deliver." />
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
              <p className="text-muted-foreground text-sm">Part I of III</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/memos/iran-part-ii"
                className="flex items-center gap-2 text-primary hover:text-foreground transition-colors text-sm group"
              >
                Part II
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
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
              <span className="tag-pill">Sovereign Distress</span>
              <span className="tag-pill">Geopolitical Strategy</span>
              <span className="tag-pill">Game Theory</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              The Asymmetric Restructuring of the Middle East
            </h1>
            <p className="text-muted-foreground text-base italic mb-6 leading-relaxed">
              How Iran's infrastructure-targeting strategy exploits asymmetric cost dynamics to
              achieve leverage no conventional military campaign could deliver—and why restructuring
              frameworks explain this conflict better than military analysis
            </p>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
              <span>March 2026</span>
              <span className="text-primary">|</span>
              <span>Zachary Smith</span>
              <span className="text-primary">|</span>
              <DataBadge status="updated" date={formatShortDate(conflictMetadata.lastUpdated)} />
            </div>
            <div className="mt-4">
              <ShareButtons
                title="The Asymmetric Restructuring of the Middle East"
                text="Iran's infrastructure-targeting strategy explained through restructuring frameworks. A unique perspective on the 2026 conflict."
              />
            </div>
          </motion.header>

          {/* Gold line */}
          <div className="gold-line mb-8" />

          {/* Lead Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="memo-body text-zinc-200 text-lg leading-relaxed mb-8"
          >
            The 2026 Iran conflict is not a war in any traditional sense. It is the largest
            asymmetric restructuring in modern geopolitical history—a distressed sovereign entity
            leveraging infrastructure-targeting, cost asymmetry, and chokepoint control to force a
            renegotiation of the global power structure from a position of conventional military
            weakness. What the U.S. frames as a decapitation victory is, upon deeper analysis, a
            strategic sacrifice that has positioned Iran with more leverage than at any point in the
            last 45 years.
          </motion.p>

          <Callout variant="insight" title="Why a Restructuring Analyst Wrote This Memo">
            <p className="italic">
              I've navigated a business through financial distress—not as an advisor, but as the
              operator. What I learned: the party with less capital doesn't always lose. The party
              that better understands cost asymmetry, creditor incentives, and negotiation timing
              often walks away with more than the balance sheet would suggest.
            </p>
            <p className="mt-3">
              This memo applies restructuring frameworks to the 2026 Iran conflict. Iran is the
              distressed debtor. The U.S.-led coalition is the secured creditor attempting
              foreclosure. The GCC is the collateral. And the global economy is the enterprise
              value that both sides are fighting over. The parallels are not metaphorical—they are
              structural.
            </p>
          </Callout>

          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="surface-elevated border-l-2 border-primary p-6 mb-8"
          >
            <h3 className="text-primary text-[10px] uppercase tracking-wider mb-4">
              Executive Summary
            </h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Cost Asymmetry:</strong> ~100:1 on drones
                  ($35K Shahed vs. $3.7M Patriot), 8-56:1 on missiles vs. SM-3 interceptors. Heritage
                  Foundation (Jan 2026) assessed high-end interceptor stockpiles would be exhausted
                  within days of sustained combat.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Strait of Hormuz sealed:</strong>{' '}
                  Zero tanker transits for {shippingDisruptionData.keyMetrics.consecutiveZeroTransitDays}+ consecutive days. 20% of global oil, 20% of LNG, 33%
                  of global fertilizer trade halted—not by naval blockade, but by insurance
                  withdrawal. {shippingDisruptionData.keyMetrics.tankersStranded} tankers stranded, {shippingDisruptionData.keyMetrics.trappedVLCCs} VLCCs trapped ({shippingDisruptionData.keyMetrics.percentGlobalVLCCFleet}% of global fleet). <GlossaryTooltip term="vlcc">VLCC</GlossaryTooltip> rates at ${getLatest(hormuzTimeline).vlccRate.toLocaleString()}/day.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Iranian Casualties:</strong> {getLatest(casualtyTimeline).iranianKilled.toLocaleString()}+ killed (as
                  of Day {conflictMetadata.conflictDay}), including ~180 children at Minab school. IRIS Jamaran and IRIS Dena
                  (frigates) sunk in Indian Ocean—not Strait of Hormuz.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">GCC water crisis imminent:</strong> UAE,
                  Kuwait, and Qatar depend on desalination for 90%+ of drinking water with single-digit
                  days of reserves. Desalination plants are coastal, energy-intensive, and targetable.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Leadership decapitation did not halt operations:</strong>{' '}
                  40+ senior officials killed including Supreme Leader Khamenei, yet retaliatory
                  campaign launched within hours on pre-programmed orders—suggesting the strike was
                  anticipated.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">▸</span>
                <span>
                  <strong className="text-foreground">Iran's negotiating position:</strong>{' '}
                  <span className="text-primary">Strongest in 45 years</span>—proven asymmetric
                  capability, global economic hostage leverage, surviving institutional
                  infrastructure, and nothing left to lose.
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Section I: Situation Overview */}
          <section id="situation-overview" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              I. Situation Overview: The "Distressed Entity"
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                On 28 February 2026, the United States and Israel launched joint strikes against
                Iran under "Operation Epic Fury," targeting senior leadership, nuclear facilities,
                military infrastructure, and command centers across 24 of Iran's 31 provinces.
                Within 24 hours, Iran's Supreme Leader Ayatollah Ali Khamenei, defense minister,
                chief of staff, <GlossaryTooltip term="irgc">IRGC</GlossaryTooltip> commander, and
                over 40 senior officials were confirmed killed. The U.S. military has struck more
                than 1,000 targets in the first 72 hours.
              </p>

              <p>
                By any conventional military measure, this should constitute decisive victory. It
                does not. Iran's retaliatory campaign—targeting U.S. bases across the GCC, Israeli
                military and civilian infrastructure, Gulf energy and water facilities, data
                centers, and commercial shipping—launched within hours of the first strikes and has
                not diminished. Nineteen U.S. service members have been killed, 290 wounded — doubled in two weeks.
                The Strait of Hormuz remains closed for 26 consecutive days with confirmed mines. Oil touched $115,
                crashed 11%, then rebounded. Amazon's UAE data center is still offline. Day 26 brings the first
                concrete diplomatic framework: a NYT-reported 15-point plan, a 1-month ceasefire proposal, Pakistan
                offering to host talks. This is qualitatively different from Day 24's vague "productive conversations."
                But structural damage is already locked in: Ras Laffan needs 5 years to repair, maritime insurance
                has been permanently transformed, 50% of global fertilizer trade is disrupted, and yuan-denominated
                Hormuz transit has set a precedent that will outlast this war.
              </p>
            </motion.div>

            <PullQuote>
              "Decapitation without systemic degradation is a pause button, not an outcome.
              Authoritarian systems regenerate from their mid-levels."
            </PullQuote>

            {/* Conflict Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-10"
            >
              <h4 className="text-lg font-semibold text-zinc-100 mb-6">
                Conflict Timeline
              </h4>
              <div className="space-y-1">
                {conflictTimeline.map((item, index) => (
                  <motion.div
                    key={item.date}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="grid grid-cols-[180px_1fr] gap-6 py-3 border-l-2 border-primary/30 pl-4 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <span className="text-sm text-primary font-semibold whitespace-nowrap">
                      {item.date}
                    </span>
                    <p className="text-sm text-zinc-300 leading-relaxed">{item.event}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Section II: Sovereign Balance Sheet */}
          <section id="balance-sheet" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              II. Sovereign Balance Sheet Analysis
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              In corporate restructuring, we analyze the debtor's capital structure, liquidity
              runway, and operational viability. The same framework applies to sovereign entities
              in conflict. The critical insight: conventional military power is analogous to asset
              size, but asymmetric capability is analogous to cash flow—and cash flow determines
              survival.
            </motion.p>

            {/* GCC Water Crisis Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8 overflow-x-auto"
            >
              <h4 className="text-lg font-semibold text-foreground mb-4">
                GCC States: The "Collateral"
              </h4>
              <table className="w-full border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      Country
                    </th>
                    <th className="p-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      GDP
                    </th>
                    <th className="p-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      <GlossaryTooltip term="desalination">Desal.</GlossaryTooltip> Dep.
                    </th>
                    <th className="p-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      Water Reserves
                    </th>
                    <th className="p-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      Infrastructure Damage (72 hrs)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gccWaterData.map((row) => (
                    <tr key={row.country} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3 text-xs text-foreground font-semibold">
                        {row.country}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{row.gdp}</td>
                      <td className="p-3 text-xs text-red-400 font-semibold">
                        {row.desalinationDependency}
                      </td>
                      <td className="p-3 text-xs text-amber-400 font-semibold">
                        {row.waterReserves}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{row.damage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <Callout variant="critical" title="Critical Vulnerability: The GCC Water Clock">
              GCC states produce over 50% of the world's desalinated water. Desalination plants are
              coastal, energy-intensive facilities dependent on continuous power supply. Iran has
              already demonstrated willingness and capability to target energy infrastructure in
              Qatar, UAE, Saudi Arabia, Kuwait, and Bahrain. If desalination capacity is degraded by
              30-50%, most GCC states face potable water exhaustion within 7-14 days. No amount of
              U.S. military superiority can accelerate water production. This is Iran's ultimate
              leverage mechanism—the threat alone constrains coalition options.
            </Callout>

            {/* CONFIRMED annotation for GCC Water Clock */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] uppercase tracking-wider rounded">
                  Confirmed Day 9
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-red-400">This vulnerability was validated on Day 9</strong> when Iran struck
                a Bahrain desalination plant with a drone—the first Gulf water infrastructure strike of the conflict.
                Water targeting is now <strong className="text-red-400">bilateral</strong>: the U.S. struck Iran's
                Qeshm Island desalination plant on Day 8, cutting water to 30 villages. Chatham House called the
                Bahrain strike a "major escalation"—Iran moving from economic targets to ones affecting "livelihoods
                of Gulf citizens."
              </p>
            </motion.div>
          </section>

          {/* Section III: Cost Asymmetry */}
          <section id="cost-asymmetry" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              III. The Asymmetric Cost Thesis: Iran's "Negative Option Value"
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              In corporate distress, a company reaches "negative option value" when stopping
              operations destroys more value than continuing. Iran has achieved sovereign negative
              option value: the cost of stopping its campaign (loss of all leverage, coalition
              regrouping, permanent prevention of future asymmetric capability) exceeds the cost of
              continuing (missiles, domestic casualties already absorbed, economic damage already
              priced in).
            </motion.p>

            {/* Interactive Cost Asymmetry Chart */}
            <CostAsymmetryChart />

            <PullQuote>
              "Iran doesn't need to win a war. It needs to impose enough cost that the creditor
              accepts a settlement. Every day the Strait stays closed, the negotiating leverage
              shifts."
            </PullQuote>

            <Callout variant="thesis" title="The Restructuring Parallel">
              <p>
                In distressed debt, I learned that the party with the most options isn't always the
                one with the most capital. It's the one whose cost of walking away is lowest
                relative to the damage they can inflict by staying at the table. Iran has already
                taken its worst loss—its Supreme Leader is dead, its nuclear sites are destroyed.
                What does it have left to lose? Nothing. What can it still impose on the other
                side? Trillions in global economic damage, daily.
              </p>
              <p className="mt-3">
                This is the distressed debtor who just set the building on fire. The secured
                creditor can walk away and lose the asset, or send people in to save it—but the
                fire makes the rescue exponentially more expensive than the original claim was
                worth. Iran's fire is the Strait of Hormuz, GCC water infrastructure, and global
                tech supply chains.
              </p>
            </Callout>
          </section>

          {/* Section IV: Queen Sacrifice */}
          <section id="queen-sacrifice" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              IV. The Queen Sacrifice Hypothesis
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              The most provocative analytical framework for this conflict is what I term the "Queen
              Sacrifice Hypothesis"—the possibility that the decapitation of Iran's senior
              leadership was not an unforeseen intelligence failure, but an anticipated (or even
              facilitated) strategic sacrifice designed to trigger the U.S. into a "victory" that
              is actually a trap.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4 my-8"
            >
              <h4 className="text-lg font-semibold text-foreground">
                Supporting Evidence
              </h4>

              {[
                {
                  title: 'The strike was telegraphed for weeks.',
                  content:
                    "The U.S. military buildup was described as the largest since 2003. Trump gave a State of the Union speech openly threatening action. Iran could see it coming. The choice to scatter leadership or to consolidate it was deliberate either way.",
                },
                {
                  title: 'Khamenei was 86 and symbolic, not operational.',
                  content:
                    'Day-to-day management had already shifted to Ali Larijani and the IRGC. The operational handoff had already occurred. Removing Khamenei eliminated a figurehead, not the command structure. [UPDATE Day 18: Larijani himself was killed on March 17, 2026 — eliminating the last credible negotiation partner on the Iranian side.]',
                },
                {
                  title: 'Succession protocols activated with suspicious speed.',
                  content:
                    'An interim three-person leadership council was announced within hours—not the timeline of a shocked institution, but of one executing a pre-planned transition.',
                },
                {
                  title: 'Retaliatory operations launched immediately on pre-programmed orders.',
                  content:
                    'The infrastructure-targeting campaign—GCC energy, water, data centers, Strait of Hormuz—executed without pause despite the elimination of the entire senior command. Either Iran has the most resilient C2 in military history, or the campaign was designed to run without them.',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-muted/30 rounded-lg"
                >
                  <p className="text-sm text-foreground font-semibold mb-2">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.content}</p>
                </motion.div>
              ))}
            </motion.div>

            <Callout variant="warning" title="Analytical Caveat">
              There is no direct evidence this sacrifice was intentional. The hypothesis is
              presented as a game-theoretic framework to explain the <em>outcome</em>, which is
              strategically consistent regardless of intent. Whether planned or accidental, Iran is
              now in a stronger negotiating position than before the strikes. The structural
              leverage exists either way.
            </Callout>
          </section>

          {/* Section V: Stakeholder Analysis */}
          <section id="stakeholder-analysis" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              V. Stakeholder Analysis: The Game Theory Matrix
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              Each actor in this conflict has distinct objectives, constraints, and optimal
              strategies. Mapping these reveals why the conflict is likely to persist and why
              Iran's leverage compounds over time.
            </motion.p>

            {/* Simplified stakeholder cards */}
            <div className="grid md:grid-cols-2 gap-4 my-8">
              {[
                {
                  actor: 'Iran',
                  objective: 'Maximize leverage for sanctions relief',
                  costContinuing: 'Low — missiles from existing inventory',
                  costStopping: 'Catastrophic — loss of all leverage',
                  color: 'emerald',
                },
                {
                  actor: 'United States',
                  objective: 'Quick victory narrative',
                  costContinuing: 'High — $1B/day confirmed (NBC) + casualties',
                  costStopping: 'Moderate — can redefine objectives',
                  color: 'blue',
                },
                {
                  actor: 'GCC States',
                  objective: 'Survival — water, energy, stability',
                  costContinuing: 'Existential — water reserves in days',
                  costStopping: 'Low — desperately want de-escalation',
                  color: 'amber',
                },
                {
                  actor: 'China',
                  objective: 'Preserve Iran as energy supplier',
                  costContinuing: 'Moderate — 50% oil imports at risk',
                  costStopping: 'Low — can extract U.S. concessions',
                  color: 'red',
                },
              ].map((stakeholder) => (
                <motion.div
                  key={stakeholder.actor}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-lg border border-${stakeholder.color}-500/30 bg-${stakeholder.color}-500/5`}
                >
                  <h5 className={`text-lg font-semibold text-${stakeholder.color}-400 mb-2`}>
                    {stakeholder.actor}
                  </h5>
                  <div className="space-y-2 text-xs">
                    <p>
                      <span className="text-muted-foreground">Objective:</span>{' '}
                      <span className="text-foreground">{stakeholder.objective}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Cost Continuing:</span>{' '}
                      <span className="text-foreground">{stakeholder.costContinuing}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Cost Stopping:</span>{' '}
                      <span className="text-foreground">{stakeholder.costStopping}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section VI: Leverage Map */}
          <section id="leverage-map" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              VI. Iran's Strategic Leverage Map
            </motion.h2>

            <ShippingDisruptionChart />

            <Callout variant="thesis" title="Day 26 Update: Hormuz Sovereignty Codification — The Endgame Becomes Clear">
              <p>
                The progression of Iran's Hormuz strategy has now reached its logical endpoint. Day 1: Insurance
                withdrawal shuts the strait without a single Iranian shot. Day 13: Yuan-denominated transit for
                select vessels (Iran/China-linked) — selective access emerging. Day 25: GCC confirms Iran already
                charging passage fees for safe transit. <strong className="text-primary">Day 26: Iranian parliament
                pursuing legislation to formally codify sovereignty, control, and oversight over the Strait of Hormuz
                with permanent transit fee collection.</strong>
              </p>
              <p className="mt-3">
                This is the structural development that outlasts the war. Iran is converting a wartime blockade into
                permanent legal/sovereign control over the strait. If codified into Iranian law, this persists regardless
                of any ceasefire. It's the equivalent of a creditor converting a temporary DIP lien into permanent equity —
                Iran wants ownership of the chokepoint, not just leverage over it.
              </p>
              <p className="mt-3">
                UAE's Abu Dhabi National Oil Co. head called it "economic terrorism" — "every nation pays the ransom at the
                gas pump, grocery store and pharmacy." But the structural reality is: if this legislation passes, the pre-war
                Hormuz status quo is gone permanently. The petrodollar erosion from yuan-denominated transit combined with
                formal sovereignty claims means the global energy architecture is being rewritten in real time.
              </p>
            </Callout>
          </section>

          {/* Section VII: Alliance Portfolio */}
          <section id="alliance-portfolio" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              VII. The Alliance Portfolio: Iran's "Creditor Committee"
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body mb-8"
            >
              In restructuring, a distressed debtor's survival often depends on assembling a
              creditor committee with aligned interests. Iran's potential alliance network—sanctioned
              nations with complementary resources—represents the formation of a counter-hegemonic
              economic bloc that could fundamentally alter global power dynamics.
            </motion.p>

            <Callout variant="thesis" title="The 'Sanctioned Nations Syndicate' Thesis">
              Nearly one-third of the world's countries are now subject to some form of U.S., EU,
              or UN sanctions. The problem with sanctioning so many nations simultaneously is that
              isolation—the central purpose—becomes self-defeating. Targeted nations team up. If
              Iran uses this moment of maximum leverage to formalize a mutual defense/economic pact
              among sanctioned nations with complementary resources (Iranian military tech +
              Venezuelan oil + Bolivian lithium + North Korean nuclear deterrence + Russian nuclear
              umbrella + Chinese economic backing), it creates a bloc that U.S. sanctions cannot
              break because the bloc is internally self-sustaining. This is the real endgame beyond
              any single negotiation.
            </Callout>
          </section>

          {/* Section VIII: Recovery Scenarios */}
          <section id="recovery-scenarios" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              VIII. Recovery Scenarios: Plan of Reorganization
            </motion.h2>

            <ScenarioProbabilityMatrix />
          </section>

          {/* Section IX: Conclusion */}
          <section id="conclusion" className="memo-section">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-heading-1"
            >
              IX. Conclusion: The Fulcrum Has Shifted
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body space-y-6"
            >
              <p>
                In restructuring, the "fulcrum security" is the instrument where value breaks—where
                recovery transitions from full to impaired. In this conflict, the fulcrum has
                shifted in ways that most conventional military analysts have not recognized.
              </p>
              <p>
                The U.S. played its strongest card—killing the Supreme Leader, destroying nuclear
                facilities, eliminating 40+ senior officials—and the regime survived. The
                retaliatory campaign launched on pre-programmed orders. The{' '}
                <GlossaryTooltip term="irgc">IRGC</GlossaryTooltip> mid-level command structure is
                intact. The institutional infrastructure is functioning. Iran has demonstrated, on
                live television for the global audience, that it can hold the world's energy
                supply, water infrastructure, tech backbone, and shipping lanes hostage from a
                position of conventional military weakness.
              </p>
            </motion.div>

            <PullQuote>
              "Iran is the holdout creditor that just realized it has{' '}
              <GlossaryTooltip term="blockingposition">blocking position</GlossaryTooltip> on the
              entire deal. The foot is on the throat. The only question is what terms it extracts
              before releasing."
            </PullQuote>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="memo-body"
            >
              The central lesson: in distressed situations—corporate or sovereign—the party that
              best understands asymmetric cost structures, controls critical chokepoints, and has
              the lowest cost of continued conflict will extract the most value, regardless of the
              balance sheet. Iran has internalized this lesson. The question is whether Washington
              has.
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
              <div className="flex items-center justify-between p-3 border-2 border-primary bg-primary/5">
                <div>
                  <p className="text-primary text-[10px] uppercase tracking-wider mb-1">
                    Part I - You are here
                  </p>
                  <p className="text-foreground text-sm">
                    The Asymmetric Restructuring of the Middle East
                  </p>
                </div>
              </div>
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

export default IranMemoPartIFull;
