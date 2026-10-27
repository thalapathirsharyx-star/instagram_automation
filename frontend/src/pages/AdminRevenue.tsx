import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Users, CreditCard, PieChart, ArrowUpRight, Activity, Download, Loader2 } from 'lucide-react';
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

  const planChip = (plan: string) => (plan && plan !== 'Free' ? 'chip chip-accent' : 'chip');

  // Downloads the revenue table this page is built from: one row per tenant.
  const exportCsv = () => {
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Company', 'Email', 'Plan', 'Monthly price (INR)'],
      ...clients.map(c => [c.name, c.email, c.plan || 'Free', PLAN_PRICES[c.plan || 'Free'] || 0]),
    ];
    const blob = new Blob([rows.map(r => r.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flazly-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="surface empty">
          <Loader2 size={22} className="animate-spin text-ink-faint" />
          <p className="empty-body">Calculating revenue…</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { title: 'Monthly recurring revenue', value: `₹${mrr.toLocaleString()}`, icon: IndianRupee, trend: '+18%' },
    { title: 'Annual run rate', value: `₹${arr.toLocaleString()}`, icon: TrendingUp, trend: '+18%' },
    { title: 'Paid customers', value: paidClients, icon: CreditCard, trend: `${conversionRate}% conv.` },
    { title: 'Total accounts', value: clients.length, icon: Users, trend: '+12%' },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Revenue</h1>
          <p className="page-sub">Track your platform's financial health, subscription distribution, and MRR growth.</p>
        </div>
        <button onClick={exportCsv} disabled={clients.length === 0} className="btn">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="stack">
        <div className="metric-grid">
          {kpis.map((card, i) => (
            <div key={card.title} className={`metric ${['tone-mint', 'tone-blue', 'tone-lavender', 'tone-peach'][i]}`}>
              <div className="metric-head">
                <span className="icon-tile is-sm"><card.icon size={16} /></span>
                <span className="metric-trend">{card.trend} <ArrowUpRight size={13} /></span>
              </div>
              <span className="metric-label">{card.title}</span>
              <span className="metric-figure">{card.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="surface overflow-hidden">
            <div className="surface-head">
              <h2><span className="icon-tile is-sm"><PieChart size={16} /></span>Plan distribution</h2>
            </div>
            <div className="surface-body space-y-5">
              {Object.entries(planCounts).length === 0 && <p className="text-[14px] text-ink-soft">No accounts yet.</p>}
              {Object.entries(planCounts).map(([plan, count]) => {
                const percentage = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-[14px] font-medium text-ink">{plan}</span>
                      <span className="text-[13px] tabular-nums text-ink-soft">
                        {count} {count === 1 ? 'account' : 'accounts'} · {percentage}%
                      </span>
                    </div>
                    <div className="meter" role="progressbar" aria-label={`${plan} share`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${percentage}%` }} className={plan === 'Free' ? '!bg-ink-faint' : ''} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="surface flex flex-col overflow-hidden">
            <div className="surface-head">
              <h2><span className="icon-tile is-sm is-go"><IndianRupee size={16} /></span>Revenue by plan</h2>
            </div>
            <ul className="flex-grow divide-y divide-hairline">
              {Object.entries(planCounts).map(([plan, count]) => {
                const price = PLAN_PRICES[plan] || 0;
                return (
                  <li key={plan} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="icon-tile is-neutral"><CreditCard size={17} /></span>
                      <div>
                        <p className="text-[14px] font-medium text-ink">{plan} plan</p>
                        <p className="text-[13px] tabular-nums text-ink-soft">
                          {count} {count === 1 ? 'tenant' : 'tenants'} × ₹{price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-right text-[15px] font-semibold tabular-nums text-ink">
                      ₹{(price * count).toLocaleString()}<span className="text-[13px] font-normal text-ink-soft"> /mo</span>
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className="surface-foot">
              <span className="text-[14px] font-medium text-ink">Total MRR</span>
              <span className="text-[20px] font-bold tabular-nums text-signal-go">₹{mrr.toLocaleString()}</span>
            </div>
          </section>
        </div>

        <section className="surface overflow-hidden">
          <div className="surface-head">
            <h2><span className="icon-tile is-sm"><Users size={16} /></span>Active subscriptions</h2>
            <span className="chip chip-accent">{paidClients} paying</span>
          </div>

          {paidClients === 0 ? (
            <div className="empty py-12">
              <span className="empty-mark"><Activity /></span>
              <p className="empty-title">No paying customers yet</p>
              <p className="empty-body">MRR starts tracking once a workspace upgrades from Free.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 lg:grid-cols-3">
              {clients.filter(c => c.plan && c.plan !== 'Free').map((client) => (
                <div key={client.id} className="flex items-center gap-3 rounded-[10px] border border-hairline p-3.5">
                  <span className="avatar-initial">{client.name?.charAt(0)?.toUpperCase() || '?'}</span>
                  <div className="min-w-0 flex-grow">
                    <p className="truncate text-[14px] font-medium text-ink">{client.name}</p>
                    <p className="truncate text-[13px] text-ink-soft">{client.email}</p>
                  </div>
                  <span className={`${planChip(client.plan)} shrink-0`}>{client.plan}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminRevenue;
