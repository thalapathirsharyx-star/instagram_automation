import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    document.title = "Pricing Plans | Flazly";
    window.scrollTo(0, 0);
  }, []);

  const plans = [
    {
      name: "Free",
      price: "0",
      desc: "Perfect for testing the AI capabilities.",
      features: [
        "25 Active Contacts/mo",
        "250 AI Messages/mo",
        "1 Instagram Account",
        "1 Team User",
        "Flazly Branding Included"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Essential",
      price: "999",
      desc: "For growing creators needing more capacity.",
      features: [
        "250 Active Contacts/mo",
        "2,500 AI Messages/mo",
        "2 Instagram Accounts",
        "2 Team Users",
        "No Flazly Branding"
      ],
      cta: "Start Essential",
      popular: false
    },
    {
      name: "Pro",
      price: "2,499",
      desc: "For serious businesses automating sales.",
      features: [
        "2,500 Active Contacts/mo",
        "25,000 AI Messages/mo",
        "3 Instagram Accounts",
        "Broadcasts Included",
        "Full AI Features"
      ],
      cta: "Start Pro",
      popular: true
    },
    {
      name: "Business",
      price: "5,999",
      desc: "For agencies and high-volume brands.",
      features: [
        "7,500 Active Contacts/mo",
        "75,000 AI Messages/mo",
        "Unlimited Instagram Accounts",
        "5 Team Users",
        "Priority Support"
      ],
      cta: "Start Business",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "What counts as an Active Contact?",
      a: "An active contact is a unique Instagram user who interacts with your bot during the current billing cycle. If the same user messages you multiple times in a month, they only count as one active contact."
    },
    {
      q: "What counts as an AI Message?",
      a: "Any automated response generated and sent by Flazly on your behalf counts toward your AI message limit."
    },
    {
      q: "What happens if I hit my limits?",
      a: "We will send you an email warning at 80% capacity. If you hit 100%, automated AI responses will be temporarily paused until your billing cycle resets or you upgrade your plan."
    },
    {
      q: "Can I cancel at any time?",
      a: "Yes. There are no long-term contracts. You can cancel your subscription from your dashboard at any time."
    },
    {
      q: "Do you offer custom enterprise plans?",
      a: "Yes. If you have over 25,000 active contacts, contact our sales team for an Advanced custom plan with priority support."
    }
  ];

  return (
    <div className="dark min-h-screen bg-[#0A0A0F] text-primary-foreground font-inter selection:bg-purple-500/30 selection:text-primary-foreground">
      <Navbar />

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* HERO */}
        <section className="text-center max-w-3xl mx-auto mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-purple-600/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            Pricing that scales with your leads
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-10"
          >
            Start for free. Upgrade when the AI starts making you money. Transparent limits, no hidden fees.
          </motion.p>
        </section>

        {/* PRICING CARDS */}
        <section className="mb-32">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {plans.map((plan, i) => (
              <motion.div 
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`relative bg-[#111118] border rounded-[32px] p-8 ${
                  plan.popular 
                    ? 'border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.15)] lg:-translate-y-4' 
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm h-10">{plan.desc}</p>
                </div>
                <div className="mb-8 flex items-end gap-1">
                  <span className="text-4xl font-extrabold">₹{plan.price}</span>
                  <span className="text-muted-foreground font-medium mb-1">/mo</span>
                </div>
                <a 
                  href="https://app.flazly.com/signup" 
                  className={`block w-full text-center py-3.5 rounded-xl font-bold transition-all mb-8 ${
                    plan.popular 
                      ? 'btn-premium-cta text-primary-foreground' 
                      : 'bg-white/5 hover:bg-white/10 text-primary-foreground border border-white/5'
                  }`}
                >
                  {plan.cta}
                </a>
                <div className="space-y-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">What's included</p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check size={18} className={plan.popular ? "text-pink-500" : "text-muted-foreground"} />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LIMITS EXPLANATION */}
        <section className="mb-32 max-w-4xl mx-auto">
          <div className="bg-[#111118] border border-white/5 p-10 rounded-[32px]">
            <h2 className="text-3xl font-extrabold mb-8 text-center">Understanding Your Limits</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <HelpCircle size={20} className="text-purple-400" /> What counts as an Active Contact?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  An active contact is a unique Instagram user who interacts with your bot during the current billing cycle. If the same user messages you multiple times in a month, they only count as one active contact.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <HelpCircle size={20} className="text-pink-400" /> What counts as an AI Message?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Any automated response generated and sent by Flazly on your behalf counts toward your AI message limit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-10 text-center">Pricing FAQ</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-2 text-primary-foreground">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
