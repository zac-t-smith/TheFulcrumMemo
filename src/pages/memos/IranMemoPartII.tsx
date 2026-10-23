import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const IranMemoPartII = () => {
  return (
    <>
      <Helmet>
        <title>Second-Order Effects | The Fulcrum Memo</title>
        <meta
          name="description"
          content="How the Iran conflict cascades from sovereign crisis to domestic political constraint to sector-level credit stress — and why the next 12-18 months will produce the largest restructuring cycle since 2008."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <article className="container mx-auto px-6 pt-24 pb-12 max-w-3xl">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Phase A: back link removed; global nav handles it */}
          </motion.div>

          {/* Series Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="surface-elevated border border-primary/30 p-4 mb-8 flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <p className="text-primary text-[10px] tracking-wider uppercase mb-1">
                The Asymmetric Restructuring Series
              </p>
              <p className="text-muted-foreground text-sm">Part II of II</p>
            </div>
            <Link
              to="/memos/iran"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
              Read Part I
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <p className="text-primary text-[10px] tracking-[0.2em] uppercase mb-2">
              The Fulcrum Memo
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="tag-pill">Political Economy</span>
              <span className="tag-pill">Credit Cycle</span>
              <span className="tag-pill">Macro</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Second-Order Effects
            </h1>
            <p className="text-muted-foreground text-base italic mb-6 leading-relaxed">
              The Political Timeline, Sector Repricing, and the Coming Restructuring Cycle — How the
              Iran conflict cascades from sovereign crisis to domestic political constraint to
              sector-level credit stress
            </p>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-xs">
              <span>March 2026</span>
              <span className="text-primary">|</span>
              <span>Zachary Smith</span>
            </div>
          </motion.header>

          {/* Gold line */}
          <div className="gold-line mb-8" />

          {/* Lead Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-foreground text-base leading-[1.8] mb-8"
          >
            Building on the geopolitical framework established in Part I, this analysis traces the
            second-order effects of Iran's infrastructure-targeting strategy through domestic
            political constraints, sector-level credit stress, and the emerging restructuring cycle.
            The cascade from sovereign crisis to investable thesis reveals why the next 12-18 months
            will reshape credit markets.
          </motion.p>

          {/* Phase A: entire Download CTA block hidden until Phase 5 pipeline */}

          {/* Series Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="surface-card p-6 mb-8"
          >
            <h3 className="text-foreground font-semibold mb-4">
              The Asymmetric Restructuring Series
            </h3>
            <div className="space-y-3">
              <Link
                to="/memos/iran"
                className="flex items-center justify-between p-3 border border-border hover:border-primary/50 transition-colors group"
              >
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                    Part I
                  </p>
                  <p className="text-foreground text-sm group-hover:text-primary transition-colors">
                    The Asymmetric Restructuring of the Middle East
                  </p>
                </div>
                <ArrowLeft size={16} className="text-primary" />
              </Link>
              <div className="flex items-center justify-between p-3 border-2 border-primary bg-primary/5">
                <div>
                  <p className="text-primary text-[10px] uppercase tracking-wider mb-1">
                    Part II - You are here
                  </p>
                  <p className="text-foreground text-sm">Second-Order Effects</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <div className="text-muted-foreground text-sm mb-4">
              <p className="font-semibold text-foreground mb-2">Contact</p>
              <p>Zachary Smith | zac.ty.smith@gmail.com</p>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              <strong>Disclaimer:</strong> This analysis is for educational purposes only and does
              not constitute investment advice. All information is based on publicly available
              sources and estimates, which may prove incorrect.
            </p>
          </motion.footer>
        </article>

        <Footer />
      </div>
    </>
  );
};

export default IranMemoPartII;
