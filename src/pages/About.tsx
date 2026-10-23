import PageLayout from '@/components/PageLayout';
import { PageHeader, StatBlock, Callout, Button } from '@/components/system';
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
    <PageLayout title="About" description={BIO_SHORT}>
      <PageHeader
        kicker="About the author"
        title={AUTHOR_NAME}
        dek={BIO_SHORT}
      />

      <section
        className="container-reading"
        style={{ padding: 0, maxWidth: 720 }}
      >
        <p className="t-body mb-5">
          After high school I enlisted in the Army infantry and was selected
          for security details with high-ranking officials, including a former
          U.S. President. That was 3.5 years at Fort Carson with the 4th
          Infantry Division, and it sparked a reading habit I still have —
          free time at libraries in Colorado Springs and at the University of
          Colorado.
        </p>

        <p className="t-body mb-5">
          When I transitioned out I started studying finance. Family
          circumstances moved us to Mobile, Alabama. From a non-target school
          I leaned on my veteran network and placed into early-identification,
          summer, and winter programs at Pivoton Capital (PE), Goldman Sachs
          (S&T summer insight), Citi (IB early ID), Morgan Stanley (WM winter
          analyst and the IB military early insight), and BlockCrowd Financial
          Group (IB winter analyst). COVID froze the 2020 analyst pipeline.
          With two small children I took a strategic sales role to provide
          immediate stability.
        </p>

        <Callout variant="insight" label="The lived case">
          In April 2024 I launched Best Option Restoration. I raised $300K in
          capital and {REVENUE_CLAIM}. Then insurance-carrier collection
          cycles of 90–120 days produced a cash-flow crunch I spent 18 months
          working through — creditor negotiations, vendor payment terms, and
          additional capital raises, until we liquidated in order to return
          most investor capital.
        </Callout>

        <p className="t-body mt-5">
          That experience is the reason I write this letter. I have sat on
          the debtor's side of the table: operating under a liquidity
          constraint, negotiating with vendors and lenders, deciding which
          payable to break this week and which to break next week. The
          lessons informed every memo and every position on this site, and
          they are why I am {RECRUITING_LINE}.
        </p>
      </section>

      {/* Credential strip */}
      <section className="mt-16 pt-10" style={{ borderTop: '1px solid var(--rule)' }}>
        <div className="t-kicker mb-6">Credentials</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatBlock value={CREDENTIALS.capitalRaised} label="Capital Raised" />
          <StatBlock value={CREDENTIALS.revenueScale} label="Zero to MRR" />
          <StatBlock value={CREDENTIALS.distressedOps} label="Distressed Ops" />
          <StatBlock value={CREDENTIALS.army} label="Service" />
        </div>
      </section>

      {/* CTA strip */}
      <section
        className="mt-12 pt-8 flex flex-wrap items-center gap-4"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <Button as="a" href={RESUME_PDF} download target="_blank" rel="noopener noreferrer">
          Download Resume
        </Button>
        <Button as="a" href={EMAIL_MAILTO} variant="secondary">
          {EMAIL}
        </Button>
        <Button
          as="a"
          href={LINKEDIN_URL}
          variant="secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </Button>
      </section>
    </PageLayout>
  );
};

export default About;
