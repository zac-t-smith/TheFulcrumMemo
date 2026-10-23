import PageLayout from '@/components/PageLayout';
import {
  EMAIL,
  EMAIL_MAILTO,
  LINKEDIN_URL,
  RESUME_PDF,
  RECRUITING_LINE,
} from '@/content/bio';

const Contact = () => {
  return (
    <PageLayout
      title="Contact"
      description="Reach Zachary T. Smith for restructuring, credit, and distressed-investing conversations."
    >
      <article className="max-w-[720px]">
        <header className="mb-10 pt-4">
          <div
            className="text-[10.5px] tracking-[0.18em] uppercase font-semibold text-[#4a4a4a] mb-3"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          >
            Get in touch
          </div>
          <h1
            className="text-[40px] md:text-[52px] leading-[1.08] font-bold tracking-tight m-0"
            style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}
          >
            Let's talk.
          </h1>
          <p
            className="mt-4 text-[18px] leading-[1.6] text-[#4a4a4a]"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Zachary T. Smith is {RECRUITING_LINE}. The fastest way to reach
            him is email.
          </p>
        </header>

        <section className="space-y-6">
          <ContactRow
            kicker="Email"
            value={EMAIL}
            href={EMAIL_MAILTO}
          />
          <ContactRow
            kicker="LinkedIn"
            value="linkedin.com/in/zac-t-smith"
            href={LINKEDIN_URL}
            external
          />
          <ContactRow
            kicker="Resume"
            value="Download PDF"
            href={RESUME_PDF}
            external
            download
          />
        </section>

        <p
          className="mt-16 pt-10 text-[13px] text-[#4a4a4a] italic"
          style={{ borderTop: '1px solid #d9d4c7', fontFamily: 'Georgia, serif' }}
        >
          This site is a research archive. The author is not a licensed
          financial advisor. Nothing here is investment advice.
        </p>
      </article>
    </PageLayout>
  );
};

const ContactRow = ({
  kicker,
  value,
  href,
  external = false,
  download = false,
}: {
  kicker: string;
  value: string;
  href: string;
  external?: boolean;
  download?: boolean;
}) => (
  <div
    className="flex flex-col md:flex-row md:items-baseline md:gap-6 py-4"
    style={{ borderBottom: '1px solid #d9d4c7' }}
  >
    <div
      className="text-[10.5px] tracking-[0.18em] uppercase font-semibold text-[#4a4a4a] md:w-32 shrink-0"
      style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
    >
      {kicker}
    </div>
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(download ? { download: true } : {})}
      className="text-[18px] text-[#1a1a1a] hover:text-[#c8102e] transition-colors"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {value}
    </a>
  </div>
);

export default Contact;
