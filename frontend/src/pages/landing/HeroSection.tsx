import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-16 pb-16 md:pt-24 z-10 overflow-hidden text-center">
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Category Badge */}
        <div className="mb-5 select-none">
          <span className="lp-eyebrow">
            AI Instagram Sales Agent & CRM
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-[40px] sm:text-[56px] lg:text-[64px] mb-6 max-w-4xl text-balance">
          Turn Instagram DMs Into <span className="text-headline-gradient">Qualified Leads</span> Automatically
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-[#535479] leading-[1.75] mb-10 max-w-2xl text-balance">
          Flazly instantly responds to DMs, story mentions, and comments. Qualify buyers with AI, capture contact details, and close deals 24/7 on autopilot.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/signup')}
            className="btn-premium-cta w-full sm:w-auto whitespace-nowrap px-8 py-3.5 text-[15px] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Start Free 14-Day Trial</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a
            href="#demo"
            className="lp-btn-secondary w-full sm:w-auto whitespace-nowrap px-8 py-3.5 text-[15px]"
          >
            <Play size={14} fill="currentColor" className="text-[#38BDF8]" />
            <span>Explore Platform</span>
          </a>
        </div>

        {/* Value Proposition Micro Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-zinc-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#1463FF]" /> No credit card required
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
