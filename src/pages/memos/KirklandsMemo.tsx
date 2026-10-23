import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const KirklandsMemo = () => {
  return (
    <>
      <Helmet>
        <title>Kirkland's Credit Analysis | The Fulcrum Memo</title>
        <meta
          name="description"
          content="The Beyond Inc. takeover of Kirkland's demonstrates how creditor-friendly financing can achieve effective control without triggering takeover regulations."
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
              The Fulcrum Memo
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="tag-pill">Corporate RX</span>
              <span className="tag-pill">Retail</span>
              <span className="tag-pill">Special Situations</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              When Your White Knight Is Actually a Vulture
            </h1>
            <p className="text-muted-foreground text-base italic mb-6 leading-relaxed">
              The Beyond Inc. takeover of Kirkland's demonstrates how creditor-friendly financing
              can achieve effective control without triggering takeover regulations
            </p>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-xs">
              <span>October 2025</span>
              <span className="text-primary">|</span>
              <span>Zachary Smith</span>
              <span className="text-primary">|</span>
              <span>NASDAQ: KIRK</span>
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
            <p className="text-foreground text-base leading-[1.8] mb-8">
              Kirkland's Inc. presents not as a traditional distressed retail turnaround, but as a
              live case study in creditor control and strategic asset extraction disguised as rescue
              financing. What appears on the surface as a struggling home decor retailer being
              rescued by Beyond Inc. is, upon deeper analysis, a methodical acquisition strategy
              where Beyond is purchasing KIRK's infrastructure, customer base, and retail footprint
              for a fraction of replacement cost.
            </p>
          </motion.div>

          {/* Personal Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="surface-elevated border-l-2 border-blue-500 p-6 mb-8"
          >
            <h3 className="text-blue-400 text-[10px] uppercase tracking-wider mb-3">
              Why This Analysis Matters
            </h3>
            <p className="text-muted-foreground text-sm italic leading-relaxed mb-3">
              I've navigated a business through restructuring—not as an advisor or investor, but as
              the operator making the decisions. When you're burning cash and need capital, you
              don't have the luxury of perfect options.
            </p>
            <p className="text-muted-foreground text-sm italic leading-relaxed">
              This memo applies those lessons to KIRK—not to criticize management's decisions, but
              to understand the mechanics of how creditor control operates in modern distressed
              situations.
            </p>
          </motion.div>

          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="surface-elevated border-l-2 border-primary p-6 mb-8"
          >
            <h3 className="text-primary text-[10px] uppercase tracking-wider mb-4">
              Executive Summary
            </h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  <strong className="text-foreground">Revenue collapse accelerating:</strong> Sales
                  down 11.7% year-to-date, with Q2 showing 12.2% decline
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  <strong className="text-foreground">Gross margin compression terminal:</strong>{' '}
                  16.3% in Q2 (down 410 basis points) indicates heavy promotional discounting
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  <strong className="text-foreground">Liquidity precarious:</strong> 7-12 month
                  runway after $10M brand sale and $20M delayed draw commitment
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  <strong className="text-foreground">Beyond has de facto control:</strong> 40%
                  equity ownership, 2 of 6 board seats, conversion rights expandable to 65%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  <strong className="text-foreground">Expected equity value:</strong>{' '}
                  <span className="text-red-400">67-93% downside</span> from current ~$1.50
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Phase A: entire Download CTA block hidden until Phase 5 pipeline */}

          {/* Pull Quote */}
          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="border-l-2 border-primary pl-6 my-8"
          >
            <p className="text-xl italic text-primary leading-relaxed">
              "This represents successful value extraction by Beyond, but effective wipeout for
              legacy KIRK shareholders"
            </p>
          </motion.blockquote>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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

export default KirklandsMemo;
