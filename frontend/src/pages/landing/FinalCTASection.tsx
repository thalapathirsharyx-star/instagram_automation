import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const FinalCTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 border-t border-zinc-200/80 dark:border-white/5 relative overflow-hidden text-center bg-gradient-to-b from-zinc-50 to-[#fafafa] dark:from-zinc-950 dark:to-[#09090b]">
      {/* Ambient backdrop glow using brand colors */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#EC4899]/10 via-[#818CF8]/10 to-[#4F39F6]/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 font-inter">
        <h2 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white mb-6 leading-tight tracking-tight cta-heading-glow">
          Stop Losing Leads Inside Your <span className="text-logo-gradient">Instagram DMs</span>
        </h2>
        <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
          Let Flazly AI respond instantly, qualify prospects, capture customer details, and help your business convert more conversations into revenue.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
          <button
            onClick={() => navigate('/signup')}
            className="btn-premium-cta w-full sm:w-auto px-10 py-5 text-sm font-bold flex items-center justify-center gap-2 group cursor-pointer"
          >
            Start Free 14-Day Trial
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto px-10 py-5 rounded-xl text-sm font-bold bg-white dark:bg-[#121826] border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            Book A Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
