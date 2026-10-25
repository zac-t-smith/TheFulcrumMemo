import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, Lightbulb, TrendingUp, Shield, Zap } from 'lucide-react';

type CalloutVariant = 'info' | 'warning' | 'insight' | 'thesis' | 'defense' | 'critical';

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Iran-series Callout — Phase 2.76b: retuned onto design tokens.
 * Six variants, each mapping to a token color. Hairline rule-left,
 * no filled background, serif body. Same component API; migrating
 * the three Iran memos + Shadow Partner for free.
 */

const variantConfig: Record<
  CalloutVariant,
  { icon: React.ElementType; borderColor: string; iconColor: string }
> = {
  info:     { icon: Info,           borderColor: 'var(--cat-1)',   iconColor: 'var(--cat-1)' },
  warning:  { icon: AlertTriangle,  borderColor: 'var(--warn)',    iconColor: 'var(--warn)' },
  insight:  { icon: Lightbulb,      borderColor: 'var(--red)',     iconColor: 'var(--red)' },
  thesis:   { icon: TrendingUp,     borderColor: 'var(--pos)',     iconColor: 'var(--pos)' },
  defense:  { icon: Shield,         borderColor: 'var(--cat-5)',   iconColor: 'var(--cat-5)' },
  critical: { icon: Zap,            borderColor: 'var(--red-deep)', iconColor: 'var(--red-deep)' },
};

export const Callout = ({ variant = 'insight', title, children, className }: CalloutProps) => {
  const config = variantConfig[variant];
  if (!config) {
    return <div className={className}>{children}</div>;
  }
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn('memo-callout', className)}
      style={{
        borderLeft: `3px solid ${config.borderColor}`,
        paddingLeft: '20px',
        margin: '24px 0',
        background: 'transparent',
      }}
    >
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Icon size={16} style={{ color: config.iconColor }} />
          <h4
            className="t-kicker m-0"
            style={{ color: config.iconColor }}
          >
            {title}
          </h4>
        </div>
      )}
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--fs-body)',
          lineHeight: 1.6,
          color: 'var(--ink)',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default Callout;
