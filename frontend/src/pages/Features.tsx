import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { MessageCircle, Bot, Zap, Settings, ShieldCheck, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  useEffect(() => {
    document.title = "Features | Flazly - Automated Instagram Lead Qualification";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="dark min-h-screen bg-[#0A0A0F] text-primary-foreground font-inter selection:bg-purple-500/30 selection:text-primary-foreground">
      <Navbar />

      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        {/* HERO */}
        <section className="text-center max-w-4xl mx-auto mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-[120px] pointer-events-none" />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            Put Your Instagram Inbox on <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FCAF45]">Autopilot</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            From instant replies to AI-driven lead qualification—discover the tools that help you capture every opportunity without lifting a finger.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a href="https://app.flazly.com/signup" className="btn-premium-cta px-8 py-4 text-base font-bold rounded-xl shadow-[0_0_40px_rgba(225,48,108,0.4)]">
              Start Free Trial
            </a>
          </motion.div>
        </section>

        {/* AUTOMATION TRIGGERS */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Engage users exactly where they are</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Don't let warm leads go cold. Trigger automated conversational flows the moment someone interacts with your brand.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "DM Automation", desc: "Reply instantly to any direct message with context-aware AI. Never leave a prospect waiting.", icon: <MessageCircle size={24} className="text-purple-400" /> },
              { title: "Comment-to-DM", desc: "Automatically message users who comment specific keywords on your posts or Reels. Turn public engagement into private sales.", icon: <MessageCircle size={24} className="text-pink-400" /> },
              { title: "Story Reply Triggers", desc: "Turn casual story reactions into qualified sales conversations the second they happen.", icon: <Zap size={24} className="text-amber-400" /> }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI QUALIFICATION */}
        <section className="mb-32">
          <div className="bg-[#111118] border border-white/5 rounded-[40px] p-8 md:p-16 overflow-hidden relative">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-extrabold mb-6">Identify Serious Buyers Automatically</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Stop guessing who is ready to buy. Our AI engine engages users natively within Instagram, asks predefined qualifying questions, and uses intelligent Natural Language Processing (NLP) to extract their intent.
                  <br/><br/>
                  By the time you look at the chat, the prospect is already vetted, scored, and ready for a closing conversation.
                </p>
                <a href="https://app.flazly.com/signup" className="text-primary-foreground font-bold flex items-center gap-2 hover:gap-3 transition-all text-lg">
                  See AI in Action <span className="text-pink-500">→</span>
                </a>
              </div>
              <div className="relative h-[400px] rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
                 <div className="self-end bg-white/10 px-4 py-3 rounded-2xl rounded-tr-sm text-sm max-w-[80%]">How much is your marketing automation course?</div>
                 <div className="self-start bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[80%]">It's $499! Are you looking to automate your agency or an e-commerce brand?</div>
                 <div className="self-end bg-white/10 px-4 py-3 rounded-2xl rounded-tr-sm text-sm max-w-[80%]">Agency. We have 10 clients.</div>
                 <div className="self-start bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[80%]">Perfect. What's the best email to send the agency curriculum to?</div>
                 <div className="absolute -right-6 top-1/2 bg-[#0A0A0F] border border-white/10 p-4 rounded-xl shadow-xl animate-bounce">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Lead Extracted</div>
                    <div className="font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"/> Agency Owner</div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">The Old Way vs. The Flazly Way</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-rose-500/5 border border-rose-500/20 p-10 rounded-3xl">
              <h3 className="text-2xl font-bold text-rose-400 mb-6">Manual Workflow</h3>
              <ul className="space-y-4">
                {["Hours wasted typing repetitive answers", "Leads lost in hidden request folders", "Zero scalable data extraction", "Delayed response times killing conversions"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <X className="text-destructive shrink-0 mt-1" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-pink-500/20 p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full" />
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">Flazly Workflow</h3>
              <ul className="space-y-4">
                {["Instant, contextual replies 24/7", "AI automatically extracts emails and phones", "Leads synced directly to a searchable CRM", "Zero manual effort until lead is qualified"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300">
                    <ShieldCheck className="text-pink-400 shrink-0 mt-1" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

// Simple X icon since we don't have it imported at top
const X = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default Features;
