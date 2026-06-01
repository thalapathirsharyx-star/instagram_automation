import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { CreditCard, Check, Zap, Shield, Sparkles, Lock, X } from 'lucide-react';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';


const Billing: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState<string | null>(null);
  const [upgradeAlert, setUpgradeAlert] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (location.state?.alert) {
      setUpgradeAlert(location.state.alert);
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => setUpgradeAlert(null), 8000);
      // Clear the state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId: string) => {
    if (user?.company?.plan === planId) return;
    
    // Free plan downgrade doesn't need payment
    if (planId === 'Free') {
      setLoading(planId);
      try {
        const res = await api.put('/Company/UpdatePlan', { plan: planId });
        if (res.data.Type === 'Success' || res.data.Type === 'S') {
          toast.success(`Downgraded to Free plan successfully!`);
          window.location.reload();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.Message || 'Failed to downgrade.');
      } finally {
        setLoading(null);
      }
      return;
    }

    setLoading(planId);
    try {
      // 1. Load Script
      const resLoad = await loadRazorpayScript();
      if (!resLoad) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setLoading(null);
        return;
      }

      // 2. Create Order
      const orderRes = await api.post('/Company/CreateRazorpayOrder', { plan: planId });
      if (orderRes.data.Type !== 'Success' && orderRes.data.Type !== 'S') {
        toast.error(orderRes.data.Message || 'Failed to initialize payment.');
        setLoading(null);
        return;
      }
      
      const orderData = orderRes.data.Data;

      // 3. Open Razorpay Modal
      const options = {
        key: 'rzp_test_SuNSItBA5F58KR', // Test Key passed directly for client
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ReplyZens',
        description: `Upgrade to ${planId} Plan`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            setLoading('Verifying...');
            // 4. Verify Payment Signature
            const verifyRes = await api.post('/Company/VerifyRazorpayPayment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId
            });

            if (verifyRes.data.Type === 'Success' || verifyRes.data.Type === 'S') {
              toast.success(`Successfully upgraded to ${planId} plan!`);
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.company) parsed.company.plan = planId;
                localStorage.setItem('user', JSON.stringify(parsed));
              }
              window.location.reload();
            } else {
              toast.error(verifyRes.data.Message || 'Payment verification failed.');
            }
          } catch (err: any) {
            toast.error('Verification Error: ' + err.message);
          } finally {
            setLoading(null);
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: '#18181b' // Venture UI dark theme color
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
      // Handle manual modal closure
      paymentObject.on('payment.failed', function () {
        toast.error('Payment was cancelled or failed.');
        setLoading(null);
      });

    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.Message || 'An error occurred during upgrade.');
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Billing & Pricing</h1>
          <p className="text-zinc-400 font-medium">Manage your subscription and billing details.</p>
        </div>
      </div>

      {upgradeAlert && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Lock size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-300">{upgradeAlert}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Choose a plan below to unlock this feature.</p>
            </div>
          </div>
          <button onClick={() => setUpgradeAlert(null)} className="p-1 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Current Plan Overview */}
      <div className="w3-card flex flex-col md:flex-row gap-6 items-center justify-between group hover:border-purple-500/30 transition-all duration-500 border-white/5 p-6">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl group-hover:bg-purple-500/20 transition-all duration-500 shadow-inner border border-purple-500/20">
            <Zap size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">
              {user?.company?.plan || 'Free'} Plan
            </h3>
            <p className="text-sm text-zinc-400 font-medium mt-1">
              {user?.company?.plan === 'Free' || !user?.company?.plan ? 'Basic plan limits apply' : 'Premium plan features active'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => toast.info('Razorpay billing portal integration coming soon...')}
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

        <div className="grid md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
          {/* Free Plan */}
          <div className="w3-card flex flex-col hover:border-purple-500/30 transition-all duration-500 border-white/5 relative !overflow-visible">
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Free</h3>
            <p className="text-zinc-400 text-xs mb-6 font-medium h-8">Explore basic automation for free</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-white">₹0</span>
              <span className="text-zinc-500 ml-1 font-bold">/mo</span>
            </div>
            <div className="mb-6">
              <div className="text-lg font-bold text-zinc-100">250</div>
              <div className="text-xs text-zinc-500">AI Credits / mo</div>
            </div>
            <button 
              onClick={() => handleSubscribe('Free')}
              disabled={loading === 'Free' || user?.company?.plan === 'Free' || !user?.company?.plan}
              className="w-full py-3 px-4 bg-zinc-800 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors mb-8 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'Free' ? 'Processing...' : (user?.company?.plan === 'Free' || !user?.company?.plan ? 'Current Plan' : 'Downgrade')}
            </button>
            <ul className="space-y-3 text-xs text-zinc-400 flex-grow font-medium">
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Connect 1 IG Account</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Basic automations (up to 4)</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> 1 user</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Unified inbox</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> AI-powered auto replies</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> ReplyZens branding on replies</li>
            </ul>
          </div>


          {/* Pro Plan */}
          <div className="w3-card flex flex-col border-purple-500/50 relative transform hover:-translate-y-1 transition-all duration-500 shadow-[0_0_30px_rgba(168,85,247,0.15)] !overflow-visible">
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
              <div className="text-lg font-bold text-zinc-100">25,000</div>
              <div className="text-xs text-zinc-500">AI Credits / mo</div>
            </div>
            <button 
              onClick={() => handleSubscribe('Pro')}
              disabled={loading === 'Pro' || user?.company?.plan === 'Pro'}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all mb-8 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'Pro' ? 'Processing...' : (user?.company?.plan === 'Pro' ? 'Current Plan' : 'Subscribe')}
            </button>
            <ul className="space-y-3 text-xs text-zinc-400 flex-grow font-medium">
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Connect 3 IG Accounts</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Unlimited automations</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Broadcast messaging</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> 3 team users</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> AI Persona customization</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Brain Base (Knowledge)</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> No branding on replies</li>
            </ul>
          </div>

          {/* Business Plan */}
          <div className="w3-card flex flex-col hover:border-purple-500/30 transition-all duration-500 border-white/5 relative !overflow-visible">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap">ReplyZens AI</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Business</h3>
            <p className="text-zinc-400 text-xs mb-6 font-medium h-8">For high-growth businesses</p>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-white">₹5,999</span>
              <span className="text-zinc-500 ml-1 font-bold">/mo</span>
            </div>
            <div className="mb-6">
              <div className="text-lg font-bold text-zinc-100">75,000</div>
              <div className="text-xs text-zinc-500">AI Credits / mo</div>
            </div>
            <button 
              onClick={() => handleSubscribe('Business')}
              disabled={loading === 'Business' || user?.company?.plan === 'Business'}
              className="w-full py-3 px-4 bg-zinc-800 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors mb-8 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'Business' ? 'Processing...' : (user?.company?.plan === 'Business' ? 'Current Plan' : 'Subscribe')}
            </button>
            <ul className="space-y-3 text-xs text-zinc-400 flex-grow font-medium">
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Unlimited IG Accounts</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Unlimited automations</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Broadcast messaging</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> 5 team users</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> AI Persona customization</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Brain Base (Knowledge)</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Lead scoring & qualification</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> No branding on replies</li>
            </ul>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Billing;
