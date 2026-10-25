import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();

  const pricingTiers = [
    {
      name: "Free",
      desc: "Explore basic automation capabilities for testing.",
      price: "₹0",
      volume: "250",
      btn: "Get Started for Free",
      popular: false,
      features: [
        "Connect 1 IG Account",
        "Basic automations (up to 4)",
        "1 team seat",
        "Unified inbox",
        "Flazly branding attached"
      ]
    },
    {
      name: "Pro",
      desc: "For scaling creators & digital businesses.",
      price: "₹2,499",
      volume: "25,000",
      btn: "Start Free 14-Day Trial",
      popular: true,
      features: [
        "Connect 3 IG Accounts",
        "Unlimited workflow automations",
        "Broadcast messaging",
        "3 team seats",
        "AI Persona customization",
        "Brain Base (Knowledge) access",
        "White-labeled (No branding)"
      ]
    },
    {
      name: "Business",
      desc: "For high-growth enterprise operations.",
      price: "₹5,999",
      volume: "75,000",
      btn: "Start Free 14-Day Trial",
      popular: false,
      features: [
        "Unlimited IG Accounts",
        "Unlimited workflow automations",
        "Broadcast messaging",
        "5 team seats",
        "Advanced AI Persona customization",
        "Brain Base (Knowledge) access",
        "Lead scoring & qualification",
        "White-labeled (No branding)"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-28 border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/10 dark:bg-[#121826]/10 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Pricing Plans</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3 mb-4 leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
            Scale your lead capture volume. All plans include our 14-day free trial.
          </p>
        </div>

        {/* Pricing tiers grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-[1000px] mx-auto items-stretch text-left">
          {pricingTiers.map((tier, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="flex"
            >
              <div className={`premium-gradient-border flex-1 flex ${tier.popular ? 'border-[#38BDF8] md:-translate-y-4 shadow-xl shadow-[#38BDF8]/10' : 'mt-4'}`}>
                <div className="premium-card-content p-8 flex flex-col justify-between flex-grow relative">
                  {tier.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-[#38BDF8]/20">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-1.5 font-inter">{tier.name}</h3>
                      <p className="text-xs text-zinc-400 font-medium leading-relaxed">{tier.desc}</p>
                    </div>

                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      <span className="text-sm font-bold text-zinc-400">/mo</span>
                    </div>

                    <div className="mb-8 border-b border-white/5 pb-6">
                      <span className="text-lg font-bold text-[#38BDF8] tabular-nums">{tier.volume}</span>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mt-1">
                        Automated DMs / Month
                      </span>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-3">
                          <Check size={14} className="text-[#38BDF8]" />
                          <span className="text-xs text-zinc-300 font-medium leading-relaxed font-inter">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('/signup')}
                    className={`w-full py-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tier.popular
                        ? 'btn-premium-cta font-bold'
                        : 'bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-white/10'
                    }`}
                  >
                    {tier.btn}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
