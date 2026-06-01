import React, { useState } from 'react';
import { DollarSign, Save, Edit3, ShieldAlert } from 'lucide-react';
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
    <div className="dashboard-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Plan & Pricing Configuration</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>Manage subscription tiers, prices, and limits globally.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm" 
          style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1, border: 'none', cursor: 'pointer' }}
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', color: '#f59e0b' }}>
        <ShieldAlert size={20} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
          Modifying prices here will update the Razorpay checkout amounts for all future customer upgrades. Active subscriptions are not affected.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: '#f4f4f5', borderRadius: '8px' }}>
                  <Edit3 size={18} color="#18181b" />
                </div>
                <h3 style={{ margin: 0, color: '#18181b', fontSize: '1.2rem' }}>{plan.name} Plan</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Price (₹)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                  <input 
                    type="number" 
                    value={plan.price}
                    onChange={(e) => handleUpdatePlan(plan.id, 'price', Number(e.target.value))}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '10px', color: '#18181b', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Contacts</label>
                  <input 
                    type="number" 
                    value={plan.activeContacts}
                    onChange={(e) => handleUpdatePlan(plan.id, 'activeContacts', Number(e.target.value))}
                    style={{ width: '100%', padding: '12px 16px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '10px', color: '#18181b', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Credits</label>
                  <input 
                    type="number" 
                    value={plan.aiCredits}
                    onChange={(e) => handleUpdatePlan(plan.id, 'aiCredits', Number(e.target.value))}
                    style={{ width: '100%', padding: '12px 16px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '10px', color: '#18181b', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPricing;
