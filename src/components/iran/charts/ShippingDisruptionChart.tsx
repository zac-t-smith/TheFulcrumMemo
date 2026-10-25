import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { cn } from '@/lib/utils';
import { shippingDisruptionData, conflictMetadata, formatFullDate } from '@/data/iranConflictData';

const combinedData = shippingDisruptionData.tankerTransits.map((transit, index) => ({
  ...transit,
  vlccRate: shippingDisruptionData.vlccRates[index]?.rate || null,
}));

// Get date range from data
const tankerTransits = shippingDisruptionData.tankerTransits;
const firstDate = tankerTransits[0]?.date || 'Feb 28';
const lastDate = tankerTransits[tankerTransits.length - 1]?.date || 'Mar 5';
const dateRangeSubtitle = `Daily tanker transits and VLCC charter rates (${firstDate} - ${lastDate}, 2026)`;
const keyMetricsDate = formatFullDate(conflictMetadata.lastUpdated);

// Calculate dynamic key metrics
const firstTransitCount = tankerTransits[0]?.count || 100;
const lastTransitCount = tankerTransits[tankerTransits.length - 1]?.count || 3;
const transitCollapsePercent = Math.round(((firstTransitCount - lastTransitCount) / firstTransitCount) * 100);

const maxVlccRate = Math.max(...shippingDisruptionData.vlccRates.map(r => r.rate));
const maxVlccRateFormatted = `$${Math.round(maxVlccRate / 1000)}K`;

const { tankersStranded, shipsUnableToExit } = shippingDisruptionData.keyMetrics;

const formatCurrency = (value: number) => {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const event = shippingDisruptionData.events.find((e) => e.date === label);

  return (
    <div className="surface-card border border-border p-4 rounded-lg shadow-xl max-w-xs">
      <p className="text-sm font-semibold text-primary mb-2">{label}</p>
      <div className="space-y-2">
        {data.count !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="text-xs text-blue-400">Tanker Transits:</span>
            <span className="text-xs text-foreground font-semibold">{data.count}</span>
          </div>
        )}
        {data.vlccRate && (
          <div className="flex justify-between gap-4">
            <span className="text-xs text-amber-400">VLCC Rate:</span>
            <span className="text-xs text-foreground font-semibold">
              {formatCurrency(data.vlccRate)}/day
            </span>
          </div>
        )}
        {data.event && (
          <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2 mt-2">
            {data.event}
          </p>
        )}
        {event && (
          <div className="border-t border-border pt-2 mt-2">
            <p className="text-[10px] text-primary font-semibold">{event.title}</p>
            <p className="text-[10px] text-muted-foreground">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ShippingDisruptionChart = ({ className }: { className?: string }) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn('my-8 p-6 surface-card border border-border rounded-lg', className)}
    >
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-foreground mb-1">
          Strait of Hormuz Shipping Disruption
        </h4>
        <p className="text-xs text-muted-foreground">
          {dateRangeSubtitle}
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#3b82f6"
              fontSize={10}
              tickLine={false}
              domain={[0, 120]}
              label={{
                value: 'Tanker Transits',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 10, fill: '#1F3A5F' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#eab308"
              fontSize={10}
              tickLine={false}
              tickFormatter={formatCurrency}
              domain={[0, 500000]}
              label={{
                value: 'VLCC Rate/Day',
                angle: 90,
                position: 'insideRight',
                style: { fontSize: 10, fill: '#B7791F' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
              strokeWidth={2}
              name="Tanker Transits"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="vlccRate"
              stroke="#eab308"
              strokeWidth={3}
              dot={{ fill: '#B7791F', strokeWidth: 2 }}
              name="VLCC Rate"
            />
            {/* Reference line for transit collapse */}
            <ReferenceLine
              yAxisId="left"
              y={lastTransitCount}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: `${transitCollapsePercent}% collapse`,
                position: 'right',
                style: { fontSize: 10, fill: '#C8102E' },
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-[10px] uppercase tracking-wider text-primary mb-3">
          Key Metrics (as of {keyMetricsDate})
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-500/10 rounded border border-red-500/20">
            <p className="text-2xl font-bold text-red-400">{transitCollapsePercent}%</p>
            <p className="text-[10px] text-muted-foreground">Transit Collapse</p>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded border border-amber-500/20">
            <p className="text-2xl font-bold text-amber-400">{maxVlccRateFormatted}</p>
            <p className="text-[10px] text-muted-foreground">VLCC Rate/Day <span className="text-zinc-500">(est.)</span></p>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded border border-blue-500/20">
            <p className="text-2xl font-bold text-blue-400">{tankersStranded}</p>
            <p className="text-[10px] text-muted-foreground">Tankers Stranded</p>
          </div>
          <div className="text-center p-3 bg-purple-500/10 rounded border border-purple-500/20">
            <p className="text-2xl font-bold text-purple-400">{shipsUnableToExit}</p>
            <p className="text-[10px] text-muted-foreground">Ships Unable to Exit</p>
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-[10px] uppercase tracking-wider text-primary mb-3">
          Key Events
        </p>
        <div className="space-y-2">
          {shippingDisruptionData.events.map((event, index) => (
            <motion.div
              key={event.date}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'flex gap-4 p-3 rounded cursor-pointer transition-colors',
                selectedEvent === event.date
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-muted/30 hover:bg-muted/50'
              )}
              onClick={() => setSelectedEvent(selectedEvent === event.date ? null : event.date)}
            >
              <span className="text-xs text-primary font-semibold whitespace-nowrap">
                {event.date}
              </span>
              <div>
                <p className="text-xs text-foreground font-semibold">{event.title}</p>
                {selectedEvent === event.date && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[11px] text-muted-foreground mt-1"
                  >
                    {event.description}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ShippingDisruptionChart;
