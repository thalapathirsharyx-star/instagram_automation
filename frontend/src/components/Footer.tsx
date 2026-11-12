import React from 'react';
import { Link } from 'react-router-dom';
import { SECTION_IDS, useSectionLink } from '../lib/sectionNav';
import { scrollToTop } from '../lib/smoothScroll';

const Footer: React.FC = () => {
  const goToSection = useSectionLink();

  // Each column holds links to sections that exist. `Meta OAuth Setup` and
  // `Spam Shield` previously pointed at `#setup` and `#noise-filter`, which
  // were never on the page; the first is the security section, and the second
  // described a feature the product does not have.
  const productLinks = [
    { label: 'Features', id: SECTION_IDS.features },
    { label: 'How It Works', id: SECTION_IDS.howItWorks },
    { label: 'Pricing Plans', id: SECTION_IDS.pricing },
    { label: 'FAQ', id: SECTION_IDS.faq },
  ];

  const platformLinks = [
    { label: 'Interactive Demo', id: SECTION_IDS.demo },
    { label: 'Meta OAuth Setup', id: SECTION_IDS.security },
    { label: 'Security & Compliance', id: SECTION_IDS.security },
  ];

  return (
    <footer className="site-footer pt-16 md:pt-20 pb-10 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group">
              <img
                src="/Light Theme.png"
                alt="Flazly Logo"
                className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="lp-wordmark logo-text text-xl">
                Flaz<span className="text-logo-gradient">ly</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              The modern Instagram DM API and CRM for digital creators, scaling agencies, and high-growth e-commerce brands. Automatically route inquiries and scale your conversions.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link is-facebook" aria-label="Facebook">
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link is-instagram" aria-label="Instagram">
                {/* Instagram's glyph: rounded square, lens and flash dot. */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-[15px] font-semibold mb-5">Product</h4>
            <ul className="space-y-3 text-sm">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={`/#${link.id}`}
                    onClick={(e) => goToSection(e, link.id)}
                    className="transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers Column */}
          <div>
            <h4 className="text-[15px] font-semibold mb-5">Platform</h4>
            <ul className="space-y-3 text-sm">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={`/#${link.id}`}
                    onClick={(e) => goToSection(e, link.id)}
                    className="transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-[15px] font-semibold mb-5">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy" onClick={scrollToTop} className="transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" onClick={scrollToTop} className="transition-colors">Terms of Service</Link></li>
              <li><Link to="/data-deletion" onClick={scrollToTop} className="transition-colors">Data Deletion</Link></li>
            </ul>
          </div>

        </div>

        <div className="rounded-2xl bg-[#F7F9FC] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[13px] text-[#535479]">
          <span>© 2026 Flazly Inc. All rights reserved.</span>
          <span>Built with ❤ for professional Instagram automation.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
