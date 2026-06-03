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
  Star
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
      badge: "Maya AI",
      detail: "Maya processes intent in <0.2s",
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
      title: "Appointment Booking",
      icon: <Calendar size={18} />,
      badge: "Cal.com",
      detail: "Cal link sent to book consultation",
      glow: "from-[#3B82F6] to-[#6366F1]",
      color: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20 dark:text-[#3B82F6]"
    },
    {
      title: "Revenue",
      icon: <DollarSign size={18} />,
      badge: "Sale Closed",
      detail: "Booking completed: +$499 Revenue",
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
              className={`flex flex-col p-4 rounded-2xl border transition-all duration-500 cursor-pointer relative group text-left h-full ${
                isSelected
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
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isSelected ? "bg-[#38BDF8] text-white" : "bg-white/5 text-zinc-400"
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
    { id: 'agent' as TabType, label: 'AI Agent (Maya)', icon: <Bot size={14} /> },
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
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
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
              replyzens_cloud_v1.0.8 // {activeTab.toUpperCase()}
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
            <span className="text-[7px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Booked</span>
          </div>
          <span className="text-[9px] text-zinc-500 truncate">Booked demo for 10am</span>
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
                ✦ Automated by Maya
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
                Awesome! I've saved daniel@gmail.com. Here is your checkout link: replyzens.com/chk/shoes-10
              </p>
              <span className="text-[6.5px] font-bold text-[#38BDF8] uppercase tracking-wide mt-1 block font-extrabold">
                ✦ Automated by Maya
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
            value="You are Maya, an AI assistant representing replyzens.com. Your tone should be extremely friendly, helpful, and outcome-oriented. Help visitors qualify their DMs, answer FAQs regarding products, pricing, features, and setup. Push high-intent buyers to schedule a call via Cal.com link, or provide a purchase link if they inquire about pricing. If you do not know the answer, ask for their email so our human staff can follow up."
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
          <label className="text-xs font-bold text-zinc-350">Default Call to Action Node</label>
          <div className="bg-white/[0.02] border border-[#38BDF8]/20 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#38BDF8]" />
              <span className="text-[10px] font-bold text-white">Book Introductory Call</span>
            </div>
            <span className="text-[8px] text-zinc-555 font-mono">Cal.com/replyzens/15min</span>
          </div>
        </div>
      </div>

      {/* Right Knowledge Base Panel */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 text-left">
        <h5 className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest border-b border-white/5 pb-2">Knowledge Docs</h5>
        <p className="text-[10px] text-zinc-400 leading-normal font-medium">
          Upload catalogs, spreadsheets, FAQs, or policies. ReplyZens learns instantly.
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
                <span className="text-[8px] text-zinc-500">Booked Demo: Consultation</span>
              </div>
            </div>
            <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Booked
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
                ● Connected as @replyzens
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
          Send webhook events to your backend on lead qualifications, appointment bookings, or payment updates.
        </p>

        <div className="bg-white/[0.02] border border-[#38BDF8]/20 p-3 rounded-xl text-left">
          <span className="text-[8px] font-bold text-zinc-300 uppercase font-mono block">Webhook Endpoint</span>
          <span className="text-[10px] font-mono text-zinc-200 mt-1 block truncate">https://api.yourdomain.com/webhook</span>
          
          <div className="flex gap-1.5 mt-3">
            <span className="text-[7px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded">
              on_lead_qualify
            </span>
            <span className="text-[7px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded">
              on_appointment
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
              Fine-tune the parameters below to calculate how much revenue you stand to recover by deploying ReplyZens AI automations.
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
    <div className={`border border-white/5 rounded-2xl p-6 bg-[#121826]/40 hover:bg-[#121826]/60 transition-all duration-300 relative overflow-hidden text-left ${
      isOpen ? 'ring-1 ring-[#38BDF8]/20 border-[#38BDF8]' : ''
    }`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#38BDF8] to-[#6366F1] transition-all duration-500 origin-top ${
        isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
      }`} />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group outline-none"
      >
        <span className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors font-inter">
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all shrink-0 ${
          isOpen
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
// 5. MAIN LANDING COMPONENT
// ==========================================
type TabType = 'inbox' | 'agent' | 'builder' | 'analytics' | 'settings';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter selection:bg-[#38BDF8]/10 selection:text-[#38BDF8] min-h-screen relative overflow-x-hidden">
      
      {/* Decorative gradient radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#3B82F6]/5 dark:from-[#3B82F6]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[450px] h-[450px] bg-[#6366F1]/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-[1800px] left-0 w-[500px] h-[500px] bg-[#38BDF8]/5 blur-[120px] pointer-events-none" />

      {/* NAVBAR */}
      <Navbar />

      <main className="pt-[72px]">

        {/* ==========================================
            SECTION 1 — HERO
            ========================================== */}
        <section className="relative pt-12 pb-24 z-10 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Tag / Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4F39F6]/10 border border-[#4F39F6]/20 mb-6 select-none animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F39F6] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">
                  AI Instagram Sales Agent
                </span>
              </div>

              {/* Headline with visual gradient spec */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] lg:leading-[1.1] font-extrabold tracking-tight mb-6 text-balance text-zinc-950 dark:text-white">
                Turn Every Instagram <span className="text-headline-gradient">DM Into Revenue</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base text-zinc-650 dark:text-zinc-400 font-medium leading-relaxed mb-10 text-balance max-w-xl">
                ReplyZens automatically replies to Instagram messages, qualifies leads, captures customer information, answers questions, and books appointments while you focus on growing your business.
              </p>

              {/* CTA Buttons using btn-premium-cta styles */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-8">
                <button
                  onClick={() => navigate('/signup')}
                  className="btn-premium-cta w-full sm:w-auto px-8 py-4.5 text-sm font-bold flex items-center justify-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#demo"
                  className="w-full sm:w-auto px-8 py-4.5 rounded-xl text-sm font-bold bg-white dark:bg-[#121826] border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play size={14} fill="currentColor" />
                  Watch Demo
                </a>
              </div>
            </div>

            {/* Right Interactive Mobile Mockup Column */}
            <div className="w-full flex justify-center items-center mockup-dark">
              <InstagramMobileMockup />
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 2 — SOCIAL PROOF
            ========================================== */}
        <section className="py-20 border-y border-zinc-200/80 dark:border-white/5 bg-zinc-100/50 dark:bg-[#121826]/30 backdrop-blur-xl relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Conversations Automated", value: "10,000+", icon: <MessageCircle size={20} /> },
                { label: "Faster Response Times", value: "85%", icon: <Clock size={20} /> },
                { label: "More Qualified Leads", value: "3X", icon: <TrendingUp size={20} /> },
                { label: "AI Availability", value: "24/7", icon: <Sparkles size={20} /> },
              ].map((metric, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="bg-[#121826]/50 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center relative group hover:border-[#38BDF8]/40 hover:bg-[#121826]/80 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4 text-[#38BDF8] group-hover:scale-110 transition-transform">
                    {metric.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                    {metric.value}
                  </div>
                  <div className="text-[10px] md:text-xs font-bold text-zinc-550 uppercase tracking-widest font-mono">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 3 — PROBLEM
            ========================================== */}
        <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">The Hard Truth</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight mt-3">
                Every Missed Instagram Message Is Lost Revenue
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed mt-1">
                Manual Instagram management scales poorly. Customers expect immediate replies, and while you sleep or focus on operations, leads are leaking.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Slow Responses",
                  desc: "Customers leave before businesses can reply. 78% of buyers purchase from the brand that responds first.",
                  glow: "group-hover:border-[#38BDF8]/50 group-hover:shadow-lg group-hover:shadow-[#38BDF8]/5",
                  badge: "Friction"
                },
                {
                  title: "Repetitive Questions",
                  desc: "Teams waste hours answering the same questions about pricing, stock availability, and shipping info.",
                  glow: "group-hover:border-[#38BDF8]/50 group-hover:shadow-lg group-hover:shadow-[#38BDF8]/5",
                  badge: "Inefficiency"
                },
                {
                  title: "Lost Opportunities",
                  desc: "Potential buyers never receive follow-up messages, checkouts, or demo links, disappearing forever.",
                  glow: "group-hover:border-[#38BDF8]/50 group-hover:shadow-lg group-hover:shadow-[#38BDF8]/5",
                  badge: "Lost Sales"
                }
              ].map((p, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="group"
                >
                  <div className={`p-8 rounded-3xl bg-[#121826]/40 border border-white/5 h-full flex flex-col justify-between transition-all duration-300 hover:bg-[#121826]/70 shadow-sm ${p.glow}`}>
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
                          <X size={18} />
                        </div>
                        <span className="text-[8.5px] font-bold text-zinc-555 uppercase tracking-widest">{p.badge}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">{p.title}</h3>
                      <p className="text-zinc-400 leading-relaxed text-sm font-medium">{p.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 4 — SOLUTION
            ========================================== */}
        <section className="py-28 border-t border-zinc-200/80 dark:border-white/5 relative overflow-hidden bg-gradient-to-b from-[#fafafa] via-zinc-100/50 to-[#fafafa] dark:from-[#09090b] dark:via-[#121826]/30 dark:to-[#09090b]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Core Architecture</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white mt-3 animate-fade-in">
                Meet Your AI Instagram Growth Engine
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium">
                ReplyZens streamlines your sales funnel, seamlessly taking prospects from a simple message to a confirmed conversion.
              </p>
            </div>

            {/* Workflow Architecture Map */}
            <div className="max-w-4xl mx-auto bg-[#121826]/50 border border-white/5 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 flex-wrap lg:flex-nowrap">
                {[
                  { title: "Instagram Message", desc: "Trigger received", icon: <MessageCircle size={16} /> },
                  { title: "AI Understanding", desc: "Intent parsing", icon: <Bot size={16} /> },
                  { title: "Smart Response", desc: "FAQ answered", icon: <Zap size={16} /> },
                  { title: "Lead Capture", desc: "Contact details", icon: <Users size={16} /> },
                  { title: "Qualification", desc: "Intent scoring", icon: <Star size={16} /> },
                  { title: "CRM Integration", desc: "System updated", icon: <Database size={16} /> },
                  { title: "Appointment Booking", desc: "Sale closed", icon: <Calendar size={16} /> }
                ].map((node, idx) => (
                  <React.Fragment key={idx}>
                    {/* Node */}
                    <div className="flex flex-col items-center text-center p-4 bg-[#0B1020]/80 border border-white/5 rounded-2xl w-32 shrink-0 group hover:border-[#38BDF8] hover:shadow-lg hover:shadow-[#38BDF8]/5 transition-all">
                      <div className="w-10 h-10 rounded-full bg-[#121826] border border-white/10 text-white flex items-center justify-center mb-3 group-hover:bg-[#38BDF8] group-hover:text-white transition-colors">
                        {node.icon}
                      </div>
                      <span className="text-[10px] font-bold text-white block mb-0.5 leading-tight">{node.title}</span>
                      <span className="text-[8.5px] text-zinc-555 block font-medium">{node.desc}</span>
                    </div>

                    {/* Arrow (hidden after the last node) */}
                    {idx < 6 && (
                      <div className="hidden lg:flex flex-col justify-center items-center text-[#38BDF8] shrink-0">
                        <ArrowRight size={14} className="opacity-70 transition-colors" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 5 — FEATURE GRID WITH ELEGANT GRADIENT BORDERS
            ========================================== */}
        <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Built For scale</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Enterprise Features, Zero Complexity
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium">
                Everything you need to automate conversations, capture customer insights, and increase revenue.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Bot size={20} />,
                  title: "AI-Powered Conversations",
                  desc: "Maya AI parses customer inquiries and replies naturally in 40+ languages based on your knowledge base docs."
                },
                {
                  icon: <MessageCircle size={20} />,
                  title: "Comment-to-DM Automation",
                  desc: "Instantly reply to comments on posts, reels, and stories with personalized DMs to funnel engagement."
                },
                {
                  icon: <Workflow size={20} />,
                  title: "Lead Qualification Workflows",
                  desc: "Automatically filter out casual browsers and extract email addresses, phone numbers, and location info."
                },
                {
                  icon: <Inbox size={20} />,
                  title: "Unified Smart Inbox",
                  desc: "Monitor automated live chats, take over manual conversations, and tag customer statuses in real time."
                },
                {
                  icon: <Calendar size={20} />,
                  title: "Appointment Scheduling",
                  desc: "Connect Cal.com or Calendly. Let the AI share available slots and book client appointments in-thread."
                },
                {
                  icon: <BarChart3 size={20} />,
                  title: "Analytics & Reporting",
                  desc: "Track critical ROI metrics including total conversations automated, leads collected, and estimated revenue growth."
                }
              ].map((feature, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  key={i}
                >
                  <div className="premium-gradient-border h-full">
                    <div className="premium-card-content p-8 flex flex-col justify-between text-left">
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-[#0B1020] border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#38BDF8]/50 group-hover:bg-[#38BDF8]/10 group-hover:text-[#38BDF8] transition-all text-[#38BDF8] font-semibold">
                          {feature.icon}
                        </div>
                        <h3 className="text-lg font-bold mb-2.5 text-white">{feature.title}</h3>
                        <p className="text-zinc-400 leading-relaxed text-sm font-medium">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 6 — PRODUCT SHOWCASE
            ========================================== */}
        <section id="demo" className="py-28 border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/20 dark:bg-[#121826]/20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#3B82F6]/5 blur-[150px] rounded-full pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Interactive Console</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white mt-3">
                Experience the ReplyZens Platform
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium">
                Click through the tabs below to explore the premium interface digital brands use to control their automation funnel.
              </p>
            </div>

            {/* Showcase dashboard viewport container */}
            <ProductShowcase />
          </div>
        </section>


        {/* ==========================================
            SECTION 7 — AUTOMATION EXAMPLES
            ========================================== */}
        <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b] border-t border-zinc-200/80 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Playbooks</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white mt-3">
                Automations That Drive Growth
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium mt-1">
                Deploy templates that work 24/7 to convert story replies, comments, and DMs into pipeline sales.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                {
                  title: 'Comment → DM → Lead Captured',
                  desc: 'Perfect for e-commerce brands launching new collections or catalogs.',
                  steps: ["User comments 'GUIDE' on your post", "AI sends direct message link", "AI extracts email, syncing details"]
                },
                {
                  title: 'Story Reply → AI Qualification → Appointment Booked',
                  desc: 'Ideal for coaches, consultants, and agencies seeking consultation calls.',
                  steps: ["Prospect responds to story highlight", "Maya asks qualifying questions", "AI shares custom Cal.com invite"]
                },
                {
                  title: 'Keyword Trigger → Product Recommendation → Sale',
                  desc: 'Excellent for stores looking to close transactions immediately in DMs.',
                  steps: ["User sends DM containing keyword", "AI reviews stock & recommends product", "Direct checkout invoice generated"]
                }
              ].map((recipe, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="group"
                >
                  <div className="p-8 rounded-3xl bg-[#121826]/40 border border-white/5 hover:border-[#38BDF8] hover:bg-[#121826]/60 transition-all shadow-lg h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-white group-hover:text-[#38BDF8] transition-colors font-inter">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium mb-8">
                        {recipe.desc}
                      </p>
                    </div>

                    <div className="space-y-4 relative">
                      <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-[#38BDF8] to-[#6366F1] opacity-35" />
                      {recipe.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 rounded-full bg-[#0B1020] border border-white/10 flex items-center justify-center text-white font-bold text-xs shrink-0 group-hover:border-[#38BDF8] transition-colors">
                            {idx + 1}
                          </div>
                          <div className="text-xs font-semibold text-zinc-300 bg-white/[0.02] border border-white/5 px-4 py-3 rounded-xl flex-1">
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 8 — COMPARISON
            ========================================== */}
        <section className="py-28 bg-[#fafafa] dark:bg-[#09090b] border-t border-zinc-200/80 dark:border-white/5 relative z-10">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Side-by-side</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white mt-3">
                Why Businesses Choose ReplyZens
              </h2>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative max-w-4xl mx-auto"
            >
              {/* Highlight Column Glow behind ReplyZens */}
              <div className="absolute top-0 bottom-0 left-[35%] w-[33%] bg-[#38BDF8]/5 rounded-3xl shadow-sm border border-[#38BDF8]/20 -z-10 transform scale-y-[1.05]" />
              
              <div className="grid grid-cols-[1.2fr_1fr_1fr] items-center text-left">
                {/* Header row */}
                <div className="p-4 md:p-6 font-bold text-xs uppercase tracking-widest text-zinc-400">
                  Capabilities
                </div>
                <div className="p-4 md:p-6 text-center flex flex-col items-center justify-center">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3B82F6] text-white font-bold text-[9px] uppercase tracking-wider mb-2 shadow-md shadow-[#3B82F6]/20">
                    <Sparkles size={10} /> Autopilot
                  </div>
                  <div className="font-extrabold text-base md:text-lg text-white font-inter">ReplyZens</div>
                </div>
                <div className="p-4 md:p-6 font-bold text-center text-xs uppercase tracking-widest text-zinc-400">
                  Manual DMs
                </div>

                {/* Rows */}
                {[
                  { feat: "Instant replies", reply: "Instant (< 1s)", manual: "Hours or days" },
                  { feat: "24/7 Availability", reply: "Always online", manual: "Work hours only" },
                  { feat: "Lead qualification", reply: "AI entity extraction", manual: "Manual questioning" },
                  { feat: "CRM integration", reply: "Real-time automated sync", manual: "Manual copy-paste" },
                  { feat: "Appointment booking", reply: "Direct in-chat schedule", manual: "Back-and-forth links" },
                  { feat: "Analytics & stats", reply: "Live dashboard reports", manual: "None" }
                ].map((row, i) => (
                  <React.Fragment key={i}>
                    <div className="p-4 md:p-5 border-t border-white/5 font-semibold text-xs md:text-sm text-zinc-300">
                      {row.feat}
                    </div>
                    <div className="p-4 md:p-5 border-t border-white/10 text-center font-bold text-xs md:text-sm text-[#38BDF8]">
                      {row.reply}
                    </div>
                    <div className="p-4 md:p-5 border-t border-white/5 text-center font-medium text-xs md:text-sm text-zinc-500">
                      {row.manual}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </div>
        </section>


        {/* ==========================================
            SECTION 9 — ROI CALCULATOR
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
            SECTION 10 — TESTIMONIALS WITH ELEGANT GRADIENT BORDERS
            ========================================== */}
        <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b] border-t border-zinc-200/80 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Success Stories</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Trusted by Scaling Brands
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium">
                See how high-growth creators and digital shops use ReplyZens to optimize conversions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              {[
                {
                  quote: "Waking up to direct payment confirmations and booked consulting calls in my CRM is a complete game-changer. ReplyZens automated over 90% of our inbox inquiries, recovering $8,400 in lost revenue in our first month alone.",
                  name: "Sarah Jenkins",
                  role: "Founder, Zenith Templates",
                  stats: "+340% Conversions",
                  avatar: "SJ"
                },
                {
                  quote: "We were scaling our reel ads but losing half of our leads in the inbox due to slow replies. Setting up ReplyZens comment-to-DM triggers took less than 5 minutes. Response times dropped to under 1s, and our sales increased by 3X.",
                  name: "Marcus Thorne",
                  role: "Director of Growth, HypeFit",
                  stats: "3X Lead Growth",
                  avatar: "MT"
                }
              ].map((t, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="premium-gradient-border"
                >
                  <div className="premium-card-content p-8 flex flex-col justify-between h-full">
                    <div>
                      {/* Stars */}
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* ==========================================
            SECTION 11 — PRICING WITH ELEGANT GRADIENT BORDERS
            ========================================== */}
        <section id="pricing" className="py-28 border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/10 dark:bg-[#121826]/10 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Pricing Plans</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed">
                Scale your automated interactions without hidden fees. Choose a plan that matches your audience volume.
              </p>
            </div>

            {/* Pricing tiers grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-[1000px] mx-auto items-stretch text-left">
              {[
                {
                  name: "Starter",
                  desc: "Perfect for new creators & personal brands",
                  price: "$29",
                  volume: "500",
                  btn: "Start Free Trial",
                  popular: false,
                  features: [
                    "Connect 1 Instagram Account",
                    "Basic FAQ Automations",
                    "Google Sheets Lead Sync",
                    "Email Support (24h response)"
                  ]
                },
                {
                  name: "Growth",
                  desc: "Ideal for scaling e-commerce & active creators",
                  price: "$79",
                  volume: "3,000",
                  btn: "Start 14-Day Trial",
                  popular: true,
                  features: [
                    "Connect 3 Instagram Accounts",
                    "Advanced Maya AI Agent Setup",
                    "Instant Google Sheets & HubSpot Sync",
                    "Unlimited Comment-to-DM triggers",
                    "Cal.com / Calendly scheduling nodes",
                    "Priority Discord & Email Support"
                  ]
                },
                {
                  name: "Agency",
                  desc: "For multi-client social brands & enterprise",
                  price: "$199",
                  volume: "10,000",
                  btn: "Get Agency Trial",
                  popular: false,
                  features: [
                    "Connect 10 Instagram Accounts",
                    "Dedicated High-Performance Sync Nodes",
                    "Custom Webhooks & Developer API access",
                    "White-labeled client dashboards",
                    "Dedicated Account Success Manager",
                    "24/7 VIP Zoom Support"
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
                  <div className={`premium-gradient-border flex-1 flex ${tier.popular ? 'border-[#38BDF8] md:-translate-y-4' : 'mt-4'}`}>
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
                  q: "What is ReplyZens?",
                  a: "ReplyZens is an enterprise-grade AI-powered Instagram DM automation platform. It integrates directly with your Instagram business profile via Meta's secure Graph API. It automatically draft responses, answers FAQs, filters spam content, books user appointments in calendar slots, and syncs collected lead lists directly to Google Sheets and major CRMs."
                },
                {
                  q: "Is it safe to connect my Instagram account?",
                  a: "Absolutely. ReplyZens utilizes Meta's official Graph API and secure OAuth protocol. We never store or access your personal passwords, and our automated messaging pipeline strictly complies with Instagram's Developer Policies, ensuring your account is 100% safe."
                },
                {
                  q: "How does the AI learn about my business?",
                  a: "You can train your AI assistant (Maya) by typing custom system instructions, uploading FAQs, product catalogs, shipping rules, or policy sheets (in pdf or txt format). Maya parses this raw text and answers questions accordingly with a human-like tone."
                },
                {
                  q: "Does the AI support languages other than English?",
                  a: "Yes! Maya automatically detects the customer's language and replies natively. She supports over 40 languages including Spanish, French, German, Italian, Portuguese, Japanese, Hindi, and more."
                },
                {
                  q: "Can I take over automated conversations manually?",
                  a: "Yes. Our Unified Smart Inbox allows you to pause the AI autopilot with a single click. You or your team agents can reply manually at any point, and reactivate the autopilot whenever you are ready."
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
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Stop Losing Leads In Your Instagram Inbox
            </h2>
            <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Automate conversations, qualify prospects, and convert more customers with ReplyZens.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
              <button
                onClick={() => navigate('/signup')}
                className="btn-premium-cta w-full sm:w-auto px-10 py-5 text-sm font-bold flex items-center justify-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#demo"
                className="w-full sm:w-auto px-10 py-5 rounded-xl text-sm font-bold bg-white dark:bg-[#121826] border border-zinc-200 dark:border-white/10 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Book Demo
              </a>
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
