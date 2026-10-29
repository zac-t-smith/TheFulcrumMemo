import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  Target,
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign,
  Percent,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

// Position data types
interface Position {
  id: string;
  market: string;
  contract: string;
  direction: 'YES' | 'NO';
  entryAvg: number; // cents
  cost: number; // dollars
  maxPayout: number; // dollars
  potentialReturn: number; // percentage
  edge: string;
  edgePercent: number; // for calculations
  thesis: string;
  fullThesis: string;
  resolutionCriteria: string;
  riskFactors: string[];
  precedingAnalysis: { date: string; description: string; link: string }[];
  links: string[];
  dateOpened: string;
  status: 'OPEN' | 'RESOLVED';
  // v2 (Track Record): populate these when a position resolves.
  // Leave as null until you have exit data; the aggregate stats will
  // skip the position until outcome is set.
  outcome?: 'WON' | 'LOST' | null;
  exitDate?: string | null;
  exitValue?: number | null;        // dollars realized at resolution
  realizedReturnPct?: number | null;
  resolutionNote?: string | null;   // short explanation of what happened
}

// Hardcoded positions data
const positions: Position[] = [
  {
    id: 'iran-nuclear-june',
    market: 'US-Iran Nuclear Deal?',
    contract: 'No · Before June',
    direction: 'NO',
    entryAvg: 49.5,
    cost: 21.00,
    maxPayout: 35.89,
    potentialReturn: 71,
    edge: 'Fair value ~75¢, entry ~49.5¢ = 25¢ edge',
    edgePercent: 25,
    thesis: 'Islamabad talks collapsed after 21 hours over nuclear. Iran set preconditions. Trump canceled envoys Apr 25. Protracted Attrition base case (65%).',
    fullThesis: `The Islamabad channel—the only bilateral diplomatic framework since the war began—collapsed on Day 43 after 21 hours of negotiations. The sticking point: nuclear. Iran demanded lifting of all nuclear-related sanctions as a precondition; the US refused.

On Day 44, Trump canceled the Witkoff/Kushner envoy trip to Pakistan, stating Iran "offered a lot, but not enough." The US-Iran diplomatic channel is now frozen with no credible path to resumption before June.

Our Protracted Attrition scenario remains the base case at 65% probability. Quick Resolution has collapsed to single digits. The structural dynamics—mutual blockade, no negotiator, domestic political constraints on both sides—all point to extended conflict timeline.

A nuclear deal before June would require: (1) revival of a frozen diplomatic channel, (2) Iranian capitulation on preconditions, (3) US acceptance of terms Iran has already rejected. The probability of all three occurring in the next 5 weeks is negligible.`,
    resolutionCriteria: 'Contract resolves YES if the US and Iran announce a nuclear agreement before June 1, 2026. Any official bilateral statement confirming a deal triggers resolution. Resolves NO otherwise.',
    riskFactors: [
      'Unexpected diplomatic breakthrough via third-party (China, Russia)',
      'Iranian regime change triggering rapid negotiation',
      'Trump executive action bypassing formal deal structure',
    ],
    precedingAnalysis: [
      { date: 'Apr 12, 2026', description: 'Day 43: Islamabad talks collapse documented', link: '/field-notes/day-43' },
      { date: 'Apr 13, 2026', description: 'Day 44: Trump cancels envoy trip', link: '/field-notes/day-44' },
      { date: 'Apr 1, 2026', description: 'Part III: Protracted Attrition framework', link: '/memos/iran-part-iii' },
    ],
    links: ['/field-notes/day-43', '/field-notes/day-44', '/memos/iran-part-iii'],
    dateOpened: '2026-04-19',
    status: 'OPEN', // TODO(zac): the Iran series is archived at Apr 26, 2026. If this contract settled before cutoff, set status='RESOLVED' and fill outcome / exitDate / exitValue / realizedReturnPct / resolutionNote below.
    outcome: null,
    exitDate: null,
    exitValue: null,
    realizedReturnPct: null,
    resolutionNote: null,
  },
  {
    id: 'iran-nuclear-july',
    market: 'US-Iran Nuclear Deal?',
    contract: 'No · Before July',
    direction: 'NO',
    entryAvg: 50.8,
    cost: 5.00,
    maxPayout: 10.09,
    potentialReturn: 102,
    edge: 'Fair value ~65¢, entry ~50.8¢ = 14¢ edge',
    edgePercent: 14,
    thesis: 'Extended timeline on same Protracted Attrition thesis. Hedges June position if deal slips to June-July window.',
    fullThesis: `This position extends the same analytical framework to the July timeframe, providing hedge value if negotiations restart in late May but fail to conclude before June.

The July contract trades at similar levels to June despite the additional month, suggesting the market is pricing a binary outcome: either rapid resolution or extended stalemate. Our analysis supports the stalemate case.

Even if diplomatic channels reopen in May, the complexity of nuclear negotiations—inspections, sanctions sequencing, congressional review—makes a sub-60-day timeline implausible. The JCPOA took 20 months to negotiate; a replacement framework under wartime conditions would face even higher friction.`,
    resolutionCriteria: 'Contract resolves YES if the US and Iran announce a nuclear agreement before July 1, 2026. Resolves NO otherwise.',
    riskFactors: [
      'June deal announcement that extends into July implementation',
      'Interim agreement framed as "nuclear deal" triggering early resolution',
    ],
    precedingAnalysis: [
      { date: 'Apr 13, 2026', description: 'Day 44: Diplomatic channel analysis', link: '/field-notes/day-44' },
    ],
    links: ['/field-notes/day-44'],
    dateOpened: '2026-04-19',
    status: 'OPEN', // TODO(zac): the Iran series is archived at Apr 26, 2026. If this contract settled before cutoff, set status='RESOLVED' and fill outcome / exitDate / exitValue / realizedReturnPct / resolutionNote below.
    outcome: null,
    exitDate: null,
    exitValue: null,
    realizedReturnPct: null,
    resolutionNote: null,
  },
  {
    id: 'russia-crude-april',
    market: 'Russia Crude Exports Below 4.0 mbpd in April?',
    contract: 'No · Below 4.0 mbpd',
    direction: 'NO',
    entryAvg: 35,
    cost: 23.43,
    maxPayout: 67.00,
    potentialReturn: 186,
    edge: 'Fair value ~55¢, entry ~35¢ = 20¢ edge (45% per contract)',
    edgePercent: 20,
    thesis: 'Data source mismatch: market pricing off Bloomberg seaborne tracking (3.1-3.5 mbpd) while Kalshi contract resolves on IEA total exports including pipeline flows (+1.3 mbpd floor). March IEA total: 4.6 mbpd.',
    fullThesis: `This position exploits a critical data source mismatch between market pricing and contract resolution criteria.

**The Mispricing:**
The market appears to be pricing based on Bloomberg seaborne tanker tracking, which shows Russian crude exports at 3.1-3.5 mbpd in recent weeks. However, the Kalshi contract resolves on IEA Oil Market Report data, which includes BOTH seaborne AND pipeline exports.

**The Pipeline Floor:**
Russian pipeline infrastructure provides a structural floor that seaborne tracking misses:
- ESPO pipeline to China: ~1.0 mbpd (beyond Ukrainian strike range)
- Kozmino Pacific terminal: ~0.3-0.5 mbpd
- Kazakhstan transit (CPC blend): ~0.2 mbpd
- **Total pipeline floor: ~1.3-1.5 mbpd**

Even if seaborne exports dropped to 2.5 mbpd (extreme scenario), total exports would remain above 3.8 mbpd.

**The March Precedent:**
IEA March Oil Market Report showed Russian crude exports at 4.6 mbpd total. Ukrainian drone strikes on Russian refineries have actually INCREASED export availability by reducing domestic processing demand.

**Demand Pull:**
India remains at ~2.0 mbpd imports from Russia; China at ~1.8 mbpd. Neither buyer has reduced orders despite Western pressure. The demand side is structurally locked in.`,
    resolutionCriteria: 'Contract resolves based on IEA Oil Market Report data for April 2026. IEA reports TOTAL crude exports including pipeline flows. Resolves YES if IEA reports Russia crude exports below 4.0 mbpd; NO if 4.0 mbpd or above.',
    riskFactors: [
      'Ukrainian sustained multi-port strikes disrupting ESPO loading',
      'IEA methodology change excluding certain export categories',
      'Catastrophic infrastructure failure (Druzhba pipeline, etc.)',
      'Self-sanctioning by remaining buyers',
    ],
    precedingAnalysis: [
      { date: 'Apr 20, 2026', description: 'Shadow fleet analysis and pipeline infrastructure research', link: '/memos/shadow-partner' },
    ],
    links: ['/memos/shadow-partner'],
    dateOpened: '2026-04-20',
    status: 'OPEN', // TODO(zac): the Iran series is archived at Apr 26, 2026. If the IEA April OMR has published, set status='RESOLVED' and fill outcome / exitDate / exitValue / realizedReturnPct / resolutionNote below.
    outcome: null,
    exitDate: null,
    exitValue: null,
    realizedReturnPct: null,
    resolutionNote: null,
  },
];

