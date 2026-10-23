import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { RESUME_PDF } from '@/content/bio';

/**
 * Sitewide navigation header — Phase A cream / Economist treatment.
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

  // Order: research first, credibility second (track record), context third
  // (fulcrum index), case work, then identity (about, contact).
  // Resume is a side button (download), not a nav item.
  // Timeline is NOT in the top nav — it lives inside Field Notes.
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
        {/* Brand — logo links to Home top */}
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

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
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
          ))}
          <a
            href={RESUME_PDF}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10.5px] tracking-[0.18em] uppercase font-semibold px-3 py-1.5 border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f7f5f0] transition-colors"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          >
            Resume
          </a>
        </div>

        {/* Mobile toggle */}
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
            {navLinks.map((link) => (
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
            ))}
            <a
              href={RESUME_PDF}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-[0.18em] uppercase font-semibold py-2 text-[#c8102e]"
              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
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
