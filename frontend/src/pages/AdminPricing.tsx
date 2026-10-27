import React, { useState } from 'react';
import { IndianRupee, Save, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AdminPricing: React.FC = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([
    {
      id: 'Free',
      name: 'Free',
      price: 0,
      activeContacts: 25,
      aiCredits: 250,
      features: ['Connect 1 IG Account', 'Basic automations']
    },
    {
      id: 'Pro',
      name: 'Pro',
      price: 2499,
      activeContacts: 2500,
      aiCredits: 25000,
      features: ['Connect 3 IG Accounts', 'Full AI Features', 'Broadcasts']
    },
    {
      id: 'Business',
      name: 'Business',
      price: 5999,
      activeContacts: 7500,
      aiCredits: 75000,
      features: ['Unlimited IG Accounts', 'Shared Team Inbox', 'Priority Support']
    }
  ]);

  const [saving, setSaving] = useState(false);

  const handleUpdatePlan = (id: string, field: string, value: number | string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call to save settings
    setTimeout(() => {
      setSaving(false);
      toast.success('Pricing plans updated successfully!', 'Backend DB integration required to make live');
    }, 1000);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Plan pricing</h1>
          <p className="page-sub">Manage subscription tiers, prices, and limits globally.</p>
        </div>
        <button onClick={handleSave} disabled={saving} aria-busy={saving || undefined} className="btn btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save configuration'}
        </button>
      </div>

      <div className="notice notice-warn mb-6 justify-start">
        <ShieldAlert size={18} className="shrink-0 text-signal-warn" />
        <p className="notice-body m-0 text-[14px]">
          Modifying prices here will update the Razorpay checkout amounts for all future customer upgrades. Active subscriptions are not affected.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <section key={plan.id} className="surface overflow-hidden">
            <div className="surface-head">
              <h2>{plan.name} plan</h2>
            </div>
            <div className="surface-body space-y-4">
              <div>
                <label htmlFor={`price-${plan.id}`} className="field-label">Monthly price</label>
                <div className="field-icon">
                  <IndianRupee size={15} />
                  <input
                    id={`price-${plan.id}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={plan.price}
                    onChange={(e) => handleUpdatePlan(plan.id, 'price', Number(e.target.value))}
                    className="field tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`contacts-${plan.id}`} className="field-label">Active contacts</label>
                  <input
                    id={`contacts-${plan.id}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={plan.activeContacts}
                    onChange={(e) => handleUpdatePlan(plan.id, 'activeContacts', Number(e.target.value))}
                    className="field tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor={`credits-${plan.id}`} className="field-label">AI credits</label>
                  <input
                    id={`credits-${plan.id}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={plan.aiCredits}
                    onChange={(e) => handleUpdatePlan(plan.id, 'aiCredits', Number(e.target.value))}
                    className="field tabular-nums"
                  />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AdminPricing;
