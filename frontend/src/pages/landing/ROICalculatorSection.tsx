import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const ROICalculator: React.FC = () => {
  const [dms, setDms] = useState(2500);
  const [conversionRate, setConversionRate] = useState(5);
  const [dealValue, setDealValue] = useState(150);

  const capturedDMs = dms * 0.45;
  const qualifiedLeads = capturedDMs * (conversionRate / 100);
  const monthlyRevenue = qualifiedLeads * dealValue;
  const annualRevenue = monthlyRevenue * 12;

  return (
    <div className="w-full grid lg:grid-cols-2 gap-12 items-stretch max-w-6xl mx-auto text-left">
      {/* Sliders Block */}
      <div className="premium-gradient-border shadow-2xl">
        <div className="premium-card-content p-8 flex flex-col justify-between h-full">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Interactive Model</span>
            <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-3">Adjust Your Metrics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium mt-1">
              Fine-tune the parameters below to calculate how much revenue you stand to recover by deploying Flazly AI automations.
            </p>
          </div>

          <div className="space-y-8">
            {/* Slider 1 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Monthly Instagram DMs</span>
                <span className="text-[#38BDF8] tabular-nums font-bold text-base">{dms.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={dms}
                aria-label="Monthly Instagram DMs"
                onChange={(e) => setDms(Number(e.target.value))}
                className="w-full h-1.5 bg-[#121826] border border-white/5 rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 tabular-nums">
                <span>500</span>
                <span>20,000+</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Current Conversion Rate</span>
                <span className="text-[#38BDF8] tabular-nums font-bold text-base">{conversionRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={conversionRate}
                aria-label="Current Conversion Rate"
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full h-1.5 bg-[#121826] border border-white/5 rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 tabular-nums">
                <span>1%</span>
                <span>25%</span>
              </div>
            </div>

            {/* Slider 3 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Average Customer Value (LTV)</span>
                <span className="text-[#38BDF8] tabular-nums font-bold text-base">${dealValue}</span>
              </div>
              <input
                type="range"
                min="20"
                max="1500"
                step="10"
                value={dealValue}
                aria-label="Average Customer Value"
                onChange={(e) => setDealValue(Number(e.target.value))}
                className="w-full h-1.5 bg-[#121826] border border-white/5 rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 tabular-nums">
                <span>$20</span>
                <span>$1,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculations / Output Panel */}
      <div className="premium-gradient-border shadow-2xl">
        <div className="premium-card-content p-8 md:p-10 flex flex-col justify-between h-full relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/5 blur-[80px] rounded-full -z-10" />

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recovered Lost Conversions</span>
            <div className="text-5xl md:text-6xl font-bold roi-recovered-revenue mt-4 mb-3 tracking-tight font-sans text-white">
              ${Math.round(monthlyRevenue).toLocaleString()}
            </div>
            <span className="text-xs font-semibold text-zinc-400">Recovered Revenue / Month</span>
          </div>

          <div className="h-px bg-white/5 my-6" />

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider block mb-1">Additional Leads</span>
              <span className="text-lg font-bold text-white tabular-nums">{Math.round(qualifiedLeads).toLocaleString()} /mo</span>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider block mb-1">Estimated Annual Growth</span>
              <span className="text-lg font-bold text-[#38BDF8] tabular-nums">${Math.round(annualRevenue).toLocaleString()} /yr</span>
            </div>
          </div>

          <p className="text-[10.5px] text-zinc-500 font-medium leading-relaxed mt-6">
            *Calculation assumes a conservative recovery of 45% of customer inquiries lost due to delayed response times and lack of manual follow-ups.
          </p>

          <Link
            to="/signup"
            className="btn-premium-cta mt-8 w-full py-4 text-sm font-bold flex items-center justify-center gap-2 group"
          >
            Stop Leaving Money On The Table
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ROICalculatorSection: React.FC = () => {
  return (
    <section className="py-28 relative border-t border-zinc-200/80 dark:border-white/5 bg-zinc-100/10 dark:bg-[#121826]/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">ROI Calculator</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white mt-3">
            Calculate Your Recovered Revenue
          </h2>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium">
            See how much revenue is left unrecovered without automated lead pipelines.
          </p>
        </div>

        <ROICalculator />
      </div>
    </section>
  );
};

export default ROICalculatorSection;
