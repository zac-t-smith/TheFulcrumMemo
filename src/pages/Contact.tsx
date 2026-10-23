import PageLayout from '@/components/PageLayout';
import { PageHeader } from '@/components/system';
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
      <PageHeader
        kicker="Get in touch"
        title="Let's talk."
        dek={`Zachary T. Smith is ${RECRUITING_LINE}. The fastest way to reach him is email.`}
      />

      <section className="container-reading" style={{ padding: 0, maxWidth: 720 }}>
        <ContactRow kicker="Email" value={EMAIL} href={EMAIL_MAILTO} />
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
        className="t-caption mt-16 pt-10 italic serif"
        style={{
          borderTop: '1px solid var(--rule)',
          color: 'var(--ink-muted)',
          textTransform: 'none',
          letterSpacing: 0,
        }}
      >
        This site is a research archive. The author is not a licensed financial
        advisor. Nothing here is investment advice.
      </p>
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
    style={{ borderBottom: '1px solid var(--rule)' }}
  >
    <div className="t-kicker md:w-32 shrink-0">{kicker}</div>
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(download ? { download: true } : {})}
      className="t-body hover:underline"
      style={{ color: 'var(--ink)' }}
    >
      {value}
    </a>
  </div>
);

export default Contact;
