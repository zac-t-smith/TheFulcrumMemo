import { Link } from 'react-router-dom';
import { EMAIL, EMAIL_MAILTO, RESUME_PDF, SITE_TAGLINE } from '@/content/bio';

/**
 * SiteFooter — Phase 1 token-driven version.
 */
const Footer = () => {
  return (
    <footer
      style={{ background: 'var(--paper)', borderTop: '1px solid var(--rule)' }}
      className="py-10 mt-16"
    >
      <div className="max-w-[1120px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-6">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--red)' }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                }}
              >
                The Fulcrum Memo
              </span>
            </Link>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                color: 'var(--ink-muted)',
                margin: 0,
              }}
            >
              {SITE_TAGLINE}
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-2"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10.5px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <Link to="/memos" style={{ color: 'var(--ink-muted)' }}>Memos</Link>
            <span style={{ color: 'var(--red)' }} aria-hidden="true">●</span>
            <Link to="/casework" style={{ color: 'var(--ink-muted)' }}>Casework</Link>
            <span style={{ color: 'var(--red)' }} aria-hidden="true">●</span>
            <Link to="/positions" style={{ color: 'var(--ink-muted)' }}>Track Record</Link>
            <span style={{ color: 'var(--red)' }} aria-hidden="true">●</span>
            <Link to="/fulcrum-index" style={{ color: 'var(--ink-muted)' }}>Fulcrum Index</Link>
            <span style={{ color: 'var(--red)' }} aria-hidden="true">●</span>
            <a
              href={RESUME_PDF}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--ink-muted)' }}
            >
              Resume
            </a>
            <span style={{ color: 'var(--red)' }} aria-hidden="true">●</span>
            <a href={EMAIL_MAILTO} style={{ color: 'var(--ink-muted)' }}>Contact</a>
          </div>
        </div>

        <div
          className="mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-2"
          style={{ borderTop: '1px solid var(--rule)' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '10.5px',
              fontStyle: 'italic',
              color: 'var(--ink-muted)',
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Zachary T. Smith · Last updated{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10.5px',
              color: 'var(--ink-muted)',
              margin: 0,
            }}
          >
            <a href={EMAIL_MAILTO} style={{ color: 'var(--ink-muted)' }}>
              {EMAIL}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
