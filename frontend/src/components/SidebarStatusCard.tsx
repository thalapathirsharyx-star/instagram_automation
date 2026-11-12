import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Link2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInstagramSettings } from '../api/crm.api';
import { aiMessagesFor } from '../lib/planLimits';

/**
 * The gradient card at the foot of the sidebar.
 *  - Workspace owners: this month's AI replies against the plan allowance,
 *    with a way to Billing.
 *  - Agents (no Billing access): the Instagram connection status instead.
 * Super admins don't get one.
 */
const SidebarStatusCard: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.roleCode === 'CLIENT_ADMIN';
  const [igState, setIgState] = useState<'loading' | 'ok' | 'reconnect' | 'off'>('loading');

  useEffect(() => {
    if (isOwner) return;
    getInstagramSettings()
      .then((res) => {
        const d = res?.Data;
        setIgState(!d?.isConnected ? 'off' : d.needs_reconnect ? 'reconnect' : 'ok');
      })
      .catch(() => setIgState('off'));
  }, [isOwner]);

  if (isOwner) {
    const plan = user?.company?.plan || 'Free';
    const limit = aiMessagesFor(plan);
    const used = Number(user?.company?.monthly_ai_usage) || 0;
    const pct = Math.min(100, Math.round((used / limit) * 100));
    const nearLimit = pct >= 80;

    return (
      <div className="sidebar-card">
        <span className="sidebar-card-badge" aria-hidden="true"><Sparkles size={22} /></span>
        <p className="sidebar-card-title">AI usage</p>
        <p className="sidebar-card-text">
          <span className="font-semibold text-white">{used.toLocaleString()}</span> of {limit.toLocaleString()} replies this month on {plan}
        </p>
        <div className="sidebar-card-meter" role="progressbar" aria-label="AI replies used this month" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <Link to="/billing" className="sidebar-card-btn">
          {nearLimit || plan === 'Free' ? 'Upgrade plan' : 'View usage'}
        </Link>
      </div>
    );
  }

  const copy = {
    loading: { title: 'Instagram', text: 'Checking your connection…', cta: 'Open settings' },
    ok: { title: 'Instagram connected', text: 'The assistant is answering DMs and comments.', cta: 'Manage connection' },
    reconnect: { title: 'Reconnect Instagram', text: 'Meta access needs renewing before replies stop.', cta: 'Reconnect' },
    off: { title: 'Instagram not connected', text: 'Ask your workspace owner to connect the account.', cta: 'View connection' },
  }[igState];

  return (
    <div className="sidebar-card">
      <span className="sidebar-card-badge" aria-hidden="true"><Link2 size={22} /></span>
      <p className="sidebar-card-title">{copy.title}</p>
      <p className="sidebar-card-text">{copy.text}</p>
      <Link to="/meta-integration" className="sidebar-card-btn">{copy.cta}</Link>
    </div>
  );
};

export default SidebarStatusCard;
