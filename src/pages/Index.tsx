import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Phase 4E-3 home page — clean Economist-style landing.
 *
 * Editorial cover (red eyebrow, Georgia masthead, gold accent rule, lede,
 * three CTAs, three featured tiles) followed by About and Contact scroll
 * sections at #about / #contact anchors. Replaces the prior dark/gold/
 * monospace hero. The eight legacy landing components were deleted in
 * Phase 4E-3b — About and Contact content was migrated inline below;
 * the rest (HeroSection, AuthorBar, ExperienceSection, CaseStudySection,
 * ResearchSection, InteractiveMesh) was retired with the dark theme.
 */
const Index = () => {
  return (
    <>
      <Helmet>
        <title>The Fulcrum Memo | Independent Credit Research</title>
        <meta
          name="description"
          content="A research letter on distressed credit, restructuring situations, and special situations. Applying restructuring frameworks to complex credit cycles."
        />
        <meta
          name="keywords"
          content="restructuring, distressed debt, credit research, special situations, fulcrum security, investment banking"
        />
        <link rel="canonical" href="https://zac-t-smith.github.io/TheFulcrumMemo" />
      </Helmet>

      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'var(--paper)', color: 'var(--ink)' }}
      >
        <Navbar />

        <main className="flex-1 flex items-center pt-24 pb-16">
          <div className="max-w-[1080px] mx-auto px-7 w-full">
            {/* Editorial cover treatment */}
            <div
              className="flex items-stretch gap-3.5 pb-3.5 mb-6"
              style={{ borderBottom: '1px solid #1a1a1a' }}
            >
              <div className="w-2 flex-shrink-0" style={{ background: 'var(--red)' }} />
              <div className="flex flex-col justify-center gap-2">
                <div
                  className="text-[10px] tracking-[0.22em] uppercase font-semibold text-[#4a4a4a]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Independent Research
                  <span className="text-[#c8102e] mx-2" aria-hidden="true">●</span>
                  Distressed Credit
                  <span className="text-[#c8102e] mx-2" aria-hidden="true">●</span>
                  Restructuring & Special Situations
                </div>
                <h1
                  className="text-[44px] md:text-[60px] leading-[1.05] font-bold tracking-tight m-0"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  The Fulcrum Memo
                </h1>
              </div>
            </div>

            {/* Gold accent rule */}
            <div
              className="h-px mb-7"
              style={{
                background:
                  'linear-gradient(90deg, #c9a227 0%, rgba(201,162,39,0.0) 70%)',
                maxWidth: '320px',
              }}
            />

            {/* Lede */}
            <p
              className="text-[19px] md:text-[21px] leading-[1.55] text-[#1a1a1a] max-w-[720px] mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              A research letter on distressed credit, restructuring situations, and special
              situations. Applying restructuring frameworks to complex credit cycles —
              translating geopolitical and macro developments into specific portfolio
              positioning.
            </p>

            <p
              className="text-[14.5px] leading-relaxed text-[#4a4a4a] italic max-w-[720px] mb-9"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              By Zachary Smith — Army veteran, operator, restructuring analyst candidate.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link
                to="/memos"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.16em] uppercase text-white transition-colors"
                style={{
                  background: 'var(--red)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Read the Memos
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                to="/fulcrum-index"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.16em] uppercase text-[#1a1a1a] transition-colors hover:text-[#c8102e]"
                style={{
                  border: '1px solid #1a1a1a',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                The Fulcrum Index
              </Link>
              <Link
                to="/positions"
                className="text-[12px] font-bold tracking-[0.16em] uppercase text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Track Record →
              </Link>
            </div>

            {/* Featured tiles */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2"
              style={{
                borderTop: '1px solid #d9d4c7',
                borderBottom: '1px solid #d9d4c7',
              }}
            >
              <FeaturedTile
                eyebrow="Latest"
                title="The Fulcrum Index"
                description="A composite signal calibrated against four decades of investment-grade credit spreads. Updated daily."
                href="/fulcrum-index"
              />
              <FeaturedTile
                eyebrow="Tracking"
                title="Field Notes"
                description="Day-by-day analytical entries on the 2026 Iran conflict, framed through a restructuring lens."
                href="/field-notes"
                bordered
              />
              <FeaturedTile
                eyebrow="Framework"
                title="Memos"
                description="Long-form theses on portfolio contagion, asymmetric restructuring, and macro transmission."
                href="/memos"
              />
            </div>
          </div>
        </main>

        <AboutScrollSection />
        <ContactScrollSection />

        <Footer />
      </div>
    </>
  );
};

// =============================================================================
// ABOUT SECTION — folded in from the legacy AboutSection.tsx component during
// Phase 4E-3b. Same content, cream/serif styling, no framer-motion. Anchored
// at #about so the existing nav link convention (`/#about`) keeps working.
// =============================================================================

const AboutScrollSection = () => (
  <section id="about" className="py-16" style={{ background: 'var(--paper)', borderTop: '1px solid #d9d4c7' }}>
    <div className="max-w-[1080px] mx-auto px-7">
      <div className="mb-8">
        <div
          className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#c8102e] mb-2"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Background
        </div>
        <h2
          className="text-[32px] md:text-[38px] font-bold tracking-tight m-0 mb-3"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          About
        </h2>
        <div
          className="h-px"
          style={{
            background: 'linear-gradient(90deg, #c9a227 0%, transparent 70%)',
            maxWidth: '240px',
          }}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Story */}
        <div
          className="space-y-4 text-[14px] leading-relaxed text-[#1a1a1a]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          <p>
            After high school, I enlisted in the Army infantry and was selected for security
            details with high-ranking officials, including a former U.S. President. That
            experience sparked my love of learning — I'd spend free time at libraries around
            the city and at the University of Colorado.
          </p>
          <p>
            When I transitioned out, I started studying finance but family circumstances required
            us to move to Mobile, Alabama. With one young child and being at a non-target, I
            leveraged my veteran network to get my foot in the door with investment banking,
            private equity, and wealth management internships.
          </p>
          <p>
            However, in 2020, my junior year, COVID-19 froze the internship and analyst hiring
            pipelines. With much uncertainty and two small children, I decided to pivot and take
            a full-time strategic sales role to provide immediate stability for my family.
          </p>
          <p>
            I spent four years in tech sales as a business advisor, then launched my own
            restoration company in April 2024. I raised $300K in capital and scaled from $0 to
            $100K in monthly revenue within 5 months. We faced 90–120 day collection cycles
            with insurance carriers, creating severe cash flow constraints despite the growth.
          </p>
          <p>
            After 18 months of managing creditor negotiations, vendor payment terms, and seeking
            additional capital, we liquidated while we could still return most investor capital.
          </p>
          <div
            className="my-2 px-5 py-3 italic text-[14px] leading-relaxed"
            style={{
              borderLeft: '3px solid #c8102e',
              background: 'rgba(200, 16, 46, 0.04)',
              fontFamily: 'var(--font-serif)',
            }}
          >
            That experience gave me firsthand insight into financial distress — managing liquidity
            crunches, negotiating with creditors, and making operational decisions under pressure.
            That hands-on perspective now fuels my drive to pursue what I'm genuinely passionate
            about: helping companies navigate similar situations from the capital provider side.
          </div>
        </div>

        {/* Differentiators */}
        <div className="space-y-5">
          <Differentiator
            title="Military Discipline"
            body="Four years as an Infantry Specialist instilled attention to detail, composure under pressure, and the ability to execute in high-stakes environments. Selected for presidential security details."
          />
          <Differentiator
            title="Operator Experience"
            body="Scaled Best Option Restoration from $0 to $100K in monthly revenue within 5 months. Raised $300K. Managed P&L, led teams, and navigated financial distress firsthand — creditor negotiations, vendor payment terms, orderly wind-down."
          />
          <Differentiator
            title="Analytical Foundation"
            body="Internships and programs with Pivoton Capital, Goldman Sachs (S&T summer insight), Citi (IB early ID), Morgan Stanley (WM winter analyst and IB military early insight), and BlockCrowd Financial Group (IB winter analyst). COVID froze the 2020 analyst pipeline before full-time; I rebuilt the stack as an operator and from this research letter."
          />
          <Differentiator
            title="Family-First Resilience"
            body="Every career decision has been made with my family in mind. Raising two children while building a business taught me to balance ambition with responsibility."
          />

          <div
            className="pt-4 mt-2 italic text-[13px] text-[#4a4a4a]"
            style={{ borderTop: '1px solid #d9d4c7', fontFamily: 'var(--font-serif)' }}
          >
            Outside of finance, I'm a distance runner with a 5:52 mile PR. I bring the same focus
            and endurance to every deal.
          </div>

          <div
            className="px-4 py-3 mt-4"
            style={{ background: 'var(--paper-raised)', border: '1px solid #d9d4c7' }}
          >
            <div
              className="text-[9.5px] tracking-[0.2em] uppercase font-bold text-[#c8102e] mb-1.5"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Current Focus
            </div>
            <p
              className="text-[13.5px] leading-relaxed text-[#1a1a1a] m-0"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Currently finishing my finance degree at the University of Mobile (3.71 GPA,
              graduating December 2026), seeking full-time 2027 analyst roles in restructuring,
              credit, and distressed investing — Evercore, PJT, Houlihan Lokey, Lazard on the
              banking side; A&M, AlixPartners, FTI on the consulting side.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Differentiator = ({ title, body }: { title: string; body: string }) => (
  <div>
    <div
      className="text-[14px] font-bold tracking-tight text-[#1a1a1a] mb-1"
      style={{ fontFamily: 'var(--font-serif)' }}
    >
      {title}
    </div>
    <p
      className="text-[12.5px] leading-relaxed text-[#4a4a4a] m-0"
      style={{ fontFamily: 'var(--font-serif)' }}
    >
      {body}
    </p>
  </div>
);

// =============================================================================
// CONTACT SECTION — folded in from the legacy ContactSection.tsx during 4E-3b.
// =============================================================================

const ContactScrollSection = () => (
  <section
    id="contact"
    className="py-14"
    style={{ background: 'var(--paper-raised)', borderTop: '1px solid #d9d4c7' }}
  >
    <div className="max-w-[720px] mx-auto px-7 text-center">
      <div
        className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#c8102e] mb-2"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        Get in Touch
      </div>
      <h2
        className="text-[28px] md:text-[32px] font-bold tracking-tight m-0 mb-3"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Contact
      </h2>
      <div
        className="h-px mx-auto mb-6"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #c9a227 50%, transparent 100%)',
          maxWidth: '240px',
        }}
      />
      <p
        className="text-[14.5px] leading-relaxed text-[#1a1a1a] mb-7"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Seeking full-time 2027 analyst roles in restructuring, credit, and distressed
        investing. I'd welcome the opportunity to connect.
      </p>
      <a
        href="mailto:zac.ty.smith@gmail.com"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.16em] uppercase text-white transition-colors mb-6"
        style={{ background: 'var(--red)', fontFamily: 'var(--font-sans)' }}
      >
        zac.ty.smith@gmail.com
      </a>
      <div
        className="flex items-center justify-center gap-4 text-[11px] tracking-[0.14em] uppercase font-semibold"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <a
          href="https://linkedin.com/in/zac-t-smith"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors"
        >
          LinkedIn
        </a>
        <span className="text-[#c8102e]" aria-hidden="true">●</span>
        <a
          href="https://twitter.com/TheFulcrumMemo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors"
        >
          @TheFulcrumMemo
        </a>
      </div>
    </div>
  </section>
);

interface FeaturedTileProps {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  bordered?: boolean;
}

const FeaturedTile = ({ eyebrow, title, description, href, bordered }: FeaturedTileProps) => (
  <Link
    to={href}
    className="block py-5 px-5 transition-colors hover:bg-[rgba(0,0,0,0.02)]"
    style={
      bordered
        ? { borderLeft: '1px solid #d9d4c7', borderRight: '1px solid #d9d4c7' }
        : undefined
    }
  >
    <div
      className="text-[9.5px] tracking-[0.18em] uppercase font-bold text-[#c8102e] mb-1.5"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {eyebrow}
    </div>
    <div
      className="text-[18px] font-bold tracking-tight text-[#1a1a1a] mb-2"
      style={{ fontFamily: 'var(--font-serif)' }}
    >
      {title}
    </div>
    <p
      className="text-[13px] leading-relaxed text-[#4a4a4a] m-0"
      style={{ fontFamily: 'var(--font-serif)' }}
    >
      {description}
    </p>
  </Link>
);

export default Index;
