import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Zap,
  Menu,
  X,
  Users,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowUpRight,
  TrendingDown,
  Filter,
  Check,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-slate-900 group-hover:text-slate-600 transition-colors">{question}</span>
        {isOpen ? <ChevronUp className="text-slate-900" /> : <ChevronDown className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 pb-2 text-slate-500 leading-relaxed font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// SVG Icon Component extracted
const AlertCircle = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="landing-page bg-white text-slate-900 font-outfit selection:bg-slate-900 selection:text-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 border-b border-slate-100 backdrop-blur-3xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 text-current" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">
              Reply<span className="text-slate-500">Zens</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a href="#story" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#faq" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">FAQ</a>
            <button
              onClick={() => navigate('/login')}
              className="bg-slate-900 hover:bg-slate-800 text-sm font-bold text-white px-6 py-2.5 rounded-xl shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden text-slate-900 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                <a href="#story" className="text-lg font-bold" onClick={() => setMobileOpen(false)}>Features</a>
                <a href="#how-it-works" className="text-lg font-bold" onClick={() => setMobileOpen(false)}>How it works</a>
                <a href="#faq" className="text-lg font-bold" onClick={() => setMobileOpen(false)}>FAQ</a>
                <button
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="bg-slate-900 text-white font-bold py-4 rounded-2xl"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-20">
        
        {/* 1. HERO SECTION (HOOK) */}
        <section className="relative pt-24 lg:pt-32 pb-32 z-10 overflow-hidden min-h-[90vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-50/50 dot-grid pointer-events-none -z-10" />
          <div className="max-w-6xl mx-auto px-6 w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center justify-center max-w-4xl mx-auto"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8 text-slate-900">
                Scale your Instagram DMs without <br />
                <span className="text-slate-400">scaling your workload</span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-500 font-medium leading-normal mb-12 max-w-3xl text-balance">
                Our CRM automatically filters all incoming messages, organizes them into a streamlined inbox, and turns them into qualified leads—so you don't have to manually reply to every customer.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-8">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-full text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 active:scale-95 transition-all w-full sm:w-auto min-w-[240px] group"
                >
                  Get Started Free
                  <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
                <button className="px-10 py-5 rounded-full text-lg font-bold bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50 transition-all w-full sm:w-auto min-w-[240px]">
                  Watch Demo
                </button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>No credit card</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"/>
                <span>14-day free trial</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"/>
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. PROBLEM SECTION (PAIN) */}
        <section className="relative py-32 z-10 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-6 text-center mb-20">
            <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-8 leading-tight"
            >
              Your DMs are full. <br/>
              <span className="text-slate-400">But your conversions aren't.</span>
            </motion.h2>

            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               className="text-xl text-slate-500 font-medium max-w-2xl mx-auto"
            >
              Every day, new messages come in — questions, inquiries, order requests.<br/>
              But most of them go unanswered, delayed, or lost in the chaos.
            </motion.p>
          </div>

          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            
            {/* Chaos Visualization */}
            <motion.div 
               className="relative h-[400px] w-full rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center"
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
            >
               {/* Floating chaos elements */}
               <motion.div 
                 animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, -5, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="absolute top-10 left-10 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 z-10"
               >
                 <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600"><AlertCircle size={16}/></div>
                 <div className="space-y-1">
                   <div className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1">Unread: Hi</div>
                   <div className="h-2 w-24 bg-slate-100 rounded mt-1"></div>
                 </div>
               </motion.div>

               <motion.div 
                 animate={{ y: [0, 30, 0], x: [0, -10, 0], rotate: [0, 5, 0] }}
                 transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                 className="absolute bottom-12 right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 z-20"
               >
                 <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><TrendingDown size={16}/></div>
                 <div className="space-y-1">
                   <div className="text-xs font-bold text-slate-900">Lead Lost</div>
                   <div className="text-[10px] text-slate-500">No reply after 2 days</div>
                 </div>
               </motion.div>

               <motion.div 
                 animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                 transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                 className="absolute inset-0 m-auto w-32 h-32 flex items-center justify-center opacity-30"
               >
                 <DotLottieReact
                    src="https://lottie.host/3b4f9ac2-8173-4c40-9dd0-0eac1d5263c9/fC41pUIMdc.lottie"
                    loop
                    autoplay
                 />
               </motion.div>
            </motion.div>

            {/* Pain Points */}
            <div className="flex flex-col gap-8">
              {[
                { title: "Important leads get buried under 'Hi' messages", icon: MessageSquare },
                { title: "You waste hours switching between apps", icon: Users },
                { title: "Manual replies slow everything down", icon: Clock },
                { title: "Opportunities slip through the cracks", icon: AlertCircleIcon }
              ].map((p, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex gap-5 items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex shrink-0 items-center justify-center text-red-500">
                    <p.icon size={18} className="stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center mt-24">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-black text-slate-900"
            >
              You're not losing customers because of demand — <br/>
              <span className="text-slate-400">you're losing them because you can't keep up.</span>
            </motion.p>
          </div>
        </section>

        {/* 3. TRANSITION & CORE SOLUTION */}
        <section className="py-32 bg-slate-900 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_white_0%,_transparent_70%)]" />
          
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="relative z-10 max-w-4xl mx-auto px-6 mb-24"
          >
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">
               What if your inbox worked <br/> <span className="text-slate-400 text-3xl md:text-5xl">for you?</span>
             </h2>
             <p className="text-xl md:text-2xl text-slate-400 font-medium">
               Instead of replying to everyone... <br/>
               What if you only focused on the people who are ready to buy?
             </p>
          </motion.div>

          {/* SOLUTION Block */}
          <div className="relative z-10 max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-12 rounded-[2rem] text-left">
            <h3 className="text-3xl font-black mb-6">Turn messages into qualified leads — automatically</h3>
            <p className="text-lg text-slate-300 font-medium mb-8">
              ReplyZens doesn't just manage your DMs. It filters, organizes, and prioritizes them — so you see only what matters.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex gap-3 items-center text-slate-200 font-medium text-lg"><CheckCircle2 className="text-indigo-400"/> Messages are automatically sorted</li>
              <li className="flex gap-3 items-center text-slate-200 font-medium text-lg"><CheckCircle2 className="text-indigo-400"/> High-intent users become leads</li>
              <li className="flex gap-3 items-center text-slate-200 font-medium text-lg"><CheckCircle2 className="text-indigo-400"/> Low-value chats don't waste your time</li>
            </ul>
            <div className="inline-block px-4 py-2 bg-slate-900 border border-slate-700 rounded-full font-bold tracking-widest text-sm uppercase text-slate-400">
              Less noise. More conversions.
            </div>
          </div>
        </section>

        {/* 4. FEATURES AS STORY (Zigzag Timeline) */}
        <section id="story" className="py-32 bg-slate-50 relative border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 relative">
            
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900">Features built to convert</h2>
            </div>

            {/* Central Vertical Line (hidden on very small screens, visible md+) */}
            <div className="hidden md:block absolute left-1/2 top-48 bottom-0 w-px bg-slate-200 -translate-x-1/2" />

            <div className="space-y-32">
              {[
                {
                  subtitle: "1. Unified Inbox",
                  title: "All your Instagram conversations — in one clean dashboard.",
                  desc: "No more switching between apps.",
                  lottie: "https://lottie.host/8166af2b-fc65-4b1d-91e7-d54e88e04a97/TIUNin8LAv.lottie"
                },
                {
                  subtitle: "2. Smart Filtering",
                  title: "Not every message deserves your attention.",
                  desc: "Automatically detect and highlight real buyers. Filter out the noise so you focus only on revenue.",
                  lottie: "https://lottie.host/3b2e0942-a601-4b7a-acea-236ae63297c2/75iGGQpYNH.lottie" // Analytics/filtering style lottie
                },
                {
                  subtitle: "3. AI Auto-Replies",
                  title: "Handle 80% of common questions instantly.",
                  desc: "Automatically reply pricing, availability, and delivery info perfectly and naturally.",
                  lottie: "https://lottie.host/3b4f9ac2-8173-4c40-9dd0-0eac1d5263c9/fC41pUIMdc.lottie" // Chat lottie
                },
                {
                  subtitle: "4. Lead Management",
                  title: "Convert conversations into structured leads.",
                  desc: "Track their lifecycle and close deals effectively with organized pipelines.",
                  lottie: "https://lottie.host/8166af2b-fc65-4b1d-91e7-d54e88e04a97/TIUNin8LAv.lottie" // Dashboard Lottie
                },
                {
                  subtitle: "5. Order & Tracking",
                  title: "Send updates directly in chat.",
                  desc: "Share order updates, package photos, and tracking links seamlessly.",
                  lottie: "https://lottie.host/82732e6c-84bd-40e8-bcad-fb6808599b92/WLrfOMZkHh.lottie" // Package Lottie
                },
                {
                  subtitle: "6. Team Collaboration",
                  title: "Work together without confusion.",
                  desc: "Assign chats, track responses, and maintain a clear audit trail for multiple agents.",
                  lottie: "https://lottie.host/3b2e0942-a601-4b7a-acea-236ae63297c2/75iGGQpYNH.lottie" // Data/Team lottie
                }
              ].map((step, idx) => (
                <div key={idx} className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">
                  
                  {/* Timeline Node */}
                  <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-300 rounded-full -translate-x-1/2 z-10 shadow-sm" />

                  <motion.div 
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className={cn(
                      "w-full md:w-1/2 flex flex-col justify-center",
                      idx % 2 === 0 ? "md:items-end text-left md:text-right pr-0 md:pr-12" : "md:items-start text-left pl-0 md:pl-12 md:order-2"
                    )}
                  >
                    <span className="inline-block px-3 py-1 bg-slate-200 text-slate-800 text-sm font-bold tracking-widest rounded-full mb-6">
                      {step.subtitle}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{step.title}</h3>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm">
                      {step.desc}
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={cn(
                      "w-full md:w-1/2 h-80 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-center p-8",
                      idx % 2 === 0 ? "" : "md:order-1"
                    )}
                  >
                    <div className="w-full h-full relative">
                      <DotLottieReact
                        src={step.lottie}
                        loop
                        autoplay
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                  </motion.div>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS (Progressive steps) */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Up and running in minutes</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "Step 1", title: "Connect your Instagram", desc: "Securely link your account via Meta. Your messages sync instantly." },
                { step: "Step 2", title: "Set your rules", desc: "Define filters, keywords, and AI auto-replies." },
                { step: "Step 3", title: "Let the system work", desc: "Messages get sorted, replies get handled, leads get created." },
                { step: "Step 4", title: "Focus on closing", desc: "You only talk to people who are ready to buy." }
              ].map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 border border-slate-100 p-8 rounded-3xl"
                >
                  <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">{s.step}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. TRANSFORMATION SECTION (Before vs After) */}
        <section className="py-32 bg-slate-900 text-white relative">
           <div className="max-w-6xl mx-auto px-6 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-black mb-16"
              >
                From chaos to control
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center"
                >
                  <div className="bg-red-500/20 text-red-400 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-8 border border-red-500/10">Before</div>
                  <ul className="space-y-6 text-slate-300 font-medium text-lg">
                    <li className="flex items-center justify-center gap-3"><X size={24} className="text-red-400"/> Endless unread messages</li>
                    <li className="flex items-center justify-center gap-3"><X size={24} className="text-red-400"/> Manual replies all day</li>
                    <li className="flex items-center justify-center gap-3"><X size={24} className="text-red-400"/> Missed opportunities</li>
                  </ul>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-xl shadow-white/5"
                >
                  <div className="bg-green-100 text-green-600 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-8 border border-green-200">After</div>
                  <ul className="space-y-6 text-slate-600 font-bold text-lg">
                    <li className="flex items-center justify-center gap-3"><Check size={24} className="text-green-500"/> Clean, organized inbox</li>
                    <li className="flex items-center justify-center gap-3"><Check size={24} className="text-green-500"/> Automated responses</li>
                    <li className="flex items-center justify-center gap-3"><Check size={24} className="text-green-500"/> More leads, faster conversions</li>
                  </ul>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-2xl font-black text-slate-400"
              >
                Same DMs. Completely different results.
              </motion.div>
           </div>
        </section>

        {/* 7. SOCIAL PROOF (Testimonials) */}
        <section id="testimonials" className="py-32 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "We stopped missing leads completely. The system handles most replies, and we just close.",
                  role: "Fashion Brand Owner"
                },
                {
                  quote: "Our response time dropped from hours to seconds.",
                  role: "E-commerce Seller"
                },
                {
                  quote: "Finally, a CRM that actually fits how Instagram businesses work.",
                  role: "Skincare Founder"
                }
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-200 p-8 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-h-[250px]"
                >
                  <p className="text-slate-800 font-medium italic mb-10 leading-relaxed text-xl">"{t.quote}"</p>
                  <div>
                    <h4 className="font-black text-slate-900">— {t.role}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* 8. FAQ */}
        <section id="faq" className="py-32 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            </div>
            
            <div className="flex flex-col">
              {[
                { q: "Does this work with any Instagram account?", a: "Yes, any business account can be connected securely and easily." },
                { q: "Will customers know replies are automated?", a: "No — responses feel natural and human-like." },
                { q: "Can my team use it together?", a: "Yes, multiple team members can collaborate in one inbox without stepping on each other's toes." },
                { q: "Is my data secure?", a: "Yes, we use secure Meta integrations and follow all best practices to ensure your data stays safe." }
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>


        {/* 9. FINAL CTA (CLIMAX) */}
        <section className="py-40 text-center bg-slate-50 border-t border-slate-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto px-6"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6 text-slate-900 tracking-tighter leading-tight">
              Stop replying to everyone.<br/> Start closing the right ones.
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 font-medium mb-12 max-w-3xl mx-auto">
              Let your CRM filter the noise and bring you the leads that matter.
            </p>

            <div className="flex flex-col gap-8 items-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-12 py-6 rounded-full font-black text-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-transform inline-flex items-center gap-4 group"
              >
                <span className="flex items-center gap-3">
                  Get Started Free <ArrowUpRight size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </button>
              
              <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>No credit card</span>
                <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"/>
                <span>14-day free trial</span>
                <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"/>
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Zap className="w-5 h-5 text-current" fill="currentColor" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">ReplyZens</span>
          </div>

          <div className="flex items-center gap-10 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
          </div>

          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            © 2026 REPLYZENS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
