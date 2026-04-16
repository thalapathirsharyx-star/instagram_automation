import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Menu, 
  X, 
  ArrowRight, 
  Play, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  BarChart3, 
  Inbox, 
  BotMessageSquare, 
  ShieldCheck 
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Internal Components ---

const DashboardMockup = () => {
  const StatCard = ({ icon: Icon, label, value, change }: { icon: any; label: string; value: string; change: string }) => (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{value}</span>
          <span className="text-[10px] text-green-400 font-medium">{change}</span>
        </div>
      </div>
    </div>
  );

  const MessageRow = ({ name, msg, time }: { name: string; msg: string; time: string }) => (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-foreground truncate">{name}</p>
        <p className="text-[9px] text-muted-foreground truncate">{msg}</p>
      </div>
      <span className="text-[9px] text-muted-foreground flex-shrink-0">{time}</span>
    </div>
  );

  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      <div
        className="glass rounded-2xl p-5 w-full max-w-md ml-auto border border-white/10 shadow-2xl shadow-indigo-500/10"
        style={{ transform: "rotateY(-12deg) rotateX(6deg)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold text-foreground">Analytics Center</h3>
          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground tracking-tighter">LIVE DATA</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon={Users} label="Total Reach" value="24.8K" change="+12%" />
          <StatCard icon={MessageCircle} label="Active DMs" value="1,247" change="+8%" />
          <StatCard icon={TrendingUp} label="Engagement" value="6.2%" change="+3%" />
          <StatCard icon={BarChart3} label="Leads Won" value="389" change="+22%" />
        </div>

        <div className="glass rounded-xl p-4 mb-5 border-white/5 bg-white/[0.02]">
          <p className="text-[9px] text-muted-foreground mb-3 text-center uppercase tracking-widest">Global Activity Flux</p>
          <div className="flex items-end gap-1.5 h-16">
            {[30, 50, 40, 90, 60, 100, 80, 45, 75, 55].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-indigo-500/40 relative overflow-hidden group"
                style={{ height: `${h}%` }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-4 border-white/5">
          <p className="text-[9px] text-muted-foreground mb-3 uppercase tracking-[0.2em]">Prioritized Inbound</p>
          <MessageRow name="@alex.visuals" msg="Pricing for the enterprise plan? 🔥" time="2m" />
          <MessageRow name="@studio_flow" msg="Can we integrate custom hooks?" time="12m" />
          <MessageRow name="@vibe_marketing" msg="The automation is amazing!" time="1h" />
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#030712] text-foreground font-outfit selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* Background Decors */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 backdrop-blur-3xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl gradient-btn group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 text-foreground" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tighter text-foreground">
              Reply<span className="gradient-text-premium">Zens</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Compliance</Link>
            <button
              onClick={() => navigate('/login')}
              className="gradient-btn text-sm font-bold text-foreground px-6 py-2.5 rounded-xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-white/10"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                <a href="#features" className="text-lg font-bold" onClick={() => setMobileOpen(false)}>Features</a>
                <Link to="/privacy" className="text-lg font-bold" onClick={() => setMobileOpen(false)}>Compliance</Link>
                <button
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="gradient-btn font-bold py-4 rounded-2xl"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO HERO */}
      <section className="relative pt-32 lg:pt-48 pb-24 lg:pb-32 z-10">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full mb-8 border-white/10">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Next-Gen Instagram CRM</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-8">
              Elevate Your <br />
              <span className="gradient-text-premium">Social Growth</span>
            </h1>

            <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-lg mx-auto lg:mx-0 mb-12">
              Transform your Instagram into a conversion machine. Unified inbox, intelligent lead tracking, and smart automation designed for high-growth teams.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/login')}
                className="gradient-btn px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all text-lg"
              >
                Launch ReplyZens <ArrowRight size={20} />
              </button>
              <button className="glass glass-hover px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border-white/10 group transition-all">
                <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" /> Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block z-20"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative py-24 lg:py-40 z-10 border-t border-white/5 bg-[#050914]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-6">
              Built for <span className="gradient-text-premium">Peak Performance</span>
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl font-light max-w-2xl mx-auto">
              Engineered with the speed and precision required for global agency-scale operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Inbox,
                title: "Unified Inbox",
                desc: "Lightning-fast interface to manage all Instagram interactions without the clutter.",
                color: "text-indigo-400"
              },
              {
                icon: BarChart3,
                title: "Lead Insights",
                desc: "Identify high-value leads and visualize your funnel with real-time data.",
                color: "text-purple-400"
              },
              {
                icon: BotMessageSquare,
                title: "AI Automation",
                desc: "Context-aware smart replies that maintain your brand's unique voice.",
                color: "text-pink-400"
              },
              {
                icon: ShieldCheck,
                title: "Meta Certified",
                desc: "Official Meta API integration ensuring total security and compliance.",
                color: "text-emerald-400"
              }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass glass-hover hover-glow rounded-[2rem] p-8 group border-white/5"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className={cn("w-7 h-7", f.color)} />
                </div>
                <h3 className="text-xl font-black mb-4 tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 lg:py-48 z-10 text-center bg-white/[0.01]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6"
        >
          <h2 className="text-4xl lg:text-7xl font-black mb-8">Ready to grow?</h2>
          <p className="text-lg text-muted-foreground mb-12 font-light">Join the top-tier agencies transforming Instagram engagement with ReplyZens.</p>
          <button
            onClick={() => navigate('/login')}
            className="gradient-btn px-12 py-5 rounded-3xl font-black text-2xl shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-4"
          >
            Get Started Now <ArrowRight size={28} />
          </button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-4 h-4 text-foreground" fill="currentColor" />
            </div>
            <span className="font-black text-foreground tracking-widest uppercase text-sm">ReplyZens</span>
          </div>

          <div className="flex items-center gap-10 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/data-deletion" className="hover:text-foreground transition-colors">Safety</Link>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            © 2026 REPLYZENS. BUILT FOR GROWTH.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
