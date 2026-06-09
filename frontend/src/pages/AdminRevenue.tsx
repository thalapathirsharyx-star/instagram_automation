import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Users, CreditCard, PieChart, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
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
    Free: 'bg-zinc-500',
    Pro: 'bg-brand',
    Business: 'bg-blue-500',
    Advanced: 'bg-emerald-500',
  };

  const planTextColors: Record<string, string> = {
    Free: 'text-zinc-500',
    Pro: 'text-foreground',
    Business: 'text-blue-400',
    Advanced: 'text-emerald-400',
  };

  const planBgLight: Record<string, string> = {
    Free: 'bg-muted',
    Pro: 'bg-primary/10',
    Business: 'bg-blue-500/10',
    Advanced: 'bg-emerald-500/10',
  };

  const planBorderLight: Record<string, string> = {
    Free: 'border-border',
    Pro: 'border-primary/20',
    Business: 'border-blue-500/20',
    Advanced: 'border-emerald-500/20',
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500 font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="text-sm">Calculating Financials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue & Analytics</h2>
          <p className="text-zinc-500 text-sm">Track your platform's financial health, subscription distribution, and MRR growth.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-zinc-500 font-semibold hover:bg-muted hover:border-border transition-all shadow-sm">
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Monthly Recurring', value: `₹${mrr.toLocaleString()}`, icon: IndianRupee, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: '+18%', up: true },
          { title: 'Annual Run Rate', value: `₹${arr.toLocaleString()}`, icon: TrendingUp, iconColor: 'text-foreground', iconBg: 'bg-primary/10', border: 'border-primary/20', trend: '+18%', up: true },
          { title: 'Paid Customers', value: paidClients, icon: CreditCard, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: `${conversionRate}% conv.`, up: true },
          { title: 'Total Accounts', value: clients.length, icon: Users, iconColor: 'text-warning', iconBg: 'bg-amber-50', border: 'border-amber-100', trend: '+12%', up: true },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.iconBg} ${card.iconColor} border ${card.border}`}>
                <card.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${card.up ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                {card.trend} {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{card.title}</p>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution & Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Plan Distribution */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <PieChart size={20} className="text-foreground" /> Plan Distribution
            </h3>
          </div>
          
          <div className="flex flex-col gap-6 flex-grow justify-center">
            {Object.entries(planCounts).map(([plan, count]) => {
              const percentage = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;
              const bgColor = planColors[plan] || 'bg-zinc-500';
              
              return (
                <div key={plan} className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${bgColor}`}></div>
                      <span className="text-sm font-bold text-foreground">{plan} Tier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-500">{count} accounts</span>
                      <span className="text-xs font-bold text-zinc-500 bg-secondary px-2 py-0.5 rounded-md">{percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${bgColor}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Per Plan */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <IndianRupee size={20} className="text-emerald-400" /> Revenue Architecture
            </h3>
          </div>
          
          <div className="flex flex-col gap-4 flex-grow">
            {Object.entries(planCounts).map(([plan, count]) => {
              const price = PLAN_PRICES[plan] || 0;
              const revenue = price * count;
              
              const tColor = planTextColors[plan] || 'text-zinc-500';
              const bgLight = planBgLight[plan] || 'bg-muted';
              const bLight = planBorderLight[plan] || 'border-border';

              return (
                <div key={plan} className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border border-border hover:bg-muted transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${bgLight} ${tColor} ${bLight} shadow-sm group-hover:scale-105 transition-transform`}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">{plan} Plan</div>
                      <div className="text-xs text-zinc-500 font-medium mt-0.5">{count} {count === 1 ? 'tenant' : 'tenants'} × ₹{price.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-base text-foreground">₹{revenue.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">/ month</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex justify-between items-center shadow-inner">
            <span className="font-bold text-emerald-400 uppercase tracking-widest text-xs">Total Validated MRR</span>
            <span className="font-extrabold text-xl text-emerald-400 tracking-tight">₹{mrr.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Paying Customers Grid */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users size={20} className="text-blue-400" /> Active Subscriptions
          </h3>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20">
            {paidClients} Paying Tenants
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.filter(c => c.plan && c.plan !== 'Free').map((client) => {
            const tColor = planTextColors[client.plan] || 'text-zinc-500';
            const bgLight = planBgLight[client.plan] || 'bg-muted';
            const bLight = planBorderLight[client.plan] || 'border-border';

            return (
              <div key={client.id} className="p-4 bg-card border border-border rounded-xl flex items-center gap-4 hover:border-border hover:shadow-sm transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${bgLight} ${tColor} ${bLight} shrink-0`}>
                  {client.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="font-bold text-sm text-foreground truncate">{client.name}</div>
                  <div className="text-xs text-zinc-500 font-medium truncate">{client.email}</div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${bgLight} ${tColor} ${bLight}`}>
                  {client.plan}
                </div>
              </div>
            );
          })}
          
          {paidClients === 0 && (
            <div className="col-span-full py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 border border-border shadow-sm">
                <Activity size={24} className="text-zinc-500" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">No paying customers yet</h3>
              <p className="text-zinc-500 text-sm">Your MRR starts tracking once users upgrade their free accounts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
