import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, MessageCircle, Settings, Book, Zap, Sparkles, ChevronLeft, ChevronRight, CreditCard, Activity, DollarSign, Key, Lock, IndianRupee, ClipboardList, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItemClass = ({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`;

/** A plan-gated entry keeps its lock in the row rather than inside the label text. */
const LockedHint: React.FC<{ locked: boolean }> = ({ locked }) =>
  locked ? <Lock size={13} className="ml-auto text-ink-faint shrink-0" aria-label="Requires a Pro plan" /> : null;

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasProPlan = ['Pro', 'Business', 'Advanced'].includes(user?.company?.plan);
  const isSuperAdmin = user?.roleCode === 'SUPER_ADMIN';

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo-container">
        <div className="logo gap-2">
          <img src="/Dark theme.png" alt="" className="hidden dark:block w-7 h-7 object-contain" />
          <img src="/Light Theme.png" alt="" className="block dark:hidden w-7 h-7 object-contain" />
          <span className="logo-text">Flazly</span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="toggle-btn-inline"
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="nav-links premium-scroll" aria-label="Main">
        {isSuperAdmin ? (
          <>
            <div className="nav-group-label">Overview</div>
            <NavLink to="/admin/dashboard" className={navItemClass}>
              <LayoutDashboard /> <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/revenue" className={navItemClass}>
              <IndianRupee /> <span>Revenue</span>
            </NavLink>
            <NavLink to="/admin/activity" className={navItemClass}>
              <ClipboardList /> <span>Activity log</span>
            </NavLink>

            <div className="nav-group-label">Management</div>
            <NavLink to="/admin/clients" className={navItemClass}>
              <Users /> <span>Clients</span>
            </NavLink>
            <NavLink to="/admin/usage" className={navItemClass}>
              <Activity /> <span>API usage</span>
            </NavLink>
            <NavLink to="/admin/pricing" className={navItemClass}>
              <DollarSign /> <span>Plan pricing</span>
            </NavLink>
            <NavLink to="/admin/llm-keys" className={navItemClass}>
              <Key /> <span>LLM API keys</span>
            </NavLink>
            <NavLink to="/settings" className={navItemClass}>
              <Settings /> <span>Settings</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="nav-group-label">Conversations</div>
            <NavLink to="/dashboard" className={navItemClass}>
              <LayoutDashboard /> <span>Dashboard</span>
            </NavLink>
            <NavLink to="/inbox" className={navItemClass}>
              <MessageSquare /> <span>Inbox</span>
            </NavLink>
            <NavLink to="/comments-manager" className={navItemClass}>
              <MessageCircle /> <span>Comments</span>
            </NavLink>
            <NavLink to="/leads" className={navItemClass}>
              <Users /> <span>Leads</span>
            </NavLink>

            <div className="nav-group-label">Automation</div>
            <NavLink to="/knowledge" className={navItemClass}>
              <Book /> <span>Brain base</span>
            </NavLink>
            <NavLink to="/automation" className={navItemClass}>
              <Zap /> <span>Automation</span>
            </NavLink>
            {user?.roleCode === 'CLIENT_ADMIN' && (
              <NavLink to="/ai-settings" className={navItemClass}>
                <Sparkles /> <span>AI persona</span>
                <LockedHint locked={!hasProPlan} />
              </NavLink>
            )}

            <div className="nav-group-label">Account</div>
            <NavLink to="/meta-integration" className={navItemClass}>
              <Shield /> <span>Instagram connection</span>
            </NavLink>
            {user?.roleCode === 'CLIENT_ADMIN' && (
              <>
                <NavLink to="/team" className={navItemClass}>
                  <Users /> <span>Team</span>
                </NavLink>
                <NavLink to="/billing" className={navItemClass}>
                  <CreditCard /> <span>Billing</span>
                </NavLink>
              </>
            )}
            <NavLink to="/settings" className={navItemClass}>
              <Settings /> <span>Settings</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
