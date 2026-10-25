import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupplySource {
  name: string;
  volume: string;
  status: 'flowing' | 'blocked' | 'limited';
  color: string;
  hemisphere: 'western' | 'eastern';
  note?: string;
}

interface Consumer {
  name: string;
  hormuzDep: string;
  status: 'critical' | 'severe' | 'moderate' | 'low';
  note?: string;
}

const supplySources: SupplySource[] = [
  {
    name: 'Middle East via Hormuz',
    volume: '16M bpd',
    status: 'blocked',
    color: '#C8102E',
    hemisphere: 'eastern',
    note: 'Effectively closed to Western shipping',
  },
  {
    name: 'Bypass Pipelines',
    volume: '3.5-5.5M bpd',
    status: 'limited',
    color: '#B7791F',
    hemisphere: 'eastern',
    note: 'Saudi East-West + UAE ADCOP only',
  },
  {
    name: 'U.S. Domestic',
    volume: '13.6M bpd',
    status: 'flowing',
    color: '#2E7D4F',
    hemisphere: 'western',
    note: 'World\'s largest producer',
  },
  {
    name: 'Venezuela (U.S.-controlled)',
    volume: '0.9-2M bpd',
    status: 'flowing',
    color: '#2E7D4F',
    hemisphere: 'western',
    note: 'Ramping under U.S. operational control',
  },
  {
    name: 'Canada',
    volume: '4.9M bpd',
    status: 'flowing',
    color: '#2E7D4F',
    hemisphere: 'western',
  },
  {
    name: 'Brazil/Guyana',
    volume: '~4M bpd',
    status: 'flowing',
    color: '#2E7D4F',
    hemisphere: 'western',
  },
];

const consumers: Consumer[] = [
  {
    name: 'U.S. Domestic',
    hormuzDep: '~2.5%',
    status: 'low',
    note: 'Net exporter, minimal exposure',
  },
  {
    name: 'Japan',
    hormuzDep: '95%',
    status: 'critical',
    note: '87% fossil fuel import dependency',
  },
  {
    name: 'South Korea',
    hormuzDep: '68%',
    status: 'critical',
    note: 'Plus 25% tariffs in effect',
  },
  {
    name: 'India',
    hormuzDep: '50%',
    status: 'severe',
    note: 'Trade deal linked to Russia freeze',
  },
  {
    name: 'EU',
    hormuzDep: '12-14%',
    status: 'moderate',
    note: 'LNG exposure, non-binding framework',
  },
  {
    name: 'China',
    hormuzDep: '37.7%',
    status: 'severe',
    note: 'Selective Hormuz access via Iran',
  },
];

const getStatusIcon = (status: SupplySource['status']) => {
  switch (status) {
    case 'flowing':
      return <Check size={14} className="text-emerald-400" />;
    case 'blocked':
      return <X size={14} className="text-red-400" />;
    case 'limited':
      return <AlertTriangle size={14} className="text-amber-400" />;
  }
};

const getConsumerColor = (status: Consumer['status']) => {
  switch (status) {
    case 'critical':
      return 'border-red-500 bg-red-500/10';
    case 'severe':
      return 'border-orange-500 bg-orange-500/10';
    case 'moderate':
      return 'border-yellow-500 bg-yellow-500/10';
    case 'low':
      return 'border-emerald-500 bg-emerald-500/10';
  }
};

