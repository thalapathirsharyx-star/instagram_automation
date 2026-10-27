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
          color: '#2563eb' // Brand accent
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
  const planLimit = parseInt(planMaxRecords.replace(/,/g, ''));
  const planProgress = Math.min((Number(planRecordsUsed) / planLimit) * 100, 100);
  const planRemaining = Math.max(planLimit - Number(planRecordsUsed), 0);
  // Paid plans run for a fixed period from payment; Free never expires.
  const planExpiresAt = currentPlan !== 'Free' && user?.company?.plan_expires_at ? new Date(user.company.plan_expires_at) : null;
  const formatDate = (value: string | Date) =>
    new Date(value).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

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

  const plans = [
    {
      id: 'Free',
      blurb: 'Explore basic automation capabilities for testing.',
      price: '₹0',
      credits: '250',
      features: ['Connect 1 IG Account', 'Basic automations (up to 4)', '1 team seat', 'Unified inbox', 'Flazly branding attached'],
    },
    {
      id: 'Pro',
      blurb: 'For scaling creators & digital businesses.',
      price: '₹2,499',
      credits: '25,000',
      badge: 'Most popular',
      features: ['Connect 3 IG Accounts', 'Unlimited workflow automations', 'Broadcast messaging', '3 team seats', 'AI Persona customization', 'Brain Base (Knowledge) access', 'White-labeled (No branding)'],
    },
    {
      id: 'Business',
      blurb: 'For high-growth enterprise operations.',
      price: '₹5,999',
      credits: '75,000',
      badge: 'Enterprise volume',
      features: ['Unlimited IG Accounts', 'Unlimited workflow automations', 'Broadcast messaging', '5 team seats', 'Advanced AI Persona customization', 'Brain Base (Knowledge) access', 'Lead scoring & qualification', 'White-labeled (No branding)'],
    },
  ];
  const activePlan = user?.company?.plan || 'Free';

  return (
    <div className="page">
      <div className="page-head mb-4">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="page-sub">Manage your subscription tier, track API usage, and download invoices.</p>
        </div>
      </div>

      <div className="tabs mb-6" role="tablist" aria-label="Billing sections">
        {tabs.map((tab) => (
          <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {upgradeAlert && (
        <div className="notice notice-info mb-6" role="status">
          <div className="flex items-start gap-3">
            <Lock size={16} className="mt-0.5 shrink-0 text-viridian" />
            <div>
              <p className="notice-title">{upgradeAlert}</p>
              <p className="notice-body">Upgrade your subscription below to unlock this feature.</p>
            </div>
          </div>
          <button onClick={() => setUpgradeAlert(null)} className="btn btn-ghost btn-icon btn-sm" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {activeTab === 'Billing' && (
        <div className="stack">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="surface flex flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[20px] font-semibold text-ink">{currentPlan} plan</h2>
                <p className="text-[14px] text-ink-soft">
                  <span className="text-[18px] font-semibold text-ink">{planPrice}</span> / month
                </p>
              </div>
              <p className="mt-1 text-[14px] text-ink-soft">
                {currentPlan === 'Free' ? 'You are currently on the starter evaluation tier.' : `Premium AI infrastructure with up to ${planMaxRecords} queries.`}
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-end justify-between gap-3">
                  <p className="text-[13px] font-medium text-ink-soft">AI usage this month</p>
                  <p className="tabular whitespace-nowrap text-[14px] font-medium text-ink">
                    {Number(planRecordsUsed).toLocaleString()} <span className="text-ink-soft">/ {planMaxRecords}</span>
                  </p>
                </div>
                <div
                  className="meter"
                  role="progressbar"
                  aria-label="AI usage this month"
                  aria-valuenow={Math.round(planProgress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    style={{ width: `${planProgress}%` }}
                    className={planProgress > 90 ? '!bg-signal-stop' : planProgress > 75 ? '!bg-signal-warn' : ''}
                  />
                </div>
              </div>

              {/* The figures behind the meter, so the card reads at a glance. */}
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-hairline pt-4">
                <div>
                  <dt className="text-[12px] text-ink-soft">Used</dt>
                  <dd className="tabular mt-0.5 text-[15px] font-semibold text-ink">{Math.round(planProgress)}%</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-soft">Remaining</dt>
                  <dd className="tabular mt-0.5 text-[15px] font-semibold text-ink">{planRemaining.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-soft">{planExpiresAt ? 'Active until' : 'Usage resets'}</dt>
                  <dd className="mt-0.5 text-[15px] font-semibold text-ink">{planExpiresAt ? formatDate(planExpiresAt) : 'Monthly'}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[13px] text-ink-soft">We email you at 80% and 100% of your monthly allowance.</p>

              <div className="mt-auto pt-6">
                <button onClick={() => setActiveTab('Plans')} className="btn btn-primary">
                  <Zap size={16} /> {currentPlan === 'Business' ? 'Compare plans' : 'Upgrade plan'}
                </button>
              </div>
            </section>

            <section className="surface p-6">
              <h2 className="text-[16px] font-semibold text-ink">Included in your plan</h2>
              <p className="mb-5 mt-1 text-[14px] text-ink-soft">Everything included in your active plan.</p>

              <ul className="space-y-3 text-[14px] text-ink">
                {currentPlanFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-go-tint text-signal-go">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="surface overflow-hidden">
            <div className="surface-head">
              <div>
                <h2>Billing history</h2>
                <p>Your previous invoices and payment receipts.</p>
              </div>
            </div>

            {invoices.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table is-stacked">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th className="num">Amount</th>
                      <th className="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <span className="flex items-center gap-2 font-medium">
                            <FileText size={14} className="text-ink-faint" />
                            {inv.invoice_number}
                          </span>
                        </td>
                        <td data-label="Date" className="text-ink-soft">{formatDate(inv.created_on)}</td>
                        <td data-label="Amount" className="num font-medium">₹{inv.amount_paid?.toLocaleString()}</td>
                        <td data-label="Status" className="text-right">
                          {(() => {
                            // The chip follows the invoice's real state, not just "paid".
                            const status = String(inv.invoice_status || 'paid').toLowerCase();
                            const tone = status === 'paid' ? 'chip-go' : status === 'failed' ? 'chip-stop' : 'chip-warn';
                            return <span className={`chip ${tone} capitalize`}>{status}</span>;
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty py-12">
                <span className="empty-mark"><FileText /></span>
                <p className="empty-title">No invoices yet</p>
                <p className="empty-body">When you subscribe to a paid plan, your invoices appear here.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'Plans' && (
        <>
          <div className="mb-6">
            <h2 className="section-title">Choose your plan</h2>
            <p className="mt-1 text-[14px] text-ink-soft">Pick the tier that matches your business needs.</p>
          </div>

          <div className="grid items-stretch gap-6 pt-3 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = activePlan === plan.id;
              const isFeatured = plan.id === 'Pro';
              return (
                <section
                  key={plan.id}
                  className={`surface relative flex flex-col p-6 ${isFeatured ? 'border-viridian ring-1 ring-viridian' : ''}`}
                  aria-labelledby={`plan-${plan.id}`}
                >
                  {plan.badge && (
                    <span className={`chip absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 ${isFeatured ? 'border-viridian bg-viridian text-on-accent' : ''}`}>
                      {isFeatured && <Sparkles size={12} />} {plan.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <h3 id={`plan-${plan.id}`} className="text-[20px] font-semibold text-ink">{plan.id}</h3>
                    {isCurrent && <span className="chip chip-dot chip-go">Current</span>}
                  </div>
                  <p className="mt-1 min-h-[42px] text-[14px] text-ink-soft">{plan.blurb}</p>

                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="text-[32px] font-bold leading-none tracking-[-0.02em] text-ink">{plan.price}</span>
                    <span className="text-[14px] text-ink-soft">/mo</span>
                  </p>

                  <div className="mb-5 mt-5 border-b border-hairline pb-5">
                    <p className="text-[18px] font-semibold tabular-nums text-ink">{plan.credits}</p>
                    <p className="text-[13px] text-ink-soft">AI credits / month</p>
                  </div>

                  <ul className="mb-6 flex-grow space-y-3 text-[14px] text-ink">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check size={16} className="mt-0.5 shrink-0 text-viridian" /> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id || isCurrent}
                    aria-busy={loading === plan.id || undefined}
                    className={`btn btn-lg btn-block ${isCurrent ? '' : plan.id === 'Free' ? '' : 'btn-primary'}`}
                  >
                    {loading === plan.id
                      ? 'Processing…'
                      : isCurrent
                        ? 'Current plan'
                        : plan.id === 'Free'
                          ? 'Downgrade to Free'
                          : `Subscribe to ${plan.id}`}
                  </button>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Billing;
