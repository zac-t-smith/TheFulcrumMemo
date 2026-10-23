import { Link } from 'react-router-dom';
import { EMAIL, EMAIL_MAILTO, RESUME_PDF, SITE_TAGLINE } from '@/content/bio';

/**
 * Sitewide footer — Phase A cream / Economist treatment.
 */
const Footer = () => {
  return (
    <footer
      className="py-10"
      style={{ background: '#f7f5f0', borderTop: '1px solid #d9d4c7' }}
    >
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-6">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: '#c8102e' }}
                aria-hidden="true"
              />
              <span
                className="text-[14px] font-bold tracking-tight text-[#1a1a1a]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                The Fulcrum Memo
              </span>
            </Link>
            <p
              className="text-[11px] text-[#4a4a4a] tracking-[0.04em]"
              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
            >
              {SITE_TAGLINE}
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10.5px] tracking-[0.18em] uppercase font-semibold"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          >
            <Link to="/memos" className="text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors">
              Memos
            </Link>
            <span className="text-[#c8102e]" aria-hidden="true">●</span>
            <Link to="/casework" className="text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors">
              Casework
            </Link>
            <span className="text-[#c8102e]" aria-hidden="true">●</span>
            <Link to="/positions" className="text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors">
              Track Record
            </Link>
            <span className="text-[#c8102e]" aria-hidden="true">●</span>
            <Link to="/fulcrum-index" className="text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors">
              Fulcrum Index
            </Link>
            <span className="text-[#c8102e]" aria-hidden="true">●</span>
            <a
              href={RESUME_PDF}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors"
            >
              Resume
            </a>
            <span className="text-[#c8102e]" aria-hidden="true">●</span>
            <a
              href={EMAIL_MAILTO}
              className="text-[#4a4a4a] hover:text-[#c8102e] transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        <div
          className="mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-2"
          style={{ borderTop: '1px solid #d9d4c7' }}
        >
          <p
            className="text-[10.5px] text-[#4a4a4a] tracking-[0.06em] italic"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            © {new Date().getFullYear()} Zachary T. Smith
          </p>
          <p
            className="text-[10.5px] text-[#4a4a4a] tracking-[0.04em]"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          >
            <a href={EMAIL_MAILTO} className="hover:text-[#c8102e] transition-colors">
              {EMAIL}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
