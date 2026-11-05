import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, TrendingUp, AlertTriangle, ChevronRight, Map } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ArchiveBanner from '@/components/ArchiveBanner';
import CorrectionNote from '@/components/CorrectionNote';
import { fieldNotes, getLatestScenario, getAvailableFieldNoteDays, EIA_SOURCE_ATTRIBUTION } from '@/data/iranConflictData';
import { lookupVerifiedMarket, VERIFIED_MARKET_ATTRIBUTION } from '@/data/verifiedMarketLookup';
import { ConflictMap } from '@/components/maps/ConflictMap';
import { BRENT, BRENT_CHANGE_PCT, HY_SPREAD, CONFLICT_DAYS, SERIES_SNAPSHOT } from '@/content/marketFigures';

const FieldNotesIndex = () => {
  const availableDays = getAvailableFieldNoteDays();
  const latestScenario = getLatestScenario();

  return (
    <>
      <Helmet>
        <title>Field Notes | Iran Conflict Analysis | The Fulcrum Memo</title>
        <meta
          name="description"
          content="Archived day-by-day field notes on the 2025–26 U.S.–Iran conflict. Thesis validation, scenario probability revisions, and trading implications. Data snapshot: Apr 26, 2026."
        />
      </Helmet>

      <Navbar />

      <div className="pt-[64px]">
        <ArchiveBanner />
      </div>

      <main className="min-h-screen bg-background pt-6 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Phase A: back link removed; global nav handles it */}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--red)' }} />
              <span className="text-[10px] uppercase tracking-wider text-red-400">
                Archived · Iran Series
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Field Notes
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Day-by-day entries that tracked the 2025–26 U.S.–Iran conflict as it developed.
              Each entry includes thesis validation, scenario probability revisions, and trading
              implications. The data snapshot is Apr 26, 2026; this series is no longer updated.
            </p>
          </motion.div>

          <CorrectionNote context="Field notes index" />

          {/* Phase 2.5: tabs — Day log (default, this page) · Full timeline (/#/timeline) */}
          <nav
            aria-label="Field Notes sections"
            className="flex items-center gap-6 mt-8 mb-10"
            style={{ borderBottom: '1px solid var(--rule)' }}
          >
            <span
              aria-current="page"
              className="pb-3 -mb-px"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                borderBottom: '2px solid var(--red)',
              }}
            >
              Day log
            </span>
            <Link
              to="/timeline"
              className="pb-3 -mb-px hover:text-foreground transition-colors"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink-muted)',
                borderBottom: '2px solid transparent',
              }}
            >
              Full timeline →
            </Link>
          </nav>

          {/* Archive snapshot panel — final published figures, Apr 26, 2026. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 p-4 surface-card border border-border rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] uppercase tracking-wider text-primary">
                Market snapshot — final published figures
              </h2>
              <span className="text-[9px] text-muted-foreground">
                as of {SERIES_SNAPSHOT.asOf}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-amber-400 nums-tabular">
                  ${BRENT.lastArchived.toFixed(0)}
                </p>
                <p className="text-[10px] text-muted-foreground">Brent Crude</p>
                <p className="text-[9px] text-amber-400/70">
                  +{BRENT_CHANGE_PCT}% from pre-war
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-400 nums-tabular">
                  ${BRENT.wtiLastArchived.toFixed(0)}
                </p>
                <p className="text-[10px] text-muted-foreground">WTI Crude</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-400 nums-tabular">
                  {HY_SPREAD.lastArchived}
                </p>
                <p className="text-[10px] text-muted-foreground">HY Spread (bps)</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground nums-tabular">
                  Day {CONFLICT_DAYS.finalArchivedDay}
                </p>
                <p className="text-[10px] text-muted-foreground">of Conflict</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-border text-[9px] text-muted-foreground/70">
              <span>{VERIFIED_MARKET_ATTRIBUTION} · {EIA_SOURCE_ATTRIBUTION} · Series archived; figures do not update.</span>
            </div>
          </motion.div>

          {/* Current Scenario Probabilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12 p-6 surface-card border border-border rounded-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" />
              <h2 className="text-[10px] uppercase tracking-wider text-primary">
                Current Scenario Probabilities
              </h2>
              <span className="ml-auto text-[10px] text-muted-foreground">
                Updated: {latestScenario.date}
              </span>
            </div>

            {/* Probability Bar */}
            <div className="flex h-8 rounded-lg overflow-hidden mb-4">
              {latestScenario.probabilities.map((p, index) => {
                const colors = ['#2E7D4F', '#B7791F', '#C8102E'];
                return (
                  <div
                    key={p.scenario}
                    className="flex items-center justify-center"
                    style={{
                      width: `${p.probability}%`,
                      backgroundColor: colors[index],
                    }}
                  >
                    <span className="text-[10px] font-bold text-background">
                      {p.probability}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              {latestScenario.probabilities.map((p, index) => {
                const colors = ['text-emerald-400', 'text-amber-400', 'text-red-400'];
                return (
                  <div key={p.scenario} className="text-center">
                    <p className={`text-xs ${colors[index]}`}>{p.scenario}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Conflict Map with Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <Map size={16} className="text-primary" />
              <h2 className="text-[10px] uppercase tracking-wider text-primary">
                Conflict Timeline Map
              </h2>
            </div>
            <ConflictMap
              throughDay={conflictMetadata.conflictDay}
              height="500px"
              showLegend={true}
              showDaySlider={true}
            />
          </motion.div>

          {/* Field Notes List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Daily Updates
            </h2>

            <div className="space-y-4">
              {availableDays
                .sort((a, b) => b - a)
                .map((day) => {
                  const note = fieldNotes[day];
                  if (!note) return null;

                  return (
                    <Link
                      key={day}
                      to={`/field-notes/day-${day}`}
                      className="block group"
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="p-6 surface-card border border-border rounded-lg hover:border-primary/40 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-primary text-[10px] uppercase">
                                <Calendar size={12} />
                                Day {day}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {note.date}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                              {note.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {note.summary}
                            </p>

                            {/* Market Snapshot — verified-only (FRED/EIA exact-date match) */}
                            {(() => {
                              const v = lookupVerifiedMarket(note.date);
                              const chips: JSX.Element[] = [];
                              if (v.brentCrude !== undefined) {
                                chips.push(
                                  <div key="brent" className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground">Brent:</span>
                                    <span className="text-xs text-amber-400">${v.brentCrude.toFixed(2)}</span>
                                  </div>
                                );
                              }
                              if (v.hySpread !== undefined) {
                                chips.push(
                                  <div key="hy" className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground">HY Spread:</span>
                                    <span className="text-xs text-red-400">{Math.round(v.hySpread)}bps</span>
                                  </div>
                                );
                              }
                              if (v.vix !== undefined) {
                                chips.push(
                                  <div key="vix" className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground">VIX:</span>
                                    <span className="text-xs text-red-400">{v.vix.toFixed(2)}</span>
                                  </div>
                                );
                              }
                              return chips.length > 0 ? (
                                <div className="flex flex-wrap gap-4 mt-4">{chips}</div>
                              ) : null;
                            })()}
                          </div>

                          <ChevronRight
                            size={20}
                            className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1"
                          />
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
            </div>
            <p className="mt-4 text-[9px] text-muted-foreground/70">
              {EIA_SOURCE_ATTRIBUTION}
            </p>
          </motion.div>

          {/* Coming Soon Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 p-6 border border-dashed border-border rounded-lg text-center"
          >
            <AlertTriangle size={24} className="text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Field notes are published as the conflict develops.
              <br />
              Check back for daily updates on thesis validation and market implications.
            </p>
          </motion.div>

          {/* Memo Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid md:grid-cols-2 gap-4"
          >
            <Link
              to="/memos/iran"
              className="p-6 surface-card border border-border rounded-lg hover:border-primary/40 transition-all duration-300 group"
            >
              <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
                Part I
              </p>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                Insurance-Driven Leverage
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                The strategic framework behind Iran's asymmetric response
              </p>
            </Link>
            <Link
              to="/memos/iran-part-ii"
              className="p-6 surface-card border border-border rounded-lg hover:border-primary/40 transition-all duration-300 group"
            >
              <p className="text-[10px] uppercase tracking-wider text-amber-400 mb-2">
                Part II
              </p>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                Credit Market Transmission
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                From energy shock to restructuring cycle
              </p>
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default FieldNotesIndex;
