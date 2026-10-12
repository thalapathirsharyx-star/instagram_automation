import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import {
  MessageCircle,
  Bot,
  Users,
  Database,
  Send,
  DollarSign
} from 'lucide-react';

export const WorkflowSimulation: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "100px" });

  const steps = [
    {
      title: "Instagram DM",
      icon: <MessageCircle size={18} />,
      badge: "Inbound",
      detail: "Alex DMs: 'Hey, do you ship to UK?'",
      glow: "from-[#38BDF8] to-[#3B82F6]",
      color: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20"
    },
    {
      title: "AI Agent",
      icon: <Bot size={18} />,
      badge: "Flazly AI",
      detail: "Flazly processes intent in <0.2s",
      glow: "from-[#3B82F6] to-[#6366F1]",
      color: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20"
    },
    {
      title: "Lead Qualification",
      icon: <Users size={18} />,
      badge: "Scoring",
      detail: "Email & location captured automatically",
      glow: "from-[#6366F1] to-[#38BDF8]",
      color: "text-[#6366F1] bg-[#6366F1]/10 border-[#6366F1]/20"
    },
    {
      title: "CRM Sync",
      icon: <Database size={18} />,
      badge: "Integration",
      detail: "Synced to Google Sheets & HubSpot",
      glow: "from-[#38BDF8] to-[#3B82F6]",
      color: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20"
    },
    {
      title: "Lead Handoff",
      icon: <Send size={18} />,
      badge: "CRM Sync",
      detail: "Qualified lead synced to your database",
      glow: "from-[#3B82F6] to-[#6366F1]",
      color: "text-[#3B82F6] bg-[#38BDF8]/10 border-[#38BDF8]/20"
    },
    {
      title: "Revenue",
      icon: <DollarSign size={18} />,
      badge: "Sale Closed",
      detail: "Pipeline updated: +$499 Revenue",
      glow: "from-[#6366F1] to-[#38BDF8]",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isInView, steps.length]);

  return (
    <div ref={containerRef} className="w-full bg-[#121826]/40 border border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* Background soft glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6366F1]/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold ml-2 font-mono">
            live_autopilot_simulation
          </span>
        </div>
        <div className="text-[10px] text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-1 rounded border border-[#38BDF8]/20 flex items-center gap-1 select-none font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" /> Autopilot Active
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
        {steps.map((step, idx) => {
          const isSelected = activeStep === idx;
          const isPassed = activeStep > idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left h-full ${
                isSelected
                  ? `bg-[#121826] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/10 scale-[1.02]`
                  : isPassed
                    ? "bg-[#121826]/30 border-white/10 opacity-70"
                    : "bg-transparent border-white/5 opacity-50 hover:opacity-80"
              }`}
            >
              <div className="flex items-center justify-between mb-3 w-full">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isSelected ? "bg-[#38BDF8] text-white" : "bg-white/5 text-zinc-400"
                }`}>
                  Step {idx + 1}
                </span>
                <span className={`text-[8px] font-bold ${isSelected ? "text-[#38BDF8]" : "text-zinc-400"}`}>
                  {step.badge}
                </span>
              </div>

              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-3 transition-colors ${step.color}`}>
                {step.icon}
              </div>

              <span className="text-xs font-bold text-white mb-1 group-hover:text-[#38BDF8] transition-colors block">
                {step.title}
              </span>

              <p className="text-[10px] text-zinc-400 leading-normal font-medium mt-auto">
                {step.detail}
              </p>
            </button>
          );
        })}
      </div>

      {/* Console details of currently active step */}
      <div className="mt-8 bg-black/40 border border-white/5 p-4 rounded-xl text-left font-mono relative">
        <div className="text-[9px] text-zinc-400 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>Simulation Logs</span>
          <span className="text-[#38BDF8] font-bold">Step {activeStep + 1} / 6</span>
        </div>
        <div className="text-xs space-y-1 text-zinc-300">
          <p className="text-white font-semibold">
            &gt; Initializing pipeline flow node: {steps[activeStep].title.toUpperCase()}
          </p>
          <p className="text-zinc-400">
            [STATUS] Node connected. Status: SUCCESS. Latency: 0.120s
          </p>
          <p className="text-[#38BDF8] font-medium">
            [DATA] {steps[activeStep].detail}
          </p>
        </div>
      </div>
    </div>
  );
};
