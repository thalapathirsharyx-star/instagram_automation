import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Features', href: '/features' },
    { label: 'Spam Shield', href: '/spam-shield' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <>
      {/* Premium Navbar with forced dark mode */}
      <nav className="dark fixed top-0 left-0 right-0 z-50 bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center group gap-1">
          <img src="/Light Theme.png" alt="Flazly Logo" className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight text-zinc-900 uppercase font-inter">
            Flaz<span className="text-logo-gradient">ly</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.href} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-4 ml-4">
            <button
              onClick={() => window.location.href = 'https://app.flazly.com/login'}
              className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => window.location.href = 'https://app.flazly.com/signup'}
              className="btn-premium-cta px-5 py-2.5 text-xs font-bold"
            >
              Start Free Trial
            </button>
          </div>
        </div>

        <button className="md:hidden text-zinc-600 p-2 hover:text-zinc-900 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#111118] border-t border-zinc-200 shadow-xl"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-base font-semibold text-zinc-700 hover:text-zinc-900 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-zinc-100 my-2" />
              <button
                onClick={() => { window.location.href = 'https://app.flazly.com/login'; setMobileOpen(false); }}
                className="w-full text-center py-3 border border-zinc-300 rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-all font-semibold"
              >
                Log in
              </button>
              <button
                onClick={() => { window.location.href = 'https://app.flazly.com/signup'; setMobileOpen(false); }}
                className="btn-premium-cta py-3.5 w-full text-sm font-bold"
              >
                Start Free Trial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
};

export default Navbar;
