import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, Bot, Clock, AlertCircle, X, Check, RefreshCw, Sparkles, Image, Mic, Smile } from 'lucide-react';

export const ProblemStorytelling: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.2 });
  const [scene, setScene] = useState(1);
  const [timer, setTimer] = useState("00:00");
  const [showAiReply, setShowAiReply] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (!isInView) {
      setScene(1);
      setTimer("00:00");
      setShowAiReply(false);
      setShowTyping(false);
      return;
    }

    let timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timeouts.push(setTimeout(fn, delay));
    };

    const runAnimation = () => {
      timeouts.forEach(clearTimeout);
      timeouts = [];

      // Scene 1: New Lead Arrives
      setScene(1);
      setTimer("00:00");
      setShowAiReply(false);
      setShowTyping(false);

      // Scene 2: Waiting
      schedule(() => {
        setScene(2);
        setTimer("00:00");
      }, 2500);

      schedule(() => { setTimer("00:30"); }, 3300);
      schedule(() => { setTimer("01:00"); }, 4100);
      schedule(() => { setTimer("03:00"); }, 4900);
      schedule(() => { setTimer("05:00"); }, 5700);

      // Scene 3: Lost Opportunity
      schedule(() => {
        setScene(3);
        setTimer("05:00");
      }, 6200);

      // Scene 4: Time Rewinds
      schedule(() => {
        setScene(4);
        setTimer("Rewinding...");
      }, 8700);

      // Scene 5: Instant AI Response
      schedule(() => {
        setScene(5);
        setTimer("⚡ < 2s");
        setShowTyping(true);
      }, 10500);

      schedule(() => {
        setShowTyping(false);
        setShowAiReply(true);
      }, 11500);

      // Scene 6: Automated Workflow
      schedule(() => {
        setScene(6);
        setTimer("⚡ < 2s");
      }, 13000);

      // Scene 7: Conversion
      schedule(() => {
        setScene(7);
        setTimer("⚡ < 2s");
      }, 16000);
    };

    runAnimation();
    const interval = setInterval(runAnimation, 19500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [isInView]);

  return (
    <div ref={sectionRef} className="grid lg:grid-cols-12 gap-8 items-stretch mt-16 w-full text-zinc-900 dark:text-white">
      {/* MOCKUP CONTAINER - 7 cols */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center">
        <div className="mockup-dark w-full max-w-[360px] h-[540px] rounded-[32px] border border-zinc-200/20 dark:border-zinc-800 bg-[#09090b] text-white flex flex-col shadow-2xl relative overflow-hidden">
          {/* Header Status Bar Mockup */}
          <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[9px] font-bold text-zinc-400 select-none border-b border-zinc-900/40 shrink-0">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <div className="w-4 h-2 rounded-[2px] border border-zinc-500 flex items-center p-[1px]">
                <div className="w-full h-full bg-zinc-400 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Instagram Chat Header */}
          <div className="bg-[#0c0c0d] border-b border-zinc-900/60 py-3 px-4 flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-2.5">
              <ChevronLeft size={18} className="text-white cursor-pointer hover:opacity-80" />
              <div className="relative">
                <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#121214] flex items-center justify-center text-[8px] font-black text-white">
                    AR
                  </div>
                </div>
                {scene !== 3 && scene !== 4 && (
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0c0c0d] ${
                    scene === 1 || scene >= 5 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-tight">alex.rivera</span>
                <span className={`text-[7.5px] font-extrabold tracking-wide uppercase ${
                  scene === 1 ? 'text-emerald-400' :
                  scene === 2 && timer === "00:00" ? 'text-emerald-400' :
                  scene === 2 && timer === "00:30" ? 'text-amber-400' :
                  scene === 2 && timer === "01:00" ? 'text-amber-400' :
                  scene === 2 && timer === "03:00" ? 'text-orange-400' :
                  scene === 2 && timer === "05:00" ? 'text-rose-500' :
                  scene === 3 ? 'text-rose-500' :
                  scene === 4 ? 'text-indigo-400' :
                  'text-purple-400'
                }`}>
                  {scene === 1 && "● Active now"}
                  {scene === 2 && `● Active ${timer} ago`}
                  {scene === 3 && "● Offline (Gone)"}
                  {scene === 4 && "● Rewinding..."}
                  {scene >= 5 && "⚡ Flazly AI Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages Feed Area */}
          <div className="flex-1 bg-black p-4 overflow-y-auto flex flex-col gap-3 text-left font-sans text-xs scrollbar-none z-10 relative">
            <AnimatePresence mode="popLayout">
              {scene === 4 ? (
                <motion.div
                  key="rewind"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 z-20"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  >
                    <RefreshCw size={28} className="text-[#818CF8]" />
                  </motion.div>
                  <span className="text-xs font-bold text-[#818CF8] tracking-widest uppercase animate-pulse">Now with Flazly</span>
                </motion.div>
              ) : null}

              {/* Customer message - visible in all scenes except rewind */}
              {scene !== 4 && (
                <motion.div
                  key="customer-msg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col max-w-[80%] self-start"
                >
                  <div className="p-3 rounded-2xl text-[11px] leading-relaxed font-semibold bg-zinc-900 text-zinc-100 rounded-tl-sm border border-zinc-800">
                    Hi, I'm interested in your service. Can you share pricing?
                  </div>
                  <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest mt-1 ml-1">
                    Alex Rivera
                  </span>
                </motion.div>
              )}

              {/* Scene 5, 6, 7 AI Typing Bubble */}
              {scene >= 5 && showTyping && (
                <motion.div
                  key="ai-typing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="self-end max-w-[80%] flex flex-col items-end"
                >
                  <div className="bg-gradient-to-r from-[#818CF8]/25 to-[#4F39F6]/25 border border-[#4F39F6]/30 text-white p-3 rounded-2xl rounded-tr-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest mt-1 mr-1">
                    Flazly AI typing...
                  </span>
                </motion.div>
              )}

              {/* Scene 5, 6, 7 AI Reply */}
              {scene >= 5 && showAiReply && (
                <motion.div
                  key="ai-reply"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col max-w-[85%] self-end"
                >
                  <div className="bg-gradient-to-r from-[#818CF8] to-[#4F39F6] text-white p-3 rounded-2xl rounded-tr-sm shadow-lg leading-relaxed font-semibold">
                    Thanks for reaching out. I'd be happy to help. What service are you interested in?
                  </div>
                  <span className="text-[7.5px] font-bold text-[#818CF8] uppercase tracking-widest mt-1 mr-1 self-end flex items-center gap-1">
                    ✨ Flazly AI
                  </span>
                </motion.div>
              )}

              {/* Scene 6 & 7 Customer response */}
              {scene >= 6 && (
                <motion.div
                  key="customer-reply"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col max-w-[80%] self-start"
                >
                  <div className="p-3 rounded-2xl text-[11px] leading-relaxed font-semibold bg-zinc-900 text-zinc-100 rounded-tl-sm border border-zinc-800">
                    I'm looking for lead generation for my D2C brand.
                  </div>
                </motion.div>
              )}

              {/* Scene 6 & 7 AI follow-up response */}
              {scene >= 6 && (
                <motion.div
                  key="ai-followup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col max-w-[85%] self-end"
                >
                  <div className="bg-gradient-to-r from-[#818CF8] to-[#4F39F6] text-white p-3 rounded-2xl rounded-tr-sm shadow-lg leading-relaxed font-semibold">
                    Perfect! We sync lead data automatically. Can I get your email to send the details?
                  </div>
                  <span className="text-[7.5px] font-bold text-[#818CF8] uppercase tracking-widest mt-1 mr-1 self-end">
                    ✨ Flazly AI
                  </span>
                </motion.div>
              )}

              {/* Scene 7 Customer email capture */}
              {scene >= 7 && (
                <motion.div
                  key="customer-email"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col max-w-[80%] self-start"
                >
                  <div className="p-3 rounded-2xl text-[11px] leading-relaxed font-semibold bg-zinc-900 text-zinc-100 rounded-tl-sm border border-zinc-800">
                    Sure, it's alex@riveramedia.co
                  </div>
                </motion.div>
              )}

              {/* Scene 7 AI capture success */}
              {scene >= 7 && (
                <motion.div
                  key="ai-capture-success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex flex-col max-w-[85%] self-end"
                >
                  <div className="bg-gradient-to-r from-[#818CF8] to-[#4F39F6] text-white p-3 rounded-2xl rounded-tr-sm shadow-lg leading-relaxed font-semibold">
                    Captured! Details sent. Here's a link to schedule a strategy call if you want: flazly.com/book
                  </div>
                  <span className="text-[7.5px] font-bold text-[#818CF8] uppercase tracking-widest mt-1 mr-1 self-end">
                    ✨ Flazly AI
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Instagram Chat Footer Input Mockup */}
          <div className="p-3 bg-[#09090b] border-t border-zinc-900 flex items-center gap-2 shrink-0 z-10">
            <div className="flex-1 bg-zinc-900 border border-zinc-800/80 rounded-full h-8 px-3 flex items-center justify-between text-[10px] text-zinc-500 select-none">
              <span>Message...</span>
              <div className="flex items-center gap-2">
                <Mic size={12} className="text-zinc-500" />
                <Image size={12} className="text-zinc-500" />
                <Smile size={12} className="text-zinc-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD / STATUS PANEL - 5 cols */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <div className="bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 p-8 rounded-3xl min-h-[460px] flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300">
          
          {/* Header Dynamic Status */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Live Pipeline State
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              scene === 1 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
              scene === 2 && (timer === "00:00" || timer === "00:30" || timer === "01:00") ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
              scene === 2 && timer === "03:00" ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
              scene === 2 && timer === "05:00" ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
              scene === 3 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
              scene === 4 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' :
              'bg-[#4F39F6]/10 text-[#818CF8] border border-[#4F39F6]/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                scene === 1 || (scene === 2 && (timer === "00:00" || timer === "00:30")) ? 'bg-emerald-500' :
                scene === 2 && (timer === "01:00" || timer === "03:00") ? 'bg-amber-500' :
                scene === 2 && timer === "05:00" ? 'bg-rose-500' :
                scene === 3 ? 'bg-rose-500' :
                scene === 4 ? 'bg-indigo-400 animate-ping' :
                'bg-[#818CF8] animate-pulse'
              }`} />
              {scene === 1 && "Interested"}
              {scene === 2 && (timer === "00:00" || timer === "00:30" || timer === "01:00" ? "Waiting" : "Losing Interest")}
              {scene === 3 && "Gone"}
              {scene === 4 && "Resetting"}
              {scene === 5 && "AI Active"}
              {scene === 6 && "Qualifying"}
              {scene === 7 && "Success"}
            </span>
          </div>

          {/* Middle Clock / Metrics Card */}
          <div className="my-8 text-left">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
              Elapsed Time
            </span>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                scene >= 5 ? 'bg-emerald-500/10 text-emerald-500' :
                scene === 3 ? 'bg-rose-500/10 text-rose-500' :
                scene === 4 ? 'bg-indigo-500/10 text-indigo-400' :
                'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
              }`}>
                {scene >= 5 ? <Bot size={24} /> : scene === 4 ? <RefreshCw size={24} className="animate-spin" /> : <Clock size={24} />}
              </div>
              <div className="flex flex-col">
                <span className={`text-4xl font-extrabold tracking-tight tabular-nums ${
                  scene >= 5 ? 'text-emerald-500' :
                  scene === 3 ? 'text-rose-500' :
                  scene === 4 ? 'text-indigo-400' :
                  'text-zinc-900 dark:text-white'
                }`}>
                  {timer}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {scene >= 5 ? "Autopilot response speed" : "Average response limit is 5 mins"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Card Context */}
          <div className="flex-1 flex flex-col justify-end text-left border-t border-zinc-100 dark:border-white/5 pt-6">
            <AnimatePresence mode="wait">
              {(scene === 1 || scene === 2) && (
                <motion.div
                  key="waiting-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    Lead is waiting in DM queue
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    Prospect has sent an inquiry. If they are left waiting, high-intent interest drops rapidly, leading to lost sales.
                  </p>
                </motion.div>
              )}

              {scene === 3 && (
                <motion.div
                  key="lost-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h4 className="text-sm font-extrabold text-rose-500 flex items-center gap-1.5">
                    <AlertCircle size={16} /> Leakage: Lost Opportunity
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      "Lead Lost",
                      "No Follow-up",
                      "No Contact Captured",
                      "Revenue Missed"
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-xs font-bold"
                      >
                        <X size={12} className="stroke-[3]" />
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {scene === 4 && (
                <motion.div
                  key="rewind-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <h4 className="text-sm font-bold text-indigo-400">
                    Deploying Flazly AI
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium animate-pulse">
                    Implementing instant, context-aware reply loops.
                  </p>
                </motion.div>
              )}

              {scene === 5 && (
                <motion.div
                  key="ai-active-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <h4 className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                    <Bot size={16} /> Instant AI Reply Triggered
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    Flazly AI instantly reads context, answers the pricing query, and prompts the prospect, saving the opportunity.
                  </p>
                </motion.div>
              )}

              {scene === 6 && (
                <motion.div
                  key="workflow-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h4 className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                    <Check size={16} /> Automated Engagement Flow
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Instant Reply",
                      "Lead Qualification",
                      "Contact Capture",
                      "CRM Sync",
                      "Follow-Up Automation"
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[10.5px] font-bold"
                      >
                        <Check size={10} className="stroke-[3]" />
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {scene === 7 && (
                <motion.div
                  key="conversion-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h4 className="text-sm font-extrabold text-emerald-500 flex items-center gap-1.5">
                    <Sparkles size={16} /> Conversion Pipeline Complete
                  </h4>
                  <div className="space-y-2">
                    {[
                      { icon: "🎉", label: "Qualified Lead Captured" },
                      { icon: "📅", label: "Meeting Booked" },
                      { icon: "💰", label: "New Revenue Generated" }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.15, type: "spring", stiffness: 150 }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-500 text-xs font-extrabold"
                      >
                        <span className="text-sm">{item.icon}</span>
                        {item.label}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b] border-t border-zinc-200/80 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">
            THE COST OF MANUAL DM MANAGEMENT
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-zinc-900 dark:text-white leading-tight mt-3">
            Every Unanswered DM Is Lost Revenue
          </h2>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mt-2 text-balance">
            Potential customers are messaging your business right now. Slow replies, missed follow-ups, and manual processes cause leads to disappear before they ever become customers.
          </p>
        </div>

        <ProblemStorytelling />
      </div>
    </section>
  );
};

export default ProblemSection;
