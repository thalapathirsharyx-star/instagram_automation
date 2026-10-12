import React from 'react';
import { Bot, FileText, Check } from 'lucide-react';

export const CapabilitiesSection: React.FC = () => {
  const capabilities = [
    {
      title: "Smart Inbox",
      desc: "Human-in-the-loop control. Monitor automated conversations, toggle autopilot pause/resume, and tag client statuses.",
      feats: ["Live chat stream", "One-click AI pause", "Lead status tags"],
      gridClass: "md:col-span-1",
      visual: (
        <div className="w-full bg-zinc-50/50 dark:bg-[#121826]/30 border border-zinc-200/50 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2.5 mb-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Inbox Stream</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />Live</span>
          </div>
          <div className="flex items-center justify-between bg-white dark:bg-[#090b11]/80 p-2.5 rounded-xl border border-zinc-150 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center text-[10px] font-extrabold shrink-0">JD</div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-zinc-900 dark:text-white truncate">John Doe</span>
                <span className="text-[8px] text-zinc-500 dark:text-zinc-400 truncate">"Price list please?"</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[8px] font-bold uppercase tracking-wide border border-purple-500/20 shrink-0">Autopilot</span>
          </div>
        </div>
      )
    },
    {
      title: "Flazly AI Agent",
      desc: "Conversational agent qualified to speak in 40+ languages. Uses warm, sales-focused tones to maximize conversions.",
      feats: ["Multilingual recognition", "Custom system prompts", "Adjustable confidence limits"],
      gridClass: "md:col-span-2",
      special: true,
      visual: (
        <div className="bg-zinc-50/50 dark:bg-[#121826]/30 border border-zinc-200/50 dark:border-white/5 p-5 rounded-2xl flex flex-col gap-3 min-w-[280px] w-full lg:w-auto shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#4F39F6]/10 text-[#4F39F6] dark:text-indigo-400 border border-[#4F39F6]/20 flex items-center justify-center relative shrink-0">
                <Bot size={16} />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-[#0c0f1a] rounded-full" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-900 dark:text-white">Flazly AI</div>
                <div className="text-[8px] text-emerald-500 font-bold uppercase tracking-wide">Autopilot</div>
              </div>
            </div>
            <span className="text-[9px] text-zinc-400 font-semibold">99.8% Accuracy</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-white dark:bg-black/20 p-2.5 rounded-2xl rounded-tr-none text-[10px] text-zinc-650 dark:text-zinc-300 self-end max-w-[85%] border border-zinc-100 dark:border-white/5 shadow-sm">
              "Do you ship to Germany? mark@web.de"
            </div>
            <div className="bg-indigo-500/10 dark:bg-indigo-500/10 p-2.5 rounded-2xl rounded-tl-none text-[10px] text-indigo-600 dark:text-indigo-300 self-start max-w-[85%] border border-indigo-500/10">
              "Yes! Worldwide shipping is available. 📦 I've locked in your email."
            </div>
            <div className="flex gap-1.5 mt-1 justify-start">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[8px] font-bold">Email Captured</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[8px] font-bold">Germany</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Knowledge Base",
      desc: "Train Flazly on your business guides. Upload product sheets, return rules, and policies (PDF/TXT) for instant learning.",
      feats: ["PDF & TXT training docs", "FAQ overriding builder", "Static fact book storage"],
      gridClass: "md:col-span-1",
      visual: (
        <div className="w-full bg-zinc-50/50 dark:bg-[#121826]/30 border border-zinc-200/50 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2.5 mb-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Source Material</span>
            <span className="text-emerald-500 font-bold">Trained</span>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-[#090b11]/80 p-2.5 rounded-xl border border-zinc-150 dark:border-white/5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div className="flex-grow min-w-0">
              <div className="text-[10px] font-bold text-zinc-900 dark:text-white truncate">product_catalog_2026.pdf</div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-full w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Automation Builder",
      desc: "Easily map and schedule lead capture sequences. Connect comments, reels, and stories to DM steps.",
      feats: ["Visual workflow node map", "Keyword rule matching", "Flexible webhook nodes"],
      gridClass: "md:col-span-1",
      visual: (
        <div className="w-full bg-zinc-50/50 dark:bg-[#121826]/30 border border-zinc-200/50 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between gap-2 mb-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="bg-white dark:bg-[#090b11]/80 px-2.5 py-1.5 rounded-xl border border-zinc-150 dark:border-white/5 shadow-sm text-[9px] font-bold text-zinc-700 dark:text-zinc-300">
            Trigger "Price"
          </div>
          <div className="flex-grow border-t border-dashed border-zinc-300 dark:border-zinc-700 relative">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[7px] text-white shadow-sm">⚡</span>
          </div>
          <div className="bg-indigo-500 text-white px-2.5 py-1.5 rounded-xl text-[9px] font-bold shadow-sm">
            Send DM
          </div>
        </div>
      )
    },
    {
      title: "Comment-To-DM Workflows",
      desc: "Trigger DM sequences to anybody who comments on posts, reels, or stories to start conversational qualification.",
      feats: ["Reels & post comment hook", "Post-specific keywords", "Automated outbound links"],
      gridClass: "md:col-span-1",
      visual: (
        <div className="w-full bg-zinc-50/50 dark:bg-[#121826]/30 border border-zinc-200/50 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2.5 mb-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Comment Trigger</span>
            <span className="text-[#818CF8] font-bold">Active</span>
          </div>
          <div className="bg-white dark:bg-[#090b11]/80 p-2.5 rounded-xl border border-zinc-150 dark:border-white/5 shadow-sm flex flex-col gap-1">
            <div className="text-[10px] text-zinc-800 dark:text-zinc-200 font-bold">"@alex: Send details!"</div>
            <div className="flex items-center gap-1.5 text-[8px] text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Auto-DM Sent
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Lead Capture System",
      desc: "Automatic parsing of customer detail fields. Sync collected leads directly to Sheets and CRMs in real time.",
      feats: ["Entity extraction logic", "Google Sheets sync", "HubSpot CRM plugin"],
      gridClass: "md:col-span-2",
      visual: (
        <div className="bg-zinc-50/50 dark:bg-[#121826]/30 border border-zinc-200/50 dark:border-white/5 p-5 rounded-2xl flex flex-col gap-2 min-w-[280px] w-full lg:w-auto shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Live Sync Queue</div>
          <div className="flex flex-col gap-1.5">
            {[
              { handle: "@alex_runner", email: "alex@gmail.com", status: "Synced to Sheets" },
              { handle: "@sophie_travel", email: "sophie@outlook.com", status: "Synced to HubSpot" }
            ].map((lead, i) => (
              <div key={i} className="flex justify-between items-center bg-white dark:bg-black/20 p-2.5 rounded-xl border border-zinc-100 dark:border-white/5 text-[9px] shadow-sm">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-bold text-zinc-900 dark:text-white truncate">{lead.handle}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 truncate">{lead.email}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-tighter text-[7px] shrink-0">{lead.status}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Broadcast Campaigns",
      desc: "Send automated follow-ups or campaign schedules to segments of qualified leads in bulk directly in-thread.",
      feats: ["Lead segment selection", "Sequential broadcasts", "Delivered stats reporting"],
      gridClass: "md:col-span-1",
      visual: (
        <div className="w-full bg-zinc-50/50 dark:bg-[#121826]/30 border border-zinc-200/50 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2.5 mb-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Campaign Delivery</span>
            <span className="text-indigo-500 font-bold">Sending</span>
          </div>
          <div className="bg-white dark:bg-[#090b11]/80 p-2.5 rounded-xl border border-zinc-150 dark:border-white/5 shadow-sm flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[10px] font-bold text-zinc-900 dark:text-white truncate">Summer Launch</span>
              <span className="text-[8px] text-zinc-500 dark:text-zinc-400">1,240 recipients</span>
            </div>
            <div className="text-[11px] font-extrabold text-indigo-500 shrink-0">92%</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-28 border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/10 dark:bg-[#121826]/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Core Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-3 mb-4">
            Designed to Generate More Business Leads
          </h2>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium">
            Everything you need to automate conversations, capture details, and scale lead collection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((mod, idx) => {
            const isColSpan2 = mod.gridClass.includes('col-span-2');
            const cardContent = (
              <div className={`flex flex-col h-full justify-between gap-6 ${isColSpan2 ? 'lg:flex-row lg:items-center' : ''}`}>
                {!isColSpan2 && mod.visual && (
                  <div className="w-full shrink-0">
                    {mod.visual}
                  </div>
                )}

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 font-inter">{mod.title}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 font-medium font-sans">{mod.desc}</p>
                  </div>
                  <ul className="space-y-2.5 border-t border-zinc-100 dark:border-white/5 pt-5">
                    {mod.feats.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium font-sans">
                        <Check size={12} className="text-[#38BDF8] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {isColSpan2 && mod.visual && (
                  <div className="flex items-center justify-center shrink-0 w-full lg:w-auto">
                    {mod.visual}
                  </div>
                )}
              </div>
            );

            if (mod.special) {
              return (
                <div key={idx} className={`${mod.gridClass} relative p-[1px] rounded-[32px] bg-gradient-to-br from-[#4F39F6] via-[#818CF8] to-[#38BDF8] dark:from-[#4F39F6] dark:to-[#38BDF8] shadow-[0_4px_30px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_12px_40px_rgba(79,57,246,0.1)] transition-all duration-300`}>
                  <div className="bg-gradient-to-b from-white to-zinc-50/50 dark:from-[#0f1220] dark:to-[#090b14] rounded-[31px] p-8 h-full text-left">
                    {cardContent}
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className={`${mod.gridClass} bg-gradient-to-b from-white to-zinc-50/30 dark:from-[#131929]/50 dark:to-[#0f1422]/50 border border-zinc-200/50 dark:border-white/5 rounded-[32px] p-8 text-left hover:border-[#38BDF8]/20 dark:hover:border-[#38BDF8]/30 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.03)] dark:shadow-none`}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
