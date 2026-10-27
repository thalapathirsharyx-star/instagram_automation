import React from 'react';
import { MessageCircle, Users, Clock, Sparkles, Star } from 'lucide-react';

export const SocialProofSection: React.FC = () => {
  const metrics = [
    { label: "DMs Automated", value: "10M+", icon: <MessageCircle size={20} /> },
    { label: "Leads Captured", value: "500K+", icon: <Users size={20} /> },
    { label: "Response Time", value: "< 1s", icon: <Clock size={20} /> },
    { label: "Businesses Connected", value: "5,000+", icon: <Sparkles size={20} /> },
  ];

  const testimonials = [
    {
      quote: "Waking up to direct payment confirmations and qualified leads in my CRM is a complete game-changer. Flazly automated over 90% of our inbox inquiries, recovering $8,400 in lost revenue in our first month alone.",
      name: "Sarah Jenkins",
      role: "Founder, Zenith Templates",
      stats: "+340% Conversions",
      avatar: "SJ"
    },
    {
      quote: "We were scaling our reel ads but losing half of our leads in the inbox due to slow replies. Setting up Flazly comment-to-DM triggers took less than 5 minutes. Response times dropped to under 1s, and our sales increased by 3X.",
      name: "Marcus Thorne",
      role: "Director of Growth, HypeFit",
      stats: "3X Lead Growth",
      avatar: "MT"
    }
  ];

  return (
    <section className="py-28 border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/20 dark:bg-[#121826]/20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="lp-eyebrow is-orange">Success Stories</span>
          <h2 className="lp-title text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3 mb-4 leading-tight">
            Trusted by High-Growth Brands
          </h2>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, i) => (
            <div key={i} className="bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center mb-4 text-[#38BDF8]">
                {metric.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">{metric.value}</div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-8 text-left">
          {testimonials.map((t, i) => (
            <div key={i} className="premium-gradient-border">
              <div className="premium-card-content p-8 flex flex-col justify-between h-full">
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={14} className="fill-[#38BDF8] text-[#38BDF8]" />
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium italic mb-8 font-inter">
                    &quot;{t.quote}&quot;
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {t.avatar}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight font-inter">{t.name}</span>
                      <span className="text-xs text-zinc-500 mt-0.5">{t.role}</span>
                    </div>
                  </div>
                  <div className="bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#38BDF8]">
                    {t.stats}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
