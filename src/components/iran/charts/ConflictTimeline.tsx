import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { oilPriceData, getOilPrice, EIA_SOURCE_ATTRIBUTION, getLatestOilPrice, getPercentChangeFromBaseline } from '@/data/oilPriceData';
import { scenarioUpdates, casualtyTimeline, hormuzTimeline, conflictMetadata } from '@/data/iranConflictData';

// =============================================================================
// TYPES
// =============================================================================

interface TimelineEvent {
  date: string;
  label: string;
  description?: string;
  track: 'strategic' | 'military' | 'energy' | 'diplomacy';
  link?: string;
  conflictDay?: number;
}

interface ConflictTimelineProps {
  mode: 'full' | 'compact';
  className?: string;
}

// =============================================================================
// COLORS
// =============================================================================

const COLORS = {
  strategic: '#2E7D4F',
  military: '#C8102E',
  energy: '#B07D2B',
  diplomacy: '#1F3A5F',
  phases: {
    prepositioning: '#2E7D4F',
    shock: '#C8102E',
    attrition: '#B07D2B',
    negotiation: '#1F3A5F',
    resolution: '#4a4a4a',
  },
};

// =============================================================================
// PHASES
// =============================================================================

const phases = [
  { id: 'prepositioning', label: 'PRE-POSITIONING', start: '2026-01-01', end: '2026-02-27', color: COLORS.phases.prepositioning },
  { id: 'shock', label: 'SHOCK & ESCALATION', start: '2026-02-28', end: '2026-03-14', color: COLORS.phases.shock },
  { id: 'attrition', label: 'ATTRITION', start: '2026-03-15', end: '2026-03-25', color: COLORS.phases.attrition },
  { id: 'negotiation', label: 'NEGOTIATION', start: '2026-03-26', end: '2026-04-06', color: COLORS.phases.negotiation },
  { id: 'resolution', label: 'RESOLUTION (?)', start: '2026-04-07', end: '2026-04-15', color: COLORS.phases.resolution },
];

// =============================================================================
// EVENT DATA
// =============================================================================

