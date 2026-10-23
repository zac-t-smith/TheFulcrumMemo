import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PartyCityMemo = () => {
  return (
    <>
      <Helmet>
        <title>Party City | The Fulcrum Memo</title>
        <meta
          name="description"
          content="Post-mortem analysis of a failed bankruptcy restructuring. When debt reduction can't save a dying business."
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

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <p className="text-primary text-[10px] tracking-[0.2em] uppercase mb-2">
              Credit Memo
            </p>
            <span className="inline-block bg-red-500/20 text-red-400 px-3 py-1 text-[10px] uppercase tracking-wider mb-4">
              Restructuring Failure
            </span>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="tag-pill">Corporate RX</span>
              <span className="tag-pill">Retail</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Party City: When Debt Reduction Can't Save a Dying Business
            </h1>
            <p className="text-muted-foreground text-base italic mb-6 leading-relaxed">
              Post-mortem analysis of a failed bankruptcy restructuring. The specialty retailer
              eliminated nearly $1 billion in debt, only to liquidate 14 months later—a case study
              in mistaking balance sheet repair for business model salvation.
            </p>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-xs">
              <span>October 2025</span>
              <span className="text-primary">|</span>
              <span>Zachary Smith</span>
              <span className="text-primary">|</span>
              <span>Specialty Retail</span>
            </div>
          </motion.header>

          {/* Gold line */}
          <div className="gold-line mb-8" />

          {/* Lead Paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-foreground text-base leading-[1.8] mb-6">
              Party City's October 2023 bankruptcy emergence lasted just 14 months—a case study in
              mistaking balance sheet repair for business model salvation. The specialty retailer
              eliminated nearly $1 billion in debt, closed 70 underperforming stores, and raised $75
              million in fresh equity, only to file for liquidation bankruptcy in December 2024.
            </p>
            <p className="text-muted-foreground text-sm leading-[1.8] mb-8">
              By February 2025, all 700+ stores were closed and 12,000 employees terminated. This
              post-mortem examines why the restructuring failed, identifies early warning signs
              visible in real-time, and extracts lessons for credit investors evaluating distressed
              situations.
            </p>
          </motion.div>

          {/* Key Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="surface-elevated border-l-2 border-primary p-6 mb-8"
          >
            <h3 className="text-primary text-[10px] uppercase tracking-wider mb-4">
              Key Timeline
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>October 12, 2023: Emerged from Chapter 11 bankruptcy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>Debt reduced from ~$1.5B to $232M in Second Lien Notes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>December 21, 2024: Filed for liquidation (14 months later)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>February 2025: All 700+ stores closed, 12,000 jobs eliminated</span>
              </li>
            </ul>
          </motion.div>

          {/* Estimated Recoveries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="surface-elevated border-l-2 border-primary p-6 mb-8"
          >
            <h3 className="text-primary text-[10px] uppercase tracking-wider mb-4">
              Estimated Recoveries
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>ABL Facility lenders: 30-40 cents on the dollar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  Second Lien Note holders (12% PIK toggle):{' '}
                  <span className="text-red-400">0-10 cents</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>Equity holders: Zero</span>
              </li>
            </ul>
          </motion.div>

          {/* Pull Quote */}
          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border-l-2 border-primary pl-6 my-8"
          >
            <p className="text-xl italic text-primary leading-relaxed">
              "Debt reduction alone cannot salvage a business facing secular decline, intensifying
              competition, and no sustainable competitive advantages."
            </p>
          </motion.blockquote>

          {/* Phase A: entire Download CTA block hidden until Phase 5 pipeline */}

          {/* Final Warning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-red-900/20 border-2 border-red-600 p-6 rounded mb-8"
          >
            <p className="text-red-300 text-sm font-semibold text-center">
              When equity is nearly worthless and EV/Revenue is sub-0.2x, even "secured" debt is
              highly speculative.
            </p>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
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

export default PartyCityMemo;
