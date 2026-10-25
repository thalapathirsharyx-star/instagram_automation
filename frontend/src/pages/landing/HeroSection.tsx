import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-12 pb-20 z-10 overflow-hidden text-center">
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Category Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4F39F6]/10 dark:bg-[#4F39F6]/15 border border-[#4F39F6]/25 mb-6 select-none shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#4F39F6] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">
            AI Instagram Sales Agent & CRM
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-zinc-950 dark:text-white max-w-4xl leading-[1.08] text-balance">
          Turn Instagram DMs Into <span className="text-headline-gradient">Qualified Leads</span> Automatically
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl text-zinc-650 dark:text-zinc-300 font-medium leading-relaxed mb-10 max-w-2xl text-balance">
          Flazly instantly responds to DMs, story mentions, and comments. Qualify buyers with AI, capture contact details, and close deals 24/7 on autopilot.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={() => navigate('/signup')}
            className="btn-premium-cta w-full sm:w-auto px-9 py-4 text-sm font-bold flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
          >
            <span>Start Free 14-Day Trial</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a
            href="#demo"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold bg-white dark:bg-[#121826] border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Play size={14} fill="currentColor" className="text-[#38BDF8]" />
            <span>Explore Platform</span>
          </a>
        </div>

        {/* Value Proposition Micro Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-500" /> No credit card required
          </span>
          <span className="hidden sm:inline">•</span>
          <span>1-Click Meta OAuth setup</span>
          <span className="hidden sm:inline">•</span>
          <span>Cancel anytime</span>
        </div>

      </div>
    </section>
  );
};
