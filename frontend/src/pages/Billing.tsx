import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Check, Zap, Shield, Sparkles } from 'lucide-react';

const Billing: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    setLoading(planId);
    // Mock API call to Stripe or similar
    setTimeout(() => {
      setLoading(null);
      alert(`Subscribed to ${planId} successfully! (Mock)`);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Billing & Pricing</h1>
          <p className="text-zinc-400 font-medium">Manage your subscription and billing details.</p>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="w3-card flex flex-col md:flex-row gap-6 items-center justify-between group hover:border-purple-500/30 transition-all duration-500 border-white/5 p-6">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl group-hover:bg-purple-500/20 transition-all duration-500 shadow-inner border border-purple-500/20">
            <Zap size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">Free Trial</h3>
            <p className="text-sm text-zinc-400 font-medium mt-1">14 days remaining in your trial</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => alert('Redirecting to Stripe Customer Portal to manage billing...')}
            className="px-6 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-zinc-300 font-bold hover:bg-zinc-700 hover:text-white transition-all shadow-sm text-sm"
          >
            Manage Billing
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Upgrade Your Plan</h2>
          <p className="text-zinc-400">Choose the right plan for your growing business.</p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-[1400px] mx-auto">
          {/* Free Plan */}
          <div className="w3-card flex flex-col hover:border-purple-500/30 transition-all duration-500 border-white/5 relative">
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Free</h3>
            <p className="text-zinc-400 text-xs mb-6 font-medium h-8">Explore basic automation for free</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-white">₹0</span>
              <span className="text-zinc-500 ml-1 font-bold">/mo</span>
            </div>
            <div className="mb-6">
              <div className="text-lg font-bold text-zinc-100">25</div>
              <div className="text-xs text-zinc-500">Active Contacts / mo</div>
            </div>
            <button 
              onClick={() => handleSubscribe('Free')}
              disabled={loading === 'Free'}
              className="w-full py-3 px-4 bg-zinc-800 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors mb-8 shadow-sm flex items-center justify-center gap-2"
            >
              {loading === 'Free' ? 'Processing...' : 'Current Plan'}
            </button>
            <ul className="space-y-3 text-xs text-zinc-400 flex-grow font-medium">
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Connect 1 IG Account</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Basic automations (up to 4)</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> 1 user</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Basic unified inbox</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Self-serve Support</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> ReplyZens branding</li>
            </ul>
          </div>

          {/* Essential Plan */}
          <div className="w3-card flex flex-col hover:border-purple-500/30 transition-all duration-500 border-white/5 relative">
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Essential</h3>
            <p className="text-zinc-400 text-xs mb-6 font-medium h-8">For creators and growing brands</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-white">₹1,199</span>
              <span className="text-zinc-500 ml-1 font-bold">/mo</span>
            </div>
            <div className="mb-6">
              <div className="text-lg font-bold text-zinc-100">250</div>
              <div className="text-xs text-zinc-500">Active Contacts / mo</div>
            </div>
            <button 
              onClick={() => handleSubscribe('Essential')}
              disabled={loading === 'Essential'}
              className="w-full py-3 px-4 bg-zinc-800 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors mb-8 shadow-sm flex items-center justify-center gap-2"
            >
              {loading === 'Essential' ? 'Processing...' : 'Subscribe'}
            </button>
            <ul className="space-y-3 text-xs text-zinc-400 flex-grow font-medium">
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Connect 2 IG Accounts</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Unlimited custom automations</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> 2 users</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Inbox + organization & reminders</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Email Support</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> No branding</li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="w3-card flex flex-col border-purple-500/50 relative transform hover:-translate-y-1 transition-all duration-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
              <Sparkles size={12} /> ReplyZens AI
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Pro</h3>
            <p className="text-zinc-400 text-xs mb-6 font-medium h-8">For scaling creators & businesses</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-white">₹2,499</span>
              <span className="text-zinc-500 ml-1 font-bold">/mo</span>
            </div>
            <div className="mb-6">
              <div className="text-lg font-bold text-zinc-100">2,500</div>
              <div className="text-xs text-zinc-500">Active Contacts / mo</div>
            </div>
            <button 
              onClick={() => handleSubscribe('Pro')}
              disabled={loading === 'Pro'}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all mb-8 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              {loading === 'Pro' ? 'Processing...' : 'Subscribe'}
            </button>
            <ul className="space-y-3 text-xs text-zinc-400 flex-grow font-medium">
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Connect 3 IG Accounts</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Advanced automations & broadcasts</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> 3 users</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Custom inbox labels & rules</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Email Support</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Full AI Features</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> No branding</li>
            </ul>
          </div>

          {/* Business Plan */}
          <div className="w3-card flex flex-col hover:border-purple-500/30 transition-all duration-500 border-white/5 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap">ReplyZens AI</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Business</h3>
            <p className="text-zinc-400 text-xs mb-6 font-medium h-8">For high-growth businesses</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-white">₹5,999</span>
              <span className="text-zinc-500 ml-1 font-bold">/mo</span>
            </div>
            <div className="mb-6">
              <div className="text-lg font-bold text-zinc-100">7,500</div>
              <div className="text-xs text-zinc-500">Active Contacts / mo</div>
            </div>
            <button 
              onClick={() => handleSubscribe('Business')}
              disabled={loading === 'Business'}
              className="w-full py-3 px-4 bg-zinc-800 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors mb-8 shadow-sm flex items-center justify-center gap-2"
            >
              {loading === 'Business' ? 'Processing...' : 'Subscribe'}
            </button>
            <ul className="space-y-3 text-xs text-zinc-400 flex-grow font-medium">
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Unlimited IG Accounts</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Advanced automations & broadcasts</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> 5 users</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Shared team Inbox & assignments</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Priority Support</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Full AI Features</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> No branding</li>
            </ul>
          </div>

          {/* Advanced Plan */}
          <div className="w3-card flex flex-col hover:border-purple-500/30 transition-all duration-500 border-white/5 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap">ReplyZens AI</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Advanced</h3>
            <p className="text-zinc-400 text-xs mb-6 font-medium h-8">For high-volume operators</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-white">₹11,499</span>
              <span className="text-zinc-500 ml-1 font-bold">/mo</span>
            </div>
            <div className="mb-6">
              <div className="text-lg font-bold text-zinc-100">25,000</div>
              <div className="text-xs text-zinc-500">Active Contacts / mo</div>
            </div>
            <button 
              onClick={() => handleSubscribe('Advanced')}
              disabled={loading === 'Advanced'}
              className="w-full py-3 px-4 bg-zinc-800 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors mb-8 shadow-sm flex items-center justify-center gap-2"
            >
              {loading === 'Advanced' ? 'Processing...' : 'Subscribe'}
            </button>
            <ul className="space-y-3 text-xs text-zinc-400 flex-grow font-medium">
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Unlimited IG Accounts</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Advanced automations & broadcasts</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> 10 users</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Shared team Inbox & assignments</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Priority Support</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Full AI Features</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> No branding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