const timelineEvents: TimelineEvent[] = [
  // Strategic Positioning Track (Green)
  { date: '2026-01-03', label: 'Operation Absolute Resolve', description: 'Venezuela seized — 303B barrels under U.S. operational control', track: 'strategic' },
  { date: '2026-01-14', label: 'First Venezuelan oil sold', description: '$500M revenue from U.S.-controlled Venezuelan oil', track: 'strategic' },
  { date: '2026-01-26', label: 'South Korea tariffs → 25%', description: 'Tariffs escalated between Venezuela seizure and Iran strikes', track: 'strategic' },
  { date: '2026-01-29', label: 'OFAC GL 46', description: 'U.S. firms authorized to market Venezuelan oil', track: 'strategic' },
  { date: '2026-02-03', label: 'GL 47 — diluent exports', description: 'U.S. diluent exports to Venezuela authorized', track: 'strategic' },
  { date: '2026-02-13', label: 'GL 49 & GL 50', description: 'Upstream investment in Venezuela authorized', track: 'strategic' },

  // Military Operations Track (Red)
  { date: '2026-02-28', label: 'Operation Epic Fury', description: 'U.S.-Israel strikes begin, Khamenei killed in initial strikes', track: 'military', conflictDay: 1, link: '/field-notes/1' },
  { date: '2026-03-08', label: 'Israel strikes Iranian oil', description: 'First strikes on Iranian oil infrastructure: Shahr Rey, Shahran depots', track: 'military', conflictDay: 9, link: '/field-notes/9' },
  { date: '2026-03-14', label: 'Kharg Island struck', description: 'U.S. bombs Kharg Island military targets — 90% of Iran exports', track: 'military', conflictDay: 15, link: '/field-notes/15' },
  { date: '2026-03-17', label: 'Ali Larijani killed', description: 'Last viable negotiation partner eliminated in strikes', track: 'military', conflictDay: 18, link: '/field-notes/18' },
  { date: '2026-03-18', label: 'South Pars struck', description: 'Israel strikes South Pars gas field, triggering Ras Laffan retaliation', track: 'military', conflictDay: 19, link: '/field-notes/19' },
  { date: '2026-03-22', label: 'Dimona struck', description: 'Iranian missiles hit near Israeli nuclear center — 100+ injured', track: 'military', conflictDay: 23, link: '/field-notes/23' },
  { date: '2026-03-27', label: 'Arak reactor destroyed', description: 'IAEA confirms Arak reactor no longer operational. Prince Sultan base hit.', track: 'military', conflictDay: 28, link: '/field-notes/28' },
  { date: '2026-03-28', label: 'Houthis enter war', description: 'Houthis officially enter conflict, expanding front', track: 'military', conflictDay: 29, link: '/field-notes/29' },
  { date: '2026-04-01', label: 'Trump primetime address', description: '"Stone Ages" — claims war nearing completion, 2-3 more weeks', track: 'military', conflictDay: 33, link: '/field-notes/33' },

  // Energy & Markets Track (Amber)
  { date: '2026-03-04', label: 'Hormuz effectively closed', description: 'Insurance withdrawal blocks Western shipping — de facto closure', track: 'energy', conflictDay: 5, link: '/field-notes/5' },
  { date: '2026-03-12', label: 'Brent crosses $100', description: 'Oil establishes $100 floor despite record SPR release', track: 'energy', conflictDay: 13, link: '/field-notes/13' },
  { date: '2026-03-18', label: 'Ras Laffan struck', description: "World's largest LNG facility hit — 5 years to repair, 17% capacity lost", track: 'energy', conflictDay: 19, link: '/field-notes/19' },
  { date: '2026-03-19', label: 'Brent hits $119 intraday', description: 'Goldman warns oil could exceed $147 all-time high', track: 'energy', conflictDay: 20, link: '/field-notes/20' },
  { date: '2026-03-21', label: 'Mina al-Ahmadi hit', description: 'Kuwait refinery struck — 730K bpd capacity', track: 'energy', conflictDay: 22, link: '/field-notes/22' },
  { date: '2026-03-23', label: 'Oil crashes 11%', description: '"Productive conversations" signal — first de-escalation', track: 'energy', conflictDay: 24, link: '/field-notes/24' },
  { date: '2026-03-25', label: 'Hormuz tolls approved', description: 'Iran parliament approves Hormuz transit fees', track: 'energy', conflictDay: 26, link: '/field-notes/26' },
  { date: '2026-03-31', label: 'Chinese vessels transiting', description: 'Yuan-transit framework operational. Haifa oil struck.', track: 'energy', conflictDay: 32, link: '/field-notes/32' },
  { date: '2026-04-01', label: 'Oil crashes to $101', description: 'Primetime address drives 14% crash from week highs', track: 'energy', conflictDay: 33, link: '/field-notes/33' },

  // Diplomacy & Politics Track (Blue)
  { date: '2026-03-15', label: 'Araghchi: "No ceasefire"', description: 'Iran FM denies requesting ceasefire — "We never asked"', track: 'diplomacy', conflictDay: 16, link: '/field-notes/16' },
  { date: '2026-03-20', label: 'Trump rejects ceasefire', description: 'Calls NATO "cowards" — strikes hit Tehran during Nowruz', track: 'diplomacy', conflictDay: 21, link: '/field-notes/21' },
  { date: '2026-03-23', label: '"Productive conversations"', description: 'First de-escalation signal — Trump delays strikes', track: 'diplomacy', conflictDay: 24, link: '/field-notes/24' },
  { date: '2026-03-25', label: 'Iran rejects 15-point plan', description: 'Issues 5 conditions including reparations and sanctions removal', track: 'diplomacy', conflictDay: 26, link: '/field-notes/26' },
  { date: '2026-03-26', label: 'Deadline extended to Apr 6', description: 'Trump extends ultimatum deadline to April 6', track: 'diplomacy', conflictDay: 27, link: '/field-notes/27' },
  { date: '2026-03-29', label: 'Islamabad summit', description: 'Pakistan, Saudi, Turkey, Egypt meet — regional mediation', track: 'diplomacy', conflictDay: 30, link: '/field-notes/30' },
  { date: '2026-04-01', label: '2-3 more weeks', description: 'Trump primetime: claims resolution in 2-3 weeks', track: 'diplomacy', conflictDay: 33, link: '/field-notes/33' },
];

// =============================================================================
// HELPERS
// =============================================================================

const TIMELINE_START = new Date('2026-01-01').getTime();
const TIMELINE_END = new Date('2026-04-15').getTime();

const getXPosition = (dateStr: string): number => {
  const current = new Date(dateStr).getTime();
  return ((current - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
};

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get oil price for a date, with fallback to nearest available
const getOilPriceForDate = (dateStr: string): number | null => {
  const entry = getOilPrice(dateStr);
  if (entry && entry.brentSpot > 0) return entry.brentSpot;

  // Find nearest date with valid price
  const targetDate = new Date(dateStr).getTime();
  let nearest = oilPriceData
    .filter(e => e.brentSpot > 0)
    .reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.date).getTime() - targetDate);
      const currDiff = Math.abs(new Date(curr.date).getTime() - targetDate);
      return currDiff < prevDiff ? curr : prev;
    });
  return nearest?.brentSpot || null;
};

