import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wallet, 
  Server, 
  ShieldCheck, 
  ArrowUpRight,
  BarChart3,
  Globe,
  Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

import api from '../lib/axios';

const AdminStatCard: React.FC<{ title: string; value: string | number; icon: any; trend: string; color?: string }> = ({ title, value, icon: Icon, trend, color = 'var(--primary)' }) => (
  <div className="glass-card hover-glow" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ padding: '10px', background: 'var(--glass-border)', borderRadius: '12px' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
        {trend} <ArrowUpRight size={14} />
      </div>
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <h3 style={{ margin: '8px 0 0', fontSize: '1.8rem', fontWeight: 700 }}>{value}</h3>
    </div>
  </div>
);

const SuperAdminDashboard: React.FC = () => {
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
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>Loading Admin Data...</div>;
  }

  return (
    <div className="dashboard-page" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Platform Overview</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>Global metrics across all tenants and clients.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-base btn-outline">
            <Server size={18} /> System Status: OK
          </button>
          <button className="btn-base btn-primary">
            Configure Platform
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '24px' 
      }}>
        <AdminStatCard title="Total Clients" value={stats.totalClients.toLocaleString()} icon={ShieldCheck} trend="+12%" />
        <AdminStatCard title="Platform Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={Wallet} trend="+18%" color="#10b981" />
        <AdminStatCard title="Global Users" value={stats.totalUsers.toLocaleString()} icon={Users} trend="+5%" color="#6366f1" />
        <AdminStatCard title="API Requests (Msgs)" value={stats.totalMessages.toLocaleString()} icon={Globe} trend="+24%" color="#fbbf24" />
      </div>

      <div className="charts-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', minHeight: '400px' }}>
          <h3 style={{ marginBottom: '32px' }}>Platform Revenue Growth</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformGrowth}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ background: 'var(--card)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#adminRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px' }}>Top AI Consumers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topClients.map((client, i) => (
              <div key={i} style={{ fontSize: '0.85rem', padding: '12px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{client.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold mr-2 ${client.plan !== 'Free' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-primary/90 text-muted-foreground'}`}>
                      {client.plan || 'Free'}
                    </span>
                    {client.email}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{client.monthly_ai_usage || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Tokens</div>
                </div>
              </div>
            ))}
            {topClients.length === 0 && (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>No active consumers yet.</div>
            )}
          </div>
          <button className="btn-base btn-outline w-full mt-5 border-transparent text-primary hover:bg-muted">
            View All Clients
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
