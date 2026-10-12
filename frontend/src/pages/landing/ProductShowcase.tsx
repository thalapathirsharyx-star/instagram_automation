import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Bot,
  Workflow,
  BarChart3,
  Sliders,
  Sparkles,
  Send,
  Database,
  Upload,
  FileText,
  Plus,
  MessageCircle,
  Check
} from 'lucide-react';

type TabType = 'inbox' | 'agent' | 'builder' | 'analytics' | 'settings';

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');

  const tabs = [
    { id: 'inbox' as TabType, label: 'Smart Inbox', icon: <Inbox size={14} /> },
    { id: 'agent' as TabType, label: 'AI Agent (Flazly)', icon: <Bot size={14} /> },
    { id: 'builder' as TabType, label: 'Automation Builder', icon: <Workflow size={14} /> },
    { id: 'analytics' as TabType, label: 'Analytics & ROI', icon: <BarChart3 size={14} /> },
    { id: 'settings' as TabType, label: 'Integrations & Settings', icon: <Sliders size={14} /> }
  ];

  return (
    <section id="demo" className="w-full max-w-6xl mx-auto px-6 py-16 flex flex-col gap-6 mockup-dark scroll-mt-20">
      
      <div className="text-center max-w-2xl mx-auto mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">
          Interactive Dashboard Preview
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-2 mb-3">
          Explore The Full Flazly Platform
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          Toggle through live modules to see how Flazly handles conversations, builds automations, and tracks revenue.
        </p>
      </div>

      {/* Tabs navigation */}
      <div 
        role="tablist" 
        aria-label="Product Modules"
        className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#121826]/80 border border-white/5 rounded-2xl backdrop-blur-lg self-center"
      >
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/20 border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Showcase Panel wrapped in premium gradient border */}
      <div className="premium-gradient-border w-full max-w-6xl mx-auto shadow-2xl">
        <div className="premium-card-content overflow-hidden min-h-[520px] flex flex-col relative">
          
          {/* Top Window bar */}
          <div className="h-11 bg-[#0B1020]/60 border-b border-white/5 flex items-center justify-between px-5 shrink-0 select-none">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
              flazly_cloud_v1.0.8 // {activeTab.toUpperCase()}
            </span>
            <div className="w-12" />
          </div>

          {/* Dynamic Inner Panel Viewports */}
          <div 
            role="tabpanel" 
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="flex-1 p-4 md:p-6 flex flex-col bg-gradient-to-b from-[#0B1020]/20 to-black/20"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'inbox' && <InboxMockup key="inbox" />}
              {activeTab === 'agent' && <MockupWrapper key="agent"><AgentMockup /></MockupWrapper>}
              {activeTab === 'builder' && <MockupWrapper key="builder"><BuilderMockup /></MockupWrapper>}
              {activeTab === 'analytics' && <MockupWrapper key="analytics"><AnalyticsMockup /></MockupWrapper>}
              {activeTab === 'settings' && <MockupWrapper key="settings"><SettingsMockup /></MockupWrapper>}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const MockupWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full flex-grow flex flex-col min-h-[440px]">
      {children}
    </div>
  );
};

