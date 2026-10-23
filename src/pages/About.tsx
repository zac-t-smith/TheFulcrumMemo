import PageLayout from '@/components/PageLayout';
import {
  AUTHOR_NAME,
  BIO_SHORT,
  CREDENTIALS,
  EMAIL,
  EMAIL_MAILTO,
  LINKEDIN_URL,
  RECRUITING_LINE,
  RESUME_PDF,
  REVENUE_CLAIM,
} from '@/content/bio';

const About = () => {
  return (
    <PageLayout
      title="About"
      description={BIO_SHORT}
    >
      <article>
        <header className="mb-10 pt-4">
          <div
            className="text-[10.5px] tracking-[0.18em] uppercase font-semibold text-[#4a4a4a] mb-3"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          >
            About the author
          </div>
          <h1
            className="text-[40px] md:text-[52px] leading-[1.08] font-bold tracking-tight m-0"
            style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}
          >
            {AUTHOR_NAME}
          </h1>
          <p
            className="mt-4 text-[18px] leading-[1.5] text-[#4a4a4a] max-w-[640px]"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {BIO_SHORT}
          </p>
        </header>

        <section className="max-w-[720px]" style={{ fontFamily: 'Georgia, serif' }}>
          <p className="text-[17px] leading-[1.7] mb-5 text-[#1a1a1a]">
            After high school I enlisted in the Army infantry and was selected
            for security details with high-ranking officials, including a former
            U.S. President. That experience, 3.5 years at Fort Carson with the
            4th Infantry Division, sparked a reading habit I still have: free
            time at libraries in Colorado Springs and at the University of
            Colorado.
          </p>

          <p className="text-[17px] leading-[1.7] mb-5 text-[#1a1a1a]">
            When I transitioned out I started studying finance. Family
            circumstances moved us to Mobile, Alabama. From a non-target school
            I leaned on my veteran network and placed into early-identification,
            summer, and winter programs at Pivoton Capital (PE), Goldman Sachs
            (sales &amp; trading summer insight), Citi (IB early ID), Morgan
            Stanley (wealth management winter analyst and the IB military early
            insight), and BlockCrowd Financial Group (IB winter analyst). COVID
            froze the 2020 analyst pipeline. With two small children I took a
            strategic sales role to provide immediate stability.
          </p>

          <blockquote
            className="my-8 pl-5 border-l-4"
            style={{ borderColor: '#c8102e' }}
          >
            <p
              className="text-[18px] italic leading-[1.6] text-[#1a1a1a]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              In April 2024 I launched Best Option Restoration. I raised $300K
              in capital and {REVENUE_CLAIM}. Then insurance-carrier collection
              cycles of 90–120 days produced a cash-flow crunch I spent 18
              months working through: creditor negotiations, vendor payment
              terms, and additional capital raises, until we liquidated in
              order to return most investor capital.
            </p>
          </blockquote>

          <p className="text-[17px] leading-[1.7] mb-5 text-[#1a1a1a]">
            That experience is the reason I write this letter. I have sat on
            the debtor's side of the table: operating under a liquidity
            constraint, negotiating with vendors and lenders, deciding which
            payable to break this week and which to break next week. The
            lessons informed every memo and every position on this site, and
            they are why I am {RECRUITING_LINE}.
          </p>
        </section>

        {/* Credentials strip */}
        <section className="mt-16 pt-10" style={{ borderTop: '1px solid #d9d4c7' }}>
          <div
            className="text-[10.5px] tracking-[0.18em] uppercase font-semibold text-[#4a4a4a] mb-6"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          >
            Credential strip
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat value={CREDENTIALS.capitalRaised} label="Capital Raised" />
            <Stat value={CREDENTIALS.revenueScale} label="Zero to MRR" />
            <Stat value={CREDENTIALS.distressedOps} label="Distressed Ops" />
            <Stat value={CREDENTIALS.army} label="Service" />
          </div>
        </section>

        {/* CTA strip */}
        <section
          className="mt-12 pt-8 flex flex-wrap items-center gap-4"
          style={{ borderTop: '1px solid #d9d4c7' }}
        >
          <a
            href={RESUME_PDF}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2 text-[11px] uppercase tracking-[0.18em] font-semibold"
            style={{
              fontFamily: 'Helvetica Neue, Arial, sans-serif',
              background: '#1a1a1a',
              color: '#f7f5f0',
            }}
          >
            Download Resume
          </a>
          <a
            href={EMAIL_MAILTO}
            className="inline-flex items-center px-5 py-2 text-[11px] uppercase tracking-[0.18em] font-semibold"
            style={{
              fontFamily: 'Helvetica Neue, Arial, sans-serif',
              border: '1px solid #1a1a1a',
              color: '#1a1a1a',
            }}
          >
            {EMAIL}
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2 text-[11px] uppercase tracking-[0.18em] font-semibold"
            style={{
              fontFamily: 'Helvetica Neue, Arial, sans-serif',
              border: '1px solid #1a1a1a',
              color: '#1a1a1a',
            }}
          >
            LinkedIn
          </a>
        </section>
      </article>
    </PageLayout>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <p
      className="text-[24px] font-bold leading-[1.1] text-[#1a1a1a] tabular-nums"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {value}
    </p>
    <p
      className="mt-2 text-[10.5px] tracking-[0.18em] uppercase font-semibold text-[#4a4a4a]"
      style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
    >
      {label}
    </p>
  </div>
);

export default About;
