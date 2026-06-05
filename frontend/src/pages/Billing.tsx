import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { CreditCard, Check, Zap, Shield, Sparkles, Lock, X, FileText } from 'lucide-react';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';


const Billing: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState<string | null>(null);
  const [upgradeAlert, setUpgradeAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Billing');
  const { toast } = useToast();

  const [invoices, setInvoices] = useState<any[]>([]);

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

  useEffect(() => {
    if (activeTab === 'Billing') {
      fetchInvoices();
    }
  }, [activeTab]);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/Company/Invoices');
      if (res.data?.Data) {
        setInvoices(res.data.Data);
      }
    } catch (err) {
      console.error("Failed to fetch invoices");
    }
  };

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
        name: 'Flazly',
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

  const currentPlan = user?.company?.plan || 'Free';
  const planPrice = currentPlan === 'Business' ? '₹5,999' : currentPlan === 'Pro' ? '₹2,499' : '₹0';
  const planMaxRecords = currentPlan === 'Business' ? '75,000' : currentPlan === 'Pro' ? '25,000' : '250';
  const planRecordsUsed = user?.company?.credits_used || 0;
  const planProgress = Math.min((Number(planRecordsUsed) / parseInt(planMaxRecords.replace(/,/g, ''))) * 100, 100);

  const planFeaturesList: Record<string, string[]> = {
    'Free': [
      'Connect 1 IG Account',
      'Basic automations (up to 4)',
      '1 user',
      'Unified inbox',
      'Flazly branding on replies'
    ],
    'Pro': [
      'Connect 3 IG Accounts',
      'Unlimited automations',
      'Broadcast messaging',
      '3 team users',
      'AI Persona customization',
      'Brain Base (Knowledge)',
      'No branding on replies'
    ],
    'Business': [
      'Unlimited IG Accounts',
      'Unlimited automations',
      'Broadcast messaging',
      '5 team users',
      'AI Persona customization',
      'Brain Base (Knowledge)',
      'Lead scoring & qualification',
      'No branding on replies'
    ]
  };

  const currentPlanFeatures = planFeaturesList[currentPlan] || planFeaturesList['Free'];

  const tabs = ['Billing', 'Plans'];

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 min-h-full animate-in fade-in duration-700 pb-10 pt-4">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">Billing</h1>
        <p className="text-zinc-500 font-medium">Manage your billing and payment details.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4 mb-2 mt-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-transparent text-zinc-600 border border-transparent hover:bg-zinc-100 hover:border-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {upgradeAlert && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-purple-200 bg-purple-50 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-900">{upgradeAlert}</p>
              <p className="text-xs text-purple-600/80 mt-0.5">Choose a plan below to unlock this feature.</p>
            </div>
          </div>
          <button onClick={() => setUpgradeAlert(null)} className="p-1 text-purple-400 hover:text-purple-700 transition-colors rounded-lg hover:bg-purple-200/50">
            <X size={16} />
          </button>
        </div>
      )}

      {activeTab === 'Billing' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Plan Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-zinc-900 text-lg">{currentPlan} Plan</h3>
                <span className="font-medium text-zinc-500"><span className="text-zinc-900 font-bold">{planPrice}</span> / month</span>
              </div>
              <p className="text-sm text-zinc-500 mb-8">
                {currentPlan === 'Free' ? 'Explore basic automation for free.' : `Premium features with up to ${planMaxRecords} AI Credits.`}
              </p>
              
              <div className="mt-auto">
                <p className="text-sm font-bold text-zinc-900 mb-2">{planRecordsUsed} / {planMaxRecords} AI Credits</p>
                <div className="w-full bg-zinc-100 rounded-full h-2 mb-6 overflow-hidden">
                  <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${planProgress}%` }}></div>
                </div>
                
                <div className="flex justify-end">
                  <button onClick={() => setActiveTab('Plans')} className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-sm">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Features Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 flex flex-col">
              <h3 className="font-bold text-zinc-900 text-lg mb-1">Plan Features</h3>
              <p className="text-sm text-zinc-500 mb-6">Everything included in your current plan.</p>
              
              <ul className="space-y-3 text-sm text-zinc-600 flex-grow font-medium">
                {currentPlanFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Invoices Section */}
          <div className="mt-2">
            <h3 className="font-bold text-zinc-900 text-lg mb-1">Invoices</h3>
            <p className="text-sm text-zinc-500 mb-6">Access all your previous invoices.</p>
            
            {invoices.length > 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-200 text-sm font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Invoice Number</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-900">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-zinc-700">{inv.invoice_number}</td>
                        <td className="px-6 py-4 text-zinc-500">{new Date(inv.created_on).toLocaleDateString()}</td>
                        <td className="px-6 py-4">₹{inv.amount_paid?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            {inv.invoice_status?.toUpperCase() || 'PAID'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-200">
                  <FileText className="text-zinc-400" size={24} />
                </div>
                <h4 className="font-bold text-zinc-900 text-lg mb-1">No invoices yet</h4>
                <p className="text-sm text-zinc-500 max-w-sm">When you subscribe to a premium plan or make a payment, your invoices will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Plans' && (
        <div className="flex flex-col animate-in fade-in duration-300">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mt-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-1 tracking-tight">Available Plans</h2>
              <p className="text-zinc-500 text-sm">Choose the right plan for your growing business.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="w3-card flex flex-col hover:border-purple-500/30 transition-all duration-500 relative !overflow-visible">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Free</h3>
              <p className="text-zinc-500 text-xs mb-6 font-medium h-8">Explore basic automation for free</p>
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-black text-zinc-900">₹0</span>
                <span className="text-zinc-500 ml-1 font-bold">/mo</span>
              </div>
              <div className="mb-6">
                <div className="text-lg font-bold text-zinc-900">250</div>
                <div className="text-xs text-zinc-500">AI Credits / mo</div>
              </div>
              <button 
                onClick={() => handleSubscribe('Free')}
                disabled={loading === 'Free' || user?.company?.plan === 'Free' || !user?.company?.plan}
                className="w-full py-3 px-4 bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-zinc-100 hover:text-zinc-900 transition-colors mb-8 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'Free' ? 'Processing...' : (user?.company?.plan === 'Free' || !user?.company?.plan ? 'Current Plan' : 'Downgrade')}
              </button>
              <ul className="space-y-3 text-xs text-zinc-500 flex-grow font-medium">
                <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Connect 1 IG Account</li>
                <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Basic automations (up to 4)</li>
                <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> 1 user</li>
                <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Unified inbox</li>
                <li className="flex items-start gap-2"><Check size={14} className="text-purple-500 mt-0.5 shrink-0" /> Flazly branding on replies</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="w3-card flex flex-col border-purple-500/50 relative transform hover:-translate-y-1 transition-all duration-500 shadow-[0_10px_40px_rgba(168,85,247,0.15)] !overflow-visible">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
                <Sparkles size={12} /> Flazly AI
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Pro</h3>
              <p className="text-zinc-500 text-xs mb-6 font-medium h-8">For scaling creators & businesses</p>
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-black text-zinc-900">₹2,499</span>
                <span className="text-zinc-500 ml-1 font-bold">/mo</span>
              </div>
              <div className="mb-6">
                <div className="text-lg font-bold text-zinc-900">25,000</div>
                <div className="text-xs text-zinc-500">AI Credits / mo</div>
              </div>
              <button 
                onClick={() => handleSubscribe('Pro')}
                disabled={loading === 'Pro' || user?.company?.plan === 'Pro'}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all mb-8 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'Pro' ? 'Processing...' : (user?.company?.plan === 'Pro' ? 'Current Plan' : 'Subscribe')}
              </button>
              <ul className="space-y-3 text-xs text-zinc-500 flex-grow font-medium">
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
            <div className="w3-card flex flex-col hover:border-purple-500/30 transition-all duration-500 relative !overflow-visible">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500/10 text-purple-600 border border-purple-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap">Flazly AI</div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Business</h3>
              <p className="text-zinc-500 text-xs mb-6 font-medium h-8">For high-growth businesses</p>
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-black text-zinc-900">₹5,999</span>
                <span className="text-zinc-500 ml-1 font-bold">/mo</span>
              </div>
              <div className="mb-6">
                <div className="text-lg font-bold text-zinc-900">75,000</div>
                <div className="text-xs text-zinc-500">AI Credits / mo</div>
              </div>
              <button 
                onClick={() => handleSubscribe('Business')}
                disabled={loading === 'Business' || user?.company?.plan === 'Business'}
                className="w-full py-3 px-4 bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-zinc-100 hover:text-zinc-900 transition-colors mb-8 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'Business' ? 'Processing...' : (user?.company?.plan === 'Business' ? 'Current Plan' : 'Subscribe')}
              </button>
              <ul className="space-y-3 text-xs text-zinc-500 flex-grow font-medium">
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
      )}
    </div>
  );
};

export default Billing;
