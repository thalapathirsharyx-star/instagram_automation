import React, { useState, useEffect } from 'react';
import { Activity, UserPlus, CreditCard, Zap, Clock, AlertTriangle, ListFilter, Loader2 } from 'lucide-react';
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
            color: 'text-emerald-600',
            bgLight: 'bg-emerald-50',
            borderLight: 'border-emerald-200',
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
              color: 'text-violet-600',
              bgLight: 'bg-violet-50',
              borderLight: 'border-violet-200',
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
              color: isCritical ? 'text-rose-600' : 'text-amber-600',
              bgLight: isCritical ? 'bg-rose-50' : 'bg-amber-50',
              borderLight: isCritical ? 'border-rose-200' : 'border-amber-200',
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

  // Each event already carries its tone as a colour; map it onto the shared tile tones.
  const tileTone = (color: string) =>
    color.includes('rose') ? 'is-stop' : color.includes('amber') ? 'is-warn' : color.includes('emerald') ? 'is-go' : '';

  const filterButtons = [
    { key: 'all', label: 'All events' },
    { key: 'new_client', label: 'Signups' },
    { key: 'plan_upgrade', label: 'Upgrades' },
    { key: 'high_usage', label: 'Usage alerts' },
  ];

  if (isLoading) {
    return (
      <div className="page">
        <div className="surface empty">
          <Loader2 size={22} className="animate-spin text-ink-faint" />
          <p className="empty-body">Loading the activity log…</p>
        </div>
      </div>
    );
  }

  const counts = {
    new_client: activities.filter(a => a.type === 'new_client').length,
    plan_upgrade: activities.filter(a => a.type === 'plan_upgrade').length,
    high_usage: activities.filter(a => a.type === 'high_usage').length,
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Activity log</h1>
          <p className="page-sub">Real-time audit trail of SaaS signups, upgrades, and API warnings.</p>
        </div>
      </div>

      <div className="stack">
        <div className="metric-grid">
          {[
            { label: 'Signups', value: counts.new_client, icon: UserPlus, tone: 'tone-mint' },
            { label: 'Plan upgrades', value: counts.plan_upgrade, icon: CreditCard, tone: 'tone-blue' },
            { label: 'Usage alerts', value: counts.high_usage, icon: AlertTriangle, tone: 'tone-amber' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className={`metric ${tone}`}>
              <div className="metric-head">
                <span className="metric-label">{label}</span>
                <span className="icon-tile is-sm"><Icon size={16} /></span>
              </div>
              <span className="metric-figure">{value}</span>
            </div>
          ))}
        </div>

        <section className="surface overflow-hidden">
          <div className="surface-head flex-wrap">
            <h2>
              <span className="icon-tile is-sm"><Activity size={16} /></span>
              Events
              <span className="chip">{filteredActivities.length}</span>
            </h2>
            <div className="segmented" role="group" aria-label="Filter events">
              {filterButtons.map(btn => (
                <button
                  key={btn.key}
                  type="button"
                  aria-pressed={filter === btn.key}
                  onClick={() => setFilter(btn.key)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="empty py-12">
              <span className="empty-mark"><ListFilter /></span>
              <p className="empty-title">No events</p>
              <p className="empty-body">Nothing of this type has happened yet. Try another filter.</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-hairline">
                {paginatedActivities.map((item) => (
                  <li key={item.id} className="flex items-start gap-4 px-5 py-4">
                    <span className={`icon-tile ${tileTone(item.color)}`}>
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-grow">
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <p className="text-[15px] font-medium text-ink">{item.title}</p>
                        <time dateTime={item.timestamp} className="flex shrink-0 items-center gap-1.5 text-[13px] text-ink-soft">
                          <Clock size={12} /> {formatTime(item.timestamp)}
                        </time>
                      </div>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-ink-soft">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <nav className="surface-foot" aria-label="Pagination">
                  <p className="text-[13px] text-ink-soft">
                    Showing <span className="font-medium text-ink">{((currentPage - 1) * itemsPerPage) + 1}</span>–<span className="font-medium text-ink">{Math.min(currentPage * itemsPerPage, filteredActivities.length)}</span> of <span className="font-medium text-ink">{filteredActivities.length}</span> events
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn btn-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn btn-sm"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminActivity;
