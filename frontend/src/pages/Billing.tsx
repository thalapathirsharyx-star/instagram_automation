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
          color: '#8b5cf6' // Brand violet
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
  const planRecordsUsed = user?.company?.monthly_ai_usage || 0;
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
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription & Billing</h2>
        <p className="text-muted-foreground text-sm">Manage your subscription tier, track API usage, and download invoices.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4 mb-2 mt-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {upgradeAlert && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/10 animate-in slide-in-from-top duration-500 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-card rounded-lg border border-primary/20 shadow-sm">
              <Lock size={16} className="text-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{upgradeAlert}</p>
              <p className="text-xs font-medium text-foreground/80 mt-0.5">Upgrade your subscription below to unlock this feature.</p>
            </div>
          </div>
          <button onClick={() => setUpgradeAlert(null)} className="p-1.5 text-foreground hover:text-foreground transition-colors rounded-lg hover:bg-violet-100/50">
            <X size={16} />
          </button>
        </div>
      )}

      {activeTab === 'Billing' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Current Plan Card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-foreground text-xl">{currentPlan} Plan</h3>
                <span className="font-medium text-muted-foreground text-sm"><span className="text-foreground font-extrabold text-lg">{planPrice}</span> / month</span>
              </div>
              <p className="text-[13px] text-muted-foreground font-medium mb-10">
                {currentPlan === 'Free' ? 'You are currently on the starter evaluation tier.' : `Premium AI infrastructure with up to ${planMaxRecords} queries.`}
              </p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">API Usage</p>
                  <p className="text-sm font-bold text-foreground">{planRecordsUsed} / {planMaxRecords}</p>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5 mb-8 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${planProgress > 90 ? 'bg-rose-500' : planProgress > 75 ? 'bg-amber-500' : 'bg-violet-500'}`} style={{ width: `${planProgress}%` }}></div>
                </div>
                
                <div className="flex justify-start">
                  <button onClick={() => setActiveTab('Plans')} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                    Upgrade Subscription
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Features Card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 flex flex-col">
              <h3 className="font-bold text-foreground text-lg mb-1">Current Included Features</h3>
              <p className="text-[13px] font-medium text-muted-foreground mb-6">Everything included in your active plan.</p>
              
              <ul className="space-y-3.5 text-sm text-muted-foreground flex-grow font-medium">
                {currentPlanFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0 border border-emerald-500/20">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Invoices Section */}
          <div className="mt-4">
            <h3 className="font-bold text-foreground text-lg mb-1">Billing History</h3>
            <p className="text-[13px] font-medium text-muted-foreground mb-6">Access all your previous invoices and payment receipts.</p>
            
            {invoices.length > 0 ? (
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm font-medium text-foreground">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted transition-colors cursor-pointer group">
                        <td className="px-6 py-4 font-bold text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-2">
                          <FileText size={14} className="text-muted-foreground group-hover:text-foreground" />
                          {inv.invoice_number}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(inv.created_on).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold">₹{inv.amount_paid?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                            {inv.invoice_status?.toUpperCase() || 'PAID'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-border rounded-2xl overflow-hidden bg-muted/50 shadow-sm flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mb-4 border border-border shadow-sm">
                  <FileText className="text-muted-foreground" size={24} />
                </div>
                <h4 className="font-bold text-foreground text-base mb-1">No billing history</h4>
                <p className="text-sm font-medium text-muted-foreground max-w-sm">When you subscribe to a premium tier, your invoices will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Plans' && (
        <div className="flex flex-col animate-in fade-in duration-300">
          <div className="mb-8 border-b border-border pb-6 mt-2">
            <h2 className="text-xl font-bold text-foreground mb-1 tracking-tight">Select your plan</h2>
            <p className="text-muted-foreground font-medium text-sm">Choose the infrastructure tier that matches your business needs.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
            
            {/* Free Plan */}
            <div className="bg-card rounded-3xl border border-border p-8 flex flex-col hover:border-border hover:shadow-md transition-all duration-300 relative">
              <h3 className="text-xl font-bold text-foreground mb-2">Free</h3>
              <p className="text-muted-foreground font-medium text-xs mb-8 h-8">Explore basic automation capabilities for testing.</p>
              
              <div className="mb-2 flex items-baseline">
                <span className="text-4xl font-black text-foreground tracking-tight">₹0</span>
                <span className="text-muted-foreground ml-1 font-bold text-sm">/mo</span>
              </div>
              
              <div className="mb-8 pb-8 border-b border-border">
                <div className="text-lg font-bold text-foreground">250</div>
                <div className="text-xs font-medium text-muted-foreground">API Credits / mo</div>
              </div>
              
              <ul className="space-y-4 text-sm text-muted-foreground flex-grow font-medium mb-8">
                <li className="flex items-start gap-3"><Check size={16} className="text-muted-foreground shrink-0" /> Connect 1 IG Account</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-muted-foreground shrink-0" /> Basic automations (up to 4)</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-muted-foreground shrink-0" /> 1 team seat</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-muted-foreground shrink-0" /> Unified inbox</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-muted-foreground shrink-0" /> Flazly branding attached</li>
              </ul>

              <button 
                onClick={() => handleSubscribe('Free')}
                disabled={loading === 'Free' || user?.company?.plan === 'Free' || !user?.company?.plan}
                className="w-full py-3 px-4 bg-card border border-border text-muted-foreground font-bold rounded-xl hover:bg-muted transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
              >
                {loading === 'Free' ? 'Processing...' : (user?.company?.plan === 'Free' || !user?.company?.plan ? 'Current Plan' : 'Downgrade to Free')}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-card rounded-3xl border-2 border-border p-8 flex flex-col relative transform lg:-translate-y-4 shadow-[0_8px_30px_rgb(139,92,246,0.12)] transition-all duration-300 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 whitespace-nowrap">
                <Sparkles size={12} /> Most Popular
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2">Pro</h3>
              <p className="text-muted-foreground font-medium text-xs mb-8 h-8">For scaling creators & digital businesses.</p>
              
              <div className="mb-2 flex items-baseline">
                <span className="text-4xl font-black text-foreground tracking-tight">₹2,499</span>
                <span className="text-muted-foreground ml-1 font-bold text-sm">/mo</span>
              </div>
              
              <div className="mb-8 pb-8 border-b border-border">
                <div className="text-lg font-bold text-foreground">25,000</div>
                <div className="text-xs font-medium text-muted-foreground">API Credits / mo</div>
              </div>
              
              <ul className="space-y-4 text-sm text-muted-foreground flex-grow font-medium mb-8">
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Connect 3 IG Accounts</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Unlimited workflow automations</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Broadcast messaging</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> 3 team seats</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> AI Persona customization</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Brain Base (Knowledge) access</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> White-labeled (No branding)</li>
              </ul>

              <button 
                onClick={() => handleSubscribe('Pro')}
                disabled={loading === 'Pro' || user?.company?.plan === 'Pro'}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
              >
                {loading === 'Pro' ? 'Processing...' : (user?.company?.plan === 'Pro' ? 'Current Plan' : 'Subscribe to Pro')}
              </button>
            </div>

            {/* Business Plan */}
            <div className="bg-card rounded-3xl border border-border p-8 flex flex-col hover:border-border hover:shadow-md transition-all duration-300 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-muted-foreground border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap">
                Enterprise Volume
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2">Business</h3>
              <p className="text-muted-foreground font-medium text-xs mb-8 h-8">For high-growth enterprise operations.</p>
              
              <div className="mb-2 flex items-baseline">
                <span className="text-4xl font-black text-foreground tracking-tight">₹5,999</span>
                <span className="text-muted-foreground ml-1 font-bold text-sm">/mo</span>
              </div>
              
              <div className="mb-8 pb-8 border-b border-border">
                <div className="text-lg font-bold text-foreground">75,000</div>
                <div className="text-xs font-medium text-muted-foreground">API Credits / mo</div>
              </div>
              
              <ul className="space-y-4 text-sm text-muted-foreground flex-grow font-medium mb-8">
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Unlimited IG Accounts</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Unlimited workflow automations</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Broadcast messaging</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> 5 team seats</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Advanced AI Persona customization</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Brain Base (Knowledge) access</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> Lead scoring & qualification</li>
                <li className="flex items-start gap-3"><Check size={16} className="text-foreground shrink-0" /> White-labeled (No branding)</li>
              </ul>

              <button 
                onClick={() => handleSubscribe('Business')}
                disabled={loading === 'Business' || user?.company?.plan === 'Business'}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
              >
                {loading === 'Business' ? 'Processing...' : (user?.company?.plan === 'Business' ? 'Current Plan' : 'Subscribe to Business')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
