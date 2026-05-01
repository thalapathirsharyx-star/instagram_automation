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

const DashboardCard: React.FC<{ title: string; value: string | number; icon: any; trend: string; color?: string }> = ({ title, value, icon: Icon, trend, color }) => (
  <div className="w3-card group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3.5 bg-zinc-800/50 rounded-2xl text-purple-400 group-hover:bg-purple-500/10 transition-all duration-500 border border-white/5">
        <Icon size={24} />
      </div>
      <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
        {trend} <ArrowUpRight size={14} />
      </div>
    </div>
    <div>
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-zinc-100 tabular-nums">{value}</h3>
    </div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in duration-700">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Overview</h1>
          <p className="text-zinc-400 font-medium">Monitoring your AI Instagram automation performance.</p>
        </div>
        <button className="w3-button-primary">
          <TrendingUp size={18} />
          <span>Generate Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Leads" value={leadCount} icon={Users} trend="+12.5%" />
        <DashboardCard title="Wallet Balance" value={`$${Number(balance).toFixed(2)}`} icon={Wallet} trend="+5.2%" />
        <DashboardCard title="Interactions" value="1,247" icon={MessageSquare} trend="+24.8%" />
        <DashboardCard title="Active Funnel" value="38" icon={Target} trend="+8.1%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 w3-card flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-zinc-100">Engagement Analytics</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-glow-purple"></div> Messages
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-glow-blue"></div> New Leads
              </div>
            </div>
          </div>
          <div className="flex-grow w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={interactionData}>
                <defs>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12, fontWeight: 500}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12, fontWeight: 500}} />
                <Tooltip 
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="msgs" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMsgs)" strokeWidth={3} />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w3-card flex flex-col h-[450px]">
          <h3 className="text-xl font-bold text-zinc-100 mb-8">Lead Distribution</h3>
          <div className="flex-grow flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={funnelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {funnelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#14b8a6', '#f43f5e'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {funnelData.map((entry, index) => (
              <div key={entry.name} className="flex flex-col gap-1 p-2 rounded-xl bg-zinc-800/20 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: ['#8b5cf6', '#3b82f6', '#14b8a6', '#f43f5e'][index % 4] }}></div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{entry.name}</span>
                </div>
                <span className="text-base font-bold text-zinc-100 ml-4">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        
        <div className="w3-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xl font-bold text-zinc-100 mb-1">System Health</h3>
                <p className="text-xs text-zinc-500 font-medium">Real-time infrastructure monitoring</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                All Operational
              </div>
            </div>
            <div className="space-y-10">
              <div className="flex gap-5 items-center group">
                <div className="p-4 bg-zinc-800/50 rounded-2xl text-zinc-400 group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-all duration-500 border border-white/5 shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">API Latency</span>
                    <span className="text-sm font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">45ms</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full shadow-glow-purple" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-5 items-center group">
                <div className="p-4 bg-zinc-800/50 rounded-2xl text-zinc-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all duration-500 border border-white/5 shrink-0">
                  <Clock size={20} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Webhook Success</span>
                    <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">99.2%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full shadow-glow-blue" style={{ width: '99%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w3-card bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 text-white overflow-hidden relative min-h-[300px] flex flex-col justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg shadow-lg">
                <Zap size={20} className="text-purple-300" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-purple-300 text-[10px]">AI Optimization Engine</h3>
            </div>
            <h2 className="text-2xl font-bold mb-4 leading-tight">Personality Tuning</h2>
            <p className="text-sm font-medium leading-relaxed text-purple-200/80 mb-8 max-w-md">
              Maya is currently using a <strong className="text-white">Professional Tone</strong>. Based on current lead behavior, switching to a <strong className="text-purple-300">Friendly Tone</strong> could increase engagement by up to 18%.
            </p>
            <button className="w3-button-primary bg-white/10 hover:bg-white/20 shadow-none border border-white/20 group">
              <span>Adjust AI Persona</span>
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <Zap className="absolute -bottom-20 -right-20 w-80 h-80 text-purple-500 opacity-20 rotate-12 blur-2xl" />
          <div className="absolute top-0 right-0 p-8">
            <div className="w-24 h-24 rounded-full border border-purple-500/30 animate-pulse shadow-[0_0_40px_rgba(168,85,247,0.2)]"></div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
