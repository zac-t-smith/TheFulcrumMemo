import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoopStep {
  id: number;
  title: string;
  description: string;
  color: string;
}

const loopSteps: LoopStep[] = [
  {
    id: 1,
    title: 'Iran closes Hormuz',
    description: 'IRGC blocks Western shipping through the strait',
    color: '#C8102E',
  },
  {
    id: 2,
    title: 'Iran revenue → ZERO',
    description: '1.6M bpd of Iranian exports offline, cash flow severed',
    color: '#B07D2B',
  },
  {
    id: 3,
    title: 'Oil prices SPIKE',
    description: 'Brent from $71 to $120+, global energy crisis',
    color: '#B7791F',
  },
  {
    id: 4,
    title: 'U.S. alternatives gain value',
    description: 'Venezuela, domestic production, Western Hemisphere supply',
    color: '#2E7D4F',
  },
  {
    id: 5,
    title: 'Allied desperation increases',
    description: 'Japan, Korea, India face energy catastrophe',
    color: '#B7791F',
  },
  {
    id: 6,
    title: 'U.S. leverage compounds',
    description: 'Control over relief valve + tariff negotiations',
    color: '#2E7D4F',
  },
  {
    id: 7,
    title: 'Iran position weakens',
    description: 'No revenue, no leverage, no path to restructuring',
    color: '#C8102E',
  },
  {
    id: 8,
    title: 'Iran escalates further',
    description: 'To demonstrate relevance — which restarts the loop',
    color: '#C8102E',
  },
];

export const InversionFeedbackLoop = ({ className }: { className?: string }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  // Auto-animate through steps
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % loopSteps.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const currentStep = loopSteps[activeStep];

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
            The Inversion Feedback Loop
          </h4>
          <p className="text-sm text-zinc-400">
            Every Iranian offensive action strengthens the U.S. position
          </p>
        </div>
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider rounded transition-colors',
            isAnimating
              ? 'bg-primary text-primary-foreground'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          )}
        >
          <RotateCw size={12} className={isAnimating ? 'animate-spin' : ''} />
          {isAnimating ? 'Animating' : 'Paused'}
        </button>
      </div>

      {/* Circular Loop Visualization */}
      <div className="relative py-8">
        {/* Center Message */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-6 bg-zinc-900/90 rounded-lg border border-primary/30 max-w-[200px]">
            <p className="text-xs text-primary uppercase tracking-wider mb-2">
              The Paradox
            </p>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Every Iranian offensive action strengthens the U.S. position
            </p>
          </div>
        </div>

        {/* Loop Steps - Circular Layout */}
        <div className="relative mx-auto w-full max-w-2xl aspect-square">
          {loopSteps.map((step, index) => {
            const angle = (index / loopSteps.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 42; // percentage
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);

            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <motion.div
                key={step.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  onClick={() => {
                    setActiveStep(index);
                    setIsAnimating(false);
                  }}
                  className={cn(
                    'relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    isActive && 'ring-4 ring-offset-2 ring-offset-background shadow-lg',
                  )}
                  style={{
                    backgroundColor: isActive || isPast ? `${step.color}20` : 'transparent',
                    borderColor: step.color,
                    boxShadow: isActive ? `0 0 20px ${step.color}50` : undefined,
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span
                    className="text-lg md:text-xl font-bold"
                    style={{ color: step.color }}
                  >
                    {step.id}
                  </span>
                </motion.button>

                {/* Arrow to next */}
                {index < loopSteps.length - 1 && (
                  <motion.div
                    className="absolute"
                    style={{
                      left: '100%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                    animate={{
                      opacity: isActive ? 1 : 0.3,
                    }}
                  >
                    <ArrowRight
                      size={16}
                      style={{ color: step.color }}
                      className={isActive ? 'animate-pulse' : ''}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Loop back arrow */}
          <motion.div
            className="absolute bottom-[15%] right-[20%]"
            animate={{ opacity: activeStep === 7 ? 1 : 0.3 }}
          >
            <RotateCw size={20} className="text-red-500" />
          </motion.div>
        </div>
      </div>

      {/* Current Step Detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: `${currentStep.color}10`,
            borderColor: `${currentStep.color}40`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: currentStep.color }}
            >
              <span className="text-lg font-bold text-background">
                {currentStep.id}
              </span>
            </div>
            <div>
              <h5
                className="text-lg font-semibold mb-1"
                style={{ color: currentStep.color }}
              >
                {currentStep.title}
              </h5>
              <p className="text-sm text-zinc-400">
                {currentStep.description}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Step Navigator */}
      <div className="mt-6 flex justify-center gap-2">
        {loopSteps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => {
              setActiveStep(index);
              setIsAnimating(false);
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === activeStep ? 'w-6' : ''
            )}
            style={{
              backgroundColor: index === activeStep ? step.color : '#1a1a1a',
            }}
          />
        ))}
      </div>

      {/* Key Insight */}
      <div className="mt-6 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
        <p className="text-xs text-red-400 font-semibold mb-1">
          The Trap
        </p>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Iran isn't playing offense. It's performing a function in someone else's financial
          architecture — the distressed tenant who threatens to burn down the building,
          which paradoxically justifies continued U.S. presence, extends the crisis, and
          makes U.S.-controlled alternatives more valuable with each passing day.
        </p>
      </div>
    </motion.div>
  );
};

export default InversionFeedbackLoop;
