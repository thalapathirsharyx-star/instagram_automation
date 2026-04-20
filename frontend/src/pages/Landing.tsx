import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Zap,
  Menu,
  X,
  Users,
  MessageCircle,
  MessageSquare,
  Target,
  TrendingUp,
  BarChart3,
  Camera,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowUpRight
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

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold group-hover:text-white transition-colors">{question}</span>
        {isOpen ? <ChevronUp className="text-white" /> : <ChevronDown className="text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 pb-2 text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page Component ---

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="landing-page dot-grid bg-white text-slate-950 font-outfit">

      {/* Background Decors */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-violet-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 backdrop-blur-3xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl  group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 text-foreground" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tighter text-foreground">
              Reply<span className="gradient-text-premium">Zens</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
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
                <a href="#how-it-works" className="text-lg font-bold" onClick={() => setMobileOpen(false)}>How it works</a>
                <a href="#testimonials" className="text-lg font-bold" onClick={() => setMobileOpen(false)}>Testimonials</a>
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

      {/* HERO SECTION */}
      <section className="relative pt-32 lg:pt-48 pb-24 lg:pb-32 z-10">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full mb-8 border border-indigo-100">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-[0.2em]">Instagram CRM + Automation</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-10 text-slate-900">
              Scale your <br />
              <span className="gradient-text-premium">Instagram DMs</span>
            </h1>

            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12 max-w-xl">
              The first Event Media Infrastructure for Instagram. Automate replies, manage leads, and close deals without missing a single message.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button
                onClick={() => navigate('/login')}
                className="gradient-btn group px-10 py-5 rounded-full text-lg font-bold flex items-center gap-3 shadow-xl shadow-indigo-200 active:scale-95 transition-all w-full sm:w-auto"
              >
                Get Started Free
                <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button
                className="px-10 py-5 rounded-full text-lg font-bold border-2 border-slate-200 text-slate-900 hover:bg-slate-50 transition-all w-full sm:w-auto"
              >
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block z-20"
          >
            <div className="relative flex items-center justify-center w-full lg:translate-x-12">
              <DotLottieReact
                src="https://lottie.host/8166af2b-fc65-4b1d-91e7-d54e88e04a97/TIUNin8LAv.lottie"
                loop
                autoplay
                className="w-full max-w-[800px] scale-150"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="relative py-24 lg:py-40 z-10 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full flex flex-col justify-center"
            >
              <h2 className="text-4xl lg:text-7xl font-black tracking-tight mb-8 text-slate-900 leading-tight">
                Your DMs are full. <br />
                <span className="text-slate-500">Your sales are slipping.</span>
              </h2>
              <p className="text-muted-foreground text-lg font-light leading-relaxed mb-10 max-w-xl">
                Every missed message is a missed sale. Most businesses are managing Instagram DMs manually — switching between the app, spreadsheets, and WhatsApp just to follow up on one order. It doesn't scale.
              </p>
            </motion.div>

            <div className="grid gap-6">

              <div className="w-full max-w-xs aspect-square opacity-50   transition-all duration-700">
                <DotLottieReact
                  src="https://lottie.host/3b4f9ac2-8173-4c40-9dd0-0eac1d5263c9/fC41pUIMdc.lottie"
                  loop
                  autoplay
                />
              </div>
              {[
                { title: "Manual Management", desc: "Stop wasting hours switching between apps and messy spreadsheets.", icon: Users },
                { title: "Disconnected Tools", desc: "No more copying order details across five different platforms.", icon: Zap },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-200 p-6 rounded-2xl flex items-start gap-5 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-slate-900">{item.title}</h3>
                    <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-20 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-6 text-slate-900">
              Powerful features for <br />
              <span className="gradient-text-premium">modern Instagram teams</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Unified DM Inbox", desc: "Manage all your Instagram DMs from one central dashboard. Never lose a lead in the mobile app again.", icon: MessageSquare, color: "text-indigo-600" },
              { title: "Smart Auto-Replies", desc: "Set up AI-powered responses for common questions like pricing, shipping, and availability.", icon: Zap, color: "text-violet-600" },
              { title: "Package Tracker", desc: "Directly send order status and tracking links to your customers within the Instagram chat.", icon: Camera, color: "text-indigo-600" },
              { title: "Order Links", desc: "Generate and share secure checkout links that followers can use without leaving Instagram.", icon: LinkIcon, color: "text-violet-600" },
              { title: "Analytics Dashboard", desc: "Track conversion rates, response times, and identify your most loyal customers.", icon: BarChart3, color: "text-indigo-600" },
              { title: "Team Collaboration", desc: "Assign conversations to specific team members and maintain a clear audit trail of all chats.", icon: Target, color: "text-violet-600" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 group hover:shadow-md transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  {i === 0 ? (
                    <DotLottieReact
                      src="https://lottie.host/8166af2b-fc65-4b1d-91e7-d54e88e04a97/TIUNin8LAv.lottie"
                      loop
                      autoplay
                      className="w-16 h-16 scale-150"
                    />
                  ) : i === 1 ? (
                    <DotLottieReact
                      src="https://lottie.host/3b4f9ac2-8173-4c40-9dd0-0eac1d5263c9/fC41pUIMdc.lottie"
                      loop
                      autoplay
                      className="w-16 h-16"
                    />
                  ) : i === 2 ? (
                    <DotLottieReact
                      src="https://lottie.host/b93fe9a3-52a2-4d5b-a42c-88a63b5c38c8/k5K27Cglq3.lottie"
                      loop
                      autoplay
                      className="w-16 h-16"
                    />
                  ) : i === 3 ? (
                    <DotLottieReact
                      src="https://lottie.host/82732e6c-84bd-40e8-bcad-fb6808599b92/WLrfOMZkHh.lottie"
                      loop
                      autoplay
                      className="w-16 h-16"
                    />
                  ) : i === 5 ? (
                    <DotLottieReact
                      src="https://lottie.host/3b2e0942-a601-4b7a-acea-236ae63297c2/75iGGQpYNH.lottie"
                      loop
                      autoplay
                      className="w-16 h-16"
                    />
                  ) : (
                    <f.icon className={cn("w-7 h-7", f.color)} />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{f.title}</h3>
                <p className="text-slate-500 text-sm font-light leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative py-24 lg:py-40 z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-6">
              Up and running in <span className="text-indigo-600">minutes</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                step: "1",
                title: "Connect your Instagram account",
                desc: "Link your business profile in one click via Meta. Your existing DM history syncs instantly."
              },
              {
                step: "2",
                title: "Set your auto-reply rules",
                desc: "Define keywords, write templates, and turn on AI replies — the system handles every incoming message from there."
              },
              {
                step: "3",
                title: "Manage leads and send updates",
                desc: "Assign leads, attach orders, send package photos and tracking links — all from your dashboard."
              },
              {
                step: "4",
                title: "Watch your conversion grow",
                desc: "Faster replies, automated updates — more leads turn into buyers without more manual work."
              }
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-black text-slate-100 absolute -top-8 -left-2 z-0">{s.step}</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                  <p className="text-slate-500 text-sm font-light leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="relative py-24 lg:py-40 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-6 text-slate-900">
              Businesses closing more <br />
              <span className="gradient-text-premium">sales, faster</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "We were losing at least 20 leads a week just from slow replies. Now the auto-reply handles 80% of questions instantly and our team only steps in to close.",
                author: "Sarah K.",
                role: "Fashion boutique, 45K followers"
              },
              {
                quote: "The package photo feature alone saved us an hour every day. Customers love getting their shipping update directly on Instagram — it feels personal.",
                author: "Rami A.",
                role: "Electronics reseller, 120K followers"
              },
              {
                quote: "Finally a CRM built for how we actually sell. Our whole team sees the same inbox, knows who's been replied to, and nothing slips through.",
                author: "Priya M.",
                role: "Skincare brand, 80K followers"
              }
            ].map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between shadow-sm"
              >
                <p className="text-slate-500 font-medium italic mb-10 leading-relaxed">"{t.quote}"</p>
                <div>
                  <h4 className="font-bold text-slate-900">{t.author}</h4>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative py-24 lg:py-40 z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black tracking-tight mb-16 text-center"
          >
            Common questions
          </motion.h2>

          <div className="flex flex-col gap-2">
            {[
              {
                q: "Does this work with any Instagram account?",
                a: "Yes — any Instagram Business or Creator account connected to a Meta Business profile can use the platform. Setup takes under 5 minutes."
              },
              {
                q: "Will customers know the reply is automated?",
                a: "Only if you want them to. You control the tone and wording of every auto-reply. Most customers can't tell the difference from a human reply."
              },
              {
                q: "How does the package photo sending work?",
                a: "Your team uploads the photo from the order page in the CRM. With one click, it's sent directly to the customer's Instagram DM — along with any tracking link or custom message you add."
              },
              {
                q: "Can multiple team members use it at the same time?",
                a: "Yes. You can add unlimited agents, assign conversations, and see who is handling which lead — no double-replies, no confusion."
              },
              {
                q: "Is my data secure?",
                a: "All data is encrypted in transit and at rest. We use official Meta APIs — we never store your Instagram password or bypass platform rules."
              }
            ].map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <FAQItem question={item.q} answer={item.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-32 lg:py-48 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6"
        >
          <h2 className="text-4xl lg:text-7xl font-black mb-8 text-slate-900">
            Ready to stop managing <br />
            <span className="gradient-text-premium">DMs manually?</span>
          </h2>
          <p className="text-lg text-slate-500 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
            Connect your Instagram, set your rules, and let the system work. Your team focuses on closing — not copy-pasting.
          </p>
          <div className="flex flex-col gap-6 items-center">
            <button
              onClick={() => navigate('/login')}
              className="gradient-btn px-12 py-5 rounded-full font-black text-2xl shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-4 group relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none scale-150">
                <DotLottieReact
                  src="https://lottie.host/8166af2b-fc65-4b1d-91e7-d54e88e04a97/TIUNin8LAv.lottie"
                  loop
                  autoplay
                />
              </div>
              <span className="relative z-10 flex items-center gap-4">
                Get started free <ArrowUpRight size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </button>
            <div className="flex items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-indigo-400" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-indigo-400" /> 14-day free trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-indigo-400" /> Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/5 py-12 px-6">
        <nav className="glass bg-white/70 backdrop-blur-xl border-slate-200/50 flex items-center justify-between px-8 py-4 rounded-full shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">ReplyZens</span>
          </div>

          <div className="flex items-center gap-10 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            © 2026 REPLYZENS. BUILT FOR GROWTH.
          </p>
        </nav>
      </footer>
    </div>
  );
};

export default Landing;
