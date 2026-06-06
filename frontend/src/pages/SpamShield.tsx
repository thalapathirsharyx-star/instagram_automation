import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { ShieldAlert, Bot, TrendingUp, CheckCircle } from 'lucide-react';

const SpamShield: React.FC = () => {
  useEffect(() => {
    document.title = "AI Spam Shield | Filter Instagram Noise - Flazly";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="dark min-h-screen bg-[#0A0A0F] text-white font-inter selection:bg-purple-500/30 selection:text-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        {/* HERO */}
        <section className="text-center max-w-4xl mx-auto mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
            <ShieldAlert size={40} className="text-white" />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            Protect Your Inbox from the <span className="text-amber-500">Noise</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            Not every DM deserves your attention. Flazly’s AI Spam Shield automatically filters out tire-kickers, bots, and low-intent messages before they ever trigger your automation limits.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a href="https://app.flazly.com/signup" className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-4 text-base font-bold rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all">
              Enable Spam Shield
            </a>
          </motion.div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="mb-32">
          <div className="bg-[#111118] border border-amber-500/20 rounded-[40px] p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-8">High Volume Shouldn't Mean High Stress</h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              When a post goes viral, your inbox gets flooded. Without an intelligent filter, you waste valuable AI message credits on users sending single emojis, bot spam, or irrelevant messages.
              <br/><br/>
              This buries the leads who actually want to buy, causing you to lose revenue simply because you couldn't find the real messages in time.
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Intelligent Intent Detection</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Our NLP engine scans incoming messages in real-time to preserve your active contact quota.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0 -translate-y-1/2 z-0" />
            
            {[
              { title: "1. Scan", desc: "Flazly instantly evaluates message length, context, and vocabulary.", icon: <Bot size={24} className="text-amber-400" /> },
              { title: "2. Analyze", desc: "The AI compares the intent against known buying heuristics.", icon: <TrendingUp size={24} className="text-amber-500" /> },
              { title: "3. Filter", desc: "Low-intent messages are silently muted. Real buyers proceed.", icon: <CheckCircle size={24} className="text-amber-600" /> }
            ].map((step, i) => (
              <div key={i} className="bg-[#0A0A0F] border border-white/10 p-8 rounded-3xl relative z-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#111118] border border-amber-500/30 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/10">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ROI IMPACT */}
        <section className="mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-extrabold mb-6">Save Credits. Save Time.</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                By filtering out up to 40% of useless inbox noise, our users save an average of 15 hours a week. 
                <br/><br/>
                More importantly, Spam Shield ensures that every AI message credit you pay for is spent entirely on engaging actual prospects, dramatically improving your ROI.
              </p>
              <a href="https://app.flazly.com/signup" className="text-amber-500 font-bold flex items-center gap-2 hover:gap-3 transition-all text-lg">
                Start Free Trial <span className="text-amber-500">→</span>
              </a>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#111118] border border-white/5 p-8 rounded-3xl text-center">
                <div className="text-5xl font-extrabold text-amber-500 mb-2">40%</div>
                <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Spam Blocked</div>
              </div>
              <div className="bg-[#111118] border border-white/5 p-8 rounded-3xl text-center">
                <div className="text-5xl font-extrabold text-amber-500 mb-2">15h</div>
                <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Saved Weekly</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpamShield;
