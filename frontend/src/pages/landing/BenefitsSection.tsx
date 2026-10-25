import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Workflow, MessageCircle, Clock, Users } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const benefitsList = [
    {
      icon: <Bot size={20} />,
      title: "Never Miss A Lead",
      desc: "Reply instantly 24/7. Always capture warm leads when user intent and attention is highest.",
      pos: "top-[8%] left-[4%] w-[270px]",
      delay: 0
    },
    {
      icon: <Workflow size={20} />,
      title: "Qualify Leads Automatically",
      desc: "Identify serious buyers, extract email/phone contact details, and score interest in-thread.",
      pos: "top-[8%] right-[4%] w-[270px]",
      delay: 1.2
    },
    {
      icon: <MessageCircle size={20} />,
      title: "Convert Comments Into Conversations",
      desc: "Automatically DM users who comment on your posts or reels to launch automated qualification flows.",
      pos: "top-[46%] right-[4%] w-[270px]",
      delay: 2.4
    },
    {
      icon: <Clock size={20} />,
      title: "Save Hours Every Week",
      desc: "Eliminate manual copy-pasting, repetitive FAQ handling, and tedious lead logging workflows.",
      pos: "top-[46%] left-[4%] w-[270px]",
      delay: 3.6
    },
    {
      icon: <Users size={20} />,
      title: "Human Takeover Anytime",
      desc: "Seamlessly pause the AI autopilot to step in and converse with high-value leads manually.",
      pos: "top-[78%] left-1/2 -translate-x-1/2 w-[270px]",
      delay: 4.8
    }
  ];

  return (
    <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Business Outcomes</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3 mb-4 leading-tight">
            Capture Leads On Autopilot, 24/7
          </h2>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium">
            Designed to minimize manual workload and maximize conversion rates inside Instagram.
          </p>
        </div>

        {/* Desktop Layout: Central AI Engine with connection lines and floating cards */}
        <div className="hidden md:block relative w-full h-[680px] mx-auto overflow-visible">
          {/* Dynamic Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 680" fill="none">
            <defs>
              <linearGradient id="line-pulse-1" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#4F39F6" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4F39F6" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="line-pulse-2" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#4F39F6" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4F39F6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Connection lines background */}
            <path d="M 500 340 C 420 340, 380 115, 310 115" stroke="rgba(129, 140, 248, 0.12)" strokeWidth="2" fill="none" />
            <path d="M 500 340 C 580 340, 620 115, 690 115" stroke="rgba(129, 140, 248, 0.12)" strokeWidth="2" fill="none" />
            <path d="M 500 340 C 420 340, 380 373, 310 373" stroke="rgba(129, 140, 248, 0.12)" strokeWidth="2" fill="none" />
            <path d="M 500 340 C 580 340, 620 373, 690 373" stroke="rgba(129, 140, 248, 0.12)" strokeWidth="2" fill="none" />
            <path d="M 500 340 L 500 530" stroke="rgba(129, 140, 248, 0.12)" strokeWidth="2" fill="none" />

            {/* Connection lines animated pulses */}
            <path d="M 500 340 C 420 340, 380 115, 310 115" stroke="url(#line-pulse-1)" strokeWidth="2.5" strokeDasharray="30 150" className="animate-dash" fill="none" />
            <path d="M 500 340 C 580 340, 620 115, 690 115" stroke="url(#line-pulse-2)" strokeWidth="2.5" strokeDasharray="30 150" className="animate-dash" fill="none" />
            <path d="M 500 340 C 420 340, 380 373, 310 373" stroke="url(#line-pulse-1)" strokeWidth="2.5" strokeDasharray="30 150" className="animate-dash" fill="none" />
            <path d="M 500 340 C 580 340, 620 373, 690 373" stroke="url(#line-pulse-2)" strokeWidth="2.5" strokeDasharray="30 150" className="animate-dash" fill="none" />
            <path d="M 500 340 L 500 530" stroke="url(#line-pulse-1)" strokeWidth="2.5" strokeDasharray="30 150" className="animate-dash" fill="none" />
          </svg>

          {/* Central AI Engine Dial */}
          <div className="absolute top-[340px] left-[500px] -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <div className="absolute w-40 h-40 rounded-full bg-[#4F39F6]/15 dark:bg-[#4F39F6]/25 blur-2xl animate-pulse" />
              <div className="absolute w-48 h-48 rounded-full border border-dashed border-[#818CF8]/30 animate-spin" style={{ animationDuration: '40s' }} />
              <div className="absolute w-40 h-40 rounded-full border border-zinc-200/50 dark:border-white/5 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <svg className="absolute w-[184px] h-[184px] animate-spin" style={{ animationDuration: '60s' }} viewBox="0 0 200 200">
                  <path id="textPathOutcomes" d="M 100, 100 m -76, 0 a 76,76 0 1,1 152,0 a 76,76 0 1,1 -152,0" fill="none" />
                  <text className="text-[11px] font-bold fill-zinc-650 dark:fill-zinc-350 uppercase tracking-[0.2em] font-sans">
                    <textPath href="#textPathOutcomes" startOffset="0%">
                      • Flazly Core AI Engine • Autopilot Mode
                    </textPath>
                  </text>
                </svg>
              </div>

              <div className="absolute w-28 h-28 rounded-full bg-gradient-to-b from-white to-zinc-50 dark:from-[#1E293B] dark:to-[#0F172A] border border-zinc-200/50 dark:border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center z-10">
                <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center shadow-lg p-4">
                  <img src="/Dark theme.png" alt="Flazly Logo" className="hidden dark:block w-12 h-12 object-contain" />
                  <img src="/Light Theme.png" alt="Flazly Logo" className="block dark:hidden w-12 h-12 object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Cards */}
          {benefitsList.map((benefit, idx) => (
            <motion.div
              key={idx}
              className={`absolute ${benefit.pos}`}
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: benefit.delay
              }}
            >
              <div className="bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 rounded-[24px] p-6 text-left hover:border-[#38BDF8]/20 dark:hover:border-[#38BDF8]/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#38BDF8] border border-sky-500/20 flex items-center justify-center mb-4 shrink-0 font-semibold">
                    {benefit.icon}
                  </div>
                  <h3 className="text-base font-bold mb-2 text-zinc-900 dark:text-white font-inter">{benefit.title}</h3>
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium font-sans">{benefit.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Layout: Stacked Grid */}
        <div className="md:hidden flex flex-col gap-8">
          {/* Centered dial header */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div className="absolute w-36 h-36 rounded-full bg-[#4F39F6]/10 dark:bg-[#4F39F6]/20 blur-xl animate-pulse" />
              <div className="absolute w-40 h-40 rounded-full border border-dashed border-[#818CF8]/25 animate-spin" style={{ animationDuration: '50s' }} />
              <div className="absolute w-24 h-24 rounded-full bg-gradient-to-b from-white to-zinc-50 dark:from-[#1E293B] dark:to-[#0F172A] border border-zinc-200/50 dark:border-white/10 shadow-sm flex flex-col items-center justify-center z-10">
                <div className="w-18 h-18 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center shadow-md p-3.5">
                  <img src="/Dark theme.png" alt="Flazly Logo" className="hidden dark:block w-9 h-9 object-contain" />
                  <img src="/Light Theme.png" alt="Flazly Logo" className="block dark:hidden w-9 h-9 object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefitsList.map((benefit, idx) => (
              <div key={idx} className="bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 rounded-3xl p-6 text-left shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#38BDF8] border border-sky-500/20 flex items-center justify-center mb-4 shrink-0 font-semibold">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-bold mb-2 text-zinc-900 dark:text-white font-inter">{benefit.title}</h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium font-sans">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
