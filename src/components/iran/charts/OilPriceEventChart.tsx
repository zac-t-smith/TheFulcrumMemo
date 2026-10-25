import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { cn } from '@/lib/utils';
import { oilPriceData, EIA_SOURCE_ATTRIBUTION } from '@/data/oilPriceData';

interface EventMarker {
  date: string;
  label: string;
  color: string;
  category: 'venezuela' | 'tariff' | 'iran';
}

const eventMarkers: EventMarker[] = [
  { date: '2026-01-03', label: 'Venezuela secured', color: '#2E7D4F', category: 'venezuela' },
  { date: '2026-01-26', label: 'SK tariffs escalated', color: '#B7791F', category: 'tariff' },
  { date: '2026-02-28', label: 'Operation Epic Fury', color: '#C8102E', category: 'iran' },
  { date: '2026-03-04', label: 'Hormuz closed', color: '#C8102E', category: 'iran' },
  { date: '2026-03-12', label: 'Brent > $100', color: '#C8102E', category: 'iran' },
  { date: '2026-03-19', label: '$119 spike', color: '#C8102E', category: 'iran' },
  { date: '2026-03-22', label: '48hr ultimatum', color: '#C8102E', category: 'iran' },
  { date: '2026-03-23', label: '"Productive talks"', color: '#2E7D4F', category: 'iran' },
  { date: '2026-04-01', label: 'Primetime address', color: '#C8102E', category: 'iran' },
];

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Process chart data
const getChartData = () => {
  return oilPriceData
    .filter(entry => {
      const date = new Date(entry.date);
      return date >= new Date('2026-02-01') && entry.brentSpot > 0;
    })
    .map(entry => ({
      date: entry.date,
      dateDisplay: formatDateShort(entry.date),
      brent: entry.brentSpot,
      wti: entry.wtiSpot,
      day: entry.conflictDay,
    }));
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const event = eventMarkers.find(e => e.date === data.date);

  return (
    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-xl min-w-[180px]">
      <p className="text-xs text-zinc-400 mb-2">{data.dateDisplay}</p>
      {data.day && (
        <p className="text-[10px] text-primary mb-2">Day {data.day} of conflict</p>
      )}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-xs text-amber-400">Brent:</span>
          <span className="text-sm font-semibold text-amber-400">
            ${data.brent?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-blue-400">WTI:</span>
          <span className="text-sm font-semibold text-blue-400">
            ${data.wti?.toFixed(2)}
          </span>
        </div>
      </div>
      {event && (
        <div className="mt-3 pt-2 border-t border-zinc-700">
          <p className="text-xs" style={{ color: event.color }}>
            {event.label}
          </p>
        </div>
      )}
    </div>
  );
};

export const OilPriceEventChart = ({ className }: { className?: string }) => {
  const [showVenezuelaEvents, setShowVenezuelaEvents] = useState(true);
  const chartData = useMemo(() => getChartData(), []);

  const filteredMarkers = showVenezuelaEvents
    ? eventMarkers
    : eventMarkers.filter(e => e.category === 'iran');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn('memo-chart-container', className)}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h4 className="text-xl font-bold text-zinc-100 mb-2">
            Oil Price with Event Markers
          </h4>
          <p className="text-sm text-zinc-400">
            Brent crude daily spot — the pre-positioning becomes visible
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowVenezuelaEvents(true)}
            className={cn(
              'px-3 py-1.5 text-[10px] uppercase tracking-wider rounded transition-colors',
              showVenezuelaEvents
                ? 'bg-primary text-primary-foreground'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
            )}
          >
            Show All Events
          </button>
          <button
            onClick={() => setShowVenezuelaEvents(false)}
            className={cn(
              'px-3 py-1.5 text-[10px] uppercase tracking-wider rounded transition-colors',
              !showVenezuelaEvents
                ? 'bg-primary text-primary-foreground'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
            )}
          >
            War Events Only
          </button>
        </div>
      </div>

      {/* Toggle Insight */}
      <motion.div
        key={showVenezuelaEvents ? 'all' : 'war'}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-3 rounded-lg border"
        style={{
          backgroundColor: showVenezuelaEvents ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: showVenezuelaEvents ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        }}
      >
        <p className="text-xs text-zinc-300">
          {showVenezuelaEvents
            ? '🔍 With pre-positioning visible: Venezuela secured Jan 3, tariffs escalated Jan 26 — both on the flat part of the price line. The sequencing is not coincidental.'
            : '⚠️ Without context: Looks like a war-driven oil spike. The pre-positioning disappears. This is how most analysts saw it.'
          }
        </p>
      </motion.div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 10, right: 10, top: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="dateDisplay"
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

            {/* Pre-war baseline */}
            <ReferenceLine
              y={73}
              stroke="#71717a"
              strokeDasharray="5 5"
              label={{
                value: 'Pre-war $73',
                fill: '#4a4a4a',
                fontSize: 10,
                position: 'insideTopLeft',
              }}
            />

            {/* $100 threshold */}
            <ReferenceLine
              y={100}
              stroke="#B7791F"
              strokeDasharray="5 5"
              label={{
                value: '$100 threshold',
                fill: '#B7791F',
                fontSize: 10,
                position: 'insideTopLeft',
              }}
            />

            {/* Event markers as reference lines */}
            {filteredMarkers.map((event) => {
              const dataPoint = chartData.find(d => d.date === event.date);
              if (!dataPoint) return null;

              return (
                <ReferenceLine
                  key={event.date}
                  x={dataPoint.dateDisplay}
                  stroke={event.color}
                  strokeDasharray={event.category === 'iran' ? '0' : '5 5'}
                  strokeWidth={event.date === '2026-02-28' ? 2 : 1}
                />
              );
            })}

            {/* Pre-positioning phase highlight */}
            {showVenezuelaEvents && (
              <ReferenceArea
                x1="Feb 2"
                x2="Feb 27"
                fill="#2E7D4F"
                fillOpacity={0.05}
                label={{
                  value: 'Pre-positioning Phase',
                  fill: '#2E7D4F',
                  fontSize: 9,
                  position: 'insideTop',
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="brent"
              stroke="#B7791F"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#B7791F', stroke: '#000' }}
            />
            <Line
              type="monotone"
              dataKey="wti"
              stroke="#1F3A5F"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: '#1F3A5F', stroke: '#000' }}
              opacity={0.7}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-amber-500" />
          <span className="text-zinc-400">Brent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-blue-500" />
          <span className="text-zinc-400">WTI</span>
        </div>
        {showVenezuelaEvents && (
          <>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">Venezuela</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-zinc-400">Tariffs</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-zinc-400">Iran/War</span>
        </div>
      </div>

      {/* Source */}
      <div className="mt-4 pt-4 border-t border-zinc-700 flex justify-between items-center">
        <p className="text-[9px] text-zinc-500">
          {EIA_SOURCE_ATTRIBUTION}
        </p>
        <p className="text-[9px] text-zinc-500">
          Toggle view to see thesis in action
        </p>
      </div>
    </motion.div>
  );
};

export default OilPriceEventChart;
