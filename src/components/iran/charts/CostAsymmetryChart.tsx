import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  LabelList,
} from 'recharts';
import { cn } from '@/lib/utils';
import { costAsymmetry } from '@/data/iranConflictData';

type ViewMode = 'perUnit' | 'ratio';
type ScaleMode = 'linear' | 'log';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
};

// Use shared data layer
const chartData = costAsymmetry;

// Custom tooltip with light background for readability
const CustomTooltip = ({ active, payload, label, viewMode }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-zinc-100 text-zinc-900 border border-zinc-300 p-4 rounded-lg shadow-xl">
      <p className="text-sm font-semibold mb-2">{label}</p>
      {viewMode === 'perUnit' ? (
        <>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-xs text-amber-600 font-medium">Iran Cost:</span>
            <span className="text-xs font-semibold">{formatCurrency(data.iranCost)}</span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-xs text-blue-600 font-medium">Interceptor Cost:</span>
            <span className="text-xs font-semibold">{formatCurrency(data.interceptorCost)}</span>
          </div>
          <div className="border-t border-zinc-300 mt-2 pt-2">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-zinc-700">Cost Ratio:</span>
              <span className="text-xs font-bold text-red-600">{data.ratio}:1</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-between gap-4">
          <span className="text-xs text-zinc-700">Cost Ratio:</span>
          <span className="text-xs font-bold text-red-600">{data.ratio}:1 advantage Iran</span>
        </div>
      )}
    </div>
  );
};

export const CostAsymmetryChart = ({ className }: { className?: string }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('ratio');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('linear');

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
            Cost Asymmetry Analysis
          </h4>
          <p className="text-sm text-zinc-400">
            Iranian offensive costs vs. U.S. interceptor defensive costs
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('ratio')}
            className={cn(
              'px-3 py-1.5 text-[10px] uppercase tracking-wider rounded transition-colors',
              viewMode === 'ratio'
                ? 'bg-primary text-primary-foreground'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
            )}
          >
            Cost Ratio
          </button>
          <button
            onClick={() => setViewMode('perUnit')}
            className={cn(
              'px-3 py-1.5 text-[10px] uppercase tracking-wider rounded transition-colors',
              viewMode === 'perUnit'
                ? 'bg-primary text-primary-foreground'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
            )}
          >
            Per Unit Cost
          </button>
          {viewMode === 'perUnit' && (
            <button
              onClick={() => setScaleMode(scaleMode === 'linear' ? 'log' : 'linear')}
              className="px-3 py-1.5 text-[10px] uppercase tracking-wider rounded transition-colors bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
            >
              {scaleMode === 'linear' ? 'Log Scale' : 'Linear Scale'}
            </button>
          )}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'perUnit' ? (
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                type="number"
                tickFormatter={formatCurrencyShort}
                stroke="#a1a1aa"
                fontSize={12}
                scale={scaleMode === 'log' ? 'log' : 'auto'}
                domain={scaleMode === 'log' ? [10000, 'auto'] : [0, 'auto']}
              />
              <YAxis
                dataKey="shortName"
                type="category"
                stroke="#a1a1aa"
                fontSize={12}
                width={100}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} viewMode={viewMode} />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-zinc-300">{value}</span>
                )}
              />
              <Bar dataKey="iranCost" name="Iran Cost" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="iranLabel" position="right" fill="#f59e0b" fontSize={11} fontFamily="monospace" />
              </Bar>
              <Bar dataKey="interceptorCost" name="U.S. Interceptor" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="interceptorLabel" position="right" fill="#3b82f6" fontSize={11} fontFamily="monospace" />
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                type="number"
                stroke="#a1a1aa"
                fontSize={12}
                domain={[0, 120]}
                tickFormatter={(v) => `${v}:1`}
              />
              <YAxis
                dataKey="shortName"
                type="category"
                stroke="#a1a1aa"
                fontSize={12}
                width={100}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} viewMode={viewMode} />} />
              <Bar dataKey="ratio" name="Cost Ratio (Iran Advantage)" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="ratio"
                  position="right"
                  fill="#ef4444"
                  fontSize={12}
                  fontFamily="monospace"
                  formatter={(value: number) => `${value}:1`}
                />
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.category === 'drone' ? '#2E7D4F' : '#B7791F'}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="mt-8 pt-6 border-t border-zinc-700">
        <p className="text-xs uppercase tracking-wider text-primary mb-4">
          Key Insights
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <p className="text-sm text-emerald-400 font-semibold mb-2">Drone Asymmetry</p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              ~100:1 cost ratio. A $35K Shahed drone requires a $3.7M Patriot PAC-3 to intercept.
            </p>
          </div>
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <p className="text-sm text-amber-400 font-semibold mb-2">Missile vs. SM-3</p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              8-56:1 ratio. U.S. Navy fired 12 SM-3s during Iran's October 2024 attack.
            </p>
          </div>
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <p className="text-sm text-red-400 font-semibold mb-2">Heritage Foundation (Jan 2026)</p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              High-end interceptor stockpiles would likely be exhausted within days of sustained combat.
            </p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-400 font-semibold mb-2">June 2025 War Cost</p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              $2-4 billion in interceptors burned in twelve days (Norsk Luftvern calculation).
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CostAsymmetryChart;
