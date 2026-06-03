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
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="ReplyZens Logo" className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight text-white uppercase font-outfit">
            Reply<span className="text-brand-pink">Zens</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
          
          <div className="flex items-center gap-4 ml-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="w3-button-primary bg-gradient-to-r from-brand-pink to-brand-purple text-white px-5 py-2 rounded-xl text-xs shadow-lg shadow-brand-pink/15 active:scale-95 transition-all"
            >
              Start Free Trial
            </button>
          </div>
        </div>

        <button className="md:hidden text-zinc-400 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border shadow-xl"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-base font-semibold text-zinc-300"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-white/5 my-2" />
              <button
                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                className="w-full text-center py-3 border border-white/10 rounded-xl text-zinc-300 font-semibold"
              >
                Log in
              </button>
              <button
                onClick={() => { navigate('/signup'); setMobileOpen(false); }}
                className="bg-gradient-to-r from-brand-pink to-brand-purple text-white font-semibold py-3.5 rounded-xl w-full"
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
