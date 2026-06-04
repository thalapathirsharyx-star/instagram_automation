import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Setup', href: '/#setup' },
    { label: 'Features', href: '/#features' },
    { label: 'Spam Shield', href: '/#noise-filter' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center group gap-1">
          <img src="/Dark theme.png" alt="ReplyZens Logo" className="hidden dark:block w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-105" />
          <img src="/Light Theme.png" alt="ReplyZens Logo" className="block dark:hidden w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white uppercase font-inter">
            Reply<span className="text-logo-gradient">Zens</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-medium text-zinc-550 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              {link.label}
            </a>
          ))}

          <div className="flex items-center gap-4 ml-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-zinc-555 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-premium-cta px-5 py-2.5 text-xs font-bold"
            >
              Start Free Trial
            </button>
          </div>
        </div>

        <button className="md:hidden text-zinc-600 dark:text-zinc-400 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
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
                  href={link.href}
                  className="text-base font-semibold text-zinc-800 dark:text-zinc-355"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-zinc-200 dark:bg-white/5 my-2" />
              <button
                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                className="w-full text-center py-3 border border-zinc-255 dark:border-white/10 rounded-xl text-zinc-850 dark:text-zinc-300 font-semibold"
              >
                Log in
              </button>
              <button
                onClick={() => { navigate('/signup'); setMobileOpen(false); }}
                className="btn-premium-cta py-3.5 w-full text-sm font-bold"
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