// Prepare chart data
const getChartData = () => {
  return oilPriceData
    .filter(entry => {
      const date = new Date(entry.date);
      return date >= new Date('2026-02-01') && entry.brentSpot > 0;
    })
    .map(entry => ({
      date: entry.date,
      dateShort: formatDateShort(entry.date),
      brent: entry.brentSpot,
      day: entry.conflictDay,
    }));
};

// Get latest scenario probabilities
const getLatestScenario = () => {
  return scenarioUpdates[scenarioUpdates.length - 1];
};

// Get scenario for a specific date
const getScenarioForDate = (dateStr: string) => {
  const targetTime = new Date(dateStr).getTime();
  let closest = scenarioUpdates[0];
  for (const update of scenarioUpdates) {
    if (update.timestamp <= targetTime) {
      closest = update;
    }
  }
  return closest;
};

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

const PhaseBar = ({ className }: { className?: string }) => {
  const totalDays = (TIMELINE_END - TIMELINE_START) / (1000 * 60 * 60 * 24);

  return (
    <div className={cn('flex h-8 rounded overflow-hidden', className)}>
      {phases.map((phase) => {
        const startPos = getXPosition(phase.start);
        const endPos = getXPosition(phase.end);
        const width = endPos - startPos;

        return (
          <div
            key={phase.id}
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              width: `${width}%`,
              backgroundColor: phase.color,
              opacity: phase.id === 'resolution' ? 0.4 : 0.8,
            }}
          >
            <span className="text-[8px] md:text-[9px] text-white font-semibold tracking-wider whitespace-nowrap px-1">
              {phase.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface FilterButtonsProps {
  activeFilters: Set<string>;
  onToggle: (track: string) => void;
}

const FilterButtons = ({ activeFilters, onToggle }: FilterButtonsProps) => {
  const tracks = [
    { id: 'strategic', label: 'Strategic', color: COLORS.strategic },
    { id: 'military', label: 'Military', color: COLORS.military },
    { id: 'energy', label: 'Energy', color: COLORS.energy },
    { id: 'diplomacy', label: 'Diplomacy', color: COLORS.diplomacy },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tracks.map((track) => {
        const isActive = activeFilters.has(track.id);
        return (
          <button
            key={track.id}
            onClick={() => onToggle(track.id)}
            className={cn(
              'px-3 py-1.5 text-[10px] uppercase tracking-wider rounded transition-all',
              isActive
                ? 'text-white'
                : 'bg-transparent text-zinc-500 border border-zinc-700 hover:text-zinc-300'
            )}
            style={{
              backgroundColor: isActive ? track.color : undefined,
            }}
          >
            {track.label}
          </button>
        );
      })}
    </div>
  );
};

interface EventDotProps {
  event: TimelineEvent;
  onHover: (event: TimelineEvent | null) => void;
  onClick?: (event: TimelineEvent) => void;
  isVisible: boolean;
}

const EventDot = ({ event, onHover, onClick, isVisible }: EventDotProps) => {
  const xPos = getXPosition(event.date);
  const color = COLORS[event.track];

  if (!isVisible) return null;

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-pointer z-10"
      style={{ left: `${xPos}%`, transform: 'translateX(-50%)' }}
      onMouseEnter={() => onHover(event)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick?.(event)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.3 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="w-3 h-3 rounded-full border-2 shadow-lg"
        style={{
          backgroundColor: color,
          borderColor: color,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </motion.div>
  );
};

interface EventTooltipProps {
  event: TimelineEvent | null;
}

const EventTooltip = ({ event }: EventTooltipProps) => {
  if (!event) return null;

  const oilPrice = getOilPriceForDate(event.date);
  const color = COLORS[event.track];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <p className="text-xs text-zinc-400">
          {formatDateShort(event.date)}
          {event.conflictDay && (
            <span className="text-primary ml-2">Day {event.conflictDay}</span>
          )}
        </p>
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">
        {event.label}
      </p>
      {event.description && (
        <p className="text-xs text-zinc-400 mb-2">
          {event.description}
        </p>
      )}
      {oilPrice && (
        <p className="text-xs text-amber-400">
          Brent: ${oilPrice.toFixed(2)}
        </p>
      )}
      {event.link && (
        <p className="text-[10px] text-primary mt-2">
          → Field note available
        </p>
      )}
    </motion.div>
  );
};

interface EventModalProps {
  event: TimelineEvent | null;
  onClose: () => void;
}

const EventModal = ({ event, onClose }: EventModalProps) => {
  if (!event) return null;

  const oilPrice = getOilPriceForDate(event.date);
  const scenario = event.conflictDay ? getScenarioForDate(event.date) : null;
  const color = COLORS[event.track];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div>
              <p className="text-xs text-zinc-400">
                {formatDateShort(event.date)}
                {event.conflictDay && (
                  <span className="text-primary ml-2">Day {event.conflictDay}</span>
                )}
              </p>
              <h3 className="text-lg font-bold text-foreground">
                {event.label}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {event.description && (
          <p className="text-sm text-zinc-300 mb-4">
            {event.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          {oilPrice && (
            <div className="bg-zinc-800 p-3 rounded">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Brent Crude
              </p>
              <p className="text-xl font-bold text-amber-400">
                ${oilPrice.toFixed(2)}
              </p>
            </div>
          )}
          {scenario && (
            <div className="bg-zinc-800 p-3 rounded">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Full Escalation Prob.
              </p>
              <p className="text-xl font-bold text-red-400">
                {scenario.probabilities.find(p => p.scenario === 'Full Escalation')?.probability}%
              </p>
            </div>
          )}
        </div>

        {event.link && (
          <Link
            to={event.link}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            View field note <ArrowRight size={14} />
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
};

const ScenarioBar = ({ className }: { className?: string }) => {
  const latest = getLatestScenario();
  if (!latest) return null;

  const quick = latest.probabilities.find(p => p.scenario === 'Quick Resolution')?.probability || 0;
  const protracted = latest.probabilities.find(p => p.scenario === 'Protracted Attrition')?.probability || 0;
  const full = latest.probabilities.find(p => p.scenario === 'Full Escalation')?.probability || 0;

  const baseCase = full > protracted && full > quick ? 'Full Escalation'
    : protracted > quick ? 'Protracted Attrition'
    : 'Quick Resolution';

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
          Scenario Probabilities (Day {latest.day})
        </p>
      </div>
      <div className="flex h-6 rounded overflow-hidden">
        <div
          className="flex items-center justify-center"
          style={{ width: `${quick}%`, backgroundColor: COLORS.strategic }}
        >
          {quick >= 10 && (
            <span className="text-[9px] text-white font-semibold">
              {quick}%
            </span>
          )}
        </div>
        <div
          className="flex items-center justify-center"
          style={{ width: `${protracted}%`, backgroundColor: COLORS.energy }}
        >
          {protracted >= 10 && (
            <span className="text-[9px] text-white font-semibold">
              {protracted}%
            </span>
          )}
        </div>
        <div
          className="flex items-center justify-center relative"
          style={{ width: `${full}%`, backgroundColor: COLORS.military }}
        >
          {full >= 10 && (
            <span className="text-[9px] text-white font-semibold">
              {full}%
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[9px] text-zinc-500">
        <span>Quick Resolution</span>
        <span>Protracted</span>
        <span className="flex items-center gap-1">
          Full Escalation
          {baseCase === 'Full Escalation' && (
            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[8px]">
              BASE
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

const MetricCards = ({ className }: { className?: string }) => {
  const latestOil = getLatestOilPrice();
  const change = getPercentChangeFromBaseline(latestOil);
  const latestCasualty = casualtyTimeline[casualtyTimeline.length - 1];
  const latestHormuz = hormuzTimeline[hormuzTimeline.length - 1];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
          Brent Crude
        </p>
        <p className="text-2xl font-bold text-amber-400">
          ${latestOil.brentSpot.toFixed(2)}
        </p>
        <p className="text-xs text-zinc-400">
          +{change.brent.toFixed(1)}% from pre-war
        </p>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
          Hormuz Closure
        </p>
        <p className="text-2xl font-bold text-red-400">
          {conflictMetadata.conflictDay}+ days
        </p>
        <p className="text-xs text-zinc-400">
          ~16M bpd offline
        </p>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
          U.S. Casualties
        </p>
        <p className="text-2xl font-bold text-foreground">
          {latestCasualty?.usKilled || 13}
        </p>
        <p className="text-xs text-zinc-400">
          KIA / 300+ wounded
        </p>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
          Venezuela Output
        </p>
        <p className="text-2xl font-bold text-emerald-400">
          ~900K bpd
        </p>
        <p className="text-xs text-zinc-400">
          Under U.S. control
        </p>
      </div>
    </div>
  );
};

const OilPriceOverlay = ({ height = 120, className }: { height?: number; className?: string }) => {
  const chartData = useMemo(() => getChartData(), []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-xl">
        <p className="text-[10px] text-zinc-400">{data.dateShort}</p>
        <p className="text-sm font-bold text-amber-400">
          ${data.brent?.toFixed(2)}
        </p>
      </div>
    );
  };

  return (
    <div className={cn('', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <XAxis
            dataKey="dateShort"
            stroke="#2a2a2a"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#2a2a2a"
            fontSize={9}
            tickFormatter={(v) => `$${v}`}
            domain={[60, 130]}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={73}
            stroke="#2a2a2a"
            strokeDasharray="3 3"
            label={{ value: 'Pre-war $73', fill: '#2a2a2a', fontSize: 8, position: 'insideTopLeft' }}
          />
          <ReferenceLine
            y={100}
            stroke="#B07D2B"
            strokeDasharray="3 3"
            label={{ value: '$100', fill: '#B07D2B', fontSize: 8, position: 'insideTopLeft' }}
          />
          <ReferenceLine
            x="Feb 28"
            stroke="#C8102E"
            strokeDasharray="5 5"
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey="brent"
            stroke="#B07D2B"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#B07D2B' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ConflictTimeline = ({ mode, className }: ConflictTimelineProps) => {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(['strategic', 'military', 'energy', 'diplomacy'])
  );
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const toggleFilter = (track: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(track)) {
      newFilters.delete(track);
    } else {
      newFilters.add(track);
    }
    setActiveFilters(newFilters);
  };

  const handleEventClick = (event: TimelineEvent) => {
    if (mode === 'full') {
      setSelectedEvent(event);
    }
  };

  const tracks = ['strategic', 'military', 'energy', 'diplomacy'] as const;
  const trackLabels = {
    strategic: 'Strategic Positioning',
    military: 'Military Operations',
    energy: 'Energy & Markets',
    diplomacy: 'Diplomacy & Politics',
  };

  const isCompact = mode === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        'bg-zinc-900/50 border border-zinc-800 rounded-lg',
        isCompact ? 'p-4 md:p-6' : 'p-6 md:p-8',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          {!isCompact && (
            <>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                The Restructuring of the Middle East
              </h3>
              <p className="text-sm text-zinc-400">
                Interactive timeline: strategic positioning → shock → attrition → negotiation
              </p>
            </>
          )}
          {isCompact && (
            <h4 className="text-sm font-semibold text-foreground">
              Conflict Timeline
            </h4>
          )}
        </div>
        <FilterButtons activeFilters={activeFilters} onToggle={toggleFilter} />
      </div>

      {/* Phase Bar */}
      <PhaseBar className="mb-6" />

      {/* Tooltip Area */}
      <AnimatePresence>
        {hoveredEvent && (
          <div className="mb-4">
            <EventTooltip event={hoveredEvent} />
          </div>
        )}
      </AnimatePresence>

      {/* Timeline Tracks */}
      <div className="space-y-4 mb-6">
        {tracks.map((track) => {
          const isActive = activeFilters.has(track);
          const trackEvents = timelineEvents.filter((e) => e.track === track);

          return (
            <motion.div
              key={track}
              initial={false}
              animate={{
                height: isActive ? 'auto' : 0,
                opacity: isActive ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[track] }}
                />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: COLORS[track] }}
                >
                  {trackLabels[track]}
                </span>
              </div>
              <div className="relative h-8 bg-zinc-800/30 rounded-full border border-zinc-800">
                {trackEvents.map((event) => (
                  <EventDot
                    key={event.date + event.label}
                    event={event}
                    onHover={setHoveredEvent}
                    onClick={handleEventClick}
                    isVisible={isActive}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Oil Price Overlay */}
      <div className="border-t border-zinc-800 pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Brent Crude Price Overlay
          </p>
          <p className="text-[9px] text-zinc-600">
            {EIA_SOURCE_ATTRIBUTION}
          </p>
        </div>
        <OilPriceOverlay height={isCompact ? 80 : 120} />
      </div>

      {/* Full Mode Extras */}
      {!isCompact && (
        <>
          <ScenarioBar className="mt-6 pt-6 border-t border-zinc-800" />
          <MetricCards className="mt-6 pt-6 border-t border-zinc-800" />

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <p className="text-[9px] text-zinc-600">
              Oil prices: U.S. Energy Information Administration. Event data: The Fulcrum Memo field notes.
            </p>
          </div>
        </>
      )}

      {/* Compact Mode Link */}
      {isCompact && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <Link
            to="/timeline"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View full interactive timeline <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Event Modal (Full Mode Only) */}
      <AnimatePresence>
        {selectedEvent && mode === 'full' && (
          <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConflictTimeline;
