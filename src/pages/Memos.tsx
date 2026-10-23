import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define all memos with their metadata
const allMemos = [
  {
    id: 'iran-part-1',
    title: 'The Asymmetric Restructuring of the Middle East',
    subtitle: "How Iran's infrastructure-targeting strategy exploits asymmetric cost dynamics to achieve leverage no conventional military campaign could deliver",
    date: 'March 2026',
    author: 'Zachary Smith',
    tags: ['Sovereign Distress', 'Geopolitical Strategy', 'Game Theory'],
    series: { name: 'Asymmetric Restructuring', part: 1, total: 3 },
    path: '/memos/iran',
    pdfPath: '/memos/Iran_Sovereign_Distress_Analysis_Series_1.pdf',
  },
  {
    id: 'iran-part-2',
    title: 'Second-Order Effects: The Political Timeline, Sector Repricing, and the Coming Restructuring Cycle',
    subtitle: 'How the Iran conflict cascades from sovereign crisis to domestic political constraint to sector-level credit stress — and why the next 24 months will produce the largest restructuring cycle since 2008',
    date: 'March 2026',
    author: 'Zachary Smith',
    tags: ['Political Economy', 'Credit Cycle', 'Macro'],
    series: { name: 'Asymmetric Restructuring', part: 2, total: 3 },
    path: '/memos/iran-part-ii',
    pdfPath: '/memos/Iran_Sovereign_Distress_Analysis_Series_2.pdf',
  },
  {
    id: 'iran-part-3',
    title: 'The Trojan Horse: The Largest Distressed Asset Play in History',
    subtitle: 'How the sequencing of Venezuela, tariffs, and Iran describes the construction of structural energy and trade dominance — a sovereign-level distressed asset play reframing the entire conflict',
    date: 'April 2026',
    author: 'Zachary Smith',
    tags: ['Geopolitical Strategy', 'Sovereign Distress', 'Energy & Commodities', 'Macro'],
    series: { name: 'Asymmetric Restructuring', part: 3, total: 3 },
    path: '/memos/iran-part-iii',
    pdfPath: '/memos/Iran_Sovereign_Distress_Analysis_Series_3.pdf',
  },
  {
    id: 'shadow-partner',
    title: 'The Shadow Partner: Russia as Unpriced Counterparty',
    subtitle: "How Russia's intelligence sharing, oil arbitrage, and attention capture make it the largest unacknowledged beneficiary of the Iran conflict — and why the coalition's cost-benefit calculus is missing a $50-60 billion line item",
    date: 'April 2026',
    author: 'Zachary Smith',
    tags: ['Geopolitical Strategy', 'Game Theory', 'Energy & Commodities'],
    series: { name: 'Asymmetric Restructuring', part: 3.5, total: 3 },
    path: '/memos/shadow-partner',
    badge: 'ADDENDUM TO PART III',
  },
  {
    id: 'kirklands',
    title: "When Your White Knight Is Actually a Vulture",
    subtitle: "The Beyond Inc. takeover of Kirkland's demonstrates how creditor-friendly financing can achieve effective control without triggering takeover regulations",
    date: 'October 2025',
    author: 'Zachary Smith',
    tags: ['Corporate RX', 'Retail', 'Special Situations'],
    ticker: 'KIRK',
    path: '/memos/kirklands',
    pdfPath: '/memos/Kirklands_Credit_Analysis.pdf',
  },
  {
    id: 'lycra',
    title: 'The LYCRA Company',
    subtitle: 'Deep dive into the specialty fiber manufacturer facing capital structure pressures',
    date: '2025',
    author: 'Zachary Smith',
    tags: ['Corporate RX', 'Energy & Commodities'],
    ticker: 'LYCRA',
    path: '/memos/lycra',
    pdfPath: '/memos/LYCRA_Credit_Analysis.pdf',
  },
  {
    id: 'party-city',
    title: 'Party City',
    subtitle: 'Analysis of the party goods retailer through Chapter 11 proceedings',
    date: '2025',
    author: 'Zachary Smith',
    tags: ['Corporate RX', 'Retail'],
    ticker: 'PRTY',
    path: '/memos/party-city',
    pdfPath: '/memos/Party_City_Credit_Analysis.pdf',
  },
];

