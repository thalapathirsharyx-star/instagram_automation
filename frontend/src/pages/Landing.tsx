import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Zap,
  ArrowRight,
  Check,
  X,
  Play,
  Database,
  Lock,
  Upload,
  FileText,
  TrendingUp,
  Phone,
  Video,
  Info,
  ChevronLeft,
  Camera,
  Mic,
  Image,
  Smile,
  BarChart3,
  Inbox,
  Users,
  Bot,
  Clock,
  MessageCircle,
  Calendar,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  DollarSign,
  Shield,
  HelpCircle,
  Sliders,
  CheckCircle,
  Menu,
  CheckCircle2,
  Workflow,
  Layers,
  Send,
  Plus,
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// ==========================================
// 1. HERO WORKFLOW ANIMATION COMPONENT
// ==========================================
const HeroWorkflow = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Instagram DM",
      icon: <MessageCircle size={18} />,
      badge: "Inbound",
      detail: "Alex DMs: 'Hey, do you ship to UK?'",
      glow: "from-[#38BDF8] to-[#3B82F6]",
      color: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20 dark:text-[#38BDF8]"
    },
    {
      title: "AI Agent",
      icon: <Bot size={18} />,
      badge: "Flazly AI",
      detail: "Flazly processes intent in <0.2s",
      glow: "from-[#3B82F6] to-[#6366F1]",
      color: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20 dark:text-[#3B82F6]"
    },
    {
      title: "Lead Qualification",
      icon: <Users size={18} />,
      badge: "Scoring",
      detail: "Email & location captured automatically",
      glow: "from-[#6366F1] to-[#38BDF8]",
      color: "text-[#6366F1] bg-[#6366F1]/10 border-[#6366F1]/20 dark:text-[#6366F1]"
    },
    {
      title: "CRM Sync",
      icon: <Database size={18} />,
      badge: "Integration",
      detail: "Synced to Google Sheets & HubSpot",
      glow: "from-[#38BDF8] to-[#3B82F6]",
      color: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20 dark:text-white dark:bg-white/10 dark:border-white/20"
    },
    {
      title: "Lead Handoff",
      icon: <Send size={18} />,
      badge: "CRM Sync",
      detail: "Qualified lead synced to your database",
      glow: "from-[#3B82F6] to-[#6366F1]",
      color: "text-[#3B82F6] bg-[#38BDF8]/10 border-[#38BDF8]/20 dark:text-[#38BDF8]"
    },
    {
      title: "Revenue",
      icon: <DollarSign size={18} />,
      badge: "Sale Closed",
      detail: "Pipeline updated: +$499 Revenue",
      glow: "from-[#6366F1] to-[#38BDF8]",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 dark:text-white dark:bg-[#3B82F6]/20 dark:border-[#3B82F6]/35"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="w-full bg-[#121826]/40 border border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* Background soft glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6366F1]/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Title / Header bar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold ml-2 font-mono">live_workflow_simulation.sh</span>
        </div>
        <div className="text-[10px] text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-1 rounded border border-[#38BDF8]/20 flex items-center gap-1 select-none font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" /> Autopilot Active
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
        {steps.map((step, idx) => {
          const isSelected = activeStep === idx;
          const isPassed = activeStep > idx;

          return (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex flex-col p-4 rounded-2xl border transition-all duration-500 cursor-pointer relative group text-left h-full ${isSelected
                  ? `bg-[#121826] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/10 scale-[1.03]`
                  : isPassed
                    ? "bg-[#121826]/30 border-white/10 opacity-70"
                    : "bg-transparent border-white/5 opacity-50 hover:opacity-75"
                }`}
            >
              {/* Connector line (hidden on last node) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-full w-4 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
              )}

              {/* Step number / Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isSelected ? "bg-[#38BDF8] text-white" : "bg-white/5 text-zinc-400"
                  }`}>
                  Step {idx + 1}
                </span>
                <span className={`text-[8px] font-bold ${isSelected ? "text-[#38BDF8]" : "text-zinc-500"}`}>
                  {step.badge}
                </span>
              </div>

              {/* Icon Container */}
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-3 transition-colors ${step.color}`}>
                {step.icon}
              </div>

              {/* Step Title */}
              <h4 className="text-xs font-bold text-white mb-1 group-hover:text-[#38BDF8] transition-colors">
                {step.title}
              </h4>

              {/* Detail snippet */}
              <p className="text-[10px] text-zinc-400 leading-normal font-medium mt-auto">
                {step.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Console details of currently active step */}
      <div className="mt-8 bg-black/40 border border-white/5 p-4 rounded-xl text-left font-mono relative">
        <div className="text-[9px] text-zinc-555 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>Simulation Logs</span>
          <span className="text-[#38BDF8] font-bold">Step {activeStep + 1} / 6</span>
        </div>
        <div className="text-xs space-y-1 text-zinc-350">
          <p className="text-white font-semibold">
            &gt; Initializing pipeline flow node: {steps[activeStep].title.toUpperCase()}
          </p>
          <p className="text-zinc-450">
            [STATUS] Node connected. Status: SUCCESS. Latency: {(Math.random() * 0.15 + 0.05).toFixed(3)}s
          </p>
          <p className="text-[#38BDF8] font-medium">
            [DATA] {steps[activeStep].detail}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PRODUCT SHOWCASE COMPONENT (SECTION 6)
// ==========================================
const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');

  const tabs = [
    { id: 'inbox' as TabType, label: 'Smart Inbox', icon: <Inbox size={14} /> },
    { id: 'agent' as TabType, label: 'AI Agent (Flazly)', icon: <Bot size={14} /> },
    { id: 'builder' as TabType, label: 'Automation Builder', icon: <Workflow size={14} /> },
    { id: 'analytics' as TabType, label: 'Analytics & ROI', icon: <BarChart3 size={14} /> },
    { id: 'settings' as TabType, label: 'Integrations & Settings', icon: <Sliders size={14} /> }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 mockup-dark">
      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#121826]/80 border border-white/5 rounded-2xl backdrop-blur-lg self-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === tab.id
                ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/20 border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Showcase Panel wrapped in premium gradient border */}
      <div className="premium-gradient-border w-full max-w-6xl mx-auto">
        <div className="premium-card-content overflow-hidden min-h-[520px] flex flex-col relative">
          {/* Top Window bar */}
          <div className="h-11 bg-[#0B1020]/60 border-b border-white/5 flex items-center justify-between px-5 shrink-0 select-none">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <span className="text-[10px] text-zinc-555 font-bold uppercase tracking-wider font-mono">
              flazly_cloud_v1.0.8 // {activeTab.toUpperCase()}
            </span>
            <div className="w-12" />
          </div>

          {/* Dynamic Inner Panel Viewports */}
          <div className="flex-1 p-4 md:p-6 flex flex-col bg-gradient-to-b from-[#0B1020]/20 to-black/20">
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
    </div>
  );
};

// Wrapper for consistent mockup heights
const MockupWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full flex-grow flex flex-col h-[440px]">
      {children}
    </div>
  );
};

// ==========================================
// 2A. TAB SUBMOCKUPS
// ==========================================

// Mockup 1: Inbox Dashboard
const InboxMockup = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="grid lg:grid-cols-[220px_1fr_240px] gap-4 h-[440px] items-stretch text-left"
    >
      {/* Left Chat List Panel */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto">
        <span className="text-[9px] font-bold text-zinc-555 uppercase tracking-wider px-2 mb-1">Conversations</span>

        {/* Chat Item 1 */}
        <div className="p-2 rounded-xl bg-white/5 border border-zinc-700 flex flex-col gap-1 cursor-pointer">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white">@daniel_k</span>
            <span className="text-[7px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-1.5 py-0.5 rounded">Autopilot</span>
          </div>
          <span className="text-[9px] text-zinc-455 truncate font-medium">Wants custom sizes info</span>
          <span className="text-[7.5px] text-[#38BDF8] font-extrabold mt-1">🔥 High Intent</span>
        </div>

        {/* Chat Item 2 */}
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1 hover:bg-white/[0.04] transition-colors cursor-pointer opacity-70">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-300">@sarah.fit</span>
            <span className="text-[7px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Lead</span>
          </div>
          <span className="text-[9px] text-zinc-500 truncate">Qualified lead: Fitness</span>
          <span className="text-[7.5px] text-zinc-455 font-semibold mt-1">Synced to CRM</span>
        </div>

        {/* Chat Item 3 */}
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
        {/* Chat Header */}
        <div className="p-3 bg-black/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] font-bold text-white">
              DK
            </div>
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

        {/* Messages list */}
        <div className="flex-1 p-3 space-y-3.5 overflow-y-auto">
          {/* User Message */}
          <div className="flex gap-2 max-w-[85%]">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-bold shrink-0 text-zinc-305">US</div>
            <div className="bg-zinc-800/80 border border-white/5 p-2.5 rounded-2xl rounded-tl-none">
              <p className="text-[10px] text-zinc-200">
                Hi! Do you have the white sneaker in size 10? How much is it?
              </p>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex gap-2 max-w-[85%] ml-auto justify-end">
            <div className="bg-zinc-850 p-2.5 rounded-2xl rounded-tr-none text-right border border-[#38BDF8]/25">
              <p className="text-[10px] text-white">
                Yes! We have 3 pairs left in size 10. The price is $129 with free shipping. Would you like a checkout link?
              </p>
              <span className="text-[6.5px] font-bold text-zinc-450 uppercase tracking-wide mt-1 block">
                ✦ Automated by Flazly
              </span>
            </div>
            <div className="w-5 h-5 rounded-full bg-[#38BDF8] flex items-center justify-center text-[7px] font-bold shrink-0 text-white font-mono">AI</div>
          </div>

          {/* User Message 2 */}
          <div className="flex gap-2 max-w-[85%]">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-bold shrink-0 text-zinc-300">US</div>
            <div className="bg-zinc-800/80 border border-white/5 p-2.5 rounded-2xl rounded-tl-none">
              <p className="text-[10px] text-zinc-200">
                Yes please! Send details to daniel@gmail.com
              </p>
            </div>
          </div>

          {/* AI Response 2 */}
          <div className="flex gap-2 max-w-[85%] ml-auto justify-end">
            <div className="bg-zinc-850 p-2.5 rounded-2xl rounded-tr-none text-right border border-[#38BDF8]/25">
              <p className="text-[10px] text-white">
                Awesome! I've saved daniel@gmail.com. Here is your checkout link: flazly.com/chk/shoes-10
              </p>
              <span className="text-[6.5px] font-bold text-[#38BDF8] uppercase tracking-wide mt-1 block font-extrabold">
                ✦ Automated by Flazly
              </span>
            </div>
            <div className="w-5 h-5 rounded-full bg-[#38BDF8] flex items-center justify-center text-[7px] font-bold shrink-0 text-white font-mono">AI</div>
          </div>
        </div>

        {/* Input area */}
        <div className="p-2 border-t border-white/5 bg-black/20 flex items-center gap-2">
          <div className="flex-1 bg-white/5 border border-white/5 rounded-xl h-7 px-3 flex items-center text-[9px] text-zinc-500">
            AI is responding. Click to pause autopilot and reply manually...
          </div>
          <button className="h-7 px-3 bg-white/10 border border-white/20 rounded-xl text-[9px] font-bold text-zinc-200 hover:bg-white/20 transition-all cursor-pointer">
            Pause AI
          </button>
        </div>
      </div>

      {/* Right Lead Intelligence Sidebar */}
      <div className="bg-black/30 border border-[#1C2538] rounded-2xl p-4 flex flex-col gap-4 text-left">
        <h5 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest">Lead Intelligence</h5>

        <div className="flex flex-col items-center gap-2 border-b border-white/5 pb-3">
          <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            DK
          </div>
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
              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                Sheets
              </span>
              <span className="text-[8px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                HubSpot
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Mockup 2: AI Agent Instructions
const AgentMockup = () => {
  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 h-[440px] items-stretch text-left">
      {/* Left Instructions Column */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto">
        <h5 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest border-b border-white/5 pb-2">AI Agent Setup</h5>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-350">Agent Persona / System Prompt</label>
          <textarea
            readOnly
            value="You are Flazly, an AI assistant representing flazly.com. Your tone should be extremely friendly, helpful, and outcome-oriented. Help visitors qualify their DMs, answer FAQs regarding products, pricing, features, and setup. Capture lead details from high-intent buyers, or provide a purchase link if they inquire about pricing. If you do not know the answer, ask for their email so our human staff can follow up."
            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-zinc-400 font-mono leading-relaxed resize-none outline-none focus:border-[#38BDF8]/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-350">Confidence Threshold</label>
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-200 font-semibold">92% Match</span>
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#38BDF8]" style={{ width: "92%" }} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-350">Tone Type</label>
            <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex gap-1">
              <span className="text-[9px] font-bold bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] px-2 py-0.5 rounded">
                Warm & Sales
              </span>
              <span className="text-[9px] font-bold text-zinc-555 px-2 py-0.5 rounded">
                Strict FAQ
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-350">Default Integration Action</label>
          <div className="bg-white/[0.02] border border-[#38BDF8]/20 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-[#38BDF8]" />
              <span className="text-[10px] font-bold text-white">Sync Lead to CRM</span>
            </div>
            <span className="text-[8px] text-zinc-555 font-mono">hubspot.crm/leads/flazly</span>
          </div>
        </div>
      </div>

      {/* Right Knowledge Base Panel */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 text-left">
        <h5 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest border-b border-white/5 pb-2">Knowledge Docs</h5>
        <p className="text-[10px] text-zinc-400 leading-normal font-medium">
          Upload catalogs, spreadsheets, FAQs, or policies. Flazly learns instantly.
        </p>

        {/* Upload box */}
        <div className="border border-dashed border-white/10 rounded-xl p-4 text-center bg-black/40 hover:border-[#38BDF8] transition-colors cursor-pointer group flex flex-col items-center justify-center gap-2">
          <Upload size={18} className="text-zinc-400 group-hover:text-[#38BDF8] transition-colors" />
          <span className="text-[10px] font-bold text-zinc-300">Drop PDF or txt files here</span>
          <span className="text-[8px] text-zinc-500">Maximum size limit 20MB per file</span>
        </div>

        {/* Trained files list */}
        <div className="space-y-2 mt-auto">
          {/* File 1 */}
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={14} className="text-[#38BDF8] shrink-0" />
              <span className="text-[9.5px] font-bold text-zinc-300 truncate">summer_pricing_catalog.pdf</span>
            </div>
            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              Trained
            </span>
          </div>

          {/* File 2 */}
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={14} className="text-[#38BDF8] shrink-0" />
              <span className="text-[9.5px] font-bold text-zinc-300 truncate">return_and_shipping_rules.txt</span>
            </div>
            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              Trained
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mockup 3: Automation Workflow Builder
const BuilderMockup = () => {
  return (
    <div className="flex flex-col h-[440px] text-left">
      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4 shrink-0">
        <div>
          <h5 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest">Automation Editor</h5>
          <h6 className="text-xs font-bold text-white mt-0.5">Recipe: Comment &quot;SCALE&quot; to Lead</h6>
        </div>
        <button className="btn-premium-cta px-3 py-1.5 text-[9px] font-bold flex items-center gap-1">
          <Plus size={10} /> Add Node
        </button>
      </div>

      {/* Visual Workspace Canvas */}
      <div className="flex-1 bg-black/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center items-center gap-6">
        <div className="absolute inset-0 dot-grid opacity-[0.1] pointer-events-none" />

        {/* Node 1: Trigger */}
        <div className="bg-[#121826] border border-zinc-700 p-3 rounded-xl w-64 shadow-md relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
            <MessageCircle size={16} />
          </div>
          <div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">1. Trigger</span>
            <span className="text-[10.5px] font-bold text-white">User comments &quot;SCALE&quot; on post</span>
          </div>
        </div>

        {/* Connector Line 1 */}
        <div className="w-0.5 h-6 bg-gradient-to-b from-[#38BDF8] to-[#3B82F6] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-ping" />
        </div>

        {/* Node 2: Action */}
        <div className="bg-[#121826] border border-[#38BDF8]/55 p-3 rounded-xl w-64 shadow-md relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] shrink-0">
            <Send size={16} />
          </div>
          <div>
            <span className="text-[8px] font-bold text-[#38BDF8] uppercase tracking-wider block">2. Action</span>
            <span className="text-[10.5px] font-bold text-white">Send DM with checkout link</span>
          </div>
        </div>

        {/* Connector Line 2 */}
        <div className="w-0.5 h-6 bg-gradient-to-b from-[#3B82F6] to-[#6366F1] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-ping" />
        </div>

        {/* Node 3: Condition Branch */}
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

// Mockup 4: Analytics
const AnalyticsMockup = () => {
  return (
    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4 h-[440px] items-stretch text-left">
      {/* Left Graphs Column */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <h5 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest mb-1 border-b border-white/5 pb-2">Sales Analytics</h5>
          <span className="text-[9px] text-zinc-500 font-medium">Live ROI and automation conversions over the last 30 days.</span>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="h-48 w-full bg-black/20 rounded-xl relative overflow-hidden flex items-end p-2 border border-white/5">
          <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Gradient Fill */}
            <path
              d="M 0 90 Q 20 60, 40 75 T 80 30 T 100 10 L 100 100 L 0 100 Z"
              fill="url(#chart-glow)"
            />
            {/* Chart Line */}
            <motion.path
              d="M 0 90 Q 20 60, 40 75 T 80 30 T 100 10"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
          <div className="absolute top-4 left-4 bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 py-0.5 rounded text-[8px] font-bold text-[#38BDF8]">
            Revenue Trend: +34%
          </div>
          {/* Axis markers */}
          <div className="absolute bottom-1 right-2 text-[7px] text-zinc-500 font-mono">May 1 - May 30</div>
        </div>

        {/* Bottom Metrics Bar */}
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

      {/* Right KPIs Panel */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
        <h5 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest border-b border-white/5 pb-2">Recent Conversions</h5>

        <div className="space-y-2 flex-grow overflow-y-auto py-2">
          {/* Conv 1 */}
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-200 font-bold">SM</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white">@sarah_fit</span>
                <span className="text-[8px] text-zinc-505">Captured Email: sarah@fit.co</span>
              </div>
            </div>
            <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Lead
            </span>
          </div>

          {/* Conv 2 */}
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-200 font-bold">JD</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white">@john_dealz</span>
                <span className="text-[8px] text-zinc-500">Purchased Sneaker White</span>
              </div>
            </div>
            <span className="text-[8px] font-extrabold text-zinc-200 bg-white/10 border border-white/20 px-2 py-0.5 rounded">
              +$129.00
            </span>
          </div>

          {/* Conv 3 */}
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-805 flex items-center justify-center text-[8px] text-zinc-305 font-bold">CL</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white">@coaching_pro</span>
                <span className="text-[8px] text-zinc-505 font-bold">Captured Email</span>
              </div>
            </div>
            <span className="text-[8px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
              Lead Saved
            </span>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-[#121826] border border-[#38BDF8]/20 p-3 rounded-xl text-center">
          <span className="text-[9px] text-zinc-555 uppercase tracking-widest block mb-1">Time Saved This Month</span>
          <span className="text-xl font-black text-[#38BDF8] font-mono">48.5 Hours</span>
          <p className="text-[8px] text-zinc-500 mt-1">Based on 3,820 auto-responses generated 24/7</p>
        </div>
      </div>
    </div>
  );
};

// Mockup 5: Settings / Integrations
const SettingsMockup = () => {
  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 h-[440px] items-stretch text-left">
      {/* Left Integration Columns */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <h5 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest mb-1 border-b border-white/5 pb-2">Platform Connections</h5>
          <span className="text-[9px] text-zinc-555 font-medium">Sync customer details and triggers to your dashboard tools instantly.</span>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          {/* Instagram */}
          <div className="p-3 bg-white/[0.02] border border-[#38BDF8]/20 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold block text-white font-inter">Instagram Business</span>
              <span className="text-[7.5px] text-emerald-404 flex items-center gap-1 font-semibold mt-0.5">
                ● Connected as @flazly
              </span>
            </div>
            <Check size={14} className="text-emerald-400 shrink-0" />
          </div>

          {/* Google Sheets */}
          <div className="p-3 bg-white/[0.02] border border-[#38BDF8]/20 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold block text-white font-inter">Google Sheets</span>
              <span className="text-[7.5px] text-emerald-404 flex items-center gap-1 font-semibold mt-0.5">
                ● Active Leads Sheet
              </span>
            </div>
            <Check size={14} className="text-emerald-400 shrink-0" />
          </div>

          {/* HubSpot */}
          <div className="p-3 bg-white/[0.02] border border-[#38BDF8]/20 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold block text-white font-inter">HubSpot CRM</span>
              <span className="text-[7.5px] text-emerald-404 flex items-center gap-1 font-semibold mt-0.5">
                ● Contact sync active
              </span>
            </div>
            <Check size={14} className="text-emerald-400 shrink-0" />
          </div>

          {/* Slack Notifications */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
            <div>
              <span className="text-[10.5px] font-bold block text-white font-inter">Slack Notifications</span>
              <span className="text-[7.5px] text-zinc-500 mt-0.5">Not configured</span>
            </div>
            <Plus size={14} className="text-[#38BDF8] shrink-0 cursor-pointer" />
          </div>
        </div>

        {/* API Token Box */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-1 font-mono text-[9px] text-[#A5D8FF]">
          <span className="font-sans font-bold text-zinc-300">API Access Token</span>
          <div className="flex items-center justify-between bg-black/60 p-2 rounded border border-white/5 text-zinc-400 mt-1">
            <span>sk_live_2026_zen_ab8201...</span>
            <span className="text-[#38BDF8] font-sans font-bold uppercase cursor-pointer hover:underline">Copy</span>
          </div>
        </div>
      </div>

      {/* Right Webhook Panel */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
        <h5 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest border-b border-white/5 pb-2">Custom Webhooks</h5>
        <p className="text-[10px] text-zinc-455 leading-normal font-medium">
          Send webhook events to your backend on lead qualifications, new lead captures, or payment updates.
        </p>

        <div className="bg-white/[0.02] border border-[#38BDF8]/20 p-3 rounded-xl text-left">
          <span className="text-[8px] font-bold text-zinc-300 uppercase font-mono block">Webhook Endpoint</span>
          <span className="text-[10px] font-mono text-zinc-200 mt-1 block truncate">https://api.yourdomain.com/webhook</span>

          <div className="flex gap-1.5 mt-3">
            <span className="text-[7px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded">
              on_lead_qualify
            </span>
            <span className="text-[7px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded">
              on_lead_capture
            </span>
          </div>
        </div>

        <button className="w-full mt-auto py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-[#38BDF8] transition-all cursor-pointer">
          Test Endpoint
        </button>
      </div>
    </div>
  );
};


// ==========================================
// 3. ROI CALCULATOR COMPONENT (SECTION 9)
// ==========================================
const ROICalculator = () => {
  const [dms, setDms] = useState(2500);
  const [conversionRate, setConversionRate] = useState(5);
  const [dealValue, setDealValue] = useState(150);

  const capturedDMs = dms * 0.45;
  const qualifiedLeads = capturedDMs * (conversionRate / 100);
  const monthlyRevenue = qualifiedLeads * dealValue;
  const annualRevenue = monthlyRevenue * 12;

  return (
    <div className="w-full grid lg:grid-cols-2 gap-12 items-stretch max-w-6xl mx-auto text-left">
      {/* Sliders Block */}
      <div className="premium-gradient-border shadow-2xl">
        <div className="premium-card-content p-8 flex flex-col justify-between h-full">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Interactive Model</span>
            <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-3">Adjust Your Metrics</h3>
            <p className="text-xs text-zinc-450 leading-relaxed font-medium mt-1">
              Fine-tune the parameters below to calculate how much revenue you stand to recover by deploying Flazly AI automations.
            </p>
          </div>

          <div className="space-y-8">
            {/* Slider 1 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Monthly Instagram DMs</span>
                <span className="text-[#4F39F6] font-mono font-bold text-base">{dms.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={dms}
                onChange={(e) => setDms(Number(e.target.value))}
                className="w-full h-1.5 bg-[#121826] border border-white/5 rounded-lg appearance-none cursor-pointer accent-[#4F39F6]"
              />
              <div className="flex justify-between text-[10px] text-zinc-555 font-mono">
                <span>500</span>
                <span>20,000+</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Current Conversion Rate</span>
                <span className="text-[#4F39F6] font-mono font-bold text-base">{conversionRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full h-1.5 bg-[#121826] border border-white/5 rounded-lg appearance-none cursor-pointer accent-[#4F39F6]"
              />
              <div className="flex justify-between text-[10px] text-zinc-555 font-mono">
                <span>1%</span>
                <span>25%</span>
              </div>
            </div>

            {/* Slider 3 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Average Customer Value (LTV)</span>
                <span className="text-[#4F39F6] font-mono font-bold text-base">${dealValue}</span>
              </div>
              <input
                type="range"
                min="20"
                max="1500"
                step="10"
                value={dealValue}
                onChange={(e) => setDealValue(Number(e.target.value))}
                className="w-full h-1.5 bg-[#121826] border border-white/5 rounded-lg appearance-none cursor-pointer accent-[#4F39F6]"
              />
              <div className="flex justify-between text-[10px] text-zinc-555 font-mono">
                <span>$20</span>
                <span>$1,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculations / Output Panel */}
      <div className="premium-gradient-border shadow-2xl">
        <div className="premium-card-content p-8 md:p-10 flex flex-col justify-between h-full relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/5 blur-[80px] rounded-full -z-10" />

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recovered Lost Conversions</span>
            <div className="text-5xl md:text-6xl font-black roi-recovered-revenue mt-4 mb-3 tracking-tight font-sans">
              ${Math.round(monthlyRevenue).toLocaleString()}
            </div>
            <span className="text-xs font-semibold text-zinc-550">Recovered Revenue / Month</span>
          </div>

          <div className="h-px bg-white/5 my-6" />

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] text-zinc-550 uppercase tracking-wider block mb-1">Additional Leads</span>
              <span className="text-lg font-bold text-white font-mono">{Math.round(qualifiedLeads).toLocaleString()} /mo</span>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] text-zinc-555 uppercase tracking-wider block mb-1">Estimated Annual Growth</span>
              <span className="text-lg font-bold text-[#4F39F6] font-mono">${Math.round(annualRevenue).toLocaleString()} /yr</span>
            </div>
          </div>

          <p className="text-[10.5px] text-zinc-500 font-medium leading-relaxed mt-6">
            *Calculation assumes a conservative recovery of 45% of customer inquiries lost due to delayed response times and lack of manual follow-ups.
          </p>

          <Link
            to="/signup"
            className="btn-premium-cta mt-8 w-full py-4 text-sm font-extrabold flex items-center justify-center gap-2 group"
          >
            Stop Leaving Money On The Table
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 4. FAQ ACCORDION COMPONENT (SECTION 12)
// ==========================================
const FAQItemComponent = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border border-white/5 rounded-2xl p-6 bg-[#121826]/40 hover:bg-[#121826]/60 transition-all duration-300 relative overflow-hidden text-left ${isOpen ? 'ring-1 ring-[#38BDF8]/20 border-[#38BDF8]' : ''
      }`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#38BDF8] to-[#6366F1] transition-all duration-500 origin-top ${isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        }`} />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group outline-none"
      >
        <span className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors font-inter">
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all shrink-0 ${isOpen
            ? 'border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]'
            : 'border-white/10 text-zinc-555 group-hover:border-white/20'
          }`}>
          <ChevronDown size={14} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              {faqMarkdownLinkFix(answer)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const faqMarkdownLinkFix = (text: string) => {
  return text;
};

// ==========================================
// 4B. INSTAGRAM MOBILE MOCKUP COMPONENT
// ==========================================
const InstagramMobileMockup = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 7);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto w-[310px] sm:w-[320px] h-[620px] rounded-[44px] border-[10px] border-zinc-800 bg-[#000000] shadow-[0_25px_60px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden select-none mockup-dark">
      {/* Notch / Dynamic Island */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-zinc-900 rounded-full z-40 flex items-center justify-center border border-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 absolute right-4" />
      </div>

      {/* Screen Header / Status Bar */}
      <div className="h-12 bg-black flex items-end justify-between px-6 pb-2 text-[10px] text-white/95 font-semibold shrink-0 z-30">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          {/* Signal */}
          <div className="flex items-end gap-[1px] h-2">
            <div className="w-[2px] h-[3px] bg-white rounded-[0.5px]" />
            <div className="w-[2px] h-[4.5px] bg-white rounded-[0.5px]" />
            <div className="w-[2px] h-[6px] bg-white rounded-[0.5px]" />
            <div className="w-[2px] h-[8px] bg-white rounded-[0.5px]" />
          </div>
          {/* Wifi */}
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 21l-12-12c6.627-6.627 17.373-6.627 24 0l-12 12zm0-18c-5.114 0-9.845 2.062-13.332 5.393l1.328 1.328c3.136-2.954 7.348-4.721 12.004-4.721 4.656 0 8.868 1.767 12.004 4.721l1.328-1.328c-3.487-3.331-8.218-5.393-13.332-5.393z" />
          </svg>
          {/* Battery */}
          <div className="w-5 h-2.5 rounded-[3px] border border-white/50 p-[1px] flex items-center">
            <div className="h-full w-3.5 bg-white rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Instagram App Header */}
      <div className="bg-[#0c0c0d] border-b border-zinc-900/60 py-2.5 px-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <ChevronLeft size={20} className="text-white cursor-pointer" />
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#121214] flex items-center justify-center text-[9px] font-black text-white">
                JD
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0c0c0d]" />
          </div>
          {/* Username & Status */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white tracking-tight">jordan.design</span>
              <svg className="w-3.5 h-3.5 text-[#38BDF8]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <span className="text-[7.5px] text-[#00e676] font-extrabold tracking-wide uppercase">● Active now</span>
          </div>
        </div>

        {/* Header Icons */}
        <div className="flex items-center gap-4 text-white/90">
          <Phone size={16} className="cursor-pointer hover:opacity-80" />
          <Video size={16} className="cursor-pointer hover:opacity-80" />
          <Info size={16} className="cursor-pointer hover:opacity-80" />
        </div>
      </div>

      {/* Chat Messages Feed Area */}
      <div className="flex-1 bg-black p-4 overflow-y-auto flex flex-col gap-4 text-left font-sans text-xs scrollbar-none z-10">
        {/* Step 0+: Welcome Auto-Reply message */}
        {step >= 0 && (
          <div className="flex flex-col items-end gap-1.5 self-end max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white p-3 rounded-2xl rounded-tr-sm shadow-md leading-relaxed font-semibold">
              Welcome to jordan.design! 👋 Let us know if you have any questions about pricing, sizing, or shipping.
            </div>
            <span className="text-[7.5px] font-bold text-[#EC4899] uppercase tracking-widest mr-1">
              ✨ AUTO-REPLY
            </span>
          </div>
        )}

        {/* Step 1: User Typing Indicator */}
        {step === 1 && (
          <div className="flex gap-2 items-center self-start">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[7.5px] font-bold text-zinc-400">US</div>
            <div className="bg-[#26262b] px-3.5 py-2.5 rounded-2xl rounded-tl-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-405 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-405 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-405 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Step 2+: User Inbound Message 1 */}
        {step >= 2 && (
          <div className="flex gap-2 items-start self-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-6 h-6 rounded-full bg-zinc-850 flex items-center justify-center text-[7.5px] font-bold text-zinc-305 shrink-0 select-none">US</div>
            <div className="bg-[#26262b] text-white p-3 rounded-2xl rounded-tl-sm font-semibold">
              Hey! Do you ship to Canada? CA
            </div>
          </div>
        )}

        {/* Step 3: Agent Typing Indicator */}
        {step === 3 && (
          <div className="flex flex-col items-end gap-1.5 self-end max-w-[85%]">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 py-2.5 rounded-2xl rounded-tr-sm flex gap-1 items-center justify-center shadow-md">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[7.5px] font-bold text-[#8B5CF6] uppercase tracking-widest mr-1 flex items-center gap-1 select-none">
              ⚡ AGENT TYPING
            </span>
          </div>
        )}

        {/* Step 4+: AI Response 2 */}
        {step >= 4 && (
          <div className="flex flex-col items-end gap-1.5 self-end max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white p-3 rounded-2xl rounded-tr-sm shadow-md leading-relaxed font-semibold">
              Yes, we ship standard worldwide! 🌏 Shipping to Canada is ₹499. Would you like me to hold one?
            </div>
            <span className="text-[7.5px] font-bold text-[#EC4899] uppercase tracking-widest mr-1">
              ✨ AUTO-REPLY
            </span>
          </div>
        )}

        {/* Step 5: User Typing Indicator 2 */}
        {step === 5 && (
          <div className="flex gap-2 items-center self-start">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[7.5px] font-bold text-zinc-400">US</div>
            <div className="bg-[#26262b] px-3.5 py-2.5 rounded-2xl rounded-tl-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-405 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-405 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-405 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Step 6+: User Inbound Message 2 */}
        {step >= 6 && (
          <div className="flex gap-2 items-start self-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-6 h-6 rounded-full bg-zinc-850 flex items-center justify-center text-[7.5px] font-bold text-zinc-305 shrink-0 select-none">US</div>
            <div className="bg-[#26262b] text-white p-3 rounded-2xl rounded-tl-sm font-semibold">
              Yes please! The standard hoodie in black, size L.
            </div>
          </div>
        )}
      </div>

      {/* Instagram Message Input Footer Bar */}
      <div className="p-3 bg-[#0c0c0d] border-t border-zinc-900/60 flex items-center gap-2.5 shrink-0 z-20">
        <div className="w-7 h-7 rounded-full bg-[#0095f6] flex items-center justify-center text-white cursor-pointer hover:bg-[#1880e6] transition-colors">
          <Camera size={14} fill="currentColor" />
        </div>
        <div className="flex-1 bg-black border border-zinc-800/80 rounded-full h-8.5 px-3.5 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Message...</span>
          <div className="flex items-center gap-3 text-zinc-500">
            <Mic size={14} className="cursor-pointer hover:text-white transition-colors" />
            <Image size={14} className="cursor-pointer hover:text-white transition-colors" />
            <Smile size={14} className="cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
const ProblemStorytelling = () => {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [scene, setScene] = useState(1);
  const [timer, setTimer] = useState("00:00");
  const [status, setStatus] = useState("Interested");
  const [showAiReply, setShowAiReply] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersecting) {
      setScene(1);
      setTimer("00:00");
      setStatus("Interested");
      setShowAiReply(false);
      setShowTyping(false);
      return;
    }

    let timeouts: any[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timeouts.push(setTimeout(fn, delay));
    };

    const runAnimation = () => {
      // Clear previous timeouts
      timeouts.forEach(clearTimeout);
      timeouts = [];

      // Scene 1: New Lead Arrives
      setScene(1);
      setTimer("00:00");
      setStatus("Interested");
      setShowAiReply(false);
      setShowTyping(false);

      // Scene 2: Waiting
      schedule(() => {
        setScene(2);
        setTimer("00:00");
        setStatus("Interested");
      }, 2500);

      schedule(() => { setTimer("00:30"); setStatus("Waiting"); }, 3300);
      schedule(() => { setTimer("01:00"); setStatus("Waiting"); }, 4100);
      schedule(() => { setTimer("03:00"); setStatus("Losing Interest"); }, 4900);
      schedule(() => { setTimer("05:00"); setStatus("Gone"); }, 5700);

      // Scene 3: Lost Opportunity
      schedule(() => {
        setScene(3);
        setTimer("05:00");
        setStatus("Gone");
      }, 6200);

      // Scene 4: Time Rewinds
      schedule(() => {
        setScene(4);
        setTimer("Rewinding...");
        setStatus("Resetting");
      }, 8700);

      // Scene 5: Instant AI Response
      schedule(() => {
        setScene(5);
        setTimer("⚡ < 2s");
        setStatus("Active");
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
        setStatus("Automating");
      }, 13000);

      // Scene 7: Conversion
      schedule(() => {
        setScene(7);
        setTimer("⚡ < 2s");
        setStatus("Success");
      }, 16000);
    };

    runAnimation();
    const interval = setInterval(runAnimation, 19500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [isIntersecting]);

  return (
    <div ref={sectionRef} className="grid lg:grid-cols-12 gap-8 items-stretch mt-16 w-full text-zinc-900 dark:text-white">
      {/* MOCKUP CONTAINER - 7 cols */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center">
        <div className="mockup-dark w-full max-w-[360px] h-[540px] rounded-[32px] border border-zinc-200/20 dark:border-zinc-800 bg-[#09090b] text-white flex flex-col shadow-2xl relative overflow-hidden">
          {/* Header Status Bar Mockup */}
          <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[9px] font-bold text-zinc-400 select-none border-b border-zinc-900/40 shrink-0">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-2.5 h-2.5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.07 20.2 10.47 20.5 12 20.5c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
              </svg>
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
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 z-25"
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
                'bg-zinc-100 dark:bg-zinc-800 text-zinc-450'
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
              {/* Scene 1 & 2 */}
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

              {/* Scene 3: Lost Opportunity */}
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

              {/* Scene 4: Rewind */}
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

              {/* Scene 5 */}
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

              {/* Scene 6 */}
              {scene === 6 && (
                <motion.div
                  key="workflow-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h4 className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle size={16} /> Automated Engagement Flow
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

              {/* Scene 7 */}
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


// ==========================================
// 4.6. HOW IT WORKS INTEGRATIONS FLOW CANVAS
// ==========================================
const IntegrationsFlowCanvas = ({ activeStep }: { activeStep: number }) => {
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
        <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-white/5">
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
              {/* Instagram Source Node and Flazly Node connected */}
              <div className="flex items-center justify-between w-full max-w-[320px] relative">
                {/* SVG connection line with pulsing dashed dashArray */}
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

                {/* Middle connector status */}
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
              {/* Intent flow diagram */}
              <div className="w-full max-w-[340px] space-y-3">
                {/* Simulated Inbound message */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[7.5px] font-bold text-zinc-400">US</div>
                  <div className="bg-zinc-100 dark:bg-zinc-850 p-2.5 rounded-xl text-[10.5px] leading-snug font-medium text-zinc-700 dark:text-zinc-305 max-w-[220px]">
                    "Can I buy the hoodie? Do you ship to Germany?"
                  </div>
                </div>

                {/* Processing node */}
                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 flex-1" />
                  <div className="bg-[#4F39F6]/10 border border-[#4F39F6]/20 px-3 py-1 rounded-full text-[9px] font-mono text-[#818CF8] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] animate-ping" />
                    Flazly NLP Processing
                  </div>
                  <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 flex-1" />
                </div>

                {/* Extracted Intent / Reply */}
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
                {/* Core Node left */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#818CF8] to-[#4F39F6] flex items-center justify-center shadow-lg text-white">
                    <Zap size={22} />
                  </div>
                  <span className="text-[9px] font-bold text-[#818CF8]">Flazly AI</span>
                </div>

                {/* Dash branch lines */}
                <svg className="absolute inset-0 w-full h-full z-0" pointerEvents="none" viewBox="0 0 320 120">
                  {/* Branch to top right */}
                  <path d="M 50 60 Q 120 20 240 25" fill="none" stroke="#4F39F6" strokeWidth="1.5" strokeDasharray="5 3" className="animate-[dash_10s_linear_infinite]" />
                  {/* Branch to middle right */}
                  <path d="M 50 60 L 240 60" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="5 3" className="animate-[dash_10s_linear_infinite]" />
                  {/* Branch to bottom right */}
                  <path d="M 50 60 Q 120 100 240 95" fill="none" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="5 3" className="animate-[dash_10s_linear_infinite]" />
                </svg>

                {/* Right integration stack */}
                <div className="flex flex-col gap-2.5 z-10 w-[150px]">
                  {/* Sheets Node */}
                  <div className="flex items-center gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/25 p-2 rounded-lg text-[9px] font-bold text-emerald-500">
                    <Database size={12} />
                    <span className="truncate">Google Sheets Sync</span>
                  </div>

                  {/* HubSpot Node */}
                  <div className="flex items-center gap-2 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/25 p-2 rounded-lg text-[9px] font-bold text-orange-500">
                    <Workflow size={12} />
                    <span className="truncate">HubSpot CRM Deal</span>
                  </div>

                  {/* Webhook Node */}
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

      {/* Footer detail */}
      <div className="border-t border-zinc-100 dark:border-white/5 pt-3 flex items-center justify-between text-[8.5px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 shrink-0 z-10">
        <span>Pipeline Activity Monitor</span>
        <span>Secure connection active</span>
      </div>
    </div>
  );
};


// ==========================================
// 5. MAIN LANDING COMPONENT
// ==========================================
type TabType = 'inbox' | 'agent' | 'builder' | 'analytics' | 'settings';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoRotate]);

  return (
    <div className="landing-page bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter selection:bg-[#38BDF8]/10 selection:text-[#38BDF8] min-h-screen relative overflow-x-hidden">

      {/* Animated Grid Background for Hero Section */}
      <div className="absolute top-0 inset-x-0 h-[1000px] hero-line-grid pointer-events-none select-none z-0" />

      {/* Premium Shifting Mesh Gradient Backdrop */}
      <div className="absolute top-0 inset-x-0 h-[1000px] overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute -top-[20%] left-[10%] w-[60%] h-[70%] rounded-full bg-[#818CF8]/5 dark:bg-[#818CF8]/10 blur-[120px] animate-mesh-glow-1" />
        <div className="absolute -top-[30%] right-[10%] w-[50%] h-[60%] rounded-full bg-[#3B82F6]/6 dark:bg-[#3B82F6]/12 blur-[140px] animate-mesh-glow-2" />
        <div className="absolute top-[10%] left-[30%] w-[40%] h-[50%] rounded-full bg-[#06B6D4]/4 dark:bg-[#06B6D4]/8 blur-[100px] animate-mesh-glow-3" />
      </div>

      {/* Left side automation connection lines */}
      <div className="absolute top-[120px] left-0 w-[20%] max-w-[300px] h-[600px] pointer-events-none select-none z-0 hidden lg:block opacity-[0.6] dark:opacity-[0.7]">
        <svg className="w-full h-full" viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-50 50 C 150 150, 100 300, 50 450 C 0 550, 100 600, -50 650" stroke="url(#leftLineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M-50 50 C 150 150, 100 300, 50 450 C 0 550, 100 600, -50 650" stroke="url(#leftLineGrad)" strokeWidth="1.5" className="animate-flow-dash" />
          <circle r="3" fill="#3B82F6">
            <animateMotion dur="10s" repeatCount="indefinite" path="M-50 50 C 150 150, 100 300, 50 450 C 0 550, 100 600, -50 650" />
          </circle>
          <defs>
            <linearGradient id="leftLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Right side automation connection lines */}
      <div className="absolute top-[160px] right-0 w-[20%] max-w-[300px] h-[600px] pointer-events-none select-none z-0 hidden lg:block opacity-[0.6] dark:opacity-[0.7]">
        <svg className="w-full h-full" viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M250 80 C 50 180, 100 320, 150 420 C 200 520, 80 580, 250 630" stroke="url(#rightLineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M250 80 C 50 180, 100 320, 150 420 C 200 520, 80 580, 250 630" stroke="url(#rightLineGrad)" strokeWidth="1.5" className="animate-flow-dash" />
          <circle r="3" fill="#06B6D4">
            <animateMotion dur="12s" repeatCount="indefinite" path="M250 80 C 50 180, 100 320, 150 420 C 200 520, 80 580, 250 630" />
          </circle>
          <defs>
            <linearGradient id="rightLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Subtle bottom/mid radial glows for scroll depth */}
      <div className="absolute top-[1500px] left-0 w-[500px] h-[500px] bg-[#3B82F6]/3 blur-[120px] pointer-events-none" />
      <div className="absolute top-[2500px] right-0 w-[500px] h-[500px] bg-[#06B6D4]/3 blur-[120px] pointer-events-none" />

      {/* NAVBAR */}
      <Navbar />

      <main className="pt-[72px]">

        {/* ==========================================
            SECTION 1 — HERO WITH EMBEDDED PRODUCT SHOWCASE
            ========================================== */}
        <section className="relative pt-16 pb-28 z-10 overflow-hidden text-center">
          <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4F39F6]/10 border border-[#4F39F6]/20 mb-6 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F39F6] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">
                AI Instagram Sales Agent
              </span>
            </div>

            {/* Headline with visual gradient spec */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-balance text-zinc-950 dark:text-white max-w-4xl leading-[1.1]">
              Turn Instagram DMs Into <span className="text-headline-gradient">Qualified Leads</span> Automatically
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-zinc-650 dark:text-zinc-400 font-medium leading-relaxed mb-10 text-balance max-w-3xl">
              Flazly instantly responds to DMs, story replies, and comment triggers, qualifies prospects with AI, captures customer details, and helps businesses convert more conversations into customers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16">
              <button
                onClick={() => navigate('/signup')}
                className="btn-premium-cta w-full sm:w-auto px-10 py-5 text-sm font-bold flex items-center justify-center gap-2 group"
              >
                Start Free 14-Day Trial
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#demo"
                className="w-full sm:w-auto px-10 py-5 rounded-xl text-sm font-bold bg-white dark:bg-[#121826] border border-zinc-200 dark:border-white/10 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Play size={14} fill="currentColor" />
                Watch Demo
              </a>
            </div>

            {/* Showcase dashboard preview directly in the Hero */}
            <div id="demo" className="w-full mt-4">
              <ProductShowcase />
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 2 — TRUST STRIP
            ========================================== */}
        <section className="py-8 border-y border-zinc-200/80 dark:border-white/5 bg-zinc-100/30 dark:bg-[#121826]/10 backdrop-blur-xl relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-zinc-550 dark:text-zinc-400 text-xs font-bold tracking-wider uppercase">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Meta Graph API Integration
              </span>
              <span className="flex items-center gap-2">
                <Lock size={16} className="text-[#38BDF8]" /> Secure OAuth Auth
              </span>
              <span className="flex items-center gap-2">
                <Bot size={16} className="text-[#3B82F6]" /> AI-Powered Conversations
              </span>
              <span className="flex items-center gap-2">
                <Users size={16} className="text-purple-400" /> Human Takeover Available
              </span>
              <span className="flex items-center gap-2">
                <Database size={16} className="text-blue-400" /> Sheets & CRM Sync
              </span>
              <span className="flex items-center gap-2">
                <Workflow size={16} className="text-pink-400" /> Webhook Support
              </span>
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 3 — PROBLEM SECTION
            ========================================== */}
        <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b] border-t border-zinc-200/80 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">THE COST OF MANUAL DM MANAGEMENT</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-zinc-900 dark:text-white leading-tight mt-3">
                Every Unanswered DM Is Lost Revenue
              </h2>
              <p className="text-sm md:text-base text-zinc-650 dark:text-zinc-400 font-medium leading-relaxed mt-2 text-balance">
                Potential customers are messaging your business right now. Slow replies, missed follow-ups, and manual processes cause leads to disappear before they ever become customers.
              </p>
            </div>

            <ProblemStorytelling />
          </div>
        </section>


        {/* ==========================================
            SECTION 4 — HOW FLAZLY WORKS
            ========================================== */}
        <section className="py-28 border-t border-zinc-200/80 dark:border-white/5 relative overflow-hidden bg-gradient-to-b from-[#fafafa] via-zinc-100/50 to-[#fafafa] dark:from-[#09090b] dark:via-[#121826]/30 dark:to-[#09090b]">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column: 3 Steps */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">How It Works</span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-3 mb-6">
                  3 Steps to Automated Lead Capture
                </h2>
                <p className="text-sm md:text-base text-zinc-550 dark:text-zinc-400 font-medium mb-12">
                  Turn your Instagram profile into a 24/7 lead generation engine in minutes.
                </p>

                <div className="space-y-6">
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
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveStep(idx);
                        setAutoRotate(false);
                      }}
                      className={`flex gap-6 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                        activeStep === idx
                          ? "bg-white dark:bg-[#121826]/40 border-zinc-200/80 dark:border-white/5 shadow-sm"
                          : "border-transparent opacity-65 hover:opacity-100"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold font-mono shrink-0 transition-all duration-300 ${
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Interactive Platform Pipeline */}
              <div className="flex flex-col items-center justify-center">
                <IntegrationsFlowCanvas activeStep={activeStep} />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-6">
                  Interactive Platform Pipeline
                </span>
              </div>
            </div>

            {/* Examples block below */}
            <div className="bg-zinc-100/50 dark:bg-[#121826]/20 border border-zinc-200/80 dark:border-white/5 p-8 rounded-3xl max-w-4xl mx-auto mt-20">
              <h4 className="text-sm font-bold text-zinc-650 dark:text-zinc-300 uppercase tracking-widest text-center mb-8">
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
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono block truncate">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 5 — BENEFITS
            ========================================== */}
        <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Business Outcomes</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Capture Leads On Autopilot, 24/7
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium">
                Designed to minimize manual workload and maximize conversion rates inside Instagram.
              </p>
            </div>

            {/* Desktop Layout: Central AI Engine with connection lines and floating cards */}
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

              <style dangerouslySetInnerHTML={{__html: `
                @keyframes dash {
                  to {
                    stroke-dashoffset: -180;
                  }
                }
                .animate-dash {
                  animation: dash 5s linear infinite;
                }
              `}} />

              {/* Central AI Engine Dial */}
              <div className="absolute top-[340px] left-[500px] -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative w-52 h-52 flex items-center justify-center">
                  <div className="absolute w-40 h-40 rounded-full bg-[#4F39F6]/15 dark:bg-[#4F39F6]/25 blur-2xl animate-pulse"></div>
                  <div className="absolute w-48 h-48 rounded-full border border-dashed border-[#818CF8]/30 animate-spin" style={{ animationDuration: '40s' }}></div>
                  <div className="absolute w-40 h-40 rounded-full border border-zinc-200/50 dark:border-white/5 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>

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
              {[
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
              ].map((benefit, idx) => (
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
                  <div className="absolute w-36 h-36 rounded-full bg-[#4F39F6]/10 dark:bg-[#4F39F6]/20 blur-xl animate-pulse"></div>
                  <div className="absolute w-40 h-40 rounded-full border border-dashed border-[#818CF8]/25 animate-spin" style={{ animationDuration: '50s' }}></div>
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
                {[
                  {
                    icon: <Bot size={20} />,
                    title: "Never Miss A Lead",
                    desc: "Reply instantly 24/7. Always capture warm leads when user intent and attention is highest."
                  },
                  {
                    icon: <Workflow size={20} />,
                    title: "Qualify Leads Automatically",
                    desc: "Identify serious buyers, extract email/phone contact details, and score interest in-thread."
                  },
                  {
                    icon: <MessageCircle size={20} />,
                    title: "Convert Comments Into Conversations",
                    desc: "Automatically DM users who comment on your posts or reels to launch automated qualification flows."
                  },
                  {
                    icon: <Clock size={20} />,
                    title: "Save Hours Every Week",
                    desc: "Eliminate manual copy-pasting, repetitive FAQ handling, and tedious lead logging workflows."
                  },
                  {
                    icon: <Users size={20} />,
                    title: "Human Takeover Anytime",
                    desc: "Seamlessly pause the AI autopilot to step in and converse with high-value leads manually."
                  }
                ].map((benefit, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 rounded-3xl p-6 text-left shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#38BDF8] border border-sky-500/20 flex items-center justify-center mb-4 shrink-0 font-semibold">
                      {benefit.icon}
                    </div>
                    <h3 className="text-base font-bold mb-2 text-zinc-900 dark:text-white font-inter">{benefit.title}</h3>
                    <p className="text-xs text-zinc-650 dark:text-zinc-450 leading-relaxed font-medium font-sans">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 6 — PRODUCT SHOWCASE / MODULE DEEP DIVE
            ========================================== */}
        <section className="py-28 border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/10 dark:bg-[#121826]/10 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Core Capabilities</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4">
                Designed to Generate More Business Leads
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium">
                Everything you need to automate conversations, capture details, and scale lead collection.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Inbox",
                  desc: "Human-in-the-loop control. Monitor automated conversations, toggle autopilot pause/resume, and tag client statuses.",
                  feats: ["Live chat stream", "One-click AI pause", "Lead status tags"],
                  gridClass: "md:col-span-1",
                  visual: (
                    <div className="w-full bg-zinc-50/50 dark:bg-[#121826]/30 border border-zinc-200/50 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2.5 mb-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                      <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        <span>Inbox Stream</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>Live</span>
                      </div>
                      <div className="flex items-center justify-between bg-white dark:bg-[#090b11]/80 p-2.5 rounded-xl border border-zinc-150 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center text-[10px] font-extrabold shrink-0">JD</div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-zinc-900 dark:text-white truncate">John Doe</span>
                            <span className="text-[8px] text-zinc-500 dark:text-zinc-450 truncate">"Price list please?"</span>
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
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-[#0c0f1a] rounded-full"></span>
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
                            <div className="bg-indigo-500 h-full w-full rounded-full"></div>
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
                      <div className="bg-white dark:bg-[#090b11]/80 px-2.5 py-1.5 rounded-xl border border-zinc-150 dark:border-white/5 shadow-sm text-[9px] font-bold text-zinc-700 dark:text-zinc-350">
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
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
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
                              <span className="text-zinc-500 dark:text-zinc-450 truncate">{lead.email}</span>
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
                          <span className="text-[8px] text-zinc-500 dark:text-zinc-450">1,240 recipients</span>
                        </div>
                        <div className="text-[11px] font-extrabold text-indigo-500 shrink-0">92%</div>
                      </div>
                    </div>
                  )
                }
              ].map((mod, idx) => {
                const isColSpan2 = mod.gridClass.includes('col-span-2');
                const cardContent = (
                  <div className={`flex flex-col h-full justify-between gap-6 ${isColSpan2 ? 'lg:flex-row lg:items-center' : ''}`}>
                    {/* Render visual at the top for 1-column cards */}
                    {!isColSpan2 && mod.visual && (
                      <div className="w-full shrink-0">
                        {mod.visual}
                      </div>
                    )}

                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 font-inter">{mod.title}</h3>
                        <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed mb-6 font-medium font-sans">{mod.desc}</p>
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

                    {/* Render visual at the right for 2-column cards */}
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


        {/* ==========================================
            SECTION 7 — USE CASES
            ========================================== */}
        <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Tailored Solutions</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4">
                Who Uses Flazly?
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium">
                Maximize the ROI of your social audience and convert inbound intent.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
              {[
                {
                  title: "E-commerce Brands",
                  desc: "Generate more qualified leads and sales from product availability or shipping inquiries in the inbox."
                },
                {
                  title: "Coaches & Consultants",
                  desc: "Qualify inbound prospects and capture email/phone details before directing them to consultation links."
                },
                {
                  title: "Agencies",
                  desc: "Manage and run high-performing Instagram lead generation campaigns for multiple client accounts seamlessly."
                },
                {
                  title: "Creators",
                  desc: "Automatically DM commenters and story replies, converting views and followers into qualified leads."
                },
                {
                  title: "Local Businesses",
                  desc: "Capture store inquiries, location requests, and customer contact information 24/7."
                }
              ].map((uc, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 flex flex-col justify-between hover:border-[#38BDF8]/20 dark:hover:border-[#38BDF8]/40 transition-all shadow-sm hover:shadow-md">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2 font-inter">{uc.title}</h3>
                    <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">{uc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 8 — SOCIAL PROOF & OUTCOMES
            ========================================== */}
        <section className="py-28 border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/20 dark:bg-[#121826]/20 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Success Stories</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Trusted by High-Growth Brands
              </h2>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { label: "DMs Automated", value: "10M+", icon: <MessageCircle size={20} /> },
                { label: "Leads Captured", value: "500K+", icon: <Users size={20} /> },
                { label: "Response Time", value: "< 1s", icon: <Clock size={20} /> },
                { label: "Businesses Connected", value: "5,000+", icon: <Sparkles size={20} /> },
              ].map((metric, i) => (
                <div key={i} className="bg-[#121826]/40 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4 text-[#38BDF8]">
                    {metric.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">{metric.value}</div>
                  <div className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest font-mono">{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-2 gap-8 text-left">
              {[
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
              ].map((t, i) => (
                <div key={i} className="premium-gradient-border">
                  <div className="premium-card-content p-8 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={14} className="fill-[#38BDF8] text-[#38BDF8]" />
                        ))}
                      </div>
                      <p className="text-sm md:text-base text-zinc-200 leading-relaxed font-medium italic mb-8 font-inter">
                        &quot;{t.quote}&quot;
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                          {t.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white leading-tight font-inter">{t.name}</span>
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


        {/* ==========================================
            SECTION 9 — SECURITY & TRUST
            ========================================== */}
        <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b] border-t border-zinc-200/80 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Enterprise Security</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Secure Connections, Complete Control
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium">
                We safeguard your Instagram business account with enterprise-grade data protection.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {[
                {
                  title: "Built on Meta Graph API",
                  desc: "Connects securely using the Instagram Messaging API. Built to strictly adhere to Meta's developer policies."
                },
                {
                  title: "Secure OAuth Authentication",
                  desc: "Zero password sharing required. Authorize connections securely through Meta's native Login dialog."
                },
                {
                  title: "Data Protection",
                  desc: "Lead details and contact logs are fully encrypted. GDPR and CCPA compliant data protection protocols."
                },
                {
                  title: "Role-Based Access",
                  desc: "Protect sensitive lead data and settings with team access permissions for your support staff."
                },
                {
                  title: "Business Account Security",
                  desc: "Sandbox environment validation and compliance audits ensure safety for large brand channels."
                },
                {
                  title: "Human Oversight Controls",
                  desc: "Seamless AI override systems mean your team can step in and take manual control at any instant."
                }
              ].map((sec, idx) => (
                <div key={idx} className="bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 rounded-3xl p-8 hover:border-[#38BDF8]/20 dark:hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-md">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-3 font-inter">{sec.title}</h3>
                    <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">{sec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 10 — ROI CALCULATOR
            ========================================== */}
        <section className="py-28 relative border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/10 dark:bg-[#121826]/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">ROI Calculator</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white mt-3">
                Calculate Your Recovered Revenue
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium">
                See how much revenue is left unrecovered without automated lead pipelines.
              </p>
            </div>

            <ROICalculator />
          </div>
        </section>


        {/* ==========================================
            SECTION 11 — PRICING (GROWTH DOMINANT)
            ========================================== */}
        <section id="pricing" className="py-28 border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/10 dark:bg-[#121826]/10 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Pricing Plans</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed">
                Scale your lead capture volume. All plans include our 14-day free trial.
              </p>
            </div>

            {/* Pricing tiers grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-[1000px] mx-auto items-stretch text-left">
              {[
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
              ].map((tier, idx) => (
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
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-[9px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-[#38BDF8]/20">
                          Most Popular
                        </span>
                      )}

                      <div>
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-white mb-1.5 font-inter">{tier.name}</h3>
                          <p className="text-xs text-zinc-400 font-medium leading-relaxed">{tier.desc}</p>
                        </div>

                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                          <span className="text-sm font-bold text-zinc-500">/mo</span>
                        </div>

                        <div className="mb-8 border-b border-white/5 pb-6">
                          <span className="text-lg font-bold text-[#38BDF8] font-mono">{tier.volume}</span>
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mt-1">
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
                        className={`w-full py-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${tier.popular
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


        {/* ==========================================
            SECTION 12 — FAQ
            ========================================== */}
        <section id="faq" className="py-28 border-t border-zinc-200/80 dark:border-white/5 bg-[#fafafa] dark:bg-[#09090b] relative">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Have Questions?</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 leading-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  q: "Will Instagram ban my account?",
                  a: "Flazly operates through the standard Meta Graph API and is built to comply with Instagram's Developer Policies to ensure secure automation."
                },
                {
                  q: "How does Flazly connect to Instagram?",
                  a: "Integration takes less than a minute. Log in with your Facebook credentials using our secure Meta OAuth setup and authorize your linked Instagram Business profile. We never ask for or store your passwords."
                },
                {
                  q: "Can I manually take over conversations?",
                  a: "Yes. The Unified Smart Inbox allows you or your staff agents to pause autopilot with a single click, type manual answers, and reactivate Flazly AI autopilot whenever you are ready."
                },
                {
                  q: "Can Flazly AI answer custom questions?",
                  a: "Absolutely. Flazly uses your Knowledge Base PDFs, FAQ spreadsheets, fact sheets, or typed instructions to reply to questions in your exact brand tone."
                },
                {
                  q: "Can I collect customer contact information?",
                  a: "Yes. Flazly is programmed to identify intent and politely extract contact info (emails, phone numbers, location, etc.) during natural dialog flows, saving them to your leads database."
                },
                {
                  q: "Can I use multiple Instagram accounts?",
                  a: "Yes. Our Growth plan supports up to 3 accounts, and the Agency plan supports up to 10 connected Instagram profiles."
                }
              ].map((faq, i) => (
                <FAQItemComponent key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 13 — FINAL CTA
            ========================================== */}
        <section className="py-32 border-t border-zinc-200/80 dark:border-white/5 relative overflow-hidden text-center bg-gradient-to-b from-zinc-50 to-[#fafafa] dark:from-zinc-950 dark:to-[#09090b]">
          {/* Ambient backdrop glow using logo colors */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#EC4899]/10 via-[#818CF8]/10 to-[#4F39F6]/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="max-w-4xl mx-auto px-6 relative z-10 font-inter">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight cta-heading-glow">
              Stop Losing Leads Inside Your <span className="text-logo-gradient">Instagram DMs</span>
            </h2>
            <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Let Flazly AI respond instantly, qualify prospects, capture customer details, and help your business convert more conversations into revenue.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
              <button
                onClick={() => navigate('/signup')}
                className="btn-premium-cta w-full sm:w-auto px-10 py-5 text-sm font-bold flex items-center justify-center gap-2 group"
              >
                Start Free 14-Day Trial
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-10 py-5 rounded-xl text-sm font-bold bg-white dark:bg-[#121826] border border-zinc-200 dark:border-white/10 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                Book A Demo
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
};

export default Landing;
