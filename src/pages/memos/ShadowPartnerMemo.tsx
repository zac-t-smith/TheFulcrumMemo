import { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
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
import { conflictMetadata, formatShortDate } from '@/data/iranConflictData';

const tocItems: TOCItem[] = [
  { id: 'intelligence-pipeline', title: 'The Intelligence Pipeline', level: 1 },
  { id: 'oil-arbitrage', title: 'The Oil Arbitrage', level: 1 },
  { id: 'attention-arbitrage', title: 'The Attention Arbitrage', level: 1 },
  { id: 'triangle', title: 'The Russia-China-Iran Triangle', level: 1 },
  { id: 'ukraine-paradox', title: 'The Ukraine Paradox', level: 1 },
  { id: 'framework', title: 'Framework: Unpriced Counterparty Risk', level: 1 },
  { id: 'game-theory', title: 'The $88 Equilibrium', level: 1 },
  { id: 'actor-analysis', title: 'Seven-Actor Analysis', level: 1 },
  { id: 'scenarios', title: 'Equilibrium Stress Test', level: 1 },
  { id: 'collection-priorities', title: 'Collection Priorities', level: 1 },
];

const ShadowPartnerMemo = () => {
  const contentRef = useRef<HTMLElement>(null);

  return (
    <PageLayout
      title="The Shadow Partner — Russia as Unpriced Counterparty"
      description="Mapping the intelligence, economic, and strategic arbitrage — how Russia emerges as the unpriced counterparty in the 2026 Iran conflict architecture."
      bare
    >
      <ReadingProgress />
      <div className="memo-page-wrapper pt-10">
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
              className="surface-elevated border border-amber-500/30 p-4 mb-8 flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <p className="text-amber-400 text-[10px] tracking-wider uppercase mb-1">
                  Special Analysis — Addendum to Part III
                </p>
                <p className="text-muted-foreground text-sm">The Trojan Horse Series</p>
              </div>
              <Link
                to="/memos/iran-part-iii"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                Read Part III
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
                <span className="tag-pill">Intelligence</span>
                <span className="tag-pill">Energy & Commodities</span>
                <span className="tag-pill">Game Theory</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                The Shadow Partner: Russia as Off-Balance-Sheet Beneficiary in the 2026 Iran Conflict
              </h1>
              <p className="text-muted-foreground text-base italic mb-6 leading-relaxed">
                Mapping the intelligence, economic, and strategic arbitrage — how Russia emerges as
                the unpriced counterparty in the Trojan Horse architecture
              </p>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
                <span>April 17, 2026</span>
                <span className="text-primary">|</span>
                <span>Zachary Smith</span>
                <span className="text-primary">|</span>
                <DataBadge status="tracking" date={formatShortDate(conflictMetadata.lastUpdated)} />
              </div>
              <div className="mt-4">
                <ShareButtons
                  title="The Shadow Partner: Russia as Off-Balance-Sheet Beneficiary"
                  text="Mapping the intelligence, economic, and strategic arbitrage in the 2026 Iran conflict."
                />
              </div>
            </motion.header>

            <div className="gold-line mb-8" />

            {/* Series Context */}
            <Callout variant="info" title="Addendum Context">
              This analysis extends{' '}
              <Link to="/memos/iran-part-iii" className="text-primary hover:underline">
                Part III: The Trojan Horse
              </Link>{' '}
              by examining the unpriced counterparty in the conflict architecture. While Part III
              mapped how the U.S. positioned itself as the sole relief valve in a crisis of its
              own design, this addendum identifies who else benefits — and how those benefits
              create structural pressures that extend the conflict timeline.
            </Callout>

            {/* Lead Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="memo-body text-zinc-200 text-lg leading-relaxed mb-8"
            >
              Every restructuring has a shadow beneficiary — the counterparty whose position improves
              with each day the crisis extends. In sovereign distress, this is typically the creditor
              who bought the fulcrum security before anyone else recognized the capital structure was
              broken. In the 2026 Iran conflict, that shadow beneficiary is Russia.
            </motion.p>

            {/* Executive Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="surface-elevated border-l-2 border-amber-400 p-6 mb-8"
            >
              <h3 className="text-amber-400 text-[10px] uppercase tracking-wider mb-4">
                Executive Summary
              </h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 font-bold mt-0.5">▸</span>
                  <span>
                    <strong className="text-foreground">Intelligence pipeline:</strong> Russia provided
                    Iran with satellite imagery for the Prince Sultan strike (confirmed by Zelensky).
                    SIGINT collection continues throughout the conflict.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 font-bold mt-0.5">▸</span>
                  <span>
                    <strong className="text-foreground">Oil arbitrage:</strong> $50-60B annualized windfall
                    from Urals crude at $88+ (vs. $60 pre-conflict). India at 2.0 mbpd, China at 1.8 mbpd
                    — both locked into Russian supply as Hormuz closes.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 font-bold mt-0.5">▸</span>
                  <span>
                    <strong className="text-foreground">Attention arbitrage:</strong> Ukrainian strikes on
                    Russian refineries barely register while global focus remains on Hormuz. Sanctions
                    enforcement resources redirected to Iran.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 font-bold mt-0.5">▸</span>
                  <span>
                    <strong className="text-foreground">The equilibrium:</strong> Every day of Hormuz closure
                    is worth ~$150M to Russia in incremental oil revenue. The rational move is to extend
                    the conflict, not resolve it.
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Section: Intelligence Pipeline */}
            <section id="intelligence-pipeline" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                The Intelligence Pipeline
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  <strong className="text-foreground">March 27, 2026.</strong> President Zelensky
                  confirmed what intelligence analysts had suspected: Russia provided Iran with
                  satellite imagery used to target the Prince Sultan Air Base strike. This wasn't
                  a one-off intelligence transfer — it represented the operationalization of the
                  Russia-Iran defense cooperation agreement signed in early 2026.
                </p>
                <p>
                  The intelligence relationship runs deeper than satellite imagery. Russian SIGINT
                  capabilities in the Persian Gulf region — inherited from Soviet-era collection
                  infrastructure and maintained through bilateral agreements with regional partners —
                  provide Iran with near-real-time tracking of U.S. naval movements. The <em>Abraham
                  Lincoln</em> carrier strike group's repositioning was monitored by Russian
                  electronic intelligence assets before CENTCOM announced it.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 p-6 surface-card border border-border rounded-lg"
              >
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Intelligence Transfer Indicators
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="text-emerald-400 text-sm font-bold">CONFIRMED</span>
                    <div>
                      <p className="text-foreground text-sm font-semibold">Prince Sultan satellite imagery</p>
                      <p className="text-muted-foreground text-xs ">Zelensky statement, March 27, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-amber-400 text-sm font-bold">ASSESSED</span>
                    <div>
                      <p className="text-foreground text-sm font-semibold">Carrier group movement tracking</p>
                      <p className="text-muted-foreground text-xs ">Pattern analysis of Iranian repositioning</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-amber-400 text-sm font-bold">ASSESSED</span>
                    <div>
                      <p className="text-foreground text-sm font-semibold">Tanker fleet coordination</p>
                      <p className="text-muted-foreground text-xs ">Shadow fleet movement synchronization</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <PullQuote>
                "Russia gave Iran the satellite imagery used for Prince Sultan. This isn't speculation —
                it's Zelensky's own accusation."
              </PullQuote>
            </section>

            {/* Section: Oil Arbitrage */}
            <section id="oil-arbitrage" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                The Oil Arbitrage: $50-60B Annualized Windfall
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  The math is straightforward. Russia exports approximately 4.5-5.0 million barrels
                  per day of crude oil. Urals crude has moved from ~$60/bbl pre-conflict to $88+
                  as Hormuz closure reprices global supply. That's a $28+ premium on 5M bpd —
                  approximately <strong className="text-amber-400">$140-150 million per day</strong> in
                  incremental revenue.
                </p>
                <p>
                  Annualized, this represents a <strong className="text-amber-400">$50-55 billion windfall</strong> from
                  the conflict. For context, Russia's entire 2024 defense budget was approximately $70 billion.
                  The Iran conflict is funding roughly 70-80% of a full year's defense spending through
                  oil revenue alone.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="p-4 surface-card border border-border rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-400">$88+</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Urals Crude</p>
                </div>
                <div className="p-4 surface-card border border-border rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-400">$28+</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Price Premium</p>
                </div>
                <div className="p-4 surface-card border border-border rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-400">~$150M</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Daily Windfall</p>
                </div>
                <div className="p-4 surface-card border border-border rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">$55B</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Annual Windfall</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
                  Demand Lock-In: India and China
                </h3>
                <p>
                  The buyers can't walk away. India imports approximately 2.0 mbpd from Russia —
                  roughly 40% of its total crude imports. China takes 1.8 mbpd. With Hormuz closed,
                  alternative Middle Eastern supply is either inaccessible or prohibitively expensive.
                  Russian crude, delivered via pipeline (ESPO to China) and tanker (to India), is
                  the only scalable option.
                </p>
                <p>
                  This creates structural demand inelasticity. India and China aren't buying Russian
                  crude because of sanctions arbitrage anymore — they're buying because they have
                  no alternative. The price cap enforcement regime, already weakened, becomes
                  irrelevant when buyers have no negotiating leverage.
                </p>
              </motion.div>

              <Callout variant="warning" title="Sanctions Easing by Necessity">
                Western sanctions enforcement on Russian oil has effectively paused. Treasury and
                State Department resources are redirected to Iran sanctions. The shadow fleet
                operates with reduced scrutiny. Insurance and shipping intermediaries that would
                normally face secondary sanctions pressure are deprioritized. Russia's oil exports
                are flowing with less friction than at any point since the Ukraine invasion began.
              </Callout>
            </section>

            {/* Section: Attention Arbitrage */}
            <section id="attention-arbitrage" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                The Attention Arbitrage
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  Media bandwidth is finite. Diplomatic bandwidth is finite. Sanctions enforcement
                  bandwidth is finite. The Iran conflict consumes all three — and Russia benefits
                  from every unit of attention redirected away from Ukraine.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 p-6 surface-card border border-border rounded-lg overflow-x-auto"
              >
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Before/After: Attention Allocation
                </h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-normal">Domain</th>
                      <th className="text-left py-2 text-muted-foreground font-normal">Pre-Conflict</th>
                      <th className="text-left py-2 text-muted-foreground font-normal">Post-Conflict</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-3">Media Coverage</td>
                      <td className="py-3 text-amber-400">Ukraine-dominant</td>
                      <td className="py-3 text-emerald-400">Iran-dominant</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3">OFAC Resources</td>
                      <td className="py-3 text-amber-400">Russia sanctions</td>
                      <td className="py-3 text-emerald-400">Iran sanctions</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3">Intelligence Focus</td>
                      <td className="py-3 text-amber-400">Ukraine battlefield</td>
                      <td className="py-3 text-emerald-400">Persian Gulf</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3">Diplomatic Bandwidth</td>
                      <td className="py-3 text-amber-400">Ukraine peace process</td>
                      <td className="py-3 text-emerald-400">Iran negotiations</td>
                    </tr>
                    <tr>
                      <td className="py-3">Military Assets</td>
                      <td className="py-3 text-amber-400">European theater</td>
                      <td className="py-3 text-emerald-400">CENTCOM region</td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  Ukrainian drone strikes on Russian refineries — which would normally dominate
                  headlines — are buried below the fold. The Druzhba pipeline disruption that
                  would have triggered emergency EU meetings is a footnote. Russia is conducting
                  offensive operations in Kharkiv with reduced international scrutiny.
                </p>
              </motion.div>
            </section>

            {/* Section: Triangle */}
            <section id="triangle" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                The Russia-China-Iran Triangle
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  The triangle isn't a formal alliance — it's a convergence of interests with
                  complementary capabilities. Each actor provides what the others need:
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 grid md:grid-cols-3 gap-4"
              >
                <div className="p-4 surface-card border border-red-500/30 rounded-lg">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Russia Provides</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Satellite intelligence</li>
                    <li>• SIGINT capabilities</li>
                    <li>• Weapons systems</li>
                    <li>• UN Security Council veto</li>
                    <li>• Sanctions evasion infrastructure</li>
                  </ul>
                </div>
                <div className="p-4 surface-card border border-amber-500/30 rounded-lg">
                  <h4 className="text-lg font-semibold text-amber-400 mb-3">China Provides</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Economic lifeline (oil purchases)</li>
                    <li>• Banking/SWIFT alternatives</li>
                    <li>• Technology transfer</li>
                    <li>• Diplomatic cover</li>
                    <li>• Yuan settlement systems</li>
                  </ul>
                </div>
                <div className="p-4 surface-card border border-emerald-500/30 rounded-lg">
                  <h4 className="text-lg font-semibold text-emerald-400 mb-3">Iran Provides</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Hormuz leverage</li>
                    <li>• Proxy network</li>
                    <li>• Drone technology</li>
                    <li>• Regional destabilization</li>
                    <li>• U.S. attention absorption</li>
                  </ul>
                </div>
              </motion.div>

              <PullQuote>
                "The triangle isn't coordinated — it's convergent. Each actor pursues its own
                interests, and those interests happen to align against U.S. hegemony."
              </PullQuote>
            </section>

            {/* Section: Ukraine Paradox */}
            <section id="ukraine-paradox" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                The Ukraine Paradox
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  Here's the paradox: Ukrainian strikes on Russian oil infrastructure are achieving
                  tactical success — refineries damaged, processing capacity reduced — but the
                  strategic effect is perverse. Reduced Russian refining capacity means more crude
                  available for export. Russian domestic fuel shortages are manageable; the export
                  revenue from unprocessed crude at $88+/bbl more than compensates.
                </p>
                <p>
                  The Iran conflict has inverted the Ukrainian targeting calculus. Before, strikes
                  on Russian energy infrastructure created economic pain. Now, they create economic
                  gain — Russia exports the crude it would have refined, at prices inflated by a
                  crisis Russia didn't start but benefits from extending.
                </p>
              </motion.div>

              <Callout variant="warning" title="The Inversion">
                Every Ukrainian strike on Russian refining capacity increases Russian crude export
                availability. Every day of Hormuz closure increases the price Russia receives for
                that crude. The vectors have flipped. Ukraine's success accelerates Russia's windfall.
              </Callout>
            </section>

            {/* Section: Framework */}
            <section id="framework" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                Framework: Unpriced Counterparty Risk
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  In credit analysis, we call this "unpriced counterparty risk" — when the capital
                  structure analysis ignores a participant whose interests materially affect
                  outcomes. The market is pricing a two-party conflict (U.S./Israel vs. Iran)
                  when the actual structure is at least four-party (add Russia and China as
                  shadow beneficiaries).
                </p>
                <p>
                  The practical implication: <strong className="text-foreground">any scenario analysis
                  that ignores Russia's incentive to extend the conflict is incomplete.</strong> Quick
                  Resolution scenarios assume the conflict is bilateral — that if the U.S. and Iran
                  find terms, the war ends. But Russia has both the capability (intelligence support,
                  weapons supply, sanctions evasion infrastructure) and the incentive ($150M/day)
                  to ensure terms are never found.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 p-6 surface-card border border-primary rounded-lg"
              >
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  The Collection Priority
                </h4>
                <p className="text-muted-foreground text-sm mb-4">
                  To track Russia's role as shadow beneficiary, monitor:
                </p>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>IEA Oil Market Reports:</strong> Total Russian crude exports (not just seaborne)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Urals-Brent spread:</strong> Compression indicates sanctions easing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Indian/Chinese import volumes:</strong> Demand lock-in indicators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>ESPO pipeline flows:</strong> Infrastructure beyond Ukrainian strike range</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Shadow fleet movements:</strong> Sanctions evasion at scale</span>
                  </li>
                </ul>
              </motion.div>
            </section>

            {/* Section: Game Theory */}
            <section id="game-theory" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                The $88 Equilibrium
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  Game theory suggests the conflict has reached a stable equilibrium — not because
                  parties want peace, but because each major actor's optimal strategy is to continue
                  the current state rather than resolve it.
                </p>
                <p>
                  <strong className="text-amber-400">The $88 price point is the equilibrium marker.</strong> At
                  this level, Russia's windfall is maximized without triggering demand destruction.
                  Higher prices risk recession-driven demand collapse. Lower prices reduce the
                  incentive to extend. The market has found the clearing price that maximizes
                  Russian revenue while keeping buyers solvent.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 p-6 surface-elevated border-l-2 border-amber-400"
              >
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Equilibrium Conditions
                </h4>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold mt-0.5">1.</span>
                    <span>
                      <strong className="text-foreground">Hormuz remains contested</strong> — not fully
                      closed (too much demand destruction) but not reopened (removes price support)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold mt-0.5">2.</span>
                    <span>
                      <strong className="text-foreground">Diplomatic channels exist but fail</strong> —
                      talks provide hope that prevents panic, but never conclude
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold mt-0.5">3.</span>
                    <span>
                      <strong className="text-foreground">Escalation stops short of catastrophe</strong> —
                      no nuclear exchange, no full ground invasion, no regime collapse
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold mt-0.5">4.</span>
                    <span>
                      <strong className="text-foreground">Alternative supply remains constrained</strong> —
                      Venezuela ramp-up slow, OPEC+ doesn't flood market, SPR depleted
                    </span>
                  </li>
                </ul>
              </motion.div>
            </section>

            {/* Section: Actor Analysis */}
            <section id="actor-analysis" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                Seven-Actor Analysis
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  To understand why the equilibrium holds, examine each actor's position:
                </p>
              </motion.div>

              {/* Actor Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 space-y-4"
              >
                {/* United States */}
                <div className="p-4 surface-card border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-400 mb-3">United States</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Wants</p>
                      <p className="text-foreground">Regime change, nuclear elimination, regional dominance</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Leverage</p>
                      <p className="text-foreground">Military supremacy, sanctions, Venezuela supply</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Constraints</p>
                      <p className="text-foreground">Domestic politics, economic blowback, coalition fracture</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Likely Move</p>
                      <p className="text-amber-400">Extend campaign, avoid ground troops, pressure allies</p>
                    </div>
                  </div>
                </div>

                {/* Iran */}
                <div className="p-4 surface-card border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-emerald-400 mb-3">Iran</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Wants</p>
                      <p className="text-foreground">Regime survival, sanctions relief, nuclear status</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Leverage</p>
                      <p className="text-foreground">Hormuz, proxy network, asymmetric capabilities</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Constraints</p>
                      <p className="text-foreground">Depleted arsenal, economic collapse, internal dissent</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Likely Move</p>
                      <p className="text-amber-400">Maintain Hormuz leverage, exhaust U.S. patience</p>
                    </div>
                  </div>
                </div>

                {/* Russia */}
                <div className="p-4 surface-card border border-amber-500/30 rounded-lg">
                  <h4 className="text-lg font-semibold text-amber-400 mb-3">Russia (Shadow Beneficiary)</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Wants</p>
                      <p className="text-foreground">High oil prices, U.S. distraction, sanctions relief</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Leverage</p>
                      <p className="text-foreground">Intel support, weapons supply, UNSC veto</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Constraints</p>
                      <p className="text-foreground">Can't be seen directing, Ukraine drain</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Likely Move</p>
                      <p className="text-red-400 font-semibold">Extend conflict, never resolve</p>
                    </div>
                  </div>
                </div>

                {/* China */}
                <div className="p-4 surface-card border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">China</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Wants</p>
                      <p className="text-foreground">Stable energy supply, U.S. weakness, Taiwan freedom</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Leverage</p>
                      <p className="text-foreground">Economic weight, alternative payment systems</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Constraints</p>
                      <p className="text-foreground">Economic exposure, energy dependence</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Likely Move</p>
                      <p className="text-amber-400">Mediate publicly, enable privately</p>
                    </div>
                  </div>
                </div>

                {/* Israel */}
                <div className="p-4 surface-card border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-400 mb-3">Israel</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Wants</p>
                      <p className="text-foreground">Iran nuclear elimination, Hezbollah degradation</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Leverage</p>
                      <p className="text-foreground">Military capability, U.S. relationship</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Constraints</p>
                      <p className="text-foreground">Multi-front exposure, domestic politics</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Likely Move</p>
                      <p className="text-amber-400">Continue strikes independent of U.S. timeline</p>
                    </div>
                  </div>
                </div>

                {/* Pakistan */}
                <div className="p-4 surface-card border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-emerald-400 mb-3">Pakistan</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Wants</p>
                      <p className="text-foreground">Regional stability, diplomatic relevance, IMF support</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Leverage</p>
                      <p className="text-foreground">Geographic position, Iran relationship</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Constraints</p>
                      <p className="text-foreground">Economic fragility, military balance</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Likely Move</p>
                      <p className="text-amber-400">Facilitate talks, avoid choosing sides</p>
                    </div>
                  </div>
                </div>

                {/* GCC */}
                <div className="p-4 surface-card border border-border rounded-lg">
                  <h4 className="text-lg font-semibold text-primary mb-3">GCC States</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Wants</p>
                      <p className="text-foreground">Infrastructure protection, Iran contained</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Leverage</p>
                      <p className="text-foreground">Oil production capacity, U.S. bases</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Constraints</p>
                      <p className="text-foreground">Vulnerability to Iranian strikes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase mb-1">Likely Move</p>
                      <p className="text-amber-400">Quiet pressure for de-escalation</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section: Scenarios */}
            <section id="scenarios" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                Equilibrium Stress Test
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  What breaks the equilibrium? Three scenarios, with updated probabilities that
                  account for the shadow beneficiary dynamics:
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 space-y-4"
              >
                <div className="p-6 surface-card border border-emerald-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-emerald-400">Quick Resolution</h4>
                    <span className="text-2xl font-bold text-emerald-400">5%</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    U.S.-Iran deal reached within 30 days. Hormuz reopens. Oil returns to $70-80.
                  </p>
                  <p className="text-foreground text-sm">
                    <strong>Why unlikely:</strong> Russia actively works against resolution. Every
                    diplomatic channel has a spoiler. Iran knows Russia will support extended
                    resistance. No credible negotiator remains after Larijani death.
                  </p>
                </div>

                <div className="p-6 surface-card border border-amber-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-amber-400">Protracted Attrition</h4>
                    <span className="text-2xl font-bold text-amber-400">65%</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    4-12 week conflict. Hormuz remains contested. Oil $85-110. Diplomatic talks
                    cycle between hope and failure.
                  </p>
                  <p className="text-foreground text-sm">
                    <strong>Base case:</strong> This is Russia's optimal outcome. Maximum revenue
                    extraction, maximum U.S. distraction, no catastrophic escalation that disrupts
                    the equilibrium.
                  </p>
                </div>

                <div className="p-6 surface-card border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-red-400">Full Escalation</h4>
                    <span className="text-2xl font-bold text-red-400">30%</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    Ground troops deployed. Multi-year occupation. Oil $120+. Regional conflagration.
                  </p>
                  <p className="text-foreground text-sm">
                    <strong>Risk:</strong> Escalation spiral escapes control. Israel acts independently.
                    Iran deploys nuclear ambiguity. This breaks the equilibrium — possibly in Russia's
                    favor (maximum disruption) or against it (global recession collapses demand).
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Section: Collection Priorities */}
            <section id="collection-priorities" className="memo-section">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-heading-1"
              >
                Collection Priorities and Indicators
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="memo-body space-y-6"
              >
                <p>
                  To track the shadow beneficiary thesis, monitor these indicators:
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 p-6 surface-card border border-border rounded-lg"
              >
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Key Data Sources
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-xs uppercase text-primary mb-2">Oil & Revenue</h5>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• IEA Monthly Oil Market Report (total exports, not Bloomberg seaborne)</li>
                      <li>• Urals-Brent spread (Argus Media)</li>
                      <li>• ESPO pipeline flows (Transneft data)</li>
                      <li>• Indian petroleum ministry import data</li>
                      <li>• Chinese customs crude import volumes</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs uppercase text-primary mb-2">Intelligence</h5>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Russian satellite tasking (commercial imagery analysis)</li>
                      <li>• Iranian targeting precision changes</li>
                      <li>• Shadow fleet AIS patterns</li>
                      <li>• Russian naval movements in Persian Gulf</li>
                      <li>• Diplomatic back-channel activity</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <Callout variant="info" title="The Kalshi Position">
                The Russia crude exports position on Kalshi exploits exactly this data source mismatch.
                The market prices off Bloomberg seaborne tracking (~3.5 mbpd). The contract resolves on
                IEA total exports (~4.6 mbpd). The difference is pipeline infrastructure — ESPO, Kozmino,
                Kazakhstan transit — that's beyond Ukrainian strike range and invisible to tanker trackers.
                See <Link to="/positions" className="text-primary hover:underline">Analytical Positions</Link> for
                the full thesis.
              </Callout>
            </section>

            {/* Closing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 pt-8 border-t border-border"
            >
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                The restructuring analyst's job is to identify who wins when everyone else is focused
                on who's losing. In the 2026 Iran conflict, the market is pricing a bilateral war.
                The actual structure is a multi-party game where the shadow beneficiary's optimal
                strategy is permanent extension. Price accordingly.
              </p>

              {/* Cross-links */}
              <div className="flex flex-col md:flex-row gap-4">
                <Link
                  to="/memos/iran-part-iii"
                  className="flex items-center gap-2 px-4 py-3 border border-border rounded hover:border-primary/50 transition-colors group"
                >
                  <ArrowLeft size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Part III</p>
                    <p className="text-sm text-foreground">The Trojan Horse</p>
                  </div>
                </Link>
                <Link
                  to="/positions"
                  className="flex items-center gap-2 px-4 py-3 border border-border rounded hover:border-primary/50 transition-colors group"
                >
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase">Applied Analysis</p>
                    <p className="text-sm text-foreground">Analytical Positions</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </motion.div>
          </article>
        </div>
    </PageLayout>
  );
};

export default ShadowPartnerMemo;
