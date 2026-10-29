import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BRENT } from '@/content/marketFigures';

interface DealMetric {
  label: string;
  value: string;
  highlight?: boolean;
  subtext?: string;
}

const dealMetrics: DealMetric[] = [
  { label: 'Asset', value: 'Bolivarian Republic of Venezuela — Oil Sector' },
  { label: 'Proven Reserves', value: '303 billion barrels', subtext: "World's largest" },
  { label: 'Acquisition Basis', value: '~$60/bbl Brent' },
  { label: 'Current Valuation', value: '', highlight: true }, // Will be calculated
  { label: 'Structure', value: 'DIP-style sovereign cash flow control' },
  { label: 'Production', value: '900K bpd → 2M bpd', subtext: 'Projected 24 months' },
  { label: 'Acquisition Cost', value: '$0', highlight: true, subtext: 'Zero financial cost' },
  { label: 'First Revenue', value: 'Jan 14, 2026 ($500M)' },
  { label: 'Cumulative Revenue', value: '$1B+ by February' },
  { label: 'Price Improvement', value: '+30%', subtext: 'vs. Maduro-era pricing' },
  { label: 'Exclusivity', value: 'China, Russia, Iran, Cuba severed' },
  { label: 'OFAC Licensing', value: 'GL 46, 47, 49, 50', subtext: 'Jan 29 – Feb 13' },
];

export const VenezuelaTombstone = ({ className }: { className?: string }) => {
  const acquisitionBasis = 60;
  // Phase 4B: pull from archive snapshot — no live fetch, no pulsing dot.
  const archivedBrent = BRENT.lastArchived;
  const priceChange = ((archivedBrent - acquisitionBasis) / acquisitionBasis * 100).toFixed(0);

  const metricsWithValues = dealMetrics.map(metric => {
    if (metric.label === 'Current Valuation') {
      return {
        ...metric,
        value: `~$${archivedBrent.toFixed(0)}/bbl Brent`,
        subtext: `+${priceChange}% from acquisition (as of ${BRENT.lastArchivedAsOf})`,
      };
    }
    return metric;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn('my-8', className)}
    >
      {/* Tombstone Header */}
      <div className="bg-zinc-900 border-2 border-primary rounded-t-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-primary uppercase tracking-widest mb-1">
              Sovereign Acquisition Summary
            </p>
            <h4 className="text-xl font-bold text-foreground">
              Operation Absolute Resolve
            </h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase">Effective Date</p>
            <p className="text-sm text-foreground">January 3, 2026</p>
          </div>
        </div>

        {/* Gold separator */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* Metrics Grid */}
      <div className="bg-zinc-950 border-x-2 border-primary">
        {metricsWithValues.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              'flex items-start justify-between px-6 py-3 border-b border-zinc-800',
              metric.highlight && 'bg-primary/5'
            )}
          >
            <span className="text-xs text-zinc-500 uppercase tracking-wider">
              {metric.label}
            </span>
            <div className="text-right">
              <span className={cn(
                'text-sm',
                metric.highlight ? 'text-primary font-semibold' : 'text-foreground'
              )}>
                {metric.value}
              </span>
              {metric.subtext && (
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {metric.subtext}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tombstone Footer */}
      <div className="bg-zinc-900 border-2 border-t-0 border-primary rounded-b-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-zinc-400">Cash Flowing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] text-zinc-400">U.S. Controlled</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-600 italic">
            "Buying the company for the price of the debt"
          </p>
        </div>
        {/* EIA Attribution */}
        <div className="mt-2 pt-2 border-t border-zinc-800">
          <p className="text-[9px] text-zinc-600">
            Source: U.S. Energy Information Administration · Series archived
          </p>
        </div>
      </div>

      {/* Key Insight Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30"
      >
        <p className="text-xs text-emerald-400 font-semibold mb-1">
          Distressed Acquisition Thesis
        </p>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Massive underlying value. Collapsed operating performance. Zero competitive bidding.
          No seller — just a seized debtor. Classic distressed playbook applied at sovereign scale.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default VenezuelaTombstone;
