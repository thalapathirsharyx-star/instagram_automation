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
  ArrowRight,
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
    <div className="border-b border-slate-200/60 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group transition-all"
      >
        <span className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600">{question}</span>
        {isOpen ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-slate-400 group-hover:text-indigo-400" />}
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
    <div className="landing-page bg-[#FAFAFA] text-slate-900 font-outfit selection:bg-indigo-100 selection:text-indigo-900">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 border-b border-slate-200/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-sm transition-transform duration-300">
              <Zap className="w-4 h-4 text-current" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Reply<span className="text-indigo-600">Zens</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#story" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#faq" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">FAQ</a>
            <div className="flex items-center gap-4 ml-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white px-5 py-2.5 rounded-lg shadow-sm shadow-slate-900/10 active:scale-95 transition-all"
              >
                Start Free Trial
              </button>
            </div>
          </div>

          <button className="md:hidden text-slate-600 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 shadow-xl"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                <a href="#story" className="text-base font-semibold text-slate-700" onClick={() => setMobileOpen(false)}>Features</a>
                <a href="#how-it-works" className="text-base font-semibold text-slate-700" onClick={() => setMobileOpen(false)}>How it works</a>
                <a href="#faq" className="text-base font-semibold text-slate-700" onClick={() => setMobileOpen(false)}>FAQ</a>
                <div className="h-px bg-slate-100 my-2" />
                <button
                  onClick={() => { navigate('/signup'); setMobileOpen(false); }}
                  className="bg-slate-900 text-white font-semibold py-3.5 rounded-xl w-full"
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
        <section className="relative pt-20 lg:pt-32 pb-24 z-10 overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
          
          <div className="max-w-5xl mx-auto px-6 w-full text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center mx-auto"
            >
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-xs font-semibold text-indigo-700">Instagram CRM Automation</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900 text-balance leading-[1.1]">
                Scale your Instagram DMs without <span className="text-indigo-600">scaling your workload</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-3xl text-balance">
                Our CRM automatically filters all incoming messages, organizes them into a streamlined inbox, and turns them into qualified leads—so you don't have to manually reply to every customer.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-8">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all w-full sm:w-auto min-w-[200px] group"
                >
                  Get Started Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 rounded-xl text-base font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all w-full sm:w-auto min-w-[200px] shadow-sm">
                  Watch Demo
                </button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-5 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><Check size={16} className="text-indigo-500"/> No credit card</span>
                <span className="flex items-center gap-1.5"><Check size={16} className="text-indigo-500"/> 14-day free trial</span>
                <span className="flex items-center gap-1.5"><Check size={16} className="text-indigo-500"/> Cancel anytime</span>
              </div>
            </motion.div>
          </div>
          
          {/* Subtle bottom gradient map */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#FAFAFA]" />
        </section>

        {/* 2. PROBLEM SECTION (PAIN) */}
        <section className="relative py-24 z-10 bg-[#FAFAFA]">
          <div className="max-w-3xl mx-auto px-6 text-center mb-16">
            <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight"
            >
              Your DMs are full. <br/>
              <span className="text-slate-400 font-medium">But your conversions aren't.</span>
            </motion.h2>

            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               className="text-lg text-slate-500 max-w-2xl mx-auto"
            >
              Every day, new messages come in — questions, inquiries, order requests.<br/>
              But most of them go unanswered, delayed, or lost in the chaos.
            </motion.p>
          </div>

          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
            
            {/* SaaS App Mockup / Chaos Visualization */}
            <motion.div 
               className="relative h-[420px] w-full rounded-2xl bg-white border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden flex items-center justify-center p-6"
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
            >
               {/* Browser Toolbar Mockup */}
               <div className="absolute top-0 left-0 right-0 h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
               </div>

               {/* Center Lottie Focus */}
               <div className="absolute inset-0 flex items-center justify-center opacity-80 mt-10">
                 <DotLottieReact src="https://lottie.host/3b4f9ac2-8173-4c40-9dd0-0eac1d5263c9/fC41pUIMdc.lottie" loop autoplay />
               </div>

               {/* Floating Alert Cards */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="absolute top-20 left-6 bg-white p-4 rounded-xl shadow-md border border-slate-100 flex items-start gap-3 w-64"
               >
                 <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0"><AlertCircle size={16}/></div>
                 <div className="space-y-1">
                   <div className="text-sm font-semibold text-slate-800">Unread Message</div>
                   <div className="text-xs text-slate-500">"Do you ship to Canada?"</div>
                   <div className="text-[10px] text-slate-400 mt-2">Sent 4 hours ago</div>
                 </div>
               </motion.div>

               <motion.div 
                 animate={{ y: [0, 10, 0] }}
                 transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                 className="absolute bottom-12 right-6 bg-white p-4 rounded-xl shadow-md border border-slate-100 flex items-start gap-3 w-64"
               >
                 <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0"><TrendingDown size={16}/></div>
                 <div className="space-y-1">
                   <div className="text-sm font-semibold text-slate-800">Lead Abandoned</div>
                   <div className="text-xs text-slate-500">User lost interest due to slow response time.</div>
                 </div>
               </motion.div>
            </motion.div>

            {/* Pain Points List */}
            <div className="flex flex-col gap-6">
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
                  className="flex gap-4 items-center bg-white border border-slate-200/60 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex shrink-0 items-center justify-center text-slate-600">
                    <p.icon size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">{p.title}</h3>
                </motion.div>
              ))}

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-xl"
              >
                <p className="text-base font-semibold text-indigo-900 leading-relaxed">
                  You're not losing customers because of demand — <span className="text-indigo-600">you're losing them because you can't keep up.</span>
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. TRANSITION & CORE SOLUTION */}
        <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
          {/* Subtle grid background for SaaS feel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center mb-20">
             <motion.h2
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
             >
               What if your inbox worked <span className="text-indigo-400">for you?</span>
             </motion.h2>
             <p className="text-lg md:text-xl text-slate-400">
               Instead of replying to everyone... <br/>
               What if you only focused on the people who are ready to buy?
             </p>
          </div>

          {/* Core Feature Value Prop */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative z-10 max-w-3xl mx-auto bg-slate-800/80 backdrop-blur-md border border-slate-700 p-10 md:p-12 rounded-[2rem] text-left shadow-2xl"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Turn messages into qualified leads — automatically</h3>
            <p className="text-slate-300 mb-8 leading-relaxed">
              ReplyZens doesn't just manage your DMs. It filters, organizes, and prioritizes them — so you see only what matters.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className="flex gap-3 items-center text-sm font-medium text-slate-200">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center"><Check size={14} className="text-indigo-400"/></div>
                Messages are automatically sorted
              </div>
              <div className="flex gap-3 items-center text-sm font-medium text-slate-200">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center"><Check size={14} className="text-indigo-400"/></div>
                High-intent users become leads
              </div>
              <div className="flex gap-3 items-center text-sm font-medium text-slate-200">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center"><Check size={14} className="text-indigo-400"/></div>
                Low-value chats filtered out
              </div>
            </div>
            
            <div className="border-t border-slate-700/50 pt-6">
              <div className="inline-flex items-center font-bold tracking-widest text-sm uppercase text-indigo-400">
                <Zap size={16} className="mr-2" /> Less noise. More conversions.
              </div>
            </div>
          </motion.div>
        </section>

        {/* 4. FEATURES AS STORY (Zigzag Timeline) */}
        <section id="story" className="py-32 bg-[#FAFAFA] relative border-b border-slate-200/50">
          <div className="max-w-6xl mx-auto px-6 relative">
            
            <div className="text-center mb-24">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Features built to convert</h2>
              <p className="text-lg text-slate-500 mt-4">Automate the boring parts. Master the important ones.</p>
            </div>

            {/* Central Vertical Line (hidden on very small screens, visible md+) */}
            <div className="hidden md:block absolute left-1/2 top-48 bottom-0 w-px bg-slate-200 -translate-x-1/2" />

            <div className="space-y-32">
              {[
                {
                  subtitle: "1. UNIFIED INBOX",
                  title: "All your Instagram conversations — in one clean dashboard.",
                  desc: "Say goodbye to the cluttered mobile app. View, manage, and reply to all DMs from a professional desktop interface.",
                  lottie: "https://lottie.host/8166af2b-fc65-4b1d-91e7-d54e88e04a97/TIUNin8LAv.lottie"
                },
                {
                  subtitle: "2. SMART FILTERING",
                  title: "Not every message deserves your attention.",
                  desc: "Automatically detect and highlight real buyers. Filter out the noise so you focus only on revenue generation.",
                  lottie: "https://lottie.host/3b2e0942-a601-4b7a-acea-236ae63297c2/75iGGQpYNH.lottie"
                },
                {
                  subtitle: "3. AI AUTO-REPLIES",
                  title: "Handle 80% of common questions instantly.",
                  desc: "Deliver perfect, natural replies for pricing, availability, and delivery info without lifting a finger.",
                  lottie: "https://lottie.host/3b4f9ac2-8173-4c40-9dd0-0eac1d5263c9/fC41pUIMdc.lottie"
                },
                {
                  subtitle: "4. LEAD MANAGEMENT",
                  title: "Convert conversations into structured leads.",
                  desc: "Track their lifecycle and close deals effectively with organized, visual CRM pipelines.",
                  lottie: "https://lottie.host/8166af2b-fc65-4b1d-91e7-d54e88e04a97/TIUNin8LAv.lottie" 
                },
                {
                  subtitle: "5. ORDER & TRACKING",
                  title: "Send updates directly in chat.",
                  desc: "Share beautiful order updates, package photos, and tracking links seamlessly with your customers.",
                  lottie: "https://lottie.host/82732e6c-84bd-40e8-bcad-fb6808599b92/WLrfOMZkHh.lottie"
                },
                {
                  subtitle: "6. TEAM COLLABORATION",
                  title: "Work together without confusion.",
                  desc: "Assign chats, track responses, and maintain a clear audit trail for multiple agents in real-time.",
                  lottie: "https://lottie.host/3b2e0942-a601-4b7a-acea-236ae63297c2/75iGGQpYNH.lottie"
                }
              ].map((step, idx) => (
                <div key={idx} className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">
                  
                  {/* Timeline Node */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-4 border-slate-100 shadow-sm -translate-x-1/2 z-10 items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className={cn(
                      "w-full md:w-1/2 flex flex-col justify-center",
                      idx % 2 === 0 ? "md:items-end text-left md:text-right pr-0 md:pr-12" : "md:items-start text-left pl-0 md:pl-12 md:order-2"
                    )}
                  >
                    <span className="inline-block text-xs font-bold tracking-[0.2em] text-indigo-600 mb-4 bg-indigo-50 px-3 py-1 rounded-full">
                      {step.subtitle}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">{step.title}</h3>
                    <p className="text-base text-slate-500 leading-relaxed max-w-sm">
                      {step.desc}
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={cn(
                      "w-full md:w-1/2 h-[320px] bg-white rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/40 flex items-center justify-center p-6 relative overflow-hidden",
                      idx % 2 === 0 ? "" : "md:order-1"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent" />
                    <div className="w-full h-full relative z-10">
                      <DotLottieReact src={step.lottie} loop autoplay className="w-full h-full object-contain" />
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Up and running in minutes</h2>
              <p className="text-slate-500 mt-4">A simple integration process that takes virtually no technical knowledge.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Connect Instagram", desc: "Securely link your account via Meta. Your messages sync instantly." },
                { step: "02", title: "Set your rules", desc: "Define filters, keywords, and AI auto-replies in our visual builder." },
                { step: "03", title: "Let it work", desc: "Messages get sorted, replies get handled, leads get created 24/7." },
                { step: "04", title: "Focus on closing", desc: "You only jump in to talk to people who are ready to buy." }
              ].map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#FAFAFA] border border-slate-200/60 p-6 rounded-2xl hover:border-indigo-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-900 mb-6 shadow-sm">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. TRANSFORMATION SECTION */}
        <section className="py-24 bg-indigo-900 text-white relative overflow-hidden">
           {/* Abstract shapes */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[100px] rounded-full" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full" />
           
           <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold tracking-tight mb-16"
              >
                From chaos to control
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-6 lg:gap-10 mb-16">
                
                {/* BEFORE */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="px-3 py-1 bg-red-500/10 text-red-400 rounded-md text-xs font-bold tracking-wider uppercase border border-red-500/20">Before</div>
                  </div>
                  <ul className="space-y-5 text-slate-300 font-medium text-left">
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5"><X size={14} className="text-red-400"/></div>
                      <span>Endless unread messages clogging the main app.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5"><X size={14} className="text-red-400"/></div>
                      <span>Manual replies taking up half your working day.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5"><X size={14} className="text-red-400"/></div>
                      <span>Missed opportunities turning into lost revenue.</span>
                    </li>
                  </ul>
                </motion.div>

                {/* AFTER */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white border border-indigo-100 rounded-2xl p-8 flex flex-col shadow-2xl shadow-black/10"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold tracking-wider uppercase border border-indigo-100">After</div>
                  </div>
                  <ul className="space-y-5 text-slate-700 font-medium text-left">
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100"><Check size={14} className="text-indigo-600"/></div>
                      <span>Clean, organized inbox built specifically for sales.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100"><Check size={14} className="text-indigo-600"/></div>
                      <span>Automated responses handling the bulk of inquiries.</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100"><Check size={14} className="text-indigo-600"/></div>
                      <span className="text-slate-900 font-semibold">More qualified leads, faster conversions.</span>
                    </li>
                  </ul>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xl font-medium text-indigo-200"
              >
                Same DMs. <span className="text-white font-bold">Completely different results.</span>
              </motion.div>
           </div>
        </section>

        {/* 7. SOCIAL PROOF (Testimonials) */}
        <section id="testimonials" className="py-24 bg-[#FAFAFA]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6">
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-200/60 p-8 rounded-2xl flex flex-col justify-between shadow-sm"
                >
                  <p className="text-slate-600 font-medium leading-relaxed text-base mb-8">"{t.quote}"</p>
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="font-semibold text-slate-900 text-sm">{t.role}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* 8. FAQ */}
        <section id="faq" className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            </div>
            
            <div className="flex flex-col">
              {[
                { q: "Does this work with any Instagram account?", a: "Yes, any business account can be connected securely and easily via Meta's official API." },
                { q: "Will customers know replies are automated?", a: "No — responses feel natural and human-like. You have full control over the tone of the AI." },
                { q: "Can my team use it together?", a: "Yes, multiple team members can collaborate in one inbox without stepping on each other's toes." },
                { q: "Is my data secure?", a: "Yes, we use secure Meta integrations and follow all standard data privacy practices to ensure your data stays safe." }
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>


        {/* 9. FINAL CTA (CLIMAX) */}
        <section className="py-32 text-center bg-white border-t border-slate-100">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto px-6"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tight text-balance leading-tight">
              Stop replying to everyone.<br/> Start closing the right ones.
            </h2>
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
              Let your CRM filter the noise and bring you the leads that matter.
            </p>

            <div className="flex flex-col items-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-xl font-semibold text-lg shadow-lg shadow-indigo-600/20 active:scale-95 transition-all inline-flex items-center gap-3 group mb-6"
              >
                Start Your Free Trial
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><Check size={16} className="text-indigo-400"/> No credit card</span>
                <span className="flex items-center gap-1.5"><Check size={16} className="text-indigo-400"/> 14-day free trial</span>
                <span className="flex items-center gap-1.5"><Check size={16} className="text-indigo-400"/> Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#FAFAFA] border-t border-slate-200/60 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 text-current" fill="currentColor" />
            </div>
            <span className="font-bold tracking-tight text-slate-900">ReplyZens</span>
          </div>

          <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
          </div>

          <p className="text-sm font-medium text-slate-400">
            © 2026 ReplyZens Inc.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
