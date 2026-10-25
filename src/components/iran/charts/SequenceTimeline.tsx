import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { oilPriceData, EIA_SOURCE_ATTRIBUTION } from '@/data/oilPriceData';

interface TimelineEvent {
  date: string;
  label: string;
  description?: string;
}

const venezuelaEvents: TimelineEvent[] = [
  { date: '2026-01-03', label: 'Op. Absolute Resolve', description: 'Maduro seized, U.S. takes operational control' },
  { date: '2026-01-14', label: 'First oil sold ($500M)', description: 'First revenue from U.S.-controlled Venezuelan oil' },
  { date: '2026-01-29', label: 'OFAC GL 46', description: 'Initial licensing for oil transactions' },
  { date: '2026-02-03', label: 'GL 47 (diluent)', description: 'Diluent exports authorized' },
  { date: '2026-02-13', label: 'GL 49 & GL 50', description: 'Upstream investment authorized' },
];

const tariffEvents: TimelineEvent[] = [
  { date: '2026-01-01', label: 'EU 15%', description: 'Framework agreement not legally binding' },
  { date: '2026-01-01', label: 'Japan 15%', description: 'Mid-negotiation when Hormuz closed' },
  { date: '2026-01-26', label: 'S. Korea → 25%', description: 'Tariffs escalated between Venezuela and Iran' },
  { date: '2026-01-01', label: 'India 18%', description: 'Linked to Russian oil freeze' },
  { date: '2026-01-01', label: 'China 10% truce', description: 'Truce expires Nov 2026' },
];

const iranEvents: TimelineEvent[] = [
  { date: '2026-02-28', label: 'Op. Epic Fury', description: 'U.S.-Israel strikes begin, Khamenei killed' },
  { date: '2026-03-04', label: 'Hormuz closed', description: 'Strait effectively closed to Western shipping' },
  { date: '2026-03-12', label: 'Brent > $100', description: 'Oil crosses $100/barrel threshold' },
  { date: '2026-03-14', label: 'Kharg struck', description: 'Kharg Island military targets hit' },
  { date: '2026-03-19', label: '$119 spike', description: 'Brent spikes to $119 intraday' },
  { date: '2026-03-22', label: '48hr ultimatum', description: 'Trump issues 48-hour ultimatum' },
  { date: '2026-04-02', label: 'Dated $141', description: 'Dated Brent hits $141' },
];

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Prepare oil price data for chart
const getChartData = () => {
  const startDate = new Date('2026-01-01');
  const endDate = new Date('2026-04-06');

  return oilPriceData
    .filter(entry => {
      const date = new Date(entry.date);
      return date >= startDate && date <= endDate;
    })
    .map(entry => ({
      date: entry.date,
      dateShort: formatDateShort(entry.date),
      brent: entry.brentSpot,
      wti: entry.wtiSpot,
    }));
};

// Calculate x position as percentage
const getXPosition = (dateStr: string): number => {
  const start = new Date('2026-01-01').getTime();
  const end = new Date('2026-04-06').getTime();
  const current = new Date(dateStr).getTime();
  return ((current - start) / (end - start)) * 100;
};

interface EventDotProps {
  event: TimelineEvent;
  color: string;
  onHover: (event: TimelineEvent | null) => void;
  isHighlighted?: boolean;
}

const EventDot = ({ event, color, onHover, isHighlighted }: EventDotProps) => {
  const xPos = getXPosition(event.date);

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-pointer"
      style={{ left: `${xPos}%`, transform: 'translateX(-50%)' }}
      onMouseEnter={() => onHover(event)}
      onMouseLeave={() => onHover(null)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={cn(
          'w-3 h-3 rounded-full border-2 z-10',
          isHighlighted && 'ring-2 ring-offset-1 ring-offset-background'
        )}
        style={{
          backgroundColor: color,
          borderColor: color,
          boxShadow: isHighlighted ? `0 0 12px ${color}` : undefined
        }}
        animate={isHighlighted ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.5, repeat: isHighlighted ? Infinity : 0 }}
      />
      <span className="text-[8px] text-zinc-500 mt-1 whitespace-nowrap">
        {formatDateShort(event.date)}
      </span>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl">
      <p className="text-xs text-zinc-400 mb-1">{data.dateShort}</p>
      <p className="text-sm text-amber-400">
        Brent: ${data.brent?.toFixed(2) || 'N/A'}
      </p>
      <p className="text-sm text-blue-400">
        WTI: ${data.wti?.toFixed(2) || 'N/A'}
      </p>
    </div>
  );
};

