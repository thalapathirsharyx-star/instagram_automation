import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { Reveal, RevealText } from '../../components/motion/Reveal';

// Small pieces of the product in the margins: the events Flazly handles, shown
// the way they appear in the app. Wide screens only, so they never crowd the
// headline or the buttons. Decorative; the copy beside them says the same.
const HERO_CARDS = [
  { icon: '/hero/chat.png', title: 'New DM', meta: '@maya.designs', body: 'Is the linen set still in stock?', side: 'left', className: 'top-[84px]', delay: '0s' },
  { icon: '/hero/love.png', title: 'Comment to DM', meta: 'Latest reel', body: 'Lookbook sent by DM', side: 'left', className: 'top-[404px]', delay: '-3s' },
  { icon: '/hero/verified.png', title: 'Lead qualified', meta: 'High intent', body: 'Email captured, call booked', side: 'right', className: 'top-[116px]', delay: '-1.5s' },
  { icon: '/hero/follow.png', title: 'Replied in 2s', meta: 'Assistant', body: 'While you were away', side: 'right', className: 'top-[452px]', delay: '-4.5s' },
] as const;

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-16 pb-16 md:pt-24 z-10 overflow-hidden text-center">
      {/* Product moments in the margins (wide screens only). */}
      <div className="pointer-events-none absolute inset-0 hidden min-[1400px]:block" aria-hidden="true">
        {HERO_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            className={`lp-hero-card ${card.side === 'left' ? 'is-left' : 'is-right'} ${card.className}`}
            style={{ animationDelay: card.delay }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 + i * 0.12 }}
          >
            <img src={card.icon} alt="" width={36} height={36} decoding="async" />
            <div className="min-w-0 text-left">
              <p className="lp-hero-card-title">
                {card.title}
                <span>{card.meta}</span>
              </p>
              <p className="lp-hero-card-body">{card.body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Category Badge */}
        <Reveal immediate y={8} className="mb-5 select-none">
          <span className="lp-eyebrow">
            AI Instagram Sales Agent & CRM
          </span>
        </Reveal>

        {/* Main Headline */}
        <RevealText as="h1" immediate delay={0.1} stagger={0.06} className="text-[40px] sm:text-[56px] lg:text-[64px] mb-6 max-w-4xl text-balance">
          Turn Instagram DMs Into <span className="text-headline-gradient">Qualified Leads</span> Automatically
        </RevealText>

        {/* Subheadline */}
        <Reveal as="p" immediate delay={0.5} className="text-base sm:text-lg text-[#535479] leading-[1.75] mb-10 max-w-2xl text-balance">
          Flazly instantly responds to DMs, story mentions, and comments. Qualify buyers with AI, capture contact details, and close deals 24/7 on autopilot.
        </Reveal>

        {/* Action Buttons */}
        <Reveal immediate delay={0.62} className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
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
        </Reveal>

        {/* Value Proposition Micro Badges */}
        <Reveal immediate delay={0.74} y={8} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-zinc-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#1463FF]" /> No credit card required
          </span>
          <span className="hidden sm:inline">•</span>
          <span>1-Click Meta OAuth setup</span>
          <span className="hidden sm:inline">•</span>
          <span>Cancel anytime</span>
        </Reveal>

      </div>
    </section>
  );
};
