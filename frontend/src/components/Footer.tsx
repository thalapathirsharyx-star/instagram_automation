import React from 'react';
import { Link } from 'react-router-dom';
import { SECTION_IDS, useSectionLink } from '../lib/sectionNav';

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
    <footer className="site-footer dark border-t border-white/5 bg-[#07080C] pt-20 pb-12 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group">
              <img
                src="/Dark theme.png"
                alt="Flazly Logo"
                className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-lg font-bold tracking-tight text-white uppercase font-inter logo-text">
                Flaz<span className="text-logo-gradient">ly</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm mb-6">
              The modern Instagram DM API and CRM for digital creators, scaling agencies, and high-growth e-commerce brands. Automatically route inquiries and scale your conversions.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Facebook">
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Instagram">
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.752.052 2.73.124 4.093 1.528 4.21 4.283.043.968.052 1.32.052 3.752 0 2.43-.008 2.784-.052 3.752-.117 2.736-1.48 4.088-4.21 4.283-.968.043-1.32.052-3.752.052-2.43-.008-2.784-.052-3.752-.052-2.73-.124-4.093-1.528-4.21-4.283-.043-.968-.052-1.32-.052-3.752 0-2.43.008-2.784.052-3.752.117-2.736 1.48-4.088 4.21-4.283.968-.043 1.32-.052 3.752-.052L12.315 2zm-1.157 2.053c-2.408.03-3.244.143-3.784.354-.72.28-1.236.616-1.777 1.156-.54.54-.876 1.056-1.156 1.776-.21.54-.324 1.376-.354 3.784-.03 2.408-.03 2.78 0 5.188.03 2.408.143 3.244.354 3.784.28.72.616 1.236 1.156 1.776.54.54 1.056.876 1.776 1.156.54.21 1.376.324 3.784.354 2.408.03 2.78.03 5.188 0 2.408-.03 3.244-.143 3.784-.354.72-.28 1.236-.616 1.776-1.156.54-.54.876-1.056 1.156-1.776.21-.54.324-1.376.354-3.784.03-2.408.03-2.78 0-5.188-.03-2.408-.143-3.244-.354-3.784-.28-.72-.616-1.236-1.156-1.776-.54-.54-1.056-.876-1.776-1.156-.54-.21-1.376-.324-3.784-.354-2.408-.03-2.78-.03-5.188 0zm-2.07 9.878a4.92 4.92 0 119.84 0 4.92 4.92 0 01-9.84 0zm6.787-3.9a1.11 1.11 0 110-2.22 1.11 1.11 0 010 2.22z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Product</h4>
            <ul className="space-y-4 text-xs font-medium text-zinc-500">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={`/#${link.id}`}
                    onClick={(e) => goToSection(e, link.id)}
                    className="hover:text-brand-purple transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers Column */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Platform</h4>
            <ul className="space-y-4 text-xs font-medium text-zinc-500">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={`/#${link.id}`}
                    onClick={(e) => goToSection(e, link.id)}
                    className="hover:text-brand-purple transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Legal</h4>
            <ul className="space-y-4 text-xs font-medium text-zinc-500">
              <li><Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-brand-purple transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-brand-purple transition-colors">Terms of Service</Link></li>
              <li><Link to="/data-deletion" onClick={() => window.scrollTo(0, 0)} className="hover:text-brand-purple transition-colors">Data Deletion</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-[10px] font-bold">
          <span>© 2026 Flazly Inc. All rights reserved.</span>
          <span>Built with ❤ for professional Instagram automation.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
