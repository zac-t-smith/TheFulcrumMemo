import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { PageHeader, TagChip, Callout, MemoDownload } from '@/components/system';

const KirklandsMemo = () => {
  return (
    <PageLayout
      title="Kirkland's — When Your White Knight Is Actually a Vulture"
      description="The Beyond Inc. takeover of Kirkland's demonstrates how creditor-friendly financing can achieve effective control without triggering takeover regulations."
      bare
    >
      <article className="max-w-[720px] mx-auto px-4 pt-10 pb-12">
        <PageHeader
          kicker="Credit memo · Oct 2025"
          title="When Your White Knight Is Actually a Vulture"
          dek="The Beyond Inc. takeover of Kirkland's demonstrates how creditor-friendly financing can achieve effective control without triggering takeover regulations."
          meta={
            <>
              <span>October 2025</span>
              <span style={{ color: 'var(--rule)' }} aria-hidden="true">·</span>
              <span>Zachary T. Smith</span>
              <span style={{ color: 'var(--rule)' }} aria-hidden="true">·</span>
              <span className="mono">NASDAQ: KIRK</span>
              <span style={{ color: 'var(--rule)' }} aria-hidden="true">·</span>
              <TagChip>Corporate RX</TagChip>
              <TagChip>Retail</TagChip>
              <TagChip>Creditor control</TagChip>
            </>
          }
        />
        <MemoDownload file="Fulcrum-Memo_Kirklands.pdf" />

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

          <Callout variant="insight" label="Why this analysis matters">
            <p className="italic mb-3">
              I've navigated a business through restructuring — not as an advisor or investor, but
              as the operator making the decisions. When you're burning cash and need capital, you
              don't have the luxury of perfect options.
            </p>
            <p className="italic">
              This memo applies those lessons to KIRK — not to criticize management's decisions, but
              to understand the mechanics of how creditor control operates in modern distressed
              situations.
            </p>
          </Callout>

          <Callout variant="stress" label="Executive summary">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>Revenue collapse accelerating:</strong>{' '}
                  Sales down 11.7% year-to-date, with Q2 showing 12.2% decline.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>Gross margin compression terminal:</strong>{' '}
                  16.3% in Q2 (down 410 basis points) indicates heavy promotional discounting.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>Liquidity precarious:</strong> 7–12 month
                  runway after the $10M brand sale and $20M delayed-draw commitment.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>Beyond has de facto control:</strong> 40%
                  equity ownership, 2 of 6 board seats, conversion rights expandable to 65%.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>Expected equity value:</strong>{' '}
                  <span style={{ color: 'var(--red)' }}>67–93% downside</span> from current ~$1.50.
                </span>
              </li>
            </ul>
          </Callout>

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
    </PageLayout>
  );
};

export default KirklandsMemo;
