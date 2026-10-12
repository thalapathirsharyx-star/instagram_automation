import React from 'react';
import { CheckCircle2, Lock, Bot, Users, Database, Workflow } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  return (
    <section className="py-7 border-y border-zinc-200/80 dark:border-white/5 bg-zinc-100/40 dark:bg-[#121826]/20 backdrop-blur-xl relative z-10 select-none">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-zinc-650 dark:text-zinc-300 text-xs font-bold tracking-wider uppercase">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Meta Graph API Integration
          </span>
          <span className="flex items-center gap-2">
            <Lock size={16} className="text-[#38BDF8] shrink-0" /> Official OAuth Security
          </span>
          <span className="flex items-center gap-2">
            <Bot size={16} className="text-[#818CF8] shrink-0" /> AI-Powered Conversations
          </span>
          <span className="flex items-center gap-2">
            <Users size={16} className="text-purple-400 shrink-0" /> Human Takeover Available
          </span>
          <span className="flex items-center gap-2">
            <Database size={16} className="text-blue-400 shrink-0" /> Sheets & CRM Sync
          </span>
          <span className="flex items-center gap-2">
            <Workflow size={16} className="text-pink-400 shrink-0" /> Webhook Support
          </span>
        </div>
      </div>
    </section>
  );
};
