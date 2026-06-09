import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer border-t border-white/10 bg-zinc-950 pt-20 pb-12 px-6 relative z-10">
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
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mb-6">
              The modern Instagram DM API and CRM for digital creators, scaling agencies, and high-growth e-commerce brands. Automatically route inquiries and scale your conversions.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Facebook">
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Instagram">
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.752.052 2.73.124 4.093 1.528 4.21 4.283.043.968.052 1.32.052 3.752 0 2.43-.008 2.784-.052 3.752-.117 2.736-1.48 4.088-4.21 4.283-.968.043-1.32.052-3.752.052-2.43-.008-2.784-.052-3.752-.052-2.73-.124-4.093-1.528-4.21-4.283-.043-.968-.052-1.32-.052-3.752 0-2.43.008-2.784.052-3.752.117-2.736 1.48-4.088 4.21-4.283.968-.043 1.32-.052 3.752-.052L12.315 2zm-1.157 2.053c-2.408.03-3.244.143-3.784.354-.72.28-1.236.616-1.777 1.156-.54.54-.876 1.056-1.156 1.776-.21.54-.324 1.376-.354 3.784-.03 2.408-.03 2.78 0 5.188.03 2.408.143 3.244.354 3.784.28.72.616 1.236 1.156 1.776.54.54 1.056.876 1.776 1.156.54.21 1.376.324 3.784.354 2.408.03 2.78.03 5.188 0 2.408-.03 3.244-.143 3.784-.354.72-.28 1.236-.616 1.776-1.156.54-.54.876-1.056 1.156-1.776.21-.54.324-1.376.354-3.784.03-2.408.03-2.78 0-5.188-.03-2.408-.143-3.244-.354-3.784-.28-.72-.616-1.236-1.156-1.776-.54-.54-1.056-.876-1.776-1.156-.54-.21-1.376-.324-3.784-.354-2.408-.03-2.78-.03-5.188 0zm-2.07 9.878a4.92 4.92 0 119.84 0 4.92 4.92 0 01-9.84 0zm6.787-3.9a1.11 1.11 0 110-2.22 1.11 1.11 0 010 2.22z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="WhatsApp">
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.218 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Product</h4>
            <ul className="space-y-4 text-sm font-medium text-zinc-400">
              <li><a href="/#features" className="hover:text-[#8B5CF6] transition-colors">Features</a></li>
              <li><a href="/#setup" className="hover:text-[#8B5CF6] transition-colors">Integration Setup</a></li>
              <li><a href="/#pricing" className="hover:text-[#8B5CF6] transition-colors">Pricing Plans</a></li>
              <li><a href="/#noise-filter" className="hover:text-[#8B5CF6] transition-colors">Noise Filter</a></li>
            </ul>
          </div>

          {/* Developers Column */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Developer API</h4>
            <ul className="space-y-4 text-sm font-medium text-zinc-400">
              <li><a href="#" className="hover:text-[#8B5CF6] transition-colors">Webhooks</a></li>
              <li><a href="#" className="hover:text-[#8B5CF6] transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-[#8B5CF6] transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-[#8B5CF6] transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-zinc-400">
              <li><Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#8B5CF6] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#8B5CF6] transition-colors">Terms of Service</Link></li>
              <li><Link to="/data-deletion" onClick={() => window.scrollTo(0, 0)} className="hover:text-[#8B5CF6] transition-colors">Data Deletion</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs font-bold">
          <span>© 2026 Flazly Inc. All rights reserved.</span>
          <span>Built with ❤ for professional Instagram automation.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
