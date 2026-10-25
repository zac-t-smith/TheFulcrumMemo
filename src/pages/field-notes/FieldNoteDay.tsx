import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Target,
  Zap,
  BarChart3,
  Fuel,
  Ship,
  DollarSign,
  Map,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ArchiveBanner from '@/components/ArchiveBanner';
import { cn } from '@/lib/utils';
import { getFieldNote, getAvailableFieldNoteDays, type ThesisScorecard, EIA_SOURCE_ATTRIBUTION } from '@/data/iranConflictData';
import { ConflictMap } from '@/components/maps/ConflictMap';

const statusConfig = {
  confirmed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: CheckCircle },
  developing: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: TrendingUp },
  challenged: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertCircle },
  invalidated: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: TrendingDown },
};

const ThesisCard = ({ thesis }: { thesis: ThesisScorecard }) => {
  const config = statusConfig[thesis.status as keyof typeof statusConfig];
  if (!config) {
    console.warn(`ThesisCard: Invalid status "${thesis.status}". Valid options: ${Object.keys(statusConfig).join(', ')}`);
    return null;
  }
  const Icon = config.icon;
  const confidenceChange = thesis.currentConfidence - thesis.initialConfidence;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn('p-5 rounded-lg border', config.bg, config.border)}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={14} className={config.color} />
            <span className={cn('text-[10px] uppercase tracking-wider', config.color)}>
              {thesis.status}
            </span>
          </div>
          <h4 className="text-base font-semibold text-foreground">
            {thesis.thesis}
          </h4>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">
            {thesis.currentConfidence}%
          </div>
          <div
            className={cn(
              'text-xs',
              confidenceChange > 0 ? 'text-emerald-400' : confidenceChange < 0 ? 'text-red-400' : 'text-muted-foreground'
            )}
          >
            {confidenceChange > 0 ? '+' : ''}
            {confidenceChange} from initial
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${thesis.currentConfidence}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">
            Initial: {thesis.initialConfidence}%
          </span>
          <span className="text-[10px] text-muted-foreground">
            Current: {thesis.currentConfidence}%
          </span>
        </div>
      </div>

      {/* Evidence */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Supporting Evidence
        </p>
        <ul className="space-y-1">
          {thesis.evidence.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <ChevronRight size={12} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const FieldNoteDay = () => {
  const { day } = useParams<{ day: string }>();
  const dayNum = day ? parseInt(day.replace('day-', '')) : 0;
  const fieldNote = getFieldNote(dayNum);
  const availableDays = getAvailableFieldNoteDays();

  // Navigation
  const currentIndex = availableDays.indexOf(dayNum);
  const prevDay = currentIndex > 0 ? availableDays[currentIndex - 1] : null;
  const nextDay = currentIndex < availableDays.length - 1 ? availableDays[currentIndex + 1] : null;

  if (!fieldNote) {
    return <Navigate to="/field-notes" replace />;
  }

  const { scenarioUpdate } = fieldNote;
  const pageTitle = `Day ${dayNum}: ${fieldNote.title} | Field Notes | The Fulcrum Memo`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={fieldNote.summary} />
      </Helmet>

      <Navbar />
      <div className="pt-[64px]">
        <ArchiveBanner />
      </div>

      <main className="min-h-screen bg-background pt-6 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Back Link */}
          <Link
            to="/field-notes"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs mb-8"
          >
            <ArrowLeft size={14} />
            All Field Notes
          </Link>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-primary text-xs uppercase">
                <Calendar size={14} />
                Day {dayNum}
              </span>
              <span className="text-sm text-muted-foreground">
                {fieldNote.date}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {fieldNote.title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {fieldNote.summary}
            </p>
          </motion.header>

          {/* Market Snapshot */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-primary" />
              <h2 className="text-[10px] uppercase tracking-wider text-primary">
                Market Snapshot
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 surface-card border border-border rounded-lg text-center">
                <Fuel size={16} className="text-amber-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-amber-400">
                  ${fieldNote.marketSnapshot.brentCrude}
                </p>
                <p className="text-[10px] text-muted-foreground">Brent Crude</p>
              </div>
              <div className="p-4 surface-card border border-border rounded-lg text-center">
                <Ship size={16} className="text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-blue-400">
                  ${(fieldNote.marketSnapshot.vlccRate / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] text-muted-foreground">VLCC Rate/Day <span className="text-zinc-500">(est.)</span></p>
              </div>
              <div className="p-4 surface-card border border-border rounded-lg text-center">
                <DollarSign size={16} className="text-red-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-red-400">
                  {fieldNote.marketSnapshot.hySpread}
                </p>
                <p className="text-[10px] text-muted-foreground">HY Spread (bps)</p>
              </div>
              <div className="p-4 surface-card border border-border rounded-lg text-center">
                <Zap size={16} className="text-purple-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-purple-400">
                  {fieldNote.marketSnapshot.vix}
                </p>
                <p className="text-[10px] text-muted-foreground">VIX</p>
              </div>
              <div className="p-4 surface-card border border-border rounded-lg text-center col-span-2 md:col-span-1">
                <Fuel size={16} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-emerald-400">
                  ${fieldNote.marketSnapshot.usGas}
                </p>
                <p className="text-[10px] text-muted-foreground">US Gas Avg</p>
              </div>
            </div>
            <p className="mt-3 text-[9px] text-muted-foreground/70">
              {EIA_SOURCE_ATTRIBUTION}
            </p>
          </motion.section>

          {/* Scenario Probabilities */}
          {scenarioUpdate && scenarioUpdate.probabilities && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} className="text-primary" />
                <h2 className="text-[10px] uppercase tracking-wider text-primary">
                  Scenario Probabilities
                </h2>
              </div>
              <div className="p-6 surface-card border border-border rounded-lg">
                {/* Probability Bar */}
                <div className="flex h-10 rounded-lg overflow-hidden mb-4">
                  {scenarioUpdate.probabilities.map((p, index) => {
                    const colors = ['#2E7D4F', '#B7791F', '#C8102E'];
                    const isBaseCase = index === 1;
                    return (
                      <div
                        key={p.scenario}
                        className="relative flex items-center justify-center"
                        style={{
                          width: `${p.probability}%`,
                          backgroundColor: colors[index],
                        }}
                      >
                        <span className="text-sm font-bold text-background">
                          {p.probability}%
                        </span>
                        {isBaseCase && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[8px] uppercase rounded whitespace-nowrap">
                            Base Case
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {scenarioUpdate.probabilities.map((p, index) => {
                    const colors = ['text-emerald-400', 'text-amber-400', 'text-red-400'];
                    return (
                      <div key={p.scenario} className="text-center">
                        <p className={cn('text-xs font-semibold', colors[index])}>
                          {p.scenario}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Rationale
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {scenarioUpdate.rationale}
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {/* Thesis Scorecard */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle size={16} className="text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Thesis Scorecard
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {fieldNote.thesisScorecard.map((thesis) => (
                <ThesisCard key={thesis.thesis} thesis={thesis} />
              ))}
            </div>
          </motion.section>

          {/* Intelligence Map */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Map size={16} className="text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Intelligence Map
              </h2>
            </div>
            <ConflictMap
              throughDay={dayNum}
              highlightDay={dayNum}
              height="450px"
              showLegend={true}
              showDaySlider={false}
            />
          </motion.section>

          {/* Key Developments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Zap size={16} className="text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Key Developments
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {fieldNote.keyDevelopments.map((category) => (
                <div
                  key={category.category}
                  className="p-5 surface-card border border-border rounded-lg"
                >
                  <h3 className="text-[10px] uppercase tracking-wider text-primary mb-3">
                    {category.category}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight size={12} className="text-muted-foreground mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Trading Implications */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Trading Implications
              </h2>
            </div>
            <div className="p-6 surface-elevated border border-primary/20 rounded-lg">
              <ul className="space-y-3">
                {fieldNote.tradingImplications.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-between pt-8 border-t border-border"
          >
            {prevDay ? (
              <Link
                to={`/field-notes/day-${prevDay}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Day {prevDay}</span>
              </Link>
            ) : (
              <div />
            )}

            <Link
              to="/field-notes"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              All Field Notes
            </Link>

            {nextDay ? (
              <Link
                to={`/field-notes/day-${nextDay}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <span className="text-sm">Day {nextDay}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default FieldNoteDay;
