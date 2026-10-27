import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedIcon from '../../components/AnimatedIcon';

export const FinalCTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 relative text-center px-4 sm:px-6">
      {/* The reference closes on a navy-to-violet rounded block. */}
      <div className="lp-dark-panel is-gradient mockup-dark max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto relative z-10 font-inter">
        <span className="mi-tile mb-6 mx-auto flex w-fit">
          <AnimatedIcon name="message-badge" size={26} />
        </span>
        <h2 className="lp-title text-[34px] md:text-[56px] mb-6">
          Stop Losing Leads Inside Your <span className="text-logo-gradient">Instagram DMs</span>
        </h2>
        <p className="text-base md:text-lg text-[#c9cbe3] max-w-2xl mx-auto mb-10 leading-relaxed">
          Let Flazly AI respond instantly, qualify prospects, capture customer details, and help your business convert more conversations into revenue.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
          <button
            onClick={() => navigate('/signup')}
            className="btn-premium-cta w-full sm:w-auto px-8 py-3.5 text-[15px] flex items-center justify-center gap-2 group cursor-pointer"
          >
            Start Free 14-Day Trial
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="lp-btn-secondary w-full sm:w-auto px-8 py-3.5 text-[15px]"
          >
            Book A Demo
          </button>
        </div>
      </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
