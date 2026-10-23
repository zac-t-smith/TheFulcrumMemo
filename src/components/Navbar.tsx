import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { RESUME_PDF } from '@/content/bio';

/**
 * SiteHeader — Phase 1 token-driven version of the sitewide nav.
 * Keeps the Navbar export name so every page import stays stable.
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Phase A order; Phase 2 may add "Research" alias label without changing /memos.
  const navLinks: Array<{ label: string; href: string }> = [
    { label: 'Memos', href: '/memos' },
    { label: 'Field Notes', href: '/field-notes' },
    { label: 'Casework', href: '/casework' },
    { label: 'Fulcrum Index', href: '/fulcrum-index' },
    { label: 'Track Record', href: '/positions' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2.5' : 'py-3.5'
      }`}
      style={{
        background: isScrolled ? 'rgba(247,244,238,0.96)' : 'var(--paper)',
        backdropFilter: isScrolled ? 'blur(8px)' : undefined,
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div className="max-w-[1120px] mx-auto px-4 flex items-center justify-between gap-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--red)' }}
            aria-hidden="true"
          />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
            }}
          >
            The Fulcrum Memo
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10.5px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isActive(link.href) ? 'var(--red)' : 'var(--ink-muted)',
                transition: 'color 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={RESUME_PDF}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10.5px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '6px 12px',
              border: '1px solid var(--ink)',
              color: 'var(--ink)',
              borderRadius: 'var(--radius)',
            }}
          >
            Resume
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2"
          style={{ color: 'var(--ink)' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0 overflow-hidden"
          style={{
            background: 'var(--paper)',
            borderBottom: '1px solid var(--rule)',
            boxShadow: 'var(--elev-1)',
          }}
        >
          <div className="max-w-[1120px] mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '8px 0',
                  color: isActive(link.href) ? 'var(--red)' : 'var(--ink-muted)',
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={RESUME_PDF}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                padding: '8px 0',
                color: 'var(--red)',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Resume (PDF)
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
