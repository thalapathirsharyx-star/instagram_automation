import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { AtSign, Settings, MessageSquare, Database, CheckCircle2 } from 'lucide-react';

const HowItWorks: React.FC = () => {
  useEffect(() => {
    document.title = "How It Works | Flazly Instagram Automation";
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      title: "Connect Instagram",
      desc: "Securely link your professional Instagram account to Flazly using the official, secure Meta API login. No passwords required.",
      icon: <AtSign size={32} className="text-pink-500" />
    },
    {
      title: "Configure Triggers",
      desc: "Tell Flazly when to respond. Set up keyword triggers for comments, or enable auto-replies for all incoming direct messages and story replies.",
      icon: <Settings size={32} className="text-purple-500" />
    },
    {
      title: "AI Engages Leads",
      desc: "The moment a trigger is fired, our AI instantly replies, answering user questions and asking predefined qualifying questions to gauge intent.",
      icon: <MessageSquare size={32} className="text-amber-500" />
    },
    {
      title: "Lead Qualification",
      desc: "The AI seamlessly extracts emails, phone numbers, and buying intent provided by the user directly in the chat thread.",
      icon: <Database size={32} className="text-blue-500" />
    },
    {
      title: "Close More Deals",
      desc: "View all extracted data neatly organized in your Flazly CRM. Jump into the Unified Inbox to take over the hottest conversations and close the deal.",
      icon: <CheckCircle2 size={32} className="text-green-500" />
    }
  ];

  return (
    <div className="dark min-h-screen bg-[#0A0A0F] text-primary-foreground font-inter selection:bg-purple-500/30 selection:text-primary-foreground">
      <Navbar />

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        {/* HERO */}
        <section className="text-center mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            From Setup to Sales in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">5 Minutes</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            No coding required. Connect your account, configure your triggers, and let our AI handle the rest.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a href="https://app.flazly.com/signup" className="btn-premium-cta px-8 py-4 text-base font-bold rounded-xl">
              Get Started
            </a>
          </motion.div>
        </section>

        {/* TIMELINE */}
        <section className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0 md:-translate-x-1/2" />

          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex flex-col md:flex-row gap-8 items-start md:items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Center Node */}
                <div className="absolute left-8 md:left-1/2 w-16 h-16 bg-[#0A0A0F] border border-white/10 rounded-2xl flex items-center justify-center -translate-x-1/2 shadow-xl z-10">
                  {step.icon}
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 pl-20 md:pl-0 md:px-16">
                  <div className={`bg-[#111118] border border-white/5 p-8 rounded-3xl ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Step {index + 1}</div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                
                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* CTA */}
        <section className="mt-32 text-center bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-pink-500/20 p-12 rounded-[40px]">
          <h2 className="text-3xl font-extrabold mb-6">Ready to automate your inbox?</h2>
          <a href="https://app.flazly.com/signup" className="inline-block bg-white text-black px-8 py-4 text-base font-bold rounded-xl hover:scale-105 transition-transform">
            Create Your Account
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