// Sub-Mockup 1: Inbox Dashboard
const InboxMockup = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="grid lg:grid-cols-[220px_1fr_240px] gap-4 min-h-[440px] items-stretch text-left"
    >
      {/* Left Chat List Panel */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto max-h-[440px]">
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-2 mb-1">Conversations</span>

        <div className="p-2 rounded-xl bg-white/5 border border-zinc-700 flex flex-col gap-1 cursor-pointer">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white">@daniel_k</span>
            <span className="text-[7px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-1.5 py-0.5 rounded">Autopilot</span>
          </div>
          <span className="text-[9px] text-zinc-400 truncate font-medium">Wants custom sizes info</span>
          <span className="text-[7.5px] text-[#38BDF8] font-extrabold mt-1">🔥 High Intent</span>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1 hover:bg-white/[0.04] transition-colors cursor-pointer opacity-70">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-300">@sarah.fit</span>
            <span className="text-[7px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Lead</span>
          </div>
          <span className="text-[9px] text-zinc-500 truncate">Qualified lead: Fitness</span>
          <span className="text-[7.5px] text-zinc-400 font-semibold mt-1">Synced to CRM</span>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1 hover:bg-white/[0.04] transition-colors cursor-pointer opacity-70">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-300">@hype_brands</span>
            <span className="text-[7px] text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">Action Needed</span>
          </div>
          <span className="text-[9px] text-zinc-500 truncate">Requests volume pricing</span>
          <span className="text-[7.5px] text-yellow-500/80 font-bold mt-1">Escalated</span>
        </div>
      </div>

      {/* Middle Chat Feed Panel */}
      <div className="bg-black/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden relative">
        <div className="p-3 bg-black/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] font-bold text-white">DK</div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Daniel Kreuger (@daniel_k)</span>
              <span className="text-[8px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Now
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-1 rounded-full text-[8.5px] font-bold text-[#38BDF8]">
            <Sparkles size={8} className="animate-spin" /> Autopilot Running
          </div>
        </div>

        <div className="flex-1 p-3 space-y-3.5 overflow-y-auto max-h-[320px]">
          <div className="flex gap-2 max-w-[85%]">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-bold shrink-0 text-zinc-300">US</div>
            <div className="bg-zinc-800/80 border border-white/5 p-2.5 rounded-2xl rounded-tl-none">
              <p className="text-[10px] text-zinc-200">Hi! Do you have the white sneaker in size 10? How much is it?</p>
            </div>
          </div>

          <div className="flex gap-2 max-w-[85%] ml-auto justify-end">
            <div className="bg-zinc-850 p-2.5 rounded-2xl rounded-tr-none text-right border border-[#38BDF8]/25">
              <p className="text-[10px] text-white">Yes! We have 3 pairs left in size 10. The price is $129 with free shipping. Would you like a checkout link?</p>
              <span className="text-[6.5px] font-bold text-zinc-400 uppercase tracking-wide mt-1 block">✦ Automated by Flazly</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-[#38BDF8] flex items-center justify-center text-[7px] font-bold shrink-0 text-white font-mono">AI</div>
          </div>

          <div className="flex gap-2 max-w-[85%]">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-bold shrink-0 text-zinc-300">US</div>
            <div className="bg-zinc-800/80 border border-white/5 p-2.5 rounded-2xl rounded-tl-none">
              <p className="text-[10px] text-zinc-200">Yes please! Send details to daniel@gmail.com</p>
            </div>
          </div>

          <div className="flex gap-2 max-w-[85%] ml-auto justify-end">
            <div className="bg-zinc-850 p-2.5 rounded-2xl rounded-tr-none text-right border border-[#38BDF8]/25">
              <p className="text-[10px] text-white">Awesome! I've saved daniel@gmail.com. Here is your checkout link: flazly.com/chk/shoes-10</p>
              <span className="text-[6.5px] font-bold text-[#38BDF8] uppercase tracking-wide mt-1 block font-extrabold">✦ Automated by Flazly</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-[#38BDF8] flex items-center justify-center text-[7px] font-bold shrink-0 text-white font-mono">AI</div>
          </div>
        </div>

        <div className="p-2 border-t border-white/5 bg-black/20 flex items-center gap-2">
          <div className="flex-1 bg-white/5 border border-white/5 rounded-xl h-7 px-3 flex items-center text-[9px] text-zinc-500 truncate">
            AI is responding. Click to pause autopilot and reply manually...
          </div>
          <button className="h-7 px-3 bg-white/10 border border-white/20 rounded-xl text-[9px] font-bold text-zinc-200 hover:bg-white/20 transition-all cursor-pointer shrink-0">
            Pause AI
          </button>
        </div>
      </div>

      {/* Right Lead Intelligence Sidebar */}
      <div className="bg-black/30 border border-[#1C2538] rounded-2xl p-4 flex flex-col gap-4 text-left">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Lead Intelligence</span>

        <div className="flex flex-col items-center gap-2 border-b border-white/5 pb-3">
          <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white shadow-lg">DK</div>
          <span className="text-xs font-bold text-white">@daniel_k</span>
          <span className="text-[8px] bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 px-2 py-0.5 rounded-full font-bold select-none">
            High-Intent Lead 🔥
          </span>
        </div>

        <div className="space-y-3 text-[10px]">
          <div>
            <span className="text-zinc-500 block mb-0.5">Email Address</span>
            <span className="text-zinc-200 font-mono font-bold">daniel@gmail.com</span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Lead Location</span>
            <span className="text-zinc-200 font-bold">United Kingdom</span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Extracted Interest</span>
            <span className="text-zinc-200 font-bold">White Sneaker (Size 10)</span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Integrations Synced</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Sheets</span>
              <span className="text-[8px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">HubSpot</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Sub-Mockup 2: AI Agent Instructions
const AgentMockup = () => {
  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 min-h-[440px] items-stretch text-left">
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">AI Agent Setup</span>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-300">Agent Persona / System Prompt</label>
          <textarea
            readOnly
            value="You are Flazly, an AI sales representative. Your tone should be extremely friendly, helpful, and outcome-oriented. Help visitors qualify their DMs, answer FAQs regarding products, pricing, features, and setup. Capture lead details from high-intent buyers, or provide a purchase link if they inquire about pricing."
            className="w-full h-28 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-zinc-300 font-mono leading-relaxed resize-none outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-zinc-300">Confidence Threshold</span>
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-200 font-semibold">92% Match</span>
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#38BDF8]" style={{ width: "92%" }} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-zinc-300">Tone Type</span>
            <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex gap-1">
              <span className="text-[9px] font-bold bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] px-2 py-0.5 rounded">Warm & Sales</span>
              <span className="text-[9px] font-bold text-zinc-500 px-2 py-0.5 rounded">Strict FAQ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 text-left">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">Knowledge Docs</span>
        <p className="text-[10px] text-zinc-400 leading-normal font-medium">
          Upload catalogs, spreadsheets, FAQs, or policies. Flazly learns instantly.
        </p>

        <div className="border border-dashed border-white/10 rounded-xl p-4 text-center bg-black/40 hover:border-[#38BDF8] transition-colors cursor-pointer group flex flex-col items-center justify-center gap-2">
          <Upload size={18} className="text-zinc-400 group-hover:text-[#38BDF8] transition-colors" />
          <span className="text-[10px] font-bold text-zinc-300">Drop PDF or TXT files here</span>
          <span className="text-[8px] text-zinc-500">Maximum size limit 20MB per file</span>
        </div>

        <div className="space-y-2 mt-auto">
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={14} className="text-[#38BDF8] shrink-0" />
              <span className="text-[9.5px] font-bold text-zinc-300 truncate">summer_pricing_catalog.pdf</span>
            </div>
            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Trained</span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={14} className="text-[#38BDF8] shrink-0" />
              <span className="text-[9.5px] font-bold text-zinc-300 truncate">return_and_shipping_rules.txt</span>
            </div>
            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Trained</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-Mockup 3: Automation Workflow Builder
const BuilderMockup = () => {
  return (
    <div className="flex flex-col min-h-[440px] text-left">
      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4 shrink-0">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Automation Editor</span>
          <span className="text-xs font-bold text-white mt-0.5 block">Recipe: Comment &quot;SCALE&quot; to Lead</span>
        </div>
        <button className="btn-premium-cta px-3 py-1.5 text-[9px] font-bold flex items-center gap-1 cursor-pointer">
          <Plus size={10} /> Add Node
        </button>
      </div>

      <div className="flex-1 bg-black/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center items-center gap-5">
        <div className="absolute inset-0 dot-grid opacity-[0.1] pointer-events-none" />

        <div className="bg-[#121826] border border-zinc-700 p-3 rounded-xl w-64 shadow-md relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
            <MessageCircle size={16} />
          </div>
          <div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">1. Trigger</span>
            <span className="text-[10.5px] font-bold text-white">User comments &quot;SCALE&quot; on post</span>
          </div>
        </div>

        <div className="w-0.5 h-5 bg-gradient-to-b from-[#38BDF8] to-[#3B82F6]" />

        <div className="bg-[#121826] border border-[#38BDF8]/55 p-3 rounded-xl w-64 shadow-md relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] shrink-0">
            <Send size={16} />
          </div>
          <div>
            <span className="text-[8px] font-bold text-[#38BDF8] uppercase tracking-wider block">2. Action</span>
            <span className="text-[10.5px] font-bold text-white">Send DM with checkout link</span>
          </div>
        </div>

        <div className="w-0.5 h-5 bg-gradient-to-b from-[#3B82F6] to-[#6366F1]" />

        <div className="bg-[#121826] border border-emerald-500/40 p-3 rounded-xl w-64 shadow-md relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Database size={16} />
          </div>
          <div>
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider block">3. Integration Sync</span>
            <span className="text-[10.5px] font-bold text-white">Sync lead data to Sheets</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-Mockup 4: Analytics
const AnalyticsMockup = () => {
  return (
    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4 min-h-[440px] items-stretch text-left">
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-2 block">Sales Analytics</span>
          <span className="text-[9px] text-zinc-400 font-medium">Live ROI and automation conversions over the last 30 days.</span>
        </div>

        <div className="h-44 w-full bg-black/20 rounded-xl relative overflow-hidden flex items-end p-2 border border-white/5 my-2">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M 0 90 Q 20 60, 40 75 T 80 30 T 100 10 L 100 100 L 0 100 Z" fill="url(#chart-glow)" />
            <path d="M 0 90 Q 20 60, 40 75 T 80 30 T 100 10" fill="none" stroke="#3B82F6" strokeWidth="2" />
          </svg>
          <div className="absolute top-3 left-3 bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 py-0.5 rounded text-[8px] font-bold text-[#38BDF8]">
            Revenue Trend: +34%
          </div>
          <div className="absolute bottom-1 right-2 text-[7px] text-zinc-500 font-mono">May 1 - May 30</div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
          <div>
            <span className="text-[9px] text-zinc-500 block">Total Automated Revenue</span>
            <span className="text-base font-extrabold text-white">$18,429.50</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block">Lead Conversion Rate</span>
            <span className="text-base font-extrabold text-[#38BDF8]">8.42%</span>
          </div>
        </div>
      </div>

      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2 block">Recent Conversions</span>

        <div className="space-y-2 flex-grow overflow-y-auto py-2 max-h-[260px]">
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-200 font-bold">SM</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white">@sarah_fit</span>
                <span className="text-[8px] text-zinc-400">Captured Email: sarah@fit.co</span>
              </div>
            </div>
            <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Lead</span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-200 font-bold">JD</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white">@john_dealz</span>
                <span className="text-[8px] text-zinc-400">Purchased Sneaker White</span>
              </div>
            </div>
            <span className="text-[8px] font-extrabold text-zinc-200 bg-white/10 border border-white/20 px-2 py-0.5 rounded">+$129.00</span>
          </div>
        </div>

        <div className="bg-[#121826] border border-[#38BDF8]/20 p-3 rounded-xl text-center">
          <span className="text-[9px] text-zinc-400 uppercase tracking-widest block mb-1">Time Saved This Month</span>
          <span className="text-xl font-black text-[#38BDF8] font-mono">48.5 Hours</span>
        </div>
      </div>
    </div>
  );
};

// Sub-Mockup 5: Settings / Integrations
const SettingsMockup = () => {
  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 min-h-[440px] items-stretch text-left">
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-2 block">Platform Connections</span>
          <span className="text-[9px] text-zinc-400 font-medium">Sync customer details and triggers to your dashboard tools instantly.</span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-white/[0.02] border border-[#38BDF8]/20 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold block text-white font-inter">Instagram Business</span>
              <span className="text-[7.5px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">● Connected as @flazly</span>
            </div>
            <Check size={14} className="text-emerald-400 shrink-0" />
          </div>

          <div className="p-3 bg-white/[0.02] border border-[#38BDF8]/20 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold block text-white font-inter">Google Sheets</span>
              <span className="text-[7.5px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">● Active Leads Sheet</span>
            </div>
            <Check size={14} className="text-emerald-400 shrink-0" />
          </div>

          <div className="p-3 bg-white/[0.02] border border-[#38BDF8]/20 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold block text-white font-inter">HubSpot CRM</span>
              <span className="text-[7.5px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">● Contact sync active</span>
            </div>
            <Check size={14} className="text-emerald-400 shrink-0" />
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between opacity-50">
            <div>
              <span className="text-[10.5px] font-bold block text-white font-inter">Slack Notifications</span>
              <span className="text-[7.5px] text-zinc-500 mt-0.5">Not configured</span>
            </div>
            <Plus size={14} className="text-[#38BDF8] shrink-0" />
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-1 font-mono text-[9px] text-[#A5D8FF]">
          <span className="font-sans font-bold text-zinc-300">API Access Token</span>
          <div className="flex items-center justify-between bg-black/60 p-2 rounded border border-white/5 text-zinc-400 mt-1">
            <span>sk_live_2026_zen_ab8201...</span>
            <span className="text-[#38BDF8] font-sans font-bold uppercase cursor-pointer hover:underline">Copy</span>
          </div>
        </div>
      </div>

      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2 block">Custom Webhooks</span>
        <p className="text-[10px] text-zinc-400 leading-normal font-medium">
          Send webhook events to your backend on lead qualifications, new lead captures, or payment updates.
        </p>

        <div className="bg-white/[0.02] border border-[#38BDF8]/20 p-3 rounded-xl text-left">
          <span className="text-[8px] font-bold text-zinc-300 uppercase font-mono block">Webhook Endpoint</span>
          <span className="text-[10px] font-mono text-zinc-200 mt-1 block truncate">https://api.yourdomain.com/webhook</span>
          <div className="flex gap-1.5 mt-3">
            <span className="text-[7px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded">on_lead_qualify</span>
            <span className="text-[7px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded">on_lead_capture</span>
          </div>
        </div>

        <button className="w-full mt-auto py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-[#38BDF8] transition-all cursor-pointer">
          Test Endpoint
        </button>
      </div>
    </div>
  );
};