export const SequenceTimeline = ({ className }: { className?: string }) => {
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const chartData = useMemo(() => getChartData(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn('memo-chart-container', className)}
    >
      <div className="mb-6">
        <h4 className="text-xl font-bold text-zinc-100 mb-2">
          The Sequence Timeline
        </h4>
        <p className="text-sm text-zinc-400">
          January – April 2026: Three policy tracks converging
        </p>
      </div>

      {/* Event Tooltip */}
      {hoveredEvent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-zinc-800/80 border border-zinc-700 rounded-lg"
        >
          <p className="text-sm font-semibold text-foreground">
            {hoveredEvent.label}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {formatDateShort(hoveredEvent.date)} — {hoveredEvent.description}
          </p>
        </motion.div>
      )}

      {/* Timeline Tracks */}
      <div className="space-y-8 mb-8">
        {/* Venezuela Track */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Venezuela
            </span>
          </div>
          <div className="relative h-8 bg-zinc-800/50 rounded-full border border-zinc-700">
            <div
              className="absolute inset-y-0 left-0 bg-emerald-500/20 rounded-full"
              style={{ width: `${getXPosition('2026-02-13')}%` }}
            />
            {venezuelaEvents.map((event) => (
              <EventDot
                key={event.date + event.label}
                event={event}
                color="#2E7D4F"
                onHover={setHoveredEvent}
              />
            ))}
          </div>
        </div>

        {/* Tariffs Track */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Tariffs
            </span>
          </div>
          <div className="relative h-8 bg-zinc-800/50 rounded-full border border-zinc-700">
            <div
              className="absolute inset-y-0 left-0 bg-amber-500/20 rounded-full"
              style={{ width: `${getXPosition('2026-02-28')}%` }}
            />
            {tariffEvents.map((event, idx) => (
              <EventDot
                key={event.date + event.label + idx}
                event={event}
                color="#B7791F"
                onHover={setHoveredEvent}
                isHighlighted={event.label.includes('Korea')}
              />
            ))}
          </div>
        </div>

        {/* Iran Track */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Iran / Hormuz
            </span>
          </div>
          <div className="relative h-8 bg-zinc-800/50 rounded-full border border-zinc-700">
            <div
              className="absolute bg-red-500/20 rounded-r-full inset-y-0"
              style={{
                left: `${getXPosition('2026-02-28')}%`,
                right: 0
              }}
            />
            {iranEvents.map((event) => (
              <EventDot
                key={event.date + event.label}
                event={event}
                color="#C8102E"
                onHover={setHoveredEvent}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Oil Price Overlay Chart */}
      <div className="mt-8 pt-6 border-t border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-wider text-primary">
            Brent Crude Price Overlay
          </p>
          <p className="text-[9px] text-zinc-500">
            {EIA_SOURCE_ATTRIBUTION}
          </p>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <XAxis
                dataKey="dateShort"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                tickFormatter={(v) => `$${v}`}
                domain={[60, 130]}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={73}
                stroke="#71717a"
                strokeDasharray="3 3"
                label={{ value: 'Pre-war $73', fill: '#4a4a4a', fontSize: 9, position: 'left' }}
              />
              <ReferenceLine
                y={100}
                stroke="#B7791F"
                strokeDasharray="3 3"
                label={{ value: '$100 threshold', fill: '#B7791F', fontSize: 9, position: 'left' }}
              />
              {/* Feb 28 marker */}
              <ReferenceLine
                x="Feb 28"
                stroke="#C8102E"
                strokeWidth={2}
                label={{ value: 'Epic Fury', fill: '#C8102E', fontSize: 9, position: 'top' }}
              />
              <Line
                type="monotone"
                dataKey="brent"
                stroke="#B7791F"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#B7791F' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insight */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-xs text-zinc-300 leading-relaxed">
          <span className="text-primary font-semibold">Pattern:</span> Green events cluster in January
          (asset acquisition). Amber spans January-February (leverage positioning). Red starts Feb 28
          (detonation). The price line is flat during pre-positioning, then explodes at the exact
          moment all pieces are in place.
        </p>
      </div>
    </motion.div>
  );
};

export default SequenceTimeline;
