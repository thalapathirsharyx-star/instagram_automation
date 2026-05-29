import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Check,
  Shield,
  Sparkles,
  Play,
  FolderSync,
  Layers,
  Database,
  Lock,
  Upload,
  FileText,
  TrendingUp
} from 'lucide-react';

const Instagram = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`lucide lucide-instagram ${className}`}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      layout
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
      }}
      className={`border border-black/5 dark:border-white/5 rounded-2xl p-6 bg-zinc-500/5 dark:bg-white/[0.02] hover:bg-zinc-500/10 dark:hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden shadow-sm dark:shadow-none ${
        isOpen ? 'ring-1 ring-brand-purple/20 border-brand-purple/30' : ''
      }`}
    >
      {/* Glowing vertical indicator stripe */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-pink to-brand-purple transition-all duration-500 origin-top ${
          isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        }`}
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group transition-all outline-none"
      >
        <span className="text-base font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-brand-purple dark:group-hover:text-brand-pink transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
            isOpen 
              ? 'border-brand-purple/30 bg-brand-purple/10 text-brand-purple' 
              : 'border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 group-hover:border-zinc-300 dark:group-hover:border-white/20'
          }`}
        >
          <ChevronDown size={16} />
        </motion.div>
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
            <motion.p 
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium"
            >
              {answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CodeSetupTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connect' | 'train' | 'automate' | 'crm'>('connect');

  // Automatically cycle through tabs every 8 seconds to show the live animations
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'connect') return 'train';
        if (prev === 'train') return 'automate';
        if (prev === 'automate') return 'crm';
        return 'connect';
      });
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const tabs = {
    connect: {
      title: "1. Link Instagram",
      heading: "Connect in one click",
      desc: "Connect your Instagram Business account instantly. Simply click connect, authenticate via Meta's secure verification popup, and you're ready to start. No complex settings required.",
    },
    train: {
      title: "2. Teach Your Assistant",
      heading: "Teach Maya about your products",
      desc: "Paste your catalog descriptions, type your frequently asked questions, or upload a product PDF. Maya learns instantly to answer pricing, sizing, and shipping questions.",
    },
    automate: {
      title: "3. Set Up Auto-Answers",
      heading: "Create rules for automatic replies",
      desc: "Specify how Maya replies. Create simple rules for specific questions, automatically collect buyer details (like sizes or emails), or chat manually yourself.",
    },
    crm: {
      title: "4. Track Your Sales",
      heading: "Organize customer leads automatically",
      desc: "Never lose track of a potential buyer. ReplyZens automatically organizes your customer chats, tags warm leads, and saves them in a clean visual tracker.",
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-stretch bg-card/40 border border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-md min-h-[480px]">
      {/* Tab Selectors & Info */}
      <div className="flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {Object.keys(tabs).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey as 'connect' | 'train' | 'automate' | 'crm')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tabKey
                    ? 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20 shadow-lg shadow-brand-purple/5'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {tabs[tabKey as keyof typeof tabs].title}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
              {tabs[activeTab].heading}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              {tabs[activeTab].desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-brand-pink mt-4">
          <Zap size={14} className="animate-pulse" />
          Setup takes less than 3 minutes — no technical skills required.
        </div>
      </div>

      {/* Visual Animation Panel */}
      <div className="dark relative rounded-2xl bg-[#0B0D13] border border-white/5 overflow-hidden shadow-2xl p-6 min-h-[300px] flex flex-col justify-center items-center">
        {/* Top bar mockup */}
        <div className="absolute top-0 left-0 right-0 h-9 bg-[#11141D] border-b border-white/5 flex items-center px-4 justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
          </div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider select-none">
            {activeTab === 'connect' && "Step 1: Connect Account"}
            {activeTab === 'train' && "Step 2: AI Training"}
            {activeTab === 'automate' && "Step 3: Auto-Replies"}
            {activeTab === 'crm' && "Step 4: Sales Tracking"}
          </span>
        </div>

        {/* Content Area with Animations */}
        <div className="w-full pt-6 flex-grow flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeTab === 'connect' && (
              <motion.div
                key="connect"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="flex items-center gap-8 relative">
                  {/* Instagram Logo */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shadow-lg shadow-pink-500/10">
                    <Instagram size={32} className="text-white" />
                  </div>

                  {/* Pulsing Connector Line */}
                  <div className="flex items-center justify-center relative w-20">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-brand-pink to-brand-purple"
                        animate={{ x: [-80, 80] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        style={{ width: "30px" }}
                      />
                    </div>
                    <div className="absolute bg-[#11141D] border border-white/10 p-1.5 rounded-full">
                      <Lock size={12} className="text-brand-purple" />
                    </div>
                  </div>

                  {/* ReplyZens Logo */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center shadow-lg shadow-brand-purple/20">
                    <Zap size={32} className="text-white" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 mt-2">
                  <motion.button
                    initial={{ backgroundColor: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}
                    animate={{ 
                      backgroundColor: ["rgba(139, 92, 246, 0.1)", "rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.1)"],
                      color: ["#8b5cf6", "#10b981", "#10b981"],
                      borderColor: ["rgba(139, 92, 246, 0.2)", "rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.2)"]
                    }}
                    transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}
                    className="px-6 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <Instagram size={14} />
                    Link Instagram Page
                  </motion.button>
                  <motion.span 
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}
                    className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"
                  >
                    <Check size={10} strokeWidth={3} /> Connected Successfully!
                  </motion.span>
                </div>
              </motion.div>
            )}

            {activeTab === 'train' && (
              <motion.div
                key="train"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm flex flex-col gap-5"
              >
                {/* Simulated File Box */}
                <div className="bg-[#11141D] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">product_shipping_faq.pdf</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Size: 1.2 MB</div>
                  </div>
                  <Upload size={16} className="text-zinc-400 animate-bounce" />
                </div>

                {/* Progress Bar & Status */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                    <span>Maya Assistant Training</span>
                    <TrainingPercentage />
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-brand-pink to-brand-purple"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                {/* Simulated Brain Synced Checkboxes */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    "Shoe sizes & inventory",
                    "Return policy facts",
                    "Shipping fees & rates",
                    "FAQ answers trained"
                  ].map((text, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.4, duration: 0.3 }}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400"
                    >
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'automate' && (
              <motion.div
                key="automate"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm flex flex-col gap-3"
              >
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-extrabold text-zinc-300">
                      JS
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-300">@john_smith</span>
                      <span className="text-[8px] text-emerald-400 font-semibold flex items-center gap-0.5">● Active</span>
                    </div>
                  </div>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    Customer Chat
                  </span>
                </div>

                {/* Message Bubble 1 (Customer) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3 max-w-[85%] self-start"
                >
                  <p className="text-[11px] text-zinc-300 font-medium">
                    Hi! Do you have the white sneaker in size 10? How much is it?
                  </p>
                </motion.div>

                {/* AI Processing / Typing Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 3,
                    times: [0, 0.1, 0.9, 1] 
                  }}
                  className="flex items-center gap-1 bg-brand-purple/10 border border-brand-purple/10 rounded-full px-3 py-1.5 w-max self-end mr-2"
                >
                  <span className="text-[8px] font-bold text-brand-purple mr-1">Maya is typing</span>
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>

                {/* Message Bubble 2 (Maya AI Reply) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5 }}
                  className="bg-brand-purple text-white rounded-2xl rounded-tr-none p-3 max-w-[85%] self-end relative"
                >
                  <p className="text-[11px] font-medium leading-relaxed">
                    Yes! We have 3 pairs left in size 10. The price is ₹2,499 with free shipping. Would you like a direct payment checkout link?
                  </p>
                  <div className="absolute -bottom-4 right-1 flex items-center gap-1 text-[8px] font-extrabold text-brand-pink bg-[#0B0D13] px-2 py-0.5 rounded-full border border-white/5">
                    <Sparkles size={8} /> Auto-Answered by AI
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'crm' && (
              <motion.div
                key="crm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm flex flex-col gap-3"
              >
                {/* Lead List Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-bold text-white">Live Customer Tracker</span>
                  <span className="text-[9px] font-bold text-zinc-500 flex items-center gap-1 bg-[#11141D] border border-white/5 px-2 py-0.5 rounded-md">
                    <TrendingUp size={10} className="text-brand-pink" /> 3 New Leads Today
                  </span>
                </div>

                {/* Lead Items */}
                <div className="flex flex-col gap-2">
                  {/* Lead 1 */}
                  <div className="bg-[#11141D] border border-white/5 p-2.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-[9px] font-bold text-brand-purple">
                        AJ
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-300">@alex_jones</span>
                        <span className="text-[8px] text-zinc-500">Asked about pricing</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-extrabold bg-brand-pink/10 text-brand-pink border border-brand-pink/10 px-2 py-0.5 rounded-md">
                      Warm Lead 🔥
                    </span>
                  </div>

                  {/* Lead 2 */}
                  <div className="bg-[#11141D] border border-white/5 p-2.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-[9px] font-bold text-brand-pink">
                        SM
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-300">@sara.miller</span>
                        <span className="text-[8px] text-zinc-500">Requested checkout link</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-md">
                      Converted 👑
                    </span>
                  </div>

                  {/* Animated Incoming Lead Row */}
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    transition={{ delay: 1, duration: 0.4 }}
                    className="bg-[#11141D] border border-brand-purple/30 p-2.5 rounded-xl flex items-center justify-between shadow-lg shadow-brand-purple/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] font-bold text-emerald-400">
                        JD
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-300">@johndoe</span>
                        <span className="text-[8px] text-zinc-400">Purchased Pro Plan</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[8px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-md">
                        +₹2,499
                      </span>
                      <span className="text-[7px] font-bold text-brand-purple">Saved to Sheets</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const NoiseFilterMockup: React.FC = () => {
  return (
    <div className="dark w-full bg-[#0B0D13] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 flex flex-col h-[400px]">
      {/* Browser Bar */}
      <div className="h-10 bg-[#11141D] border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-lg border border-white/5">
          <Shield size={10} className="text-success" />
          <span className="text-[9px] text-zinc-400 font-mono">noise-filter-engine.bin</span>
        </div>
        <div className="w-4" />
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto premium-scroll">
        
        {/* Spam / Casual Chat - FILTERED */}
        <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl opacity-40 hover:opacity-60 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">AJ</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-zinc-300">@alex_jones</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">Casual</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">"Wow nice post, check out my profile!"</p>
          </div>
          <div className="text-[9px] font-bold text-zinc-500 uppercase px-2 py-1 bg-white/5 rounded-lg border border-white/5 self-center">
            Filtered
          </div>
        </div>

        {/* Lead with Intent - ESCALATED */}
        <div className="flex items-start gap-3 p-3 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl relative shadow-lg shadow-brand-purple/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center text-xs font-bold text-white shadow-md">SM</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">@sophia_m</span>
              <span className="text-[9px] font-bold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-md border border-brand-pink/20 uppercase tracking-wider">High Intent</span>
            </div>
            <p className="text-[11px] text-zinc-300 font-medium">"Hey! Do you ship to Australia? I want to buy the premium package."</p>
          </div>
          <div className="text-[9px] font-bold text-brand-purple uppercase px-2 py-1 bg-brand-purple/10 rounded-lg border border-brand-purple/20 self-center animate-pulse">
            Active Lead
          </div>
        </div>

        {/* Spam / Casual Chat - FILTERED */}
        <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl opacity-40 hover:opacity-60 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">K9</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-zinc-300">@kristina99</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">Spam</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">"Earn 500$ daily working from home, dm me."</p>
          </div>
          <div className="text-[9px] font-bold text-zinc-500 uppercase px-2 py-1 bg-white/5 rounded-lg border border-white/5 self-center">
            Blocked
          </div>
        </div>

      </div>

      <div className="h-11 bg-[#11141D] border-t border-white/5 flex items-center justify-between px-5 text-[10px] font-mono text-zinc-500">
        <span>Filtered 293 Spam Messages today</span>
        <span className="text-brand-purple font-bold">Accuracy: 98.6%</span>
      </div>
    </div>
  );
};

const InteractivePhoneMockup: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [typing, setTyping] = useState(false);
  const [syncStatus, setSyncStatus] = useState(false);

  useEffect(() => {
    let active = true;
    const runAnimation = async () => {
      if (!active) return;
      setMessages([]);
      setTyping(false);
      setSyncStatus(false);

      // Step 1: User message 1
      await new Promise(r => setTimeout(r, 1200));
      if (!active) return;
      setMessages([{ sender: 'user', text: "Hey! Do you ship to Canada? 🇨🇦" }]);

      // Step 2: AI Typing
      await new Promise(r => setTimeout(r, 1000));
      if (!active) return;
      setTyping(true);

      // Step 3: AI Message 1
      await new Promise(r => setTimeout(r, 1500));
      if (!active) return;
      setTyping(false);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Yes, we ship standard worldwide! 🌍 Shipping to Canada is ₹499. Would you like me to hold one?"
      }]);

      // Step 4: User message 2
      await new Promise(r => setTimeout(r, 2000));
      if (!active) return;
      setMessages(prev => [...prev, { sender: 'user', text: "Yes please! The standard hoodie in black, size L." }]);

      // Step 5: AI Typing
      await new Promise(r => setTimeout(r, 1000));
      if (!active) return;
      setTyping(true);

      // Step 6: AI Message 2 + Sync
      await new Promise(r => setTimeout(r, 1500));
      if (!active) return;
      setTyping(false);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Done! 💳 Checkout link: replyzens.com/checkout/hoodie-l"
      }]);

      // Step 7: CRM Sync Banner
      await new Promise(r => setTimeout(r, 1200));
      if (!active) return;
      setSyncStatus(true);

      // Hold before reset
      await new Promise(r => setTimeout(r, 6000));
      if (active) {
        runAnimation();
      }
    };

    runAnimation();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="dark relative mx-auto py-6 px-10">
      {/* Outer Phone Container with overflow-hidden */}
      <div className="relative w-[280px] h-[520px] sm:w-[300px] sm:h-[560px] bg-[#09090B] rounded-[48px] p-3 shadow-2xl border-[6px] border-zinc-800 ring-1 ring-white/10 overflow-hidden font-sans select-none">
        {/* Dynamic Island */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 ml-auto mr-3" />
        </div>

        {/* Screen Content */}
        <div className="w-full h-full bg-[#0D0E12] rounded-[38px] overflow-hidden relative flex flex-col pt-8 border border-white/5">
          {/* Instagram DM Header */}
          <div className="h-12 border-b border-white/5 px-4 flex items-center gap-2.5 bg-black/15">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full bg-[#0D0E12] p-0.5">
                <div className="w-full h-full rounded-full bg-zinc-700 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                  JD
                </div>
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-zinc-100 leading-tight">Jordan.design</span>
              <span className="text-[7px] text-success font-medium flex items-center gap-1 leading-none mt-0.5">
                <span className="w-1 h-1 rounded-full bg-success animate-pulse" /> Active now
              </span>
            </div>
          </div>

          {/* Message Feed */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto premium-scroll flex flex-col">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex max-w-[85%] ${msg.sender === 'ai' ? 'self-end justify-end' : 'self-start'}`}
                >
                  <div
                    className={`p-2.5 rounded-2xl text-[9px] font-medium leading-relaxed text-left ${
                      msg.sender === 'ai'
                        ? 'bg-brand-purple text-white rounded-tr-none shadow-md shadow-brand-purple/10'
                        : 'bg-zinc-800/80 text-zinc-200 rounded-tl-none border border-white/5'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-1 text-[6px] font-bold uppercase tracking-wider text-brand-pink mb-1 justify-start">
                        <Zap size={7} className="fill-current" /> AI Assistant
                      </div>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="self-end bg-brand-purple text-white p-2.5 rounded-2xl rounded-tr-none flex items-center gap-1.5 shadow-md shadow-brand-purple/10"
                >
                  <div className="flex items-center gap-1 text-[6px] font-bold uppercase tracking-wider text-brand-pink">
                    <Zap size={7} className="fill-current" /> Typing
                  </div>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce delay-100" />
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce delay-200" />
                    <span className="w-1 h-1 bg-white rounded-full animate-bounce delay-300" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mock Status Footer */}
          <div className="h-8 border-t border-white/5 bg-black/20 px-3 flex items-center justify-between text-[8px] font-mono text-zinc-500">
            <span>Filter: Active</span>
            <span className="text-brand-pink font-bold">Auto-replies On</span>
          </div>
        </div>
      </div>

      {/* CRM Sync Floating Tag (Placed outside overflow-hidden chassis, completely clear on the right side) */}
      <AnimatePresence>
        {syncStatus && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="absolute top-[35%] -right-6 sm:-right-12 bg-[#120F22]/95 border border-brand-purple/30 backdrop-blur-md p-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 w-44 z-30"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-pink shrink-0">
              <Database size={11} />
            </div>
            <div className="text-left">
              <div className="text-[9px] font-bold text-zinc-200 leading-tight">CRM Sync Event</div>
              <div className="text-[7px] text-success font-semibold leading-none mt-0.5">Synced Lead to Sheets</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TrainingPercentage: React.FC = () => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 35);
    return () => clearInterval(interval);
  }, []);

  return <span>{percent}%</span>;
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="landing-page bg-background text-foreground font-inter selection:bg-brand-purple/30 selection:text-white min-h-screen relative overflow-hidden">
      
      {/* Background Decorative Mesh Gradients (Formcarry-inspired styling) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-purple/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[400px] h-[400px] bg-brand-pink/5 blur-[100px] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/favicon.svg" alt="ReplyZens Logo" className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-white uppercase font-outfit">
              Reply<span className="text-brand-pink">Zens</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#setup" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Setup</a>
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#noise-filter" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Spam Shield</a>
            <a href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">FAQ</a>
            
            <div className="flex items-center gap-4 ml-4">
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w3-button-primary bg-gradient-to-r from-brand-pink to-brand-purple text-white px-5 py-2 rounded-xl text-xs shadow-lg shadow-brand-pink/15 active:scale-95 transition-all"
              >
                Start Free Trial
              </button>
            </div>
          </div>

          <button className="md:hidden text-zinc-400 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card border-t border-border shadow-xl"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                <a href="#setup" className="text-base font-semibold text-zinc-300" onClick={() => setMobileOpen(false)}>Setup</a>
                <a href="#features" className="text-base font-semibold text-zinc-300" onClick={() => setMobileOpen(false)}>Features</a>
                <a href="#noise-filter" className="text-base font-semibold text-zinc-300" onClick={() => setMobileOpen(false)}>Spam Shield</a>
                <a href="#pricing" className="text-base font-semibold text-zinc-300" onClick={() => setMobileOpen(false)}>Pricing</a>
                <a href="#faq" className="text-base font-semibold text-zinc-300" onClick={() => setMobileOpen(false)}>FAQ</a>
                <div className="h-px bg-white/5 my-2" />
                <button
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="w-full text-center py-3 border border-white/10 rounded-xl text-zinc-300 font-semibold"
                >
                  Log in
                </button>
                <button
                  onClick={() => { navigate('/signup'); setMobileOpen(false); }}
                  className="bg-gradient-to-r from-brand-pink to-brand-purple text-white font-semibold py-3.5 rounded-xl w-full"
                >
                  Start Free Trial
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-[72px]">

        {/* 1. HERO SECTION */}
        <section className="relative pt-20 lg:pt-32 pb-20 z-10 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center relative z-10">
            {/* Left Content Column */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Tag / Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-pink/10 border border-brand-pink/20 mb-6 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink">Formcarry-Inspired DM API</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white leading-[1.1] text-balance">
                Never worry about the backend of your <span className="gradient-text-ai">Instagram DMs</span> again.
              </h1>

              {/* Subtext */}
              <p className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed max-w-xl mb-8 text-balance">
                Connect your account securely, set intelligent auto-replies, block spam with AI, qualify buyers instantly, and synchronize customer data directly to your favorite CRM.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md lg:max-w-none mb-10">
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto w3-button-primary bg-gradient-to-r from-brand-pink to-brand-purple font-bold px-8 py-4 rounded-xl text-sm shadow-xl shadow-brand-pink/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  Get Started
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#setup"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={14} fill="currentColor" />
                  How It Works
                </a>
              </div>

              {/* Features Quick List */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-5 text-[11px] font-bold text-zinc-500 border-t border-white/5 pt-6 w-full">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-success" /> Meta Partner Verified</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-success" /> 3-Minute Setup</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-success" /> 98.6% Spam Shield</span>
              </div>
            </div>

            {/* Right Column: Animated Live Phone Mockup */}
            <div className="flex items-center justify-center relative w-full lg:h-full">
              <div className="absolute w-[350px] h-[350px] bg-brand-purple/10 blur-[80px] pointer-events-none rounded-full" />
              <InteractivePhoneMockup />
            </div>
          </div>
        </section>

        {/* 2. SETUP TIMELINE SECTION (Easiest way to setup HTML form equivalent) */}
        <section id="setup" className="py-24 border-t border-white/5 relative bg-black/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">Creator & Business Friendly</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Easiest way to automate your Instagram.
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed">
                Set up auto-replies, teach your AI assistant about your products, and organize customer requests in minutes. No technical experience needed.
              </p>
            </div>

            <CodeSetupTabs />
          </div>
        </section>

        {/* 3. CORE BENEFITS SECTION (Savior, yeah time-savior equivalent) */}
        <section id="features" className="py-24 border-t border-white/5 relative">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">Time-Savior Infrastructure</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Features that save days of work.
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed">
                Automate your Instagram customer pipeline instantly. Integration with Google Sheets, email auto-responders, and filters configured in minutes.
              </p>
            </motion.div>

            {/* Features Cards Grid */}
            <motion.div 
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                {
                  title: "Maya AI Auto-Replies",
                  desc: "Configure auto-responses to handle FAQ, pricing, sizes, and shipping options instantly.",
                  icon: Sparkles,
                  color: "text-brand-pink bg-brand-pink/10 border-brand-pink/20"
                },
                {
                  title: "Smart Field Validations",
                  desc: "Extract clean buyer emails, sizes, handles, and postal codes right out of conversational messages.",
                  icon: FolderSync,
                  color: "text-brand-purple bg-brand-purple/10 border-brand-purple/20"
                },
                {
                  title: "Webhook Integrations",
                  desc: "Instantly route qualified lead events to Google Sheets, Slack, Webhooks, or Zapier.",
                  icon: Database,
                  color: "text-success bg-success/10 border-success/20"
                },
                {
                  title: "File & Image Sync",
                  desc: "Collect screenshot proofs of payment, receipts, and order media directly in the unified inbox.",
                  icon: Layers,
                  color: "text-warning bg-warning/10 border-warning/20"
                }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                  }}
                  whileHover={{ 
                    y: -8, 
                    transition: { duration: 0.3, ease: "easeOut" } 
                  }}
                  className="group bg-card/30 border border-white/5 p-6 rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-brand-purple/20 shadow-sm dark:shadow-none"
                >
                  {/* Glowing background blob specific to the card theme */}
                  <div className={`absolute -right-12 -bottom-12 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none ${
                    index === 0 ? 'bg-brand-pink' :
                    index === 1 ? 'bg-brand-purple' :
                    index === 2 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />

                  {/* Border top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r ${
                    index === 0 ? 'from-brand-pink/50 to-brand-purple/50' :
                    index === 1 ? 'from-brand-purple/50 to-indigo-500/50' :
                    index === 2 ? 'from-emerald-500/50 to-teal-500/50' : 'from-amber-500/50 to-orange-500/50'
                  }`} />

                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 transition-all duration-300 ${item.color} group-hover:scale-110 shadow-md group-hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]`}>
                      <item.icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-zinc-800 dark:text-white mb-3 group-hover:text-brand-purple dark:group-hover:text-brand-pink transition-colors">{item.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4. SPAM / NOISE SHIELD SECTION (Best in class spam protection equivalent) */}
        <section id="noise-filter" className="py-24 border-t border-white/5 bg-black/10 relative">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">Spam, No Thanks.</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Best in class noise protection.
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed mb-6">
                Don't waste hours filtering spam, bot emojis, or generic comments. ReplyZens processes and filters low-intent chat noise, keeping your unified CRM inbox pristine and focused on raw buyers.
              </p>
              <div className="flex gap-4 items-center mb-8">
                <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success shrink-0">
                  <Check size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">98.6% Spam Detection Rate</h3>
                  <p className="text-xs text-zinc-500 font-medium">Powered by customized Meta NLP filters</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="w3-button-primary bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700/80 px-6 py-3 rounded-xl text-xs font-bold transition-all"
              >
                Protect Your Inbox
              </button>
            </div>

            <NoiseFilterMockup />
          </div>
        </section>

        {/* 5. TRANSPARENT PRICING SECTION (Pricing equivalent) */}
        <section id="pricing" className="py-24 border-t border-white/5 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">Simple & Transparent</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
                Pricing that scales with you.
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed">
                Start completely free with zero credit card required. Upgrade as your automated volume increases.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-[960px] mx-auto">
              
              {/* Free Plan */}
              <div className="bg-card/20 border border-white/5 rounded-3xl p-8 flex flex-col justify-between hover:border-white/10 transition-colors">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Free</h3>
                  <p className="text-xs text-zinc-500 h-8 font-medium">Explore basic automation features</p>
                  <div className="mb-8 mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-white">₹0</span>
                    <span className="text-zinc-500 text-xs font-bold ml-1">/mo</span>
                  </div>
                  <div className="mb-6">
                    <div className="text-xl font-bold text-white">25</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Active Contacts / mo</div>
                  </div>
                </div>
                <div>
                  <button onClick={() => navigate('/signup')} className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 text-xs font-bold rounded-xl transition-all mb-8">
                    Start For Free
                  </button>
                  <ul className="space-y-4 text-xs text-zinc-400">
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-success mt-0.5" /> Connect 1 IG Account</li>
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-success mt-0.5" /> 4 Basic Automations</li>
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-success mt-0.5" /> 1 Team User</li>
                  </ul>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="dark bg-gradient-to-b from-[#1E1735] to-[#120F22] border-2 border-brand-purple rounded-3xl p-8 flex flex-col justify-between relative overflow-visible shadow-xl shadow-brand-purple/5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-purple text-white px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-full whitespace-nowrap">
                  Most Popular
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Pro</h3>
                  <p className="text-xs text-brand-pink h-8 font-medium">For scaling creators & agencies</p>
                  <div className="mb-8 mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-white">₹2,499</span>
                    <span className="text-zinc-400 text-xs font-bold ml-1">/mo</span>
                  </div>
                  <div className="mb-6">
                    <div className="text-xl font-bold text-white">2,500</div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Active Contacts / mo</div>
                  </div>
                </div>
                <div>
                  <button onClick={() => navigate('/signup')} className="w-full py-3 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-bold rounded-xl transition-all mb-8 shadow-lg shadow-brand-purple/20">
                    Try 14 Days Free
                  </button>
                  <ul className="space-y-4 text-xs text-zinc-300">
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-brand-pink mt-0.5" /> Connect 3 IG Accounts</li>
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-brand-pink mt-0.5" /> Advanced AI Automations</li>
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-brand-pink mt-0.5" /> 3 Team Users</li>
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-brand-pink mt-0.5" /> Full AI Features & Sync</li>
                  </ul>
                </div>
              </div>

              {/* Business Plan */}
              <div className="bg-card/20 border border-white/5 rounded-3xl p-8 flex flex-col justify-between hover:border-white/10 transition-colors">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Business</h3>
                  <p className="text-xs text-zinc-500 h-8 font-medium">For high-growth enterprise brands</p>
                  <div className="mb-8 mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-white">₹5,999</span>
                    <span className="text-zinc-500 text-xs font-bold ml-1">/mo</span>
                  </div>
                  <div className="mb-6">
                    <div className="text-xl font-bold text-white">7,500</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Active Contacts / mo</div>
                  </div>
                </div>
                <div>
                  <button onClick={() => navigate('/signup')} className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 text-xs font-bold rounded-xl transition-all mb-8">
                    Start Trial
                  </button>
                  <ul className="space-y-4 text-xs text-zinc-400">
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-success mt-0.5" /> Unlimited IG Accounts</li>
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-success mt-0.5" /> Dedicated Sync Server</li>
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-success mt-0.5" /> Unlimited Team Users</li>
                    <li className="flex items-start gap-2.5"><Check size={14} className="text-success mt-0.5" /> Priority 24/7 VIP Support</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6. FAQ ACCORDION SECTION (Frequently Asked Questions equivalent) */}
        <section id="faq" className="py-24 border-t border-white/5 bg-black/10 relative">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">Have Questions?</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 leading-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <motion.div 
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col gap-4"
            >
              {[
                { q: "What is ReplyZens?", a: "ReplyZens is an Instagram DM automation and CRM platform. It connects with your Instagram business page via official Meta APIs and acts as a backend dashboard to automate customer replies, score lead intent, filter noise, and sync customer data to Google Sheets." },
                { q: "Is it safe to connect my Instagram account?", a: "Yes, 100%. We utilize Meta's official Graph API and OAuth protocol. Your account details remain completely private, and we strictly follow Instagram Platform Policies." },
                { q: "Does the AI support languages other than English?", a: "Yes, our integrated AI Assistant (Maya) automatically detects and answers messages in over 40 languages including Spanish, German, French, Portuguese, Hindi, and more." },
                { q: "Can I cancel or upgrade my subscription plan anytime?", a: "Yes, you can upgrade, downgrade, or cancel your subscription plan at any time directly through your billing portal. There are no locking periods or cancellation fees." }
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* 7. FINAL CTA (Collect Form Submissions equivalent) */}
        <section className="py-32 border-t border-white/5 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/5 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Create your DM API and start automating today.
            </h2>
            <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto mb-10">
              Set up your custom rules and let our backend protect your inbox, handle questions, and qualify leads 24/7.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="w3-button-primary bg-gradient-to-r from-brand-pink to-brand-purple font-bold px-10 py-5 rounded-xl text-sm shadow-xl shadow-brand-pink/20 hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-2 group"
            >
              Get Started In 2 Minutes
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#07080C] pt-20 pb-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            
            {/* Logo and Brand Summary */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-6 group">
                <img src="/favicon.svg" alt="ReplyZens Logo" className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105" />
                <span className="text-lg font-bold tracking-tight text-white uppercase font-outfit">
                  Reply<span className="text-brand-pink">Zens</span>
                </span>
              </Link>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                The modern Instagram DM API and CRM for digital creators, scaling agencies, and high-growth e-commerce brands. Automatically route inquiries and scale your conversions.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Product</h4>
              <ul className="space-y-4 text-xs font-medium text-zinc-500">
                <li><a href="#features" className="hover:text-brand-purple transition-colors">Features</a></li>
                <li><a href="#setup" className="hover:text-brand-purple transition-colors">Integration Setup</a></li>
                <li><a href="#pricing" className="hover:text-brand-purple transition-colors">Pricing Plans</a></li>
                <li><a href="#noise-filter" className="hover:text-brand-purple transition-colors">Noise Filter</a></li>
              </ul>
            </div>

            {/* Developers Column */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Developer API</h4>
              <ul className="space-y-4 text-xs font-medium text-zinc-500">
                <li><a href="#" className="hover:text-brand-purple transition-colors">Webhooks</a></li>
                <li><a href="#" className="hover:text-brand-purple transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-brand-purple transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-brand-purple transition-colors">System Status</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Legal</h4>
              <ul className="space-y-4 text-xs font-medium text-zinc-500">
                <li><Link to="/privacy" className="hover:text-brand-purple transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-brand-purple transition-colors">Terms of Service</Link></li>
                <li><Link to="/data-deletion" className="hover:text-brand-purple transition-colors">Data Deletion</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-[10px] font-bold">
            <span>© 2026 ReplyZens Inc. All rights reserved.</span>
            <span>Built with ❤ for professional Instagram automation.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
