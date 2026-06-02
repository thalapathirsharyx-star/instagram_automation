import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Users, CreditCard, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../lib/axios';

const PLAN_PRICES: Record<string, number> = {
  Free: 0,
  Pro: 2499,
  Business: 5999,
};

const AdminRevenue: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/Company/Admin/All');
        setClients(res.data || []);
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const planCounts = clients.reduce((acc: Record<string, number>, c) => {
    const plan = c.plan || 'Free';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});

  const mrr = clients.reduce((sum, c) => {
    const plan = c.plan || 'Free';
    return sum + (PLAN_PRICES[plan] || 0);
  }, 0);

  const arr = mrr * 12;
  const paidClients = clients.filter(c => c.plan && c.plan !== 'Free').length;
  const conversionRate = clients.length > 0 ? Math.round((paidClients / clients.length) * 100) : 0;

  const planColors: Record<string, string> = {
    Free: '#71717a',
    Pro: '#a855f7',
    Business: '#6366f1',
    Advanced: '#10b981',
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
        Loading Revenue Data...
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header">
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#18181b' }}>Revenue & Analytics</h1>
        <p style={{ margin: '8px 0 0', color: '#71717a' }}>Track your platform's financial health and growth metrics.</p>
      </div>

      {/* Revenue Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {[
          { title: 'Monthly Recurring Revenue', value: `₹${mrr.toLocaleString()}`, icon: IndianRupee, color: '#10b981', trend: '+18%', up: true },
          { title: 'Annual Run Rate', value: `₹${arr.toLocaleString()}`, icon: TrendingUp, color: '#a855f7', trend: '+18%', up: true },
          { title: 'Paid Customers', value: paidClients, icon: CreditCard, color: '#6366f1', trend: `${conversionRate}% conv.`, up: true },
          { title: 'Total Accounts', value: clients.length, icon: Users, color: '#f59e0b', trend: '+12%', up: true },
        ].map((card, i) => (
          <div key={i} style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: `${card.color}15`, borderRadius: '12px' }}>
                <card.icon size={20} color={card.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: card.up ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                {card.trend} {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.title}</p>
            <h3 style={{ margin: '8px 0 0', fontSize: '1.8rem', fontWeight: 700, color: '#18181b' }}>{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Plan Distribution + Revenue Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Plan Distribution */}
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <PieChart size={18} color="#a855f7" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#18181b' }}>Plan Distribution</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(planCounts).map(([plan, count]) => {
              const percentage = Math.round((count / clients.length) * 100);
              const color = planColors[plan] || '#71717a';
              return (
                <div key={plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}></div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#18181b' }}>{plan}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: 600 }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#f4f4f5', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Per Plan */}
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <IndianRupee size={18} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#18181b' }}>Revenue Per Plan</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(planCounts).map(([plan, count]) => {
              const price = PLAN_PRICES[plan] || 0;
              const revenue = price * count;
              const color = planColors[plan] || '#71717a';
              return (
                <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fafafa', borderRadius: '12px', border: '1px solid #f4f4f5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={18} color={color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#18181b' }}>{plan} Plan</div>
                      <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{count} {count === 1 ? 'customer' : 'customers'} × ₹{price.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#18181b' }}>₹{revenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>/ month</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#166534' }}>Total MRR</span>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#166534' }}>₹{mrr.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Recent Paying Customers */}
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', color: '#18181b' }}>Paying Customers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {clients.filter(c => c.plan && c.plan !== 'Free').map((client) => {
            const color = planColors[client.plan] || '#71717a';
            return (
              <div key={client.id} style={{ padding: '16px', border: '1px solid #e4e4e7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color, fontSize: '0.9rem' }}>
                  {client.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#18181b' }}>{client.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{client.email}</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: '8px', background: `${color}15`, color, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {client.plan}
                </div>
              </div>
            );
          })}
          {paidClients === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#71717a' }}>
              No paying customers yet. Time to grow! 🚀
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
