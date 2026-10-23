import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

/**
 * Sitewide navigation header — Phase 4E-3 cream / Economist treatment.
 *
 * Eyebrow text in small caps with red dot separators, Georgia serif for
 * the brand name, letter-spaced uppercase nav links with the active
 * page in red. Replaces the prior dark/gold/monospace bar.
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

  const navLinks: Array<{ label: string; href: string; external?: boolean }> = [
    { label: 'Memos', href: '/memos' },
    { label: 'Field Notes', href: '/field-notes' },
    { label: 'Positions', href: '/positions' },
    { label: 'Fulcrum Index', href: '/fulcrum-index' },
    { label: 'Timeline', href: '/timeline' },
    { label: 'Resume', href: '/resume' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
  ];

  const isActive = (href: string) => {
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.slice(1);
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.06)]'
          : 'py-3.5'
      }`}
      style={{
        background: isScrolled ? 'rgba(247,245,240,0.96)' : '#f7f5f0',
        backdropFilter: isScrolled ? 'blur(8px)' : undefined,
        borderBottom: '1px solid #d9d4c7',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between gap-6">
        {/* Brand — red dot, Georgia serif */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: '#c8102e' }}
            aria-hidden="true"
          />
          <span
            className="text-[12px] font-bold tracking-[0.18em] uppercase text-[#1a1a1a]"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          >
            The Fulcrum Memo
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                className="text-[10.5px] tracking-[0.18em] uppercase font-semibold transition-colors text-[#4a4a4a] hover:text-[#c8102e]"
                style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={`text-[10.5px] tracking-[0.18em] uppercase font-semibold transition-colors ${
                  isActive(link.href) ? 'text-[#c8102e]' : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                }`}
                style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 text-[#1a1a1a]"
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
            background: '#f7f5f0',
            borderBottom: '1px solid #d9d4c7',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[11px] tracking-[0.18em] uppercase font-semibold py-2 text-[#4a4a4a] hover:text-[#c8102e]"
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-[11px] tracking-[0.18em] uppercase font-semibold py-2 ${
                    isActive(link.href) ? 'text-[#c8102e]' : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                  }`}
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