// Track Record aggregate helpers.
const resolvedPositions = positions.filter((p) => p.status === 'RESOLVED' && p.outcome);
const openPositions = positions.filter((p) => p.status === 'OPEN');
const wins = resolvedPositions.filter((p) => p.outcome === 'WON').length;
const hitRate = resolvedPositions.length ? (wins / resolvedPositions.length) * 100 : null;
const avgRealized = resolvedPositions.length
  ? resolvedPositions.reduce((s, p) => s + (p.realizedReturnPct ?? 0), 0) / resolvedPositions.length
  : null;

// Portfolio calculations
const totalDeployed = positions.reduce((sum, p) => sum + p.cost, 0);
const maxPayout = positions.reduce((sum, p) => sum + p.maxPayout, 0);
const maxReturn = ((maxPayout - totalDeployed) / totalDeployed) * 100;
const avgEdge = positions.reduce((sum, p) => sum + p.edgePercent, 0) / positions.length;
const avgPotentialReturn = positions.reduce((sum, p) => sum + p.potentialReturn, 0) / positions.length;

// Position Card Component
const PositionCard = ({ position }: { position: Position }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const directionColor = position.direction === 'NO' ? 'text-emerald-700' : 'text-red-700';
  const directionBg = position.direction === 'NO' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="surface-card border border-border rounded-lg overflow-hidden"
    >
      {/* Main Card Content */}
      <div className="p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={cn('px-2 py-0.5 rounded text-xs font-semibold border', directionBg, directionColor)}>
                {position.direction}
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded text-[10px] uppercase tracking-wider',
                position.status === 'OPEN'
                  ? 'bg-blue-500/10 text-blue-700 border border-blue-500/30'
                  : position.outcome === 'WON'
                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                  : position.outcome === 'LOST'
                  ? 'bg-red-500/10 text-red-700 border border-red-500/30'
                  : 'bg-slate-500/10 text-slate-600 border border-slate-500/30'
              )}>
                {position.status === 'OPEN'
                  ? 'OPEN'
                  : position.outcome
                  ? `RESOLVED — ${position.outcome}`
                  : 'RESOLVED — outcome: TODO'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {position.market}
            </h3>
            <p className="text-sm text-muted-foreground">
              {position.contract}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-700">
              {position.potentialReturn}%
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">
              Potential Return
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground mb-1">Entry Price</p>
            <p className="text-lg font-semibold text-foreground">{position.entryAvg}¢</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20">
            <p className="text-xs text-amber-700 mb-1">Edge at Entry</p>
            <p className="text-lg font-semibold text-amber-700">{position.edgePercent}¢</p>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground mb-1">Date Opened</p>
            <p className="text-sm font-semibold text-foreground">{position.dateOpened}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground mb-1">Max Payout</p>
            <p className="text-lg font-semibold text-foreground">${position.maxPayout.toFixed(2)}</p>
          </div>
        </div>

        {/* Thesis Summary */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">THESIS</p>
          <p className="text-sm text-foreground leading-relaxed">{position.thesis}</p>
        </div>

        {/* Links */}
        {position.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {position.precedingAnalysis.map((analysis, idx) => (
              <Link
                key={idx}
                to={analysis.link}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 rounded text-xs text-primary hover:bg-primary/20 transition-colors"
              >
                {analysis.date.split(',')[0]}
                <ExternalLink size={10} />
              </Link>
            ))}
          </div>
        )}

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? 'Hide Details' : 'Show Full Analysis'}
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-6 bg-muted/20 space-y-6">
              {/* Full Thesis */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                  <Target size={14} />
                  Full Analytical Basis
                </h4>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {position.fullThesis}
                </div>
              </div>

              {/* Preceding Analysis */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                  <Calendar size={14} />
                  Preceding Published Analysis
                </h4>
                <div className="space-y-2">
                  {position.precedingAnalysis.map((analysis, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">{analysis.date}</p>
                        <p className="text-sm text-foreground">{analysis.description}</p>
                      </div>
                      <Link
                        to={analysis.link}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Criteria */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                  <Shield size={14} />
                  Contract Resolution Criteria
                </h4>
                <div className="p-4 bg-background/50 rounded border border-border">
                  <p className="text-sm text-foreground leading-relaxed ">
                    {position.resolutionCriteria}
                  </p>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Risk Factors Acknowledged
                </h4>
                <ul className="space-y-2">
                  {position.riskFactors.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-red-700 mt-1">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PositionsPage = () => {
  return (
    <>
      <Helmet>
        <title>Track Record | The Fulcrum Memo</title>
        <meta
          name="description"
          content="Each position preceded by timestamped published analysis on Kalshi, a CFTC-regulated prediction market. Open positions are marked open; resolved positions show the outcome. No fabricated results."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Phase 2: widened from max-w-4xl → container-wide (1120px) for consistency with other hubs. */}
        <div className="max-w-[1120px] mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-slate-500/10 border border-slate-500/30 rounded text-slate-600 text-[10px] uppercase tracking-wider">
                Kalshi — CFTC Regulated
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Track Record
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Published analysis translated into positions on Kalshi, a CFTC-regulated prediction market. Each
              position is preceded by a timestamped memo or field note that argued the mispricing. Open positions
              are marked open. Resolved positions show the outcome. Positions still pending final data are
              labeled{' '}
              <span className="font-mono text-foreground">RESOLVED — outcome: TODO</span>; results will not be
              posted until the resolution source is public.
            </p>
          </motion.div>

          {/* Portfolio Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="p-4 surface-card border border-border rounded-lg text-center">
              <BarChart3 size={16} className="text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{positions.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Total Positions</p>
            </div>
            <div className="p-4 surface-card border border-border rounded-lg text-center">
              <TrendingUp size={16} className="text-blue-700 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{openPositions.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Open</p>
            </div>
            <div className="p-4 surface-card border border-border rounded-lg text-center">
              <Target size={16} className="text-emerald-700 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">
                {hitRate != null ? `${hitRate.toFixed(0)}%` : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">Hit Rate (resolved)</p>
            </div>
            <div className="p-4 surface-card border border-border rounded-lg text-center">
              <Percent size={16} className="text-amber-700 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-700">
                {avgRealized != null ? `${avgRealized.toFixed(0)}%` : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">Avg Realized Return</p>
            </div>
          </motion.div>

          {/* Methodology Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12 p-6 surface-card border border-border rounded-lg"
          >
            <h2 className="text-[10px] uppercase tracking-wider text-primary mb-4">
              Methodology
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every position follows the same process: <span className="text-foreground">analysis → mispricing identification → position → tracking</span>.
              The Fulcrum Memo publishes timestamped analysis; when that analysis reveals a prediction market mispricing, a position is opened.
              The contract resolution criteria analysis—reading the "indenture" to understand exactly what triggers YES vs NO—is the same skill as restructuring credit agreement analysis.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every position listed below was preceded by published analysis. The timestamps on both the analysis and the trades are independently verifiable.
            </p>
          </motion.div>

          {/* Active Positions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Positions
            </h2>
            <div className="space-y-6">
              {positions.map((position) => (
                <PositionCard key={position.id} position={position} />
              ))}
            </div>
          </motion.div>

          {/* Edge Analysis Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-12 p-6 surface-card border border-border rounded-lg"
          >
            <h2 className="text-[10px] uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Target size={14} />
              Edge Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-amber-500/10 rounded border border-amber-500/20 text-center">
                <p className="text-3xl font-bold text-amber-700">{avgEdge.toFixed(0)}¢</p>
                <p className="text-xs text-muted-foreground mt-1">Average Edge at Entry</p>
                <p className="text-[10px] text-amber-800 mt-2">per $1 contract</p>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded border border-emerald-500/20 text-center">
                <p className="text-3xl font-bold text-emerald-700">{avgPotentialReturn.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Potential Return at Entry</p>
                <p className="text-[10px] text-emerald-800 mt-2">pre-resolution, each contract</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded border border-blue-500/20 text-center">
                <p className="text-3xl font-bold text-blue-700">100%</p>
                <p className="text-xs text-muted-foreground mt-1">Positions with Prior Analysis</p>
                <p className="text-[10px] text-blue-800 mt-2">timestamped & verifiable</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted/30 rounded">
              <p className="text-xs text-foreground font-semibold mb-2">Method: Contract Resolution Criteria Analysis</p>
              <p className="text-sm text-muted-foreground">
                The edge comes from carefully reading contract resolution criteria—the prediction market equivalent of reading a credit indenture.
                Understanding exactly what data source triggers resolution, what constitutes "yes" vs "no," and where the market's assumptions diverge from the contract terms.
              </p>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 border border-dashed border-border rounded-lg"
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Disclaimer:</span> All positions placed on Kalshi, a CFTC-regulated US prediction market.
              Each position is grounded in analysis published on The Fulcrum Memo before the position was opened.
              Timestamps on both the analysis and the trades are independently verifiable.
              Returns shown are potential maximum returns; actual returns depend on market resolution.
              This is not investment advice.
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default PositionsPage;
