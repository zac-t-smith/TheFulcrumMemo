import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LycraMemo = () => {
  return (
    <>
      <Helmet>
        <title>The LYCRA Company | The Fulcrum Memo</title>
        <meta
          name="description"
          content="When debt reduction isn't enough: The LYCRA Company's serial distress demonstrates that capital structure fixes cannot solve broken business models."
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
              <span className="tag-pill">Energy & Commodities</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              The Second Restructuring
            </h1>
            <p className="text-muted-foreground text-base italic mb-6 leading-relaxed">
              When debt reduction isn't enough: The LYCRA Company's serial distress demonstrates
              that capital structure fixes cannot solve broken business models
            </p>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-xs">
              <span>October 2025</span>
              <span className="text-primary">|</span>
              <span>Zachary Smith</span>
              <span className="text-primary">|</span>
              <span>Chemical Manufacturing</span>
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
              The LYCRA Company stands at a critical juncture—just three years removed from its 2022
              restructuring, the specialty fiber manufacturer finds itself negotiating its second
              major recapitalization. With $1.4 billion in debt maturing December 31, 2025, and a
              Lock-Up Agreement that will convert existing creditors into new equity holders, LYCRA
              exemplifies a fundamental principle: debt reduction alone cannot salvage businesses
              facing secular decline.
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
              LYCRA illustrates the dangerous kind of distress. Its journey from 2019 LBO to 2022
              restructuring to 2025's second recapitalization proves that when secular headwinds and
              eroding competitive advantages overwhelm the core business model, debt reduction alone
              merely delays the inevitable.
            </p>
            <p className="text-muted-foreground text-sm italic leading-relaxed">
              This memo is about understanding the mechanics of serial restructurings, why creditors
              who "won" in 2022 are facing dilution in 2025, and what happens when structural
              problems overwhelm even dramatically reduced debt loads.
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
                  <strong className="text-foreground">Serial restructuring pattern:</strong> 2022
                  debt-for-equity swap eliminated original owners, yet only 3 years later company
                  negotiating second recapitalization
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  <strong className="text-foreground">Revenue decline accelerating:</strong> ~$800M
                  LTM (down from $885M in 2020), indicating structural market deterioration
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  <strong className="text-foreground">PIK interest death spiral:</strong>{' '}
                  $138M/year in cash interest converted to PIK—company cannot service any debt
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  <strong className="text-foreground">Complex priority structure:</strong> $120M of
                  Refinancing Notes elevated to "super senior" status in 2023
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▸</span>
                <span>
                  <strong className="text-foreground">Expected recoveries:</strong> SSTL 100%,
                  Super Senior Refi Notes 70-90%, remaining tranches{' '}
                  <span className="text-red-400">10-30%</span>
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
              "Capital structure cannot fix broken business models. LYCRA spent three years proving
              this principle."
            </p>
          </motion.blockquote>

          {/* Warning Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="surface-elevated border-l-2 border-yellow-500 p-6 mb-8"
          >
            <h4 className="text-yellow-500 text-[10px] uppercase tracking-wider mb-3">
              Why LYCRA Can't Stabilize
            </h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">▸</span>
                <span>
                  Commodity spandex market: Chinese manufacturers produce at 30-40% lower cost
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">▸</span>
                <span>Tariff uncertainty creates unpredictable cost structures</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">▸</span>
                <span>Traditional apparel/textile end markets shrinking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">▸</span>
                <span>8 global manufacturing facilities require substantial ongoing capex</span>
              </li>
            </ul>
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

export default LycraMemo;
