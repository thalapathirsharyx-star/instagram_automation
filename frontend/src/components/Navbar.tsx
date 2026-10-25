import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SECTION_IDS, useSectionLink } from '../lib/sectionNav';

/**
 * Every entry points at a section that exists on the landing page. `Setup` and
 * `Spam Shield` used to sit here pointing at `#setup` and `#noise-filter`,
 * neither of which was ever on the page.
 */
const navLinks = [
  { label: 'How It Works', id: SECTION_IDS.howItWorks },
  { label: 'Features', id: SECTION_IDS.features },
  { label: 'Security', id: SECTION_IDS.security },
  { label: 'Pricing', id: SECTION_IDS.pricing },
  { label: 'FAQ', id: SECTION_IDS.faq },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const goToSection = useSectionLink();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLoginNav = () => {
    const hostname = window.location.hostname;
    if (hostname === 'flazly.com' || hostname === 'www.flazly.com') {
      window.location.href = 'https://app.flazly.com/login';
    } else {
      navigate('/login');
    }
  };

  const handleSignupNav = () => {
    const hostname = window.location.hostname;
    if (hostname === 'flazly.com' || hostname === 'www.flazly.com') {
      window.location.href = 'https://app.flazly.com/signup';
    } else {
      navigate('/signup');
    }
  };

  return (
    <nav className="marketing-chrome fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center group gap-1">
          <img src="/Dark theme.png" alt="Flazly Logo" className="hidden dark:block w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-105" />
          <img src="/Light Theme.png" alt="Flazly Logo" className="block dark:hidden w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white uppercase font-inter">
            Flaz<span className="text-logo-gradient">ly</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={`/#${link.id}`}
              onClick={(e) => goToSection(e, link.id)}
              className="text-sm font-medium text-zinc-550 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="flex items-center gap-4 ml-4">
            <button
              onClick={handleLoginNav}
              className="text-sm font-semibold text-zinc-555 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={handleSignupNav}
              className="btn-premium-cta px-5 py-2.5 text-xs font-bold cursor-pointer"
            >
              Start Free Trial
            </button>
          </div>
        </div>

        <button className="md:hidden text-zinc-600 dark:text-zinc-400 p-2 cursor-pointer" aria-label="Toggle Menu" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-card border-t border-zinc-200 dark:border-border shadow-xl"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={`/#${link.id}`}
                  className="text-base font-semibold text-zinc-800 dark:text-zinc-355"
                  onClick={(e) => { goToSection(e, link.id); setMobileOpen(false); }}
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-zinc-200 dark:bg-white/5 my-2" />
              <button
                onClick={() => { handleLoginNav(); setMobileOpen(false); }}
                className="w-full text-center py-3 border border-zinc-255 dark:border-white/10 rounded-xl text-zinc-850 dark:text-zinc-300 font-semibold cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={() => { handleSignupNav(); setMobileOpen(false); }}
                className="btn-premium-cta py-3.5 w-full text-sm font-bold cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
