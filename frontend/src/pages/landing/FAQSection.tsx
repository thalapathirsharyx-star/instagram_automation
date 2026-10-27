import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQItemComponent = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border border-white/5 rounded-2xl p-6 bg-[#121826]/40 hover:bg-[#121826]/60 transition-all duration-300 relative overflow-hidden text-left ${
      isOpen ? 'ring-1 ring-[#38BDF8]/20 border-[#38BDF8]' : ''
    }`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#38BDF8] to-[#6366F1] transition-all duration-500 origin-top ${
        isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
      }`} />

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between text-left group outline-none"
      >
        <span className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors font-inter">
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all shrink-0 ${
          isOpen
            ? 'border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]'
            : 'border-white/10 text-zinc-400 group-hover:border-white/20'
        }`}>
          <ChevronDown size={14} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
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
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      q: "Will Instagram ban my account?",
      a: "Flazly operates through the standard Meta Graph API and is built to comply with Instagram's Developer Policies to ensure secure automation."
    },
    {
      q: "How does Flazly connect to Instagram?",
      a: "Integration takes less than a minute. Log in with your Facebook credentials using our secure Meta OAuth setup and authorize your linked Instagram Business profile. We never ask for or store your passwords."
    },
    {
      q: "Can I manually take over conversations?",
      a: "Yes. The Unified Smart Inbox allows you or your staff agents to pause autopilot with a single click, type manual answers, and reactivate Flazly AI autopilot whenever you are ready."
    },
    {
      q: "Can Flazly AI answer custom questions?",
      a: "Absolutely. Flazly uses your Knowledge Base PDFs, FAQ spreadsheets, fact sheets, or typed instructions to reply to questions in your exact brand tone."
    },
    {
      q: "Can I collect customer contact information?",
      a: "Yes. Flazly is programmed to identify intent and politely extract contact info (emails, phone numbers, location, etc.) during natural dialog flows, saving them to your leads database."
    },
    {
      q: "Can I use multiple Instagram accounts?",
      a: "Yes. Our Pro plan supports up to 3 accounts, and the Business plan supports unlimited connected Instagram profiles."
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-24 relative px-4 sm:px-6">
      {/* Questions sit on a pale rounded panel, as in the reference. */}
      <div className="lp-soft-panel max-w-4xl mx-auto px-5 py-14 sm:px-10 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="lp-eyebrow">Have Questions?</span>
          <h2 className="lp-title text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3 leading-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <FAQItemComponent key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
      </div>
    </section>
  );
};

export default FAQSection;