// Consolidated tag list
const consolidatedTags = [
  'Sovereign Distress',
  'Corporate RX',
  'Geopolitical Strategy',
  'Credit Cycle',
  'Energy & Commodities',
  'Retail',
  'Political Economy',
  'Macro',
  'Special Situations',
  'Game Theory',
];

const MemosPage = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => setSelectedTags([]);

  const filteredMemos =
    selectedTags.length === 0
      ? allMemos
      : allMemos.filter((memo) => selectedTags.some((tag) => memo.tags.includes(tag)));

  // Group memos by series
  const seriesMemos = filteredMemos.filter((m) => m.series);
  const standaloneMemos = filteredMemos.filter((m) => !m.series);

  return (
    <>
      <Helmet>
        <title>Memos | The Fulcrum Memo</title>
        <meta
          name="description"
          content="Independent credit research and analysis covering distressed debt, restructuring situations, sovereign distress, and special situations investing."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-6 pt-24 pb-12 max-w-4xl">
          {/* Header */}
          <header className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* back link removed; global nav */}

              <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-3">
                Publications
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                The <span style={{ color: '#c9a227' }}>Fulcrum</span> Memo
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                Independent credit research and analysis covering distressed debt, restructuring
                situations, sovereign distress, and special situations investing.
              </p>
            </motion.div>
          </header>

          {/* Tag Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Filter by tag
              </h2>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-primary text-xs hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearFilters}
                className={`tag-pill ${selectedTags.length === 0 ? 'tag-pill-active' : ''}`}
              >
                All
              </button>
              {consolidatedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tag-pill ${selectedTags.includes(tag) ? 'tag-pill-active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-xs mb-6"
          >
            Showing {filteredMemos.length} of {allMemos.length} memos
          </motion.p>

          {/* Series Section */}
          {seriesMemos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  The Asymmetric Restructuring Series
                </h3>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase tracking-wider border border-primary/30">
                  3-Part Series
                </span>
              </div>

              <AnimatePresence mode="popLayout">
                <div className="grid md:grid-cols-2 gap-4">
                  {seriesMemos.map((memo, index) => (
                    <motion.div
                      key={memo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="memo-card group relative"
                    >
                      <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-[10px] uppercase tracking-wider">
                        {memo.badge ? memo.badge : `Part ${memo.series?.part}`}
                      </div>

                      <div className="pt-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                            {memo.date}
                          </span>
                        </div>

                        <Link to={memo.path}>
                          <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {memo.title}
                          </h4>
                        </Link>

                        <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-3">
                          {memo.subtitle}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {memo.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="tag-pill">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={memo.path}
                            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-[10px] uppercase tracking-wider transition-all duration-300 group/btn"
                          >
                            Read
                            <ArrowRight
                              size={12}
                              className="transition-transform group-hover/btn:translate-x-0.5"
                            />
                          </Link>
                          {/* Phase A: memo PDF buttons hidden until Phase 5 pipeline */}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Standalone Memos */}
          {standaloneMemos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {seriesMemos.length > 0 && (
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Corporate Credit Analysis
                </h3>
              )}

              <AnimatePresence mode="popLayout">
                <div className="space-y-4">
                  {standaloneMemos.map((memo, index) => (
                    <motion.div
                      key={memo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="memo-card group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          {memo.ticker && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-primary text-[10px] uppercase tracking-wider">
                                {memo.ticker}
                              </span>
                            </div>
                          )}

                          <Link to={memo.path}>
                            <h4 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {memo.title}
                            </h4>
                          </Link>

                          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                            {memo.subtitle}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs mb-4">
                            <span>{memo.date}</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {memo.tags.map((tag) => (
                              <span key={tag} className="tag-pill">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:w-36 shrink-0">
                          <Link
                            to={memo.path}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-[10px] uppercase tracking-wider transition-all duration-300 group/btn"
                          >
                            Read
                            <ArrowRight
                              size={12}
                              className="transition-transform group-hover/btn:translate-x-0.5"
                            />
                          </Link>
                          {/* Phase A: memo PDF buttons hidden until Phase 5 pipeline */}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty state */}
          {filteredMemos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground text-sm">
                No memos match the selected filters.
              </p>
              <button
                onClick={clearFilters}
                className="text-primary text-sm mt-2 hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MemosPage;
