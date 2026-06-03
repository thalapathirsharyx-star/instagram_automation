import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
  Activity,
  KanbanSquare,
  Hexagon,
  Settings,
  Bell,
  Bot,
  Clock,
  MessageCircle,
  Calendar
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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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
      className={`border border-black/5 dark:border-white/5 rounded-2xl p-6 bg-zinc-500/5 dark:bg-white/[0.02] hover:bg-zinc-500/10 dark:hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden shadow-sm dark:shadow-none ${isOpen ? 'ring-1 ring-brand-purple/20 border-brand-purple/30' : ''
        }`}
    >
      {/* Glowing vertical indicator stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-pink to-brand-purple transition-all duration-500 origin-top ${isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
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
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isOpen
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tabKey
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
      <div className="dark relative rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden shadow-2xl p-6 min-h-[300px] flex flex-col justify-center items-center">
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
                  <div className="absolute -bottom-4 right-1 flex items-center gap-1 text-[8px] font-extrabold text-brand-pink bg-zinc-950 px-2 py-0.5 rounded-full border border-white/5">
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
    <div className="dark w-full bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 flex flex-col h-[400px]">
      {/* Browser Bar */}
      <div className="h-10 bg-[#11141D] border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/50 rounded-lg border border-white/5">
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
  const welcomeMessage = {
    sender: 'ai' as const,
    text: "Welcome to jordan.design! 👋 Let us know if you have any questions about pricing, sizing, or shipping."
  };

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([welcomeMessage]);
  const [typing, setTyping] = useState(false);
  const [syncStatus, setSyncStatus] = useState(false);

  useEffect(() => {
    let active = true;
    const runAnimation = async () => {
      if (!active) return;
      setMessages([welcomeMessage]);
      setTyping(false);
      setSyncStatus(false);

      // Step 1: User message 1
      await new Promise(r => setTimeout(r, 1600));
      if (!active) return;
      setMessages(prev => [...prev, { sender: 'user', text: "Hey! Do you ship to Canada? 🇨🇦" }]);

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
      await new Promise(r => setTimeout(r, 2200));
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
      await new Promise(r => setTimeout(r, 6500));
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
    <div className="dark relative mx-auto py-6 px-4 sm:px-6">
      {/* Physical Volume Buttons on the Left */}
      <div className="absolute left-[14px] sm:left-[22px] top-28 w-[3px] h-6 bg-[#2d2d30] rounded-l-md border-y border-l border-white/10 z-10" />
      <div className="absolute left-[14px] sm:left-[22px] top-38 w-[3px] h-10 bg-[#2d2d30] rounded-l-md border-y border-l border-white/10 z-10" />
      <div className="absolute left-[14px] sm:left-[22px] top-50 w-[3px] h-10 bg-[#2d2d30] rounded-l-md border-y border-l border-white/10 z-10" />

      {/* Physical Power Button on the Right */}
      <div className="absolute right-[14px] sm:right-[22px] top-42 w-[3px] h-14 bg-[#2d2d30] rounded-r-md border-y border-r border-white/10 z-10" />

      {/* Outer Phone Container - Styled with Metallic Bezel and Premium Drop Shadows */}
      <div className="relative w-[280px] h-[540px] sm:w-[300px] sm:h-[580px] bg-gradient-to-b from-[#3a3a40] via-[#1a1a1c] to-[#0a0a0c] rounded-[46px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/20 overflow-hidden font-sans select-none z-10">

        {/* Dynamic Island with Subtle Camera Lens Reflection */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#000] rounded-full z-30 flex items-center justify-center border border-zinc-900 shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-[#071328] border-[0.5px] border-zinc-800 shadow-[inset_0_0_2px_rgba(0,255,200,0.5)] mr-3 ml-auto opacity-70" />
        </div>

        {/* Screen Glass Shine / Reflection Overlay */}
        <div className="absolute inset-2.5 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.06] pointer-events-none z-20 rounded-[38px] mix-blend-overlay" />

        {/* Screen Content */}
        <div className="w-full h-full bg-[#050508] rounded-[38px] overflow-hidden relative flex flex-col pt-7 border border-white/10">

          {/* iOS Status Bar */}
          <div className="h-5 px-5 flex items-center justify-between text-[8px] font-semibold text-zinc-300 z-20 relative bg-[#050508]/80 select-none shrink-0">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Signal Bars */}
              <div className="flex items-end gap-[1px] h-1.5">
                <div className="w-[1px] h-[2px] bg-zinc-300 rounded-2xs" />
                <div className="w-[1px] h-[3px] bg-zinc-300 rounded-2xs" />
                <div className="w-[1px] h-[4px] bg-zinc-300 rounded-2xs" />
                <div className="w-[1px] h-[5px] bg-zinc-300 rounded-2xs" />
              </div>

              {/* Wifi Icon */}
              <svg className="w-2 h-2 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M1.5 9.5a15 15 0 0 1 21 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              {/* Battery Icon */}
              <div className="w-3.5 h-1.5 border border-zinc-400 rounded-[2px] p-[0.5px] flex items-center relative">
                <div className="h-full w-2 bg-emerald-500 rounded-[0.5px]" />
                <div className="w-[0.5px] h-0.75 bg-zinc-400 rounded-r-[0.5px] absolute -right-[1.5px]" />
              </div>
            </div>
          </div>

          {/* Instagram DM Header */}
          <div className="h-12 border-b border-white/5 px-3 flex items-center justify-between bg-[#0B0A0F]/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-1.5">
              <ChevronLeft size={16} className="text-zinc-300 hover:text-white cursor-pointer shrink-0" />

              {/* Profile Image Container with Story Gradient Ring */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1.5px] shrink-0">
                <div className="w-full h-full rounded-full bg-[#050508] p-[1px]">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center text-[7px] font-extrabold text-white font-outfit">
                    JD
                  </div>
                </div>
              </div>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px] font-bold text-zinc-100 leading-tight truncate max-w-[70px] sm:max-w-[90px]">jordan.design</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0095F6] flex items-center justify-center shrink-0 shadow-sm scale-75">
                    <svg className="w-1.5 h-1.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>
                <span className="text-[6.5px] text-emerald-400 font-semibold flex items-center gap-0.5 leading-none mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Active now
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-1.5">
              <Phone size={13} className="text-zinc-300 hover:text-white cursor-pointer transition-colors shrink-0" />
              <Video size={13} className="text-zinc-300 hover:text-white cursor-pointer transition-colors shrink-0" />
              <Info size={13} className="text-zinc-300 hover:text-white cursor-pointer transition-colors shrink-0" />
            </div>
          </div>

          {/* Message Feed with Midnight Glow Background */}
          <div className="flex-1 p-3 space-y-3.5 overflow-y-auto premium-scroll flex flex-col bg-gradient-to-b from-[#050508] via-[#08070D] to-[#050508]">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`flex w-full ${msg.sender === 'ai' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-1.5 max-w-[85%] ${msg.sender === 'ai' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* User profile icon to the left of incoming messages */}
                    {msg.sender === 'user' && (
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[7px] font-bold text-zinc-300 border border-white/5 shrink-0 select-none">
                        US
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div
                        className={`px-3 py-2 rounded-[18px] text-[9.5px] font-medium leading-normal text-left ${msg.sender === 'ai'
                          ? 'bg-gradient-to-tr from-brand-pink via-[#8B5CF6] to-brand-purple text-white rounded-tr-none shadow-md shadow-brand-purple/10'
                          : 'bg-zinc-800/90 text-zinc-100 rounded-tl-none border border-white/5 shadow-sm'
                          }`}
                      >
                        {msg.text}
                      </div>

                      {msg.sender === 'ai' && (
                        <span className="text-[6px] font-bold text-brand-pink/90 mt-1 flex items-center gap-0.5 justify-end mr-0.5 select-none uppercase tracking-wide">
                          <Sparkles size={6} className="text-brand-pink fill-brand-pink animate-pulse" /> Auto-reply
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="self-end flex flex-col items-end max-w-[85%]"
                >
                  <div className="bg-gradient-to-tr from-brand-pink via-[#8B5CF6] to-brand-purple text-white px-3.5 py-2.5 rounded-[18px] rounded-tr-none flex items-center gap-1.5 shadow-md shadow-brand-purple/10">
                    <div className="flex gap-1 py-0.5">
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                  <span className="text-[6px] font-bold text-brand-purple mt-1 flex items-center gap-0.5 self-end mr-1 select-none uppercase tracking-wide">
                    <Zap size={6} className="text-brand-purple fill-brand-purple animate-pulse" /> Agent typing
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Instagram Message Input Bar */}
          <div className="p-2.5 pb-4 border-t border-white/5 bg-[#050508] shrink-0 flex items-center gap-2">
            {/* Blue camera button */}
            <div className="w-6.5 h-6.5 rounded-full bg-[#0095F6] flex items-center justify-center text-white shrink-0 cursor-pointer hover:bg-blue-600 transition-colors">
              <Camera size={11} className="stroke-[2.5]" />
            </div>

            {/* Input Field Pill */}
            <div className="flex-1 bg-[#1C1C1E] border border-white/5 rounded-full h-7 px-2.5 flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-medium select-none">Message...</span>
              <div className="flex items-center gap-2 text-zinc-400 pr-0.5">
                <Mic size={11} className="cursor-pointer hover:text-white transition-colors" />
                <Image size={11} className="cursor-pointer hover:text-white transition-colors" />
                <Smile size={11} className="cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Home swipe indicator at bottom */}
          <div className="absolute bottom-1 w-20 h-1 bg-white/20 rounded-full left-1/2 -translate-x-1/2 pointer-events-none z-30" />
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

const PIPELINE_STEPS = [
  {
    id: 1,
    title: "1. The Midnight Question",
    subtitle: "Alex DMs Sarah at 1:00 AM",
    desc: "Alex is scrolling Instagram late at night and sees Sarah's Canva Template pack. He sends a DM asking if it's still on sale and leaves his email: alex@gmail.com.",
  },
  {
    id: 2,
    title: "2. AI Assistant Steps In",
    subtitle: "Maya reads & drafts a reply while Sarah sleeps",
    desc: "While Sarah is asleep, the AI assistant instantly reads Alex's message. It understands he wants to buy, extracts his email, checks stock, and writes a friendly checkout reply.",
  },
  {
    id: 3,
    title: "3. The Win-Win Sync",
    subtitle: "Alex buys instantly, Sarah wakes up to a synced lead",
    desc: "Alex receives the reply in seconds and purchases the template. Meanwhile, his handle, email, and order choice are synced directly to Sarah's Google Sheets lead sheet.",
  }
];

const PipelineFlowSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Auto cycle steps every 7 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev === 3 ? 1 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section id="how-it-works" className="py-24 border-t border-white/5 relative bg-gradient-to-b from-black/20 to-black/5" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">How ReplyZens Works</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-3 mb-4 leading-tight">
            From raw message to structured CRM lead in seconds.
          </h2>
          <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed">
            See how our intelligent DM pipeline routes, processes, and synchronizes your customer inquiries automatically.
          </p>
        </div>

        {/* Pipeline Interface Container */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-16 items-center bg-zinc-50 border border-zinc-200/60 p-8 md:p-12 rounded-[2.5rem] shadow-sm">

          {/* Left Side: Step Details & Console Simulator */}
          <div className="flex flex-col justify-between h-full">

            <div className="flex flex-col gap-8">
              {/* Step Selection Buttons */}
              <div className="flex flex-wrap gap-3">
                {PIPELINE_STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`px-4 py-2.5 rounded-full text-[11px] font-bold transition-all cursor-pointer text-left flex items-center gap-2.5 ${activeStep === step.id
                      ? 'bg-[#Ece4ff] text-[#8b5cf6]'
                      : 'bg-transparent text-zinc-500 hover:bg-zinc-100'
                      }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${activeStep === step.id ? 'bg-[#8b5cf6] text-white' : 'bg-zinc-200 text-zinc-500'
                      }`}>
                      {step.id}
                    </span>
                    {step.title.split('. ')[1]}
                  </button>
                ))}
              </div>

              {/* Step Description */}
              <div className="text-left mt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8b5cf6]">
                  {PIPELINE_STEPS[activeStep - 1].subtitle}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 mt-2 mb-4">
                  {PIPELINE_STEPS[activeStep - 1].title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-medium max-w-lg">
                  {PIPELINE_STEPS[activeStep - 1].desc}
                </p>
              </div>
            </div>

            {/* Console Simulator Box */}
            <div className="relative rounded-[1.25rem] bg-[#111111] border border-[#222] overflow-hidden p-6 min-h-[220px] flex flex-col justify-center shadow-xl text-left font-sans mt-8">

              {/* Console Header */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-[#1a1a1a] border-b border-[#333] flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />

                <span className="ml-auto text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {activeStep === 1 && "1:00 AM: INCOMING MESSAGE"}
                  {activeStep === 2 && "MAYA AI READING DETAILS"}
                  {activeStep === 3 && "GOOGLE SHEETS (AUTO-SYNCED)"}
                </span>
              </div>

              {/* Console Content based on activeStep */}
              <div className="pt-6 flex-grow flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {activeStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-[9px] font-mono text-brand-pink bg-brand-pink/5 border border-brand-pink/10 px-3 py-1.5 w-max rounded-md select-none">
                        <Zap size={12} /> Message Received from @alex_scrolls
                      </div>

                      {/* Customer IG Bubble Mockup */}
                      <div className="flex items-start gap-3 max-w-[90%] bg-[#1a1a1a] border border-[#333] p-4 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[9px] font-bold text-zinc-400 uppercase shrink-0">
                          AL
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-zinc-400 mb-1">@alex_scrolls</div>
                          <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                            "Hey! Is the Custom Canva Template bundle still on sale? I want to buy it. Send details to alex@gmail.com"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="grid md:grid-cols-2 gap-5"
                    >
                      {/* Text highlighting column */}
                      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-3 select-none">Incoming Message</div>
                        <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                          "Hey! Is the <span className="bg-brand-pink/10 text-brand-pink border border-brand-pink/20 px-1 rounded">Custom Canva Template</span> still on sale? Send details to <span className="bg-brand-purple/10 text-brand-purple border border-brand-purple/20 px-1 rounded">alex@gmail.com</span>"
                        </p>
                      </div>

                      {/* AI Parsing column */}
                      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3 shadow-sm">
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2 select-none">Extracted Entities</div>

                        <div className="flex justify-between items-center text-[10px] border-b border-[#333] pb-1.5">
                          <span className="text-zinc-500 font-medium">Intent</span>
                          <span className="text-zinc-200 font-bold bg-brand-purple/20 px-2 py-0.5 rounded text-brand-purple border border-brand-purple/20">Wants to Buy</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] border-b border-[#333] pb-1.5">
                          <span className="text-zinc-500 font-medium">Product</span>
                          <span className="text-zinc-200 font-bold">Canva Template</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] border-b border-[#333] pb-1.5">
                          <span className="text-zinc-500 font-medium">Email</span>
                          <span className="text-brand-pink font-bold">alex@gmail.com</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-zinc-500 font-medium">Spam Score</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><Check size={10} strokeWidth={3} /> Safe</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Synced row overlay mockup */}
                      <div className="bg-[#1a1a1a] border border-brand-purple/30 rounded-xl p-4 flex flex-col gap-3 relative shadow-lg shadow-brand-purple/10">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Lead Database</span>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Auto-Synced
                          </span>
                        </div>

                        {/* Mock spreadsheet headers */}
                        <div className="grid grid-cols-4 gap-2 text-[9px] font-bold text-zinc-500 bg-[#111] p-1.5 rounded select-none border border-[#333]">
                          <span className="px-1">Handle</span>
                          <span className="px-1">Email</span>
                          <span className="px-1">Product</span>
                          <span className="px-1">Interest</span>
                        </div>

                        {/* Mock spreadsheet row */}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="grid grid-cols-4 gap-2 text-[10px] font-medium text-zinc-200 p-1.5"
                        >
                          <span className="truncate px-1">@alex_scrolls</span>
                          <span className="truncate px-1">alex@gmail.com</span>
                          <span className="truncate px-1">Canva Template</span>
                          <span className="text-brand-pink font-bold px-1">🔥 High</span>
                        </motion.div>
                      </div>

                      {/* Automated Reply Sent Badge */}
                      <div className="flex items-center gap-2 justify-end text-[10px] text-zinc-400 font-medium pr-1">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span>Auto-reply successfully dispatched.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>

          {/* Right Side: Flow Graph Visualizer */}
          <div className="flex items-center justify-center min-h-[420px] rounded-[1.5rem] bg-[#09090C] relative overflow-hidden p-8 shadow-2xl">

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 dot-grid opacity-[0.15] pointer-events-none" />

            {/* Glowing background circles for active node */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <AnimatePresence mode="wait">
                {activeStep === 1 && (
                  <motion.div
                    key="glow1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-56 h-56 rounded-full bg-brand-pink blur-[50px]"
                  />
                )}
                {activeStep === 2 && (
                  <motion.div
                    key="glow2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.2, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-56 h-56 rounded-full bg-brand-purple blur-[50px]"
                  />
                )}
                {activeStep === 3 && (
                  <motion.div
                    key="glow3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-56 h-56 rounded-full bg-emerald-500 blur-[50px]"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* SVG Connecting Conduit Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: "100%" }}>
              <defs>
                <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff4fd8" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Path from Node 1 (Instagram) to Node 2 (AI Core) */}
              <motion.path
                d="M 150 90 L 150 210"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="4"
                fill="none"
              />
              <motion.path
                d="M 150 90 L 150 210"
                stroke="url(#flow-gradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="8 8"
                animate={activeStep === 1 || activeStep === 2 ? { strokeDashoffset: [-32, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />

              {/* Path from Node 2 (AI Core) to Node 3 (CRM) */}
              <motion.path
                d="M 150 210 L 150 330"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="4"
                fill="none"
              />
              <motion.path
                d="M 150 210 L 150 330"
                stroke="url(#flow-gradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="8 8"
                animate={activeStep === 2 || activeStep === 3 ? { strokeDashoffset: [-32, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />

              {/* Glowing Data Packet Circle */}
              <AnimatePresence>
                {activeStep === 1 && (
                  <motion.circle
                    cx="150"
                    cy="90"
                    r="5"
                    fill="#ff4fd8"
                    className="shadow-[0_0_10px_#ff4fd8]"
                    animate={{ cy: [90, 210] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {activeStep === 2 && (
                  <motion.circle
                    cx="150"
                    cy="210"
                    r="5"
                    fill="#8b5cf6"
                    className="shadow-[0_0_10px_#8b5cf6]"
                    animate={{ cy: [210, 330] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>
            </svg>

            {/* Nodes Layout Grid */}
            <div className="flex flex-col justify-between items-center gap-[4rem] relative z-10 w-full max-w-[240px]">

              {/* Node 1: Instagram */}
              <button
                onClick={() => setActiveStep(1)}
                className={`w-16 h-16 rounded-[1rem] flex items-center justify-center border transition-all cursor-pointer relative group ${activeStep === 1
                  ? 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white border-white/20 shadow-[0_0_25px_rgba(238,42,123,0.5)] scale-110'
                  : 'bg-zinc-900 border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
              >
                <Instagram size={28} />
                <span className="absolute left-20 bg-[#1a1a1a] border border-[#333] px-3 py-1.5 rounded-lg text-[9px] font-bold text-zinc-300 uppercase tracking-wider pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                  1. INSTAGRAM DM
                </span>
              </button>

              {/* Node 2: ReplyZens AI Core */}
              <button
                onClick={() => setActiveStep(2)}
                className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all cursor-pointer relative group ${activeStep === 2
                  ? 'bg-[#111] text-white border-brand-purple/50 shadow-[0_0_30px_rgba(139,92,246,0.3)] scale-110'
                  : 'bg-zinc-900 border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
              >
                <Zap size={24} className={activeStep === 2 ? "text-brand-purple" : ""} />
                <span className="absolute left-20 bg-[#1a1a1a] border border-[#333] px-3 py-1.5 rounded-lg text-[9px] font-bold text-zinc-300 uppercase tracking-wider pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                  2. AI PARSING CORE
                </span>
              </button>

              {/* Node 3: Your CRM */}
              <button
                onClick={() => setActiveStep(3)}
                className={`w-14 h-14 rounded-[1rem] flex items-center justify-center border transition-all cursor-pointer relative group ${activeStep === 3
                  ? 'bg-[#111] text-emerald-400 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-110'
                  : 'bg-zinc-900 border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
              >
                <Database size={24} />
                <span className="absolute left-20 bg-[#1a1a1a] border border-[#333] px-3 py-1.5 rounded-lg text-[9px] font-bold text-zinc-300 uppercase tracking-wider pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                  3. CRM / DATABASE
                </span>
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};


const Metrics = () => (
  <section className="py-16 border-y border-white/5 bg-zinc-900/50 backdrop-blur-xl relative z-10">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-white/5">
        {[
          { label: "Conversations Automated", value: "10,000+" },
          { label: "Faster Response Time", value: "85%" },
          { label: "More Qualified Leads", value: "3x" },
          { label: "AI Availability", value: "24/7" },
        ].map((m, i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={i} className="text-center px-4">
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">{m.value}</div>
            <div className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-wider">{m.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Problem = () => (
  <section className="py-24 relative bg-background">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Every Missed DM Is <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple">Lost Revenue</span></h2>
          <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed">Manual replies can't scale. While you sleep or focus on growing the business, your competitors are answering your customers instantly.</p>
        </motion.div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: <Clock size={24} />, title: "Slow Responses", desc: "Customers leave before you reply. 78% of buyers purchase from the company that responds first." },
          { icon: <MessageCircle size={24} />, title: "Repetitive Questions", desc: "Your team wastes hours answering the same pricing, sizing, and shipping questions daily." },
          { icon: <X size={24} />, title: "Missed Opportunities", desc: "Potential buyers ghost you because they never get followed up or guided to checkout." }
        ].map((p, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={i}>
            <div className="p-8 rounded-3xl bg-card/20 border border-white/5 hover:border-white/10 transition-colors h-full shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6">
                {p.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{p.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const DiagramNode = ({ icon, title, desc, active = false }: { icon: React.ReactNode, title: string, desc: string, active?: boolean }) => (
  <div className={`flex flex-col items-center text-center p-6 rounded-2xl w-40 shrink-0 transition-all duration-500 ${active ? 'bg-brand-purple/10 border border-brand-purple/50 shadow-[0_0_30px_rgba(139,92,246,0.3)] scale-105 z-10' : 'bg-white/5 border border-white/10 scale-100 opacity-50'}`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-500 ${active ? 'bg-brand-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.8)]' : 'bg-zinc-900 text-zinc-500'}`}>
      {icon}
    </div>
    <div className={`font-bold text-sm mb-1 transition-colors duration-500 ${active ? 'text-white' : 'text-zinc-400'}`}>{title}</div>
    <div className="text-[10px] text-zinc-500">{desc}</div>
  </div>
);

const DiagramArrow = ({ active = false }: { active?: boolean }) => (
  <div className="hidden lg:flex flex-col items-center justify-center w-12 shrink-0 overflow-hidden">
    <div className={`h-0.5 w-full relative transition-colors duration-500 ${active ? 'bg-brand-purple' : 'bg-black/10 dark:bg-white/10'}`}>
      {active && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-pink to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 border-t-[4px] border-b-[4px] border-l-[4px] border-transparent transition-colors duration-500 ${active ? 'border-l-brand-purple' : 'border-l-black/20 dark:border-l-white/20'}`} />
    </div>
  </div>
);

const Solution = () => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 border-y border-white/5 relative overflow-hidden bg-zinc-950/50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-[10px] font-bold uppercase tracking-widest mb-6">
               <Bot size={14} /> Meet Your AI Assistant
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Your AI Instagram Sales Assistant</h2>
            <p className="text-sm md:text-base text-zinc-400 font-medium">A seamless architecture designed to convert engagement into revenue without human intervention.</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <div className="max-w-5xl mx-auto p-1 rounded-[32px] bg-gradient-to-b from-white/10 to-transparent border border-white/10">
             <div className="bg-zinc-950 rounded-[28px] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
               
               <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
                  <DiagramNode icon={<MessageCircle size={20} />} title="Instagram DM" desc="Customer messages you" active={step >= 1} />
                  <DiagramArrow active={step >= 2} />
                  <DiagramNode icon={<Bot size={20} className={step >= 2 ? "text-white" : ""} />} title="AI Understands Intent" desc="NLP processes context" active={step >= 2} />
                  <DiagramArrow active={step >= 3} />
                  <div className="flex flex-col gap-4">
                    <DiagramNode icon={<Zap size={20} />} title="Replies Instantly" desc="Answers questions" active={step >= 3} />
                    <DiagramNode icon={<Users size={20} />} title="Captures Lead" desc="Extracts email/phone" active={step >= 3} />
                    <DiagramNode icon={<Calendar size={20} />} title="Books Meeting" desc="Shares calendar link" active={step >= 3} />
                  </div>
                  <DiagramArrow active={step >= 4} />
                  <DiagramNode icon={<Database size={20} />} title="Sends To CRM" desc="Syncs data automatically" active={step >= 4} />
               </div>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const NewFeatures = () => (
  <section className="py-24 relative bg-background">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: <Bot size={24} />, title: "AI Replies", desc: "Natural, human-like conversations powered by advanced AI that learns from your business." },
          { icon: <MessageCircle size={24} />, title: "Comment-to-DM", desc: "Instantly convert post and reel engagement into direct messages and leads." },
          { icon: <Users size={24} />, title: "Lead Qualification", desc: "Automatically collect and qualify customer details before passing them to your team." },
          { icon: <Inbox size={24} />, title: "Smart Inbox", desc: "Manage all your automated and manual conversations in one clean, unified workspace." },
          { icon: <Calendar size={24} />, title: "Appointment Booking", desc: "Let AI book meetings and schedule calls directly inside Instagram DMs." },
          { icon: <BarChart3 size={24} />, title: "Analytics Dashboard", desc: "Track leads, conversion rates, and response metrics to measure your ROI." }
        ].map((f, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={i}>
            <div className="p-8 rounded-3xl bg-card/20 border border-white/5 hover:border-brand-purple/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all group h-full">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-brand-purple/20 group-hover:text-brand-purple group-hover:border-brand-purple/30 transition-colors text-zinc-400">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 text-white">{f.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Automations = () => (
  <section className="py-24 relative border-t border-white/5 bg-zinc-950/50">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Automations That Drive Growth</h2>
          <p className="text-sm md:text-base text-zinc-400 font-medium">Pre-built flows that generate revenue while you sleep.</p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Comment "PRICE"', flows: ["Post Comment", "DM Sent", "Lead Captured"] },
          { title: 'Story Reply', flows: ["Story Reply", "AI Qualification", "Appointment Booked"] },
          { title: 'Keyword Message', flows: ["Keyword DM", "Product Recommendation", "Sale Closed"] },
        ].map((a, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={i}>
            <div className="p-8 rounded-3xl bg-card/30 border border-white/5 hover:border-brand-pink/30 transition-colors shadow-lg group">
               <h3 className="text-xl font-bold mb-8 text-white group-hover:text-brand-pink transition-colors">{a.title}</h3>
               <div className="space-y-4 relative">
                 <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-brand-purple to-brand-pink opacity-50 group-hover:opacity-100 transition-opacity" />
                 {a.flows.map((step, j) => (
                   <div key={j} className="flex items-center gap-4 relative z-10">
                     <div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-white/10 flex items-center justify-center text-brand-purple font-bold shadow-lg text-sm group-hover:border-brand-pink/30 group-hover:text-brand-pink transition-colors">
                       {j + 1}
                     </div>
                     <div className="font-semibold text-zinc-300 text-sm bg-white/5 px-4 py-3 rounded-xl flex-1 border border-white/5">
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
);

const Comparison = () => (
  <section className="py-24 bg-background relative border-t border-black/5 dark:border-white/5">
    <div className="max-w-5xl mx-auto px-6 relative z-10">
      <div className="text-center mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">Why upgrade from Manual DMs?</h2>
        </motion.div>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
        <div className="relative max-w-4xl mx-auto">
          {/* Floating Highlight for ReplyZens */}
          <div className="absolute top-0 bottom-0 left-1/3 w-1/3 bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.15)] border border-brand-purple/20 -z-10 transform scale-y-110" />
          
          <div className="grid grid-cols-3 items-center">
            {/* Headers */}
            <div className="p-4 md:p-8 font-bold text-xs md:text-sm uppercase tracking-widest text-zinc-400">Core Capabilities</div>
            <div className="p-4 md:p-8 text-center flex flex-col items-center justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple font-bold text-[10px] uppercase tracking-wider mb-2 md:mb-3">
                 <Sparkles size={12} /> The Smart Way
              </div>
              <div className="font-extrabold text-lg md:text-2xl text-foreground">ReplyZens</div>
            </div>
            <div className="p-4 md:p-8 font-bold text-center text-xs md:text-sm uppercase tracking-widest text-zinc-400">Manual DMs</div>

            {/* Rows */}
            {[
              { label: "Response Time", pro: "Instant (< 1s)", con: "Hours or Days" },
              { label: "Availability", pro: "24/7/365", con: "Business Hours" },
              { label: "Lead Qualification", pro: "Automated & Scored", con: "Manual Guesswork" },
              { label: "Meeting Booking", pro: "Directly in Chat", con: "Back-and-forth Links" },
              { label: "CRM Syncing", pro: "Real-time Sync", con: "Manual Data Entry" },
              { label: "Cost to Scale", pro: "$0 Extra", con: "Hire More Staff" }
            ].map((row, i) => (
              <React.Fragment key={i}>
                <div className="p-4 md:p-6 border-t border-black/5 dark:border-white/5 font-semibold text-xs md:text-base text-foreground flex items-center">
                  {row.label}
                </div>
                <div className="p-4 md:p-6 border-t border-brand-purple/10 text-center font-bold text-xs md:text-base text-brand-purple">
                  {row.pro}
                </div>
                <div className="p-4 md:p-6 border-t border-black/5 dark:border-white/5 text-center font-medium text-xs md:text-base text-zinc-500">
                  {row.con}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const ROICalculator = () => {
  const [dms, setDms] = useState(1000);
  const [conversion, setConversion] = useState(5);
  const [value, setValue] = useState(100);

  const missedRevenue = Math.round((dms * 0.4) * (conversion / 100) * value);

  return (
    <section className="py-24 relative border-t border-white/5 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Calculate Your Lost Revenue</h2>
              <p className="text-sm md:text-base text-zinc-400 mb-10">See how much money you are leaving on the table by not automating your Instagram DMs.</p>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-bold text-white text-sm">Monthly DMs</label>
                    <span className="text-brand-purple font-bold text-sm">{dms.toLocaleString()}</span>
                  </div>
                  <input type="range" min="100" max="10000" step="100" value={dms} onChange={e => setDms(Number(e.target.value))} className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-purple" />
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-bold text-white text-sm">Conversion Rate (%)</label>
                    <span className="text-brand-purple font-bold text-sm">{conversion}%</span>
                  </div>
                  <input type="range" min="1" max="20" step="1" value={conversion} onChange={e => setConversion(Number(e.target.value))} className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-purple" />
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-bold text-white text-sm">Average Deal Value ($)</label>
                    <span className="text-brand-purple font-bold text-sm">${value.toLocaleString()}</span>
                  </div>
                  <input type="range" min="10" max="1000" step="10" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-purple" />
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <div className="bg-gradient-to-br from-brand-purple to-brand-pink p-[1px] rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.2)]">
              <div className="bg-zinc-950 rounded-[23px] p-10 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 blur-[80px] -z-10" />
                <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-widest mb-4">Revenue You're Missing</h3>
                <div className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter">
                  ${missedRevenue.toLocaleString()}
                </div>
                <p className="text-sm text-zinc-500 mb-8 font-medium">Per month due to slow replies and uncaptured leads.</p>
                <Link to="/signup" className="block w-full py-4 rounded-xl bg-brand-purple text-white font-bold text-sm hover:bg-brand-purple/90 transition-colors shadow-xl">
                  Stop Losing Money
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const NewPricing = () => {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-24 border-t border-black/5 dark:border-white/5 relative bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">Simple & Transparent</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mt-3 mb-4 leading-tight">
            Pricing that scales with you.
          </h2>
          <p className="text-sm md:text-base text-zinc-500 font-medium leading-relaxed">
            Start completely free with zero credit card required. Upgrade as your automated volume increases.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
          {[
            { 
              name: "Free", 
              for: "Explore basic automation features", 
              price: "₹0", 
              volume: "25",
              btnText: "Start For Free",
              features: ["Connect 1 IG Account", "4 Basic Automations", "1 Team User"] 
            },
            { 
              name: "Pro", 
              for: "For scaling creators & agencies", 
              price: "₹2,499", 
              popular: true, 
              volume: "2,500",
              btnText: "Try 14 Days Free",
              features: ["Connect 3 IG Accounts", "Advanced AI Automations", "3 Team Users", "Full AI Features & Sync"] 
            },
            { 
              name: "Business", 
              for: "For high-growth enterprise brands", 
              price: "₹5,999", 
              volume: "7,500",
              btnText: "Start Trial",
              features: ["Unlimited IG Accounts", "Dedicated Sync Server", "Unlimited Team Users", "Priority 24/7 VIP Support"] 
            }
          ].map((p, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={i}>
              <div className={`p-8 rounded-[32px] border h-full flex flex-col relative ${p.popular ? 'bg-[#0B0A10] border-brand-purple shadow-[0_0_40px_rgba(139,92,246,0.15)] transform md:-translate-y-4' : 'bg-card/20 border-black/10 dark:border-white/10 mt-4'}`}>
                 {p.popular && (
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-purple text-[#ffffff] text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                     Most Popular
                   </div>
                 )}
                 <div className="mb-6">
                   <h3 className={`text-2xl font-bold mb-2 ${p.popular ? 'text-[#ffffff]' : 'text-foreground'}`}>{p.name}</h3>
                   <p className={`text-xs font-medium ${p.popular ? 'text-brand-pink' : 'text-zinc-500'}`}>{p.for}</p>
                 </div>
                 
                 <div className="mb-6 flex items-baseline gap-1">
                   <span className={`text-4xl font-extrabold ${p.popular ? 'text-[#ffffff]' : 'text-foreground'}`}>{p.price}</span>
                   <span className={`text-sm font-bold ${p.popular ? 'text-zinc-400' : 'text-zinc-500'}`}>/mo</span>
                 </div>
                 
                 <div className="mb-8">
                   <div className={`text-2xl font-bold mb-1 ${p.popular ? 'text-[#ffffff]' : 'text-foreground'}`}>{p.volume}</div>
                   <div className={`text-[10px] font-bold uppercase tracking-wider ${p.popular ? 'text-zinc-400' : 'text-zinc-500'}`}>Active Contacts / Mo</div>
                 </div>
                 
                 <button onClick={() => navigate('/signup')} className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all mb-8 ${p.popular ? 'bg-brand-purple text-[#ffffff] hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20' : 'bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10'}`}>
                   {p.btnText}
                 </button>
                 
                 <div className="space-y-4 flex-1">
                   {p.features.map((f, j) => (
                     <div key={j} className="flex items-center gap-3">
                       <Check size={14} className={p.popular ? "text-brand-pink" : "text-zinc-400"} />
                       <span className={`text-xs font-medium ${p.popular ? 'text-[#e2e8f0]' : 'text-zinc-600 dark:text-zinc-400'}`}>{f}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const NewCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-32 border-t border-white/5 relative overflow-hidden text-center bg-zinc-950/50">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/5 to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Stop Losing Leads In Your Instagram Inbox
        </h2>
        <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto mb-10">
          Start automating conversations, qualifying prospects, and growing your business today.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="w3-button-primary bg-gradient-to-r from-brand-pink to-brand-purple font-bold px-10 py-5 rounded-xl text-sm shadow-xl shadow-brand-pink/20 hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-2 group"
        >
          Start Free Trial
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page bg-background text-foreground font-inter selection:bg-brand-purple/30 selection:text-white min-h-screen relative overflow-hidden">

      {/* Background Decorative Mesh Gradients (Formcarry-inspired styling) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-purple/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[400px] h-[400px] bg-brand-pink/5 blur-[100px] pointer-events-none" />

      {/* NAVBAR */}
      <Navbar />

      <main className="pt-[72px]">

        {/* 1. HERO SECTION */}
        <section className="relative pt-20 lg:pt-20 pb-20 z-10 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center relative z-10">
            {/* Left Content Column */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Tag / Badge */}
              {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-pink/10 border border-brand-pink/20 mb-6 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink">Formcarry-Inspired DM API</span>
              </div> */}

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white leading-[1.1] text-balance">
                Turn Every <span className="gradient-text-ai">Instagram DM</span> Into Revenue
              </h1>

              {/* Subtext */}
              <p className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed max-w-xl mb-8 text-balance">
                ReplyZens automatically replies to Instagram messages, qualifies leads, answers questions, and books appointments—24/7.
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
                  href="#how-it-works"
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

        {/* INTERACTIVE WORKFLOW PIPELINE */}
        <PipelineFlowSection />


        {/* INTERACTIVE WORKFLOW PIPELINE */}
        <PipelineFlowSection />
        
        <Metrics />
        <Problem />
        <Solution />
        <NewFeatures />
        <Automations />
        <Comparison />
        <ROICalculator />
        <NewPricing />
        
        {/* FAQ ACCORDION SECTION (Original) */}
        <section id="faq" className="py-24 border-t border-white/5 bg-zinc-950/50 relative">
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

        <NewCTA />

      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
};

export default Landing;
