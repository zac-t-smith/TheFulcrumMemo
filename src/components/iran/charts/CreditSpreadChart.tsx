import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Radio } from 'lucide-react';
import { creditMarketData, hySpreadHistory } from '@/data/iranConflictData';
import { useLiveHYSpread } from '@/hooks/useLiveMarketData';

// Use shared data layer for historical HY spread data
const historicalData = hySpreadHistory;

const crisisEvents = [
  { start: '2008', end: '2009', label: '2008-09 GFC', color: '#ef444420' },
  { start: '2015', end: '2016', label: '2015-16 Energy', color: '#f9731620' },
  { start: '2020', end: '2020', label: '2020 COVID', color: '#eab30820' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="surface-card border border-border p-4 rounded-lg shadow-xl">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-xs text-primary">HY Spread:</span>
        <span className="text-xs text-foreground font-semibold">{data.spread} bps</span>
      </div>
      {data.event && (
        <p className="text-[10px] text-muted-foreground italic mt-2 border-t border-border pt-2">
          {data.event}
        </p>
      )}
    </div>
  );
};

export const CreditSpreadChart = ({ className }: { className?: string }) => {
  const { spreads, isLoading } = useLiveHYSpread();

  // Use live spread if available, otherwise fallback to static
  const currentSpread = spreads?.hy ?? creditMarketData.hySpread.current;
  const isLive = spreads?.isLive ?? false;

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
          High-Yield Credit Spreads: Historical Context
        </h4>
        <p className="text-xs text-muted-foreground">
          HY OAS (Option-Adjusted Spread) over Treasuries - shaded areas show prior crises
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              domain={[0, 2000]}
              tickFormatter={(v) => `${v}`}
              label={{
                value: 'Spread (bps)',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 30-year average line */}
            <ReferenceLine
              y={creditMarketData.hySpread.thirtyYearAverage}
              stroke="#eab308"
              strokeDasharray="5 5"
              label={{
                value: `30-yr avg: ${creditMarketData.hySpread.thirtyYearAverage} bps`,
                position: 'right',
                style: { fontSize: 10, fill: '#B7791F' },
              }}
            />

            {/* Current level line */}
            <ReferenceLine
              y={currentSpread}
              stroke="#22c55e"
              strokeDasharray="3 3"
              label={{
                value: `Current: ${currentSpread} bps${isLive ? ' (LIVE)' : ''}`,
                position: 'right',
                style: { fontSize: 10, fill: '#2E7D4F' },
              }}
            />

            <Area
              type="monotone"
              dataKey="spread"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-[10px] uppercase tracking-wider text-primary mb-3">
          Credit Market Setup
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/20 text-center relative">
            {isLive && (
              <div className="absolute top-1 right-1 flex items-center gap-1">
                <Radio size={8} className="text-emerald-400 animate-pulse" />
                <span className="text-[8px] text-emerald-400">LIVE</span>
              </div>
            )}
            <p className="text-2xl font-bold text-emerald-400">
              {isLoading ? '...' : currentSpread}
            </p>
            <p className="text-[10px] text-muted-foreground">Current HY Spread (bps)</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {creditMarketData.hySpread.thirtyYearAverage}
            </p>
            <p className="text-[10px] text-muted-foreground">30-Year Average</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {creditMarketData.tenYearYield.value}%
            </p>
            <p className="text-[10px] text-muted-foreground">10-Year Yield</p>
          </div>
          <div className="p-3 bg-red-500/10 rounded border border-red-500/20 text-center">
            <p className="text-2xl font-bold text-red-400">
              {creditMarketData.ismPricesPaid.value}
            </p>
            <p className="text-[10px] text-muted-foreground">ISM Prices Paid</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-red-500/10 rounded border border-red-500/20">
          <p className="text-xs text-foreground font-semibold mb-1">
            The Setup: Maximum Widening Potential
          </p>
          <p className="text-[11px] text-muted-foreground">
            Credit spreads entered this conflict at their tightest levels in 20 years. When the
            energy shock propagates through corporate earnings—compressed margins, higher input
            costs, weaker consumer spending—spreads have enormous room to widen. The "refinancing
            wall" of 2026–2027 amplifies the stress.
          </p>
        </div>

        {/* Attribution */}
        <p className="mt-4 text-[9px] text-muted-foreground/70">
          {spreads?.attribution || 'Source: ICE Data Indices, LLC via FRED, Federal Reserve Bank of St. Louis'}
        </p>
      </div>
    </motion.div>
  );
};

export default CreditSpreadChart;
