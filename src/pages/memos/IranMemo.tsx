import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const IranMemo = () => {
  return (
    <>
      <Helmet>
        <title>The Asymmetric Restructuring of the Middle East | The Fulcrum Memo</title>
        <meta
          name="description"
          content="How Iran's infrastructure-targeting strategy exploits asymmetric cost dynamics to achieve leverage no conventional military campaign could deliver."
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
              <p className="text-muted-foreground text-sm">Part I of II</p>
            </div>
            <Link
              to="/memos/iran-part-ii"
              className="flex items-center gap-2 text-primary hover:text-foreground transition-colors text-sm group"
            >
              Read Part II
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
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
              <span className="tag-pill">Sovereign Distress</span>
              <span className="tag-pill">Geopolitical Strategy</span>
              <span className="tag-pill">Game Theory</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              The Asymmetric Restructuring of the Middle East
            </h1>
            <p className="text-muted-foreground text-base italic mb-6 leading-relaxed">
              How Iran's infrastructure-targeting strategy exploits asymmetric cost dynamics to
              achieve leverage no conventional military campaign could deliver
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
            This analysis examines the strategic calculus behind Iran's regional positioning
            through the lens of distressed credit analysis. By applying restructuring frameworks
            to geopolitical dynamics, we can better understand the asymmetric leverage positions
            and cost structures that define modern Middle Eastern power dynamics.
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
              <div className="flex items-center justify-between p-3 border-2 border-primary bg-primary/5">
                <div>
                  <p className="text-primary text-[10px] uppercase tracking-wider mb-1">
                    Part I - You are here
                  </p>
                  <p className="text-foreground text-sm">
                    The Asymmetric Restructuring of the Middle East
                  </p>
                </div>
              </div>
              <Link
                to="/memos/iran-part-ii"
                className="flex items-center justify-between p-3 border border-border hover:border-primary/50 transition-colors group"
              >
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                    Part II
                  </p>
                  <p className="text-foreground text-sm group-hover:text-primary transition-colors">
                    Second-Order Effects
                  </p>
                </div>
                <ArrowRight size={16} className="text-primary" />
              </Link>
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

export default IranMemo;
