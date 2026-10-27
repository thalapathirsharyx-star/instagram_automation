import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Zap, Database, Workflow, Send, Shield } from 'lucide-react';

export const IntegrationsFlowCanvas: React.FC<{ activeStep: number }> = ({ activeStep }) => {
  return (
    <div className="relative w-full max-w-[440px] h-[340px] rounded-3xl border border-zinc-200/80 dark:border-white/5 bg-white dark:bg-[#0c0f17] p-6 flex flex-col justify-between shadow-lg overflow-hidden mockup-dark text-left">
      {/* Grid background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      
      {/* Top bar info */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-3 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            {activeStep === 0 && "Step 1: Secure Integration"}
            {activeStep === 1 && "Step 2: Intent Engine"}
            {activeStep === 2 && "Step 3: Webhook Pipeline"}
          </span>
        </div>
        <span className="text-[9px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-white/5">
          {activeStep === 0 && "oauth.meta.api"}
          {activeStep === 1 && "flazly.ai.engine"}
          {activeStep === 2 && "webhook.delivery"}
        </span>
      </div>

      {/* Main interactive nodes canvas */}
      <div className="flex-1 flex items-center justify-center relative my-4 z-10">
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              <div className="flex items-center justify-between w-full max-w-[320px] relative">
                <svg className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-2 z-0" pointerEvents="none">
                  <line
                    x1="20%"
                    y1="50%"
                    x2="80%"
                    y2="50%"
                    stroke="#4F39F6"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="animate-[dash_15s_linear_infinite]"
                  />
                </svg>

                {/* Left Node: Instagram Logo */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-500 flex items-center justify-center shadow-lg text-white">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">Instagram DM</span>
                </div>

                <div className="bg-[#4F39F6]/10 border border-[#4F39F6]/30 text-[#818CF8] text-[9px] px-2.5 py-1 rounded-full font-bold z-10 backdrop-blur-sm">
                  OAuth Handshake
                </div>

                {/* Right Node: Flazly Engine */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#818CF8] to-[#4F39F6] flex items-center justify-center shadow-lg text-white shadow-[#4F39F6]/20">
                    <Zap size={28} className="fill-white/10" />
                  </div>
                  <span className="text-[10px] font-bold text-[#818CF8]">Flazly AI</span>
                </div>
              </div>

              {/* Security Dialog Card overlay */}
              <div className="mt-6 bg-zinc-50 dark:bg-[#121826]/40 border border-zinc-200/50 dark:border-white/5 p-3 rounded-xl flex items-center gap-3 w-full max-w-[280px]">
                <Shield className="text-emerald-500 shrink-0" size={18} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">Meta API Compliance Verified</span>
                  <span className="text-[8px] text-zinc-500 font-medium">SSL Encrypted token rotation key</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-[340px] space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[7.5px] font-bold text-zinc-400">US</div>
                  <div className="bg-zinc-100 dark:bg-zinc-850 p-2.5 rounded-xl text-[10.5px] leading-snug font-medium text-zinc-700 dark:text-zinc-300 max-w-[220px]">
                    "Can I buy the hoodie? Do you ship to Germany?"
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 flex-1" />
                  <div className="bg-[#4F39F6]/10 border border-[#4F39F6]/20 px-3 py-1 rounded-full text-[9px] text-[#818CF8] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] animate-ping" />
                    Flazly NLP Processing
                  </div>
                  <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 flex-1" />
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className="bg-gradient-to-r from-[#818CF8] to-[#4F39F6] text-white p-2.5 rounded-xl text-[10.5px] leading-snug font-semibold max-w-[220px]">
                    "Yes! Shipping to Germany is €4.99. What color would you like?"
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      ✓ Intent: Shipping
                    </span>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      ✓ Location: Germany
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              <div className="flex items-center justify-between w-full max-w-[320px] relative">
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#818CF8] to-[#4F39F6] flex items-center justify-center shadow-lg text-white">
                    <Zap size={22} />
                  </div>
                  <span className="text-[9px] font-bold text-[#818CF8]">Flazly AI</span>
                </div>

                <svg className="absolute inset-0 w-full h-full z-0" pointerEvents="none" viewBox="0 0 320 120">
                  <path d="M 50 60 Q 120 20 240 25" fill="none" stroke="#4F39F6" strokeWidth="1.5" strokeDasharray="5 3" className="animate-[dash_10s_linear_infinite]" />
                  <path d="M 50 60 L 240 60" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="5 3" className="animate-[dash_10s_linear_infinite]" />
                  <path d="M 50 60 Q 120 100 240 95" fill="none" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="5 3" className="animate-[dash_10s_linear_infinite]" />
                </svg>

                <div className="flex flex-col gap-2.5 z-10 w-[150px]">
                  <div className="flex items-center gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/25 p-2 rounded-lg text-[9px] font-bold text-emerald-500">
                    <Database size={12} />
                    <span className="truncate">Google Sheets Sync</span>
                  </div>

                  <div className="flex items-center gap-2 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/25 p-2 rounded-lg text-[9px] font-bold text-orange-500">
                    <Workflow size={12} />
                    <span className="truncate">HubSpot CRM Deal</span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#818CF8]/5 dark:bg-[#818CF8]/10 border border-[#818CF8]/25 p-2 rounded-lg text-[9px] font-bold text-[#818CF8]">
                    <Send size={12} />
                    <span className="truncate">Slack Lead Alert</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-zinc-100 dark:border-white/5 pt-3 flex items-center justify-between text-[8.5px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 shrink-0 z-10">
        <span>Pipeline Activity Monitor</span>
        <span>Secure connection active</span>
      </div>
    </div>
  );
};

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });

  useEffect(() => {
    if (!autoRotate || !isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoRotate, isInView]);

  return (
    <section ref={sectionRef} id="how-it-works" className="py-28 border-t border-zinc-200/80 dark:border-white/5 relative overflow-hidden bg-gradient-to-b from-[#fafafa] via-zinc-100/50 to-[#fafafa] dark:from-[#09090b] dark:via-[#121826]/30 dark:to-[#09090b]">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: 3 Steps */}
          <div className="flex flex-col text-left">
            <span className="lp-eyebrow is-violet">How It Works</span>
            <h2 className="lp-title text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3 mb-6">
              3 Steps to Automated Lead Capture
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium mb-12">
              Turn your Instagram profile into a 24/7 lead generation engine in minutes.
            </p>

            <div className="space-y-6" role="tablist" aria-label="How Flazly Works Steps">
              {[
                {
                  step: "01",
                  title: "Connect Instagram Business Account",
                  desc: "Connect your Instagram profile securely with one-click Meta OAuth login. No password sharing required."
                },
                {
                  step: "02",
                  title: "Flazly AI Responds & Qualifies Leads Automatically",
                  desc: "Flazly instantly greets prospects, answers FAQs using your knowledge docs, and qualifies their intent."
                },
                {
                  step: "03",
                  title: "Capture Lead Details And Convert More Customers",
                  desc: "Automatically extract emails, phone numbers, and interests, syncing them immediately to your lead lists."
                }
              ].map((step, idx) => (
                <button
                  key={idx}
                  role="tab"
                  aria-selected={activeStep === idx}
                  onClick={() => {
                    setActiveStep(idx);
                    setAutoRotate(false);
                  }}
                  className={`flex gap-6 p-4 rounded-2xl cursor-pointer transition-all duration-300 border text-left w-full ${
                    activeStep === idx
                      ? "bg-white dark:bg-[#121826]/40 border-zinc-200/80 dark:border-white/5 shadow-sm"
                      : "border-transparent opacity-65 hover:opacity-100"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold tabular-nums shrink-0 transition-all duration-300 ${
                    activeStep === idx
                      ? "bg-[#4F39F6] text-white shadow-md shadow-[#4F39F6]/20"
                      : "bg-[#3B82F6]/10 text-[#38BDF8]"
                  }`}>
                    {step.step}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold mb-1 transition-colors duration-300 ${
                      activeStep === idx ? "text-[#4F39F6] dark:text-[#818CF8]" : "text-zinc-900 dark:text-white"
                    }`}>{step.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Platform Pipeline */}
          <div className="flex flex-col items-center justify-center">
            <IntegrationsFlowCanvas activeStep={activeStep} />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-6">
              Interactive Platform Pipeline
            </span>
          </div>
        </div>

        {/* Real-time captured entity cards */}
        <div className="bg-zinc-100/50 dark:bg-[#121826]/20 border border-zinc-200/80 dark:border-white/5 p-8 rounded-3xl max-w-4xl mx-auto mt-20">
          <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest text-center mb-8">
            What Flazly AI Captures In Real-Time
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Email Collected", detail: "alex@example.com", badge: "Contact" },
              { label: "Phone Captured", detail: "+1 (555) 019-2834", badge: "Contact" },
              { label: "Product Interest", detail: "Standard Hoodie (L)", badge: "Intent" },
              { label: "Consultation Request", detail: "Prefers Morning slots", badge: "Action" },
              { label: "Purchase Intent", detail: "Ready to order", badge: "Intent" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-[#121826]/60 border border-zinc-200/80 dark:border-white/5 p-4 rounded-2xl text-left shadow-sm">
                <span className="text-[8px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {item.badge}
                </span>
                <span className="text-xs font-bold text-zinc-800 dark:text-white block mt-3 mb-1">{item.label}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
