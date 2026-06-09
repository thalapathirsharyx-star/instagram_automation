import React, { useState, useEffect } from 'react';
import { Activity, UserPlus, CreditCard, Zap, RefreshCw, Clock, AlertTriangle, ListFilter } from 'lucide-react';
import api from '../lib/axios';

interface ActivityItem {
  id: string;
  type: 'new_client' | 'plan_upgrade' | 'high_usage' | 'ai_limit' | 'message';
  title: string;
  description: string;
  timestamp: string;
  plan?: string;
  color: string;
  bgLight: string;
  borderLight: string;
  icon: React.ReactNode;
}

const AdminActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/Company/Admin/All');
        const clients = res.data || [];

        const items: ActivityItem[] = [];

        clients.forEach((client: any) => {
          // Account creation
          items.push({
            id: `signup-${client.id}`,
            type: 'new_client',
            title: 'New Account Registered',
            description: `${client.name} (${client.email}) signed up on the platform.`,
            timestamp: client.created_on || new Date().toISOString(),
            color: 'text-emerald-400',
            bgLight: 'bg-emerald-500/10',
            borderLight: 'border-emerald-500/20',
            icon: <UserPlus size={16} />,
          });

          // Plan upgrades (paid plans)
          if (client.plan && client.plan !== 'Free') {
            items.push({
              id: `upgrade-${client.id}`,
              type: 'plan_upgrade',
              title: `Upgraded to ${client.plan}`,
              description: `${client.name} upgraded their subscription to the ${client.plan} plan.`,
              timestamp: client.plan_expires_at ? new Date(new Date(client.plan_expires_at).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
              plan: client.plan,
              color: 'text-foreground',
              bgLight: 'bg-primary/10',
              borderLight: 'border-primary/20',
              icon: <CreditCard size={16} />,
            });
          }

          // High usage warnings
          const usage = client.monthly_ai_usage || 0;
          let limit = 250;
          if (client.plan === 'Pro') limit = 25000;
          if (client.plan === 'Business') limit = 75000;
          
          if (usage > limit * 0.8) {
            const isCritical = usage >= limit;
            items.push({
              id: `usage-${client.id}`,
              type: 'high_usage',
              title: isCritical ? 'AI Credit Limit Reached' : 'High AI Usage Alert',
              description: `${client.name} has consumed ${usage.toLocaleString()} / ${limit.toLocaleString()} AI credits (${Math.round((usage/limit)*100)}%).`,
              timestamp: new Date().toISOString(),
              color: isCritical ? 'text-destructive' : 'text-warning',
              bgLight: isCritical ? 'bg-destructive/10' : 'bg-amber-50',
              borderLight: isCritical ? 'border-destructive/20' : 'border-amber-200',
              icon: isCritical ? <AlertTriangle size={16} /> : <Zap size={16} />,
            });
          }
        });

        // Sort by timestamp descending (most recent first)
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(items);
      } catch (err) {
        console.error('Failed to fetch activity data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredActivities = filter === 'all' ? activities : activities.filter(a => a.type === filter);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return 'Recently';
    }
  };

  const filterButtons = [
    { key: 'all', label: 'All Events' },
    { key: 'new_client', label: 'Signups' },
    { key: 'plan_upgrade', label: 'Upgrades' },
    { key: 'high_usage', label: 'Usage Alerts' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500 font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm">Fetching Audit Trail...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Platform Activity</h2>
          <p className="text-zinc-500 text-sm">Real-time audit trail of SaaS signups, upgrades, and API warnings.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-muted p-1.5 rounded-xl border border-border shadow-sm shrink-0 overflow-x-auto">
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === btn.key 
                  ? 'bg-primary text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-foreground hover:bg-secondary'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-sm">
            <UserPlus size={20} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">{activities.filter(a => a.type === 'new_client').length}</div>
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Total Signups</div>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-foreground border border-primary/20 shadow-sm">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">{activities.filter(a => a.type === 'plan_upgrade').length}</div>
            <div className="text-[11px] font-bold text-foreground uppercase tracking-widest mt-0.5">Plan Upgrades</div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-warning border border-amber-100 shadow-sm">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-warning tracking-tight">{activities.filter(a => a.type === 'high_usage').length}</div>
            <div className="text-[11px] font-bold text-warning uppercase tracking-widest mt-0.5">Usage Alerts</div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="border bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-400" />
            <h3 className="text-sm font-bold text-foreground">Event Audit Trail</h3>
          </div>
          <span className="text-xs font-bold text-zinc-500 bg-secondary px-2 py-0.5 rounded-full">{filteredActivities.length} events</span>
        </div>
        
        <div className="divide-y divide-zinc-100">
          {filteredActivities.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 border border-border shadow-sm">
                <ListFilter size={24} className="text-zinc-500" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">No events found</h3>
              <p className="text-zinc-500 text-sm">Try changing the filter settings.</p>
            </div>
          ) : (
            <>
              {paginatedActivities.map((item, i) => (
                <div key={item.id} className="p-5 sm:p-6 hover:bg-muted transition-colors flex items-start gap-4 sm:gap-6 group">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 ${item.bgLight} ${item.color} ${item.borderLight}`}>
                    {item.icon}
                  </div>
                  <div className="flex-grow min-w-0 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                      <span className="font-bold text-foreground text-sm sm:text-base leading-tight">{item.title}</span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">
                        <Clock size={12} /> {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-[13px] sm:text-sm text-zinc-500 font-medium leading-relaxed max-w-3xl">{item.description}</p>
                  </div>
                </div>
              ))}
              
              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-muted border-t border-border flex justify-between items-center">
                  <span className="text-xs font-medium text-zinc-500">
                    Showing <strong className="text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredActivities.length)}</strong> of <strong className="text-foreground">{filteredActivities.length}</strong> events
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-zinc-500 bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card shadow-sm transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-zinc-500 bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card shadow-sm transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminActivity;
