import React, { useState, useEffect } from 'react';
import { Activity, MessageSquare, UserPlus, CreditCard, Zap, RefreshCw, Clock, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import api from '../lib/axios';

interface ActivityItem {
  id: string;
  type: 'new_client' | 'plan_upgrade' | 'high_usage' | 'ai_limit' | 'message';
  title: string;
  description: string;
  timestamp: string;
  plan?: string;
  color: string;
  icon: React.ReactNode;
}

const AdminActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/Company/Admin/All');
        const clients = res.data || [];

        // Generate activity items from client data
        const items: ActivityItem[] = [];

        clients.forEach((client: any) => {
          // Account creation
          items.push({
            id: `signup-${client.id}`,
            type: 'new_client',
            title: 'New Account Registered',
            description: `${client.name} (${client.email}) signed up on the platform.`,
            timestamp: client.created_on || new Date().toISOString(),
            color: '#10b981',
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
              color: '#a855f7',
              icon: <CreditCard size={16} />,
            });
          }

          // High usage warnings
          const usage = client.monthly_ai_usage || 0;
          let limit = 250;
          if (client.plan === 'Pro') limit = 25000;
          if (client.plan === 'Business') limit = 75000;
          
          if (usage > limit * 0.8) {
            items.push({
              id: `usage-${client.id}`,
              type: 'high_usage',
              title: usage >= limit ? 'AI Credit Limit Reached' : 'High AI Usage Alert',
              description: `${client.name} has consumed ${usage.toLocaleString()} / ${limit.toLocaleString()} AI credits (${Math.round((usage/limit)*100)}%).`,
              timestamp: new Date().toISOString(),
              color: usage >= limit ? '#ef4444' : '#f59e0b',
              icon: usage >= limit ? <AlertTriangle size={16} /> : <Zap size={16} />,
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
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
        <RefreshCw size={20} className="animate-spin" style={{ marginRight: '8px' }} /> Loading Activity Feed...
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#18181b' }}>Platform Activity</h1>
          <p style={{ margin: '8px 0 0', color: '#71717a' }}>Real-time audit trail of platform events and alerts.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: filter === btn.key ? '1px solid #a855f7' : '1px solid #e4e4e7',
                background: filter === btn.key ? '#a855f715' : '#ffffff',
                color: filter === btn.key ? '#a855f7' : '#71717a',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserPlus size={20} color="#10b981" />
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#166534' }}>{activities.filter(a => a.type === 'new_client').length}</div>
            <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>Total Signups</div>
          </div>
        </div>
        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CreditCard size={20} color="#a855f7" />
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6b21a8' }}>{activities.filter(a => a.type === 'plan_upgrade').length}</div>
            <div style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>Plan Upgrades</div>
          </div>
        </div>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={20} color="#f59e0b" />
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#92400e' }}>{activities.filter(a => a.type === 'high_usage').length}</div>
            <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>Usage Alerts</div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#a855f7" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#18181b' }}>Event Timeline</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 500 }}>{filteredActivities.length} events</span>
        </div>
        
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredActivities.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
              <Activity size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p>No events found for this filter.</p>
            </div>
          ) : filteredActivities.map((item, i) => (
            <div
              key={item.id}
              style={{
                padding: '20px 24px',
                borderBottom: i < filteredActivities.length - 1 ? '1px solid #f4f4f5' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'background 0.2s',
              }}
              className="table-row-hover"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `${item.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.color,
                flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#18181b', fontSize: '0.95rem' }}>{item.title}</span>
                  <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <Clock size={12} /> {formatTime(item.timestamp)}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#71717a', lineHeight: 1.5 }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminActivity;
