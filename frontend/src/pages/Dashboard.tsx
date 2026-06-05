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
import { useToast } from '../context/ToastContext';



const DashboardCard: React.FC<{ title: string; value: string | number; icon: any; trend: string }> = ({ title, value, icon: Icon, trend }) => {
  let iconColor = '#8B5CF6'; // Default Purple
  let bgHover = 'group-hover:bg-[#8B5CF6]/10';
  let bgDefault = 'bg-[#8B5CF6]/5';

  if (title.toLowerCase().includes('lead')) {
    iconColor = '#E440A3'; // Pink
    bgHover = 'group-hover:bg-[#E440A3]/10';
    bgDefault = 'bg-[#E440A3]/5';
  } else if (title.toLowerCase().includes('balance') || title.toLowerCase().includes('sales')) {
    iconColor = '#22C55E'; // Green
    bgHover = 'group-hover:bg-[#22C55E]/10';
    bgDefault = 'bg-[#22C55E]/5';
  } else if (title.toLowerCase().includes('funnel') || title.toLowerCase().includes('engagement')) {
    iconColor = '#3B82F6'; // Blue
    bgHover = 'group-hover:bg-[#3B82F6]/10';
    bgDefault = 'bg-[#3B82F6]/5';
  } else if (title.toLowerCase().includes('interaction') || title.toLowerCase().includes('conversation')) {
    iconColor = '#8B5CF6'; // Purple
    bgHover = 'group-hover:bg-[#8B5CF6]/10';
    bgDefault = 'bg-[#8B5CF6]/5';
  }

  return (
    <div className="w3-card group">
      <div className="flex justify-between items-start mb-6">
        <div 
          className={`p-3.5 rounded-2xl transition-all duration-500 border border-white/5 ${bgDefault} ${bgHover}`}
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <Icon size={24} style={{ color: iconColor }} />
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
};

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState<number>(0);
  const [leadCount, setLeadCount] = useState<number>(0);
  const [interactionsCount, setInteractionsCount] = useState<number>(0);
  const [activeFunnelCount, setActiveFunnelCount] = useState<number>(0);
  const [interactionData, setInteractionData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playbookFunnel, setPlaybookFunnel] = useState<{
    started: number;
    replied: number;
    captured: number;
    converted: number;
  }>({ started: 0, replied: 0, captured: 0, converted: 0 });

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
      const leads = leadsRes?.Data || [];
      setBalance(balanceRes?.Data ?? 0);
      setLeadCount(leads.length);
      
      const activeLeads = leads.filter((l: any) => l.lead_status !== 'Lost');
      setActiveFunnelCount(activeLeads.length);
      
      // Calculate pseudo interactions as a dynamic metric
      setInteractionsCount(leads.length * 3 + Math.floor(leads.length * 0.5));
      
      // Funnel Distribution
      const statusCounts = leads.reduce((acc: any, lead: any) => {
        acc[lead.lead_status] = (acc[lead.lead_status] || 0) + 1;
        return acc;
      }, {});
      
      const funnel = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
      setFunnelData(funnel.length > 0 ? funnel : [{ name: 'Connect Instagram to capture leads', value: 1 }]);

      // Calculate playbook funnel metrics dynamically based on actual database leads
      const started = leads.length;
      const replied = leads.filter((l: any) => l.lead_status !== 'New' || (l.lead_score && l.lead_score > 1)).length;
      const captured = leads.filter((l: any) => (l.tags && l.tags.length > 0) || (l.lead_score && l.lead_score >= 5)).length;
      const converted = leads.filter((l: any) => l.lead_status === 'Buyer').length;

      setPlaybookFunnel({
        started,
        replied,
        captured,
        converted
      });

      // Interaction chart data (last 7 days grouped)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayMap = days.reduce((acc: any, day) => ({ ...acc, [day]: { day, msgs: 0, leads: 0 } }), {});
      
      leads.forEach((lead: any) => {
        let dayIndex = new Date().getDay() - 1; 
        if (dayIndex < 0) dayIndex = 6;
        if (lead.created_on) {
            const date = new Date(lead.created_on);
            dayIndex = date.getDay() - 1;
            if (dayIndex < 0) dayIndex = 6;
        }
        const day = days[dayIndex];
        if (dayMap[day]) {
           dayMap[day].leads += 1;
           dayMap[day].msgs += 3;
        }
      });
      setInteractionData(days.map(day => dayMap[day]));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await getLeads();
      const leads = res?.Data || [];
      if (leads.length === 0) {
        toast.warning('No leads to export');
        return;
      }
      
      const headers = ['Name', 'Handle', 'Status', 'Score', 'Intent'];
      const rows = leads.map((lead: any) => [
        `"${lead.customer_name}"`,
        `"${lead.instagram_handle}"`,
        `"${lead.lead_status}"`,
        lead.ai_score,
        `"${lead.last_intent || ''}"`
      ]);
      
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_report_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
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
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Overview</h1>
          <p className="text-zinc-400 font-medium">Monitoring your AI Instagram automation performance.</p>
        </div>
        <button onClick={handleGenerateReport} className="w3-button-primary">
          <TrendingUp size={18} />
          <span>Generate Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Leads" value={leadCount} icon={Users} trend="+12.5%" />
        <DashboardCard title="Wallet Balance" value={`$${Number(balance).toFixed(2)}`} icon={Wallet} trend="+5.2%" />
        <DashboardCard title="Interactions" value={interactionsCount.toLocaleString()} icon={MessageSquare} trend="+24.8%" />
        <DashboardCard title="Active Funnel" value={activeFunnelCount.toLocaleString()} icon={Target} trend="+8.1%" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Playbook Conversion Funnel */}
        <div className="lg:col-span-2 w3-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-100">Playbook Funnel Conversion</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">Track drop-off and conversion rates across automated chat playbooks</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                <Target size={14} className="text-purple-400 animate-pulse" />
                <span>Overall ROI: {playbookFunnel.started > 0 ? ((playbookFunnel.converted / playbookFunnel.started) * 100).toFixed(1) : '0.0'}%</span>
              </div>
            </div>

            {/* Funnel Visual Stack */}
            <div className="space-y-4 my-2">
              {/* Step 1: Started */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 font-bold text-[10px] flex items-center justify-center border border-white/5">1</span>
                    <span className="text-xs font-bold text-zinc-300">Playbook Started</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-100">{playbookFunnel.started} leads</span>
                    <span className="text-[10px] font-bold text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800">100%</span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Transition 1 -> 2 */}
              <div className="flex items-center gap-4 py-1.5">
                <div className="h-6 border-l-2 border-zinc-500/30 border-dashed ml-[9px]"></div>
                <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 text-[10px] font-bold">
                  <span>↓ {playbookFunnel.started > 0 ? ((playbookFunnel.replied / playbookFunnel.started) * 100).toFixed(0) : '0'}% Reply Rate</span>
                  <span className="opacity-70 ml-1">({(100 - (playbookFunnel.started > 0 ? (playbookFunnel.replied / playbookFunnel.started) * 100 : 0)).toFixed(0)}% drop-off)</span>
                </div>
              </div>

              {/* Step 2: Replied */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 font-bold text-[10px] flex items-center justify-center border border-white/5">2</span>
                    <span className="text-xs font-bold text-zinc-300">Engaged / Replied</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-100">{playbookFunnel.replied} leads</span>
                    <span className="text-[10px] font-bold text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800">
                      {playbookFunnel.started > 0 ? ((playbookFunnel.replied / playbookFunnel.started) * 100).toFixed(0) : '0'}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" style={{ width: `${playbookFunnel.started > 0 ? (playbookFunnel.replied / playbookFunnel.started) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* Transition 2 -> 3 */}
              <div className="flex items-center gap-4 py-1.5">
                <div className="h-6 border-l-2 border-zinc-500/30 border-dashed ml-[9px]"></div>
                <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 text-[10px] font-bold">
                  <span>↓ {playbookFunnel.replied > 0 ? ((playbookFunnel.captured / playbookFunnel.replied) * 100).toFixed(0) : '0'}% Capture Rate</span>
                  <span className="opacity-70 ml-1">({(100 - (playbookFunnel.replied > 0 ? (playbookFunnel.captured / playbookFunnel.replied) * 100 : 0)).toFixed(0)}% drop-off)</span>
                </div>
              </div>

              {/* Step 3: Captured */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 font-bold text-[10px] flex items-center justify-center border border-white/5">3</span>
                    <span className="text-xs font-bold text-zinc-300">Details Captured</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-100">{playbookFunnel.captured} leads</span>
                    <span className="text-[10px] font-bold text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800">
                      {playbookFunnel.started > 0 ? ((playbookFunnel.captured / playbookFunnel.started) * 100).toFixed(0) : '0'}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full" style={{ width: `${playbookFunnel.started > 0 ? (playbookFunnel.captured / playbookFunnel.started) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* Transition 3 -> 4 */}
              <div className="flex items-center gap-4 py-1.5">
                <div className="h-6 border-l-2 border-zinc-500/30 border-dashed ml-[9px]"></div>
                <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 text-[10px] font-bold">
                  <span>↓ {playbookFunnel.captured > 0 ? ((playbookFunnel.converted / playbookFunnel.captured) * 100).toFixed(0) : '0'}% Close Rate</span>
                  <span className="opacity-70 ml-1">({(100 - (playbookFunnel.captured > 0 ? (playbookFunnel.converted / playbookFunnel.captured) * 100 : 0)).toFixed(0)}% drop-off)</span>
                </div>
              </div>

              {/* Step 4: Converted */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 font-bold text-[10px] flex items-center justify-center border border-white/5">4</span>
                    <span className="text-xs font-bold text-zinc-300">Converted (Buyers)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-100">{playbookFunnel.converted} leads</span>
                    <span className="text-[10px] font-bold text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800">
                      {playbookFunnel.started > 0 ? ((playbookFunnel.converted / playbookFunnel.started) * 100).toFixed(0) : '0'}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: `${playbookFunnel.started > 0 ? (playbookFunnel.converted / playbookFunnel.started) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="flex flex-col gap-6">
          {/* System Health */}
          <div className="w3-card flex flex-col justify-between flex-grow">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 mb-1">System Health</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Real-time status</p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-wider border border-emerald-500/20">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
                  Online
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4 items-center group">
                  <div className="p-3 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-all duration-500 border border-white/5 shrink-0">
                    <TrendingUp size={16} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">API Latency</span>
                      <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">45ms</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-center group">
                  <div className="p-3 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all duration-500 border border-white/5 shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Webhook Success</span>
                      <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">99.2%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" style={{ width: '99%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Optimization Engine */}
          <div className="w3-card bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 text-white overflow-hidden relative flex flex-col justify-center flex-grow py-6">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 px-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg shadow-lg">
                  <Zap size={16} className="text-purple-300" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">AI Engine</h3>
              </div>
              <h2 className="text-lg font-bold mb-2 leading-tight">Personality Tuning</h2>
              <p className="text-xs font-medium leading-relaxed text-purple-200/80 mb-4">
                Flazly is currently using a <strong className="text-white font-bold">Professional Tone</strong>. Based on current lead behavior, switching to a <strong className="text-purple-300 font-bold">Friendly Tone</strong> could increase engagement by up to 18%.
              </p>
              <button className="w3-button-primary bg-white/10 hover:bg-white/20 shadow-none border border-white/20 group py-2.5 text-xs">
                <span>Adjust AI Persona</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            <Zap className="absolute -bottom-20 -right-20 w-60 h-60 text-purple-500 opacity-20 rotate-12 blur-2xl animate-pulse" />
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
