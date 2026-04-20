import React, { useState, useEffect } from 'react';
import { getBalance, getLeads } from '../api/crm.api';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Wallet, 
  Zap,
  ArrowUpRight,
  Target,
  Clock
} from 'lucide-react';

// Simulated data for charts
const interactionData = [
  { day: 'Mon', msgs: 45, leads: 12 },
  { day: 'Tue', msgs: 52, leads: 15 },
  { day: 'Wed', msgs: 38, leads: 8 },
  { day: 'Thu', msgs: 65, leads: 22 },
  { day: 'Fri', msgs: 48, leads: 14 },
  { day: 'Sat', msgs: 59, leads: 18 },
  { day: 'Sun', msgs: 72, leads: 25 },
];

const funnelData = [
  { name: 'Discovered', value: 400 },
  { name: 'Engaged', value: 300 },
  { name: 'Warm', value: 200 },
  { name: 'Converted', value: 100 },
];

const COLORS = ['#6366f1', '#4f46e5', '#818cf8', '#a5b4fc'];

const DashboardCard: React.FC<{ title: string; value: string | number; icon: any; trend: string; color?: string }> = ({ title, value, icon: Icon, trend, color = 'var(--primary)' }) => (
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
    <div style={{ 
      position: 'absolute', bottom: '-10px', right: '-10px', width: '80px', height: '80px', 
      background: color, filter: 'blur(50px)', opacity: 0.05, borderRadius: '50%' 
    }}></div>
  </div>
);

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [leadCount, setLeadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [balanceRes, leadsRes] = await Promise.all([
        getBalance(),
        getLeads()
      ]);
      setBalance(balanceRes?.Data ?? 0);
      setLeadCount(leadsRes?.Data?.length ?? 0);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', paddingRight: '8px' }}>
      
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Welcome back, Admin</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>Here's what's happening with your Instagram CRM today.</p>
        </div>
        <button className="gradient-btn" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
          Export Report
        </button>
      </div>

      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px' 
      }}>
        <DashboardCard title="Total Leads" value={leadCount} icon={Users} trend="+12.5%" />
        <DashboardCard title="Wallet Balance" value={`$${Number(balance).toFixed(2)}`} icon={Wallet} trend="+5.2%" color="#10b981" />
        <DashboardCard title="Interactions" value="1,247" icon={MessageSquare} trend="+24.8%" color="#6366f1" />
        <DashboardCard title="Active Funnel" value="38" icon={Target} trend="+8.1%" color="#fbbf24" />
      </div>

      <div className="charts-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Interaction History Chart */}
        <div className="glass-card" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ margin: 0 }}>Interaction Analytics</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div> Messages
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div> New Leads
              </div>
            </div>
          </div>
          <div style={{ flexGrow: 1, width: '100%', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={interactionData}>
                <defs>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="msgs" stroke="var(--primary)" fillOpacity={1} fill="url(#colorMsgs)" strokeWidth={3} />
                <Area type="monotone" dataKey="leads" stroke="#6366f1" fill="transparent" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Status Chart */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Lead Distribution</h3>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={funnelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {funnelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
            {funnelData.map((entry, index) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[index % COLORS.length] }}></div>
                <span style={{ color: 'var(--text-dim)' }}>{entry.name}</span>
                <span style={{ fontWeight: 600 }}>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="bottom-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Recent Webhook Events */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>System Health</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981' }}>
              <Zap size={14} fill="#10b981" /> Operational
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}><TrendingUp size={16} /></div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>API Latency</div>
                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '6px' }}>
                  <div style={{ width: '85%', height: '100%', background: '#10b981', borderRadius: '2px' }}></div>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>45ms</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ padding: '8px', background: 'rgba(138, 43, 226, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}><Clock size={16} /></div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Webhook Success Rate</div>
                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '6px' }}>
                  <div style={{ width: '99.2%', height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>99.2%</span>
            </div>
          </div>
        </div>

        {/* Quick Tips / Meta Status */}
        <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.05), rgba(99, 102, 241, 0.05))' }}>
          <h3 style={{ marginBottom: '16px' }}>Pro Tip</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            The AI is currently set to **Professional Tone**. You can adjust this in Settings to make it more casual or sales-oriented to improve conversion rates.
          </p>
          <button style={{ marginTop: '16px', background: 'transparent', border: '1px solid var(--glass-border)', color: '#0f172a', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Adjust Response Tone
          </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