export const ReliefValveFlow = ({ className }: { className?: string }) => {
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  const westernSources = supplySources.filter(s => s.hemisphere === 'western');
  const easternSources = supplySources.filter(s => s.hemisphere === 'eastern');

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
          The Relief Valve: Global Oil Supply Routing
        </h4>
        <p className="text-sm text-zinc-400">
          Green sources are ALL Western Hemisphere. Red/orange consumers are ALL dependent on blocked supply.
        </p>
      </div>

      {/* Flow Diagram */}
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Supply Sources */}
        <div className="space-y-3">
          <h5 className="text-xs text-primary uppercase tracking-wider mb-4">
            Supply Sources
          </h5>

          {/* Eastern Hemisphere - Blocked/Limited */}
          <div className="mb-6">
            <p className="text-[10px] text-zinc-500 uppercase mb-2">Eastern Hemisphere</p>
            {easternSources.map((source, index) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredSource(source.name)}
                onMouseLeave={() => setHoveredSource(null)}
                className={cn(
                  'p-3 rounded-lg border mb-2 transition-all cursor-pointer',
                  hoveredSource === source.name ? 'scale-[1.02]' : '',
                  source.status === 'blocked'
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-amber-500/50 bg-amber-500/5'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <span className="text-sm text-foreground">{source.name}</span>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      source.status === 'blocked' ? 'text-red-400 line-through' : 'text-amber-400'
                    )}
                  >
                    {source.volume}
                  </span>
                </div>
                {source.note && (
                  <p className="text-[10px] text-zinc-500 mt-1">{source.note}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Western Hemisphere - Flowing */}
          <div>
            <p className="text-[10px] text-emerald-400 uppercase mb-2">
              Western Hemisphere (U.S. Controlled)
            </p>
            {westernSources.map((source, index) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (index + 2) * 0.1 }}
                onMouseEnter={() => setHoveredSource(source.name)}
                onMouseLeave={() => setHoveredSource(null)}
                className={cn(
                  'p-3 rounded-lg border border-emerald-500/50 bg-emerald-500/5 mb-2 transition-all cursor-pointer',
                  hoveredSource === source.name ? 'scale-[1.02] border-emerald-400' : ''
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <span className="text-sm text-foreground">{source.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">
                    {source.volume}
                  </span>
                </div>
                {source.note && (
                  <p className="text-[10px] text-zinc-500 mt-1">{source.note}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Center - U.S. Control Node */}
        <div className="flex flex-col items-center justify-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] text-primary uppercase">U.S.</p>
                <p className="text-[10px] text-primary uppercase">Control</p>
              </div>
            </div>
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Flow arrows */}
          <div className="flex items-center gap-4 my-4">
            <ArrowRight className="text-emerald-400" />
            <span className="text-[10px] text-zinc-500">flows to</span>
            <ArrowRight className="text-zinc-500" />
          </div>
        </div>

        {/* Consumers */}
        <div className="space-y-3">
          <h5 className="text-xs text-primary uppercase tracking-wider mb-4">
            Consumers (Hormuz Dependency)
          </h5>
          {consumers.map((consumer, index) => (
            <motion.div
              key={consumer.name}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'p-3 rounded-lg border',
                getConsumerColor(consumer.status)
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{consumer.name}</span>
                <span
                  className={cn(
                    'text-sm font-bold px-2 py-0.5 rounded',
                    consumer.status === 'critical' && 'bg-red-500/20 text-red-400',
                    consumer.status === 'severe' && 'bg-orange-500/20 text-orange-400',
                    consumer.status === 'moderate' && 'bg-yellow-500/20 text-yellow-400',
                    consumer.status === 'low' && 'bg-emerald-500/20 text-emerald-400'
                  )}
                >
                  {consumer.hormuzDep}
                </span>
              </div>
              {consumer.note && (
                <p className="text-[10px] text-zinc-500 mt-1">{consumer.note}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-4 border-t border-zinc-700 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Check size={14} className="text-emerald-400" />
          <span className="text-[10px] text-zinc-400">Flowing</span>
        </div>
        <div className="flex items-center gap-2">
          <X size={14} className="text-red-400" />
          <span className="text-[10px] text-zinc-400">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" />
          <span className="text-[10px] text-zinc-400">Limited</span>
        </div>
      </div>

      {/* Key Insight */}
      <div className="mt-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
        <p className="text-xs text-emerald-400 font-semibold mb-1">
          The Structural Outcome
        </p>
        <p className="text-xs text-zinc-300 leading-relaxed">
          The U.S. controls the only major relief valve (Venezuela + domestic production) while
          holding tariff leverage over every energy-desperate ally. One country sits in the middle,
          controlling the flow. This isn't a coincidence — it's the capital structure post-restructuring.
        </p>
      </div>
    </motion.div>
  );
};

export default ReliefValveFlow;
