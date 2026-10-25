import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { PageHeader, TagChip, Callout, MemoDownload } from '@/components/system';

const LycraMemo = () => {
  return (
    <PageLayout
      title="LYCRA — The Second Restructuring"
      description="When debt reduction isn't enough: The LYCRA Company's serial distress demonstrates that capital structure fixes cannot solve broken business models."
      bare
    >
      <article className="max-w-[720px] mx-auto px-4 pt-10 pb-12">
        <PageHeader
          kicker="Credit memo · Oct 2025"
          title="The Second Restructuring"
          dek="When debt reduction isn't enough: The LYCRA Company's serial distress demonstrates that capital structure fixes cannot solve broken business models."
          meta={
            <>
              <span>October 2025</span>
              <span style={{ color: 'var(--rule)' }} aria-hidden="true">·</span>
              <span>Zachary T. Smith</span>
              <span style={{ color: 'var(--rule)' }} aria-hidden="true">·</span>
              <span className="mono">Chemical manufacturing</span>
              <span style={{ color: 'var(--rule)' }} aria-hidden="true">·</span>
              <TagChip>Corporate RX</TagChip>
              <TagChip>Liability management</TagChip>
            </>
          }
        />
        <MemoDownload file="Fulcrum-Memo_LYCRA.pdf" />

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

          <Callout variant="insight" label="Why this analysis matters">
            <p className="italic mb-3">
              LYCRA illustrates the dangerous kind of distress. Its journey from the 2019 LBO to the
              2022 restructuring to a 2025 second recapitalization proves that when secular
              headwinds and eroding competitive advantages overwhelm the core business model, debt
              reduction alone merely delays the inevitable.
            </p>
            <p className="italic">
              This memo is about the mechanics of serial restructurings — why creditors who "won"
              in 2022 are facing dilution in 2025, and what happens when structural problems
              overwhelm even a dramatically reduced debt load.
            </p>
          </Callout>

          <Callout variant="stress" label="Executive summary">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>Serial restructuring pattern:</strong> 2022
                  debt-for-equity swap eliminated original owners, yet only 3 years later company
                  negotiating a second recapitalization.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>Revenue decline accelerating:</strong>{' '}
                  ~$800M LTM (down from $885M in 2020), indicating structural market deterioration.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>PIK interest death spiral:</strong>{' '}
                  $138M/year of cash interest converted to PIK — company cannot service any debt.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>Complex priority structure:</strong> $120M
                  of Refinancing Notes elevated to "super senior" status in 2023.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--red)' }} className="font-bold">▸</span>
                <span>
                  <strong style={{ color: 'var(--ink)' }}>Expected recoveries:</strong> SSTL 100%,
                  Super Senior Refi Notes 70–90%, remaining tranches{' '}
                  <span style={{ color: 'var(--red)' }}>10–30%</span>.
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
              "Capital structure cannot fix broken business models. LYCRA spent three years proving
              this principle."
            </p>
          </motion.blockquote>

          <Callout variant="warning" label="Why LYCRA can't stabilize">
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--warn)' }}>▸</span>
                <span>
                  Commodity spandex market: Chinese manufacturers produce at 30–40% lower cost.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--warn)' }}>▸</span>
                <span>Tariff uncertainty creates unpredictable cost structures.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--warn)' }}>▸</span>
                <span>Traditional apparel/textile end markets shrinking.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--warn)' }}>▸</span>
                <span>Eight global manufacturing facilities require substantial ongoing capex.</span>
              </li>
            </ul>
          </Callout>

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
    </PageLayout>
  );
};

export default LycraMemo;
