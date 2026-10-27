import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  Globe,
  Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import api from '../lib/axios';

const AdminStatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; trend: string; tone: string }> = ({ title, value, icon: Icon, trend, tone }) => (
  <div className={`metric ${tone}`}>
    <div className="metric-head">
      <span className="icon-tile is-sm"><Icon size={16} /></span>
      <span className="metric-trend">{trend} <ArrowUpRight size={13} /></span>
    </div>
    <span className="metric-label">{title}</span>
    <span className="metric-figure">{value}</span>
  </div>
);

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    totalClients: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalMessages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [topClients, setTopClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/Admin/Stats');
        if (response.data?.Data) {
          setStats(response.data.Data);
        }

        // Fetch clients for usage widget
        const clientsRes = await api.get('/Company/Admin/All');
        if (clientsRes.data) {
          // Sort by highest AI usage first, take top 5
          const sortedClients = [...clientsRes.data].sort((a, b) => (b.monthly_ai_usage || 0) - (a.monthly_ai_usage || 0)).slice(0, 5);
          setTopClients(sortedClients);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Mock data for platform-wide metrics (Can also be made dynamic later)
  const platformGrowth = [
    { month: 'Jan', clients: Math.floor(stats.totalClients * 0.2), revenue: Math.floor(stats.totalRevenue * 0.1) },
    { month: 'Feb', clients: Math.floor(stats.totalClients * 0.5), revenue: Math.floor(stats.totalRevenue * 0.3) },
    { month: 'Mar', clients: Math.floor(stats.totalClients * 0.8), revenue: Math.floor(stats.totalRevenue * 0.7) },
    { month: 'Apr', clients: stats.totalClients, revenue: stats.totalRevenue },
  ];

  if (isLoading) {
    return (
      <div className="page">
        <div className="surface empty">
          <Loader2 size={22} className="animate-spin text-ink-faint" />
          <p className="empty-body">Loading platform metrics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Platform overview</h1>
          <p className="page-sub">Global metrics across all tenants and clients.</p>
        </div>
        <span className="chip chip-dot chip-go" role="status">System status: OK</span>
      </div>

      <div className="stack">
        <div className="metric-grid">
          <AdminStatCard title="Total clients" value={stats.totalClients.toLocaleString()} icon={ShieldCheck} trend="+12%" tone="tone-blue" />
          <AdminStatCard title="Platform revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={Wallet} trend="+18%" tone="tone-mint" />
          <AdminStatCard title="Global users" value={stats.totalUsers.toLocaleString()} icon={Users} trend="+5%" tone="tone-lavender" />
          <AdminStatCard title="AI requests (messages)" value={stats.totalMessages.toLocaleString()} icon={Globe} trend="+24%" tone="tone-peach" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="surface overflow-hidden lg:col-span-2">
            <div className="surface-head">
              <div>
                <h2>Platform revenue growth</h2>
                <p>Last four months</p>
              </div>
            </div>
            <div className="h-[300px] p-4 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={platformGrowth}>
                  <defs>
                    <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--viridian)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="var(--viridian)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--hairline)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--ink-soft)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--ink-soft)', fontSize: 12 }} tickFormatter={(v) => `₹${Number(v).toLocaleString()}`} width={84} />
                  <Tooltip
                    formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, color: 'var(--ink)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--viridian)" fill="url(#adminRevenue)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="surface flex flex-col overflow-hidden">
            <div className="surface-head">
              <h2>Top AI consumers</h2>
            </div>
            {topClients.length === 0 ? (
              <div className="empty flex-grow py-10">
                <p className="empty-body">No active consumers yet.</p>
              </div>
            ) : (
              <ul className="flex-grow divide-y divide-hairline">
                {topClients.map((client, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-ink">{client.name}</p>
                      <p className="mt-0.5 flex min-w-0 items-center gap-2 text-[13px] text-ink-soft">
                        <span className={client.plan && client.plan !== 'Free' ? 'chip chip-accent px-1.5 py-0 text-[12px]' : 'chip px-1.5 py-0 text-[12px]'}>
                          {client.plan || 'Free'}
                        </span>
                        <span className="truncate">{client.email}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-semibold tabular-nums text-ink">{(client.monthly_ai_usage || 0).toLocaleString()}</p>
                      <p className="text-[12px] text-ink-soft">tokens</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="surface-foot justify-center">
              <button onClick={() => navigate('/admin/clients')} className="btn btn-ghost btn-sm">
                View all clients <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
