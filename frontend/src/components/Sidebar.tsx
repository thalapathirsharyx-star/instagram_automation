import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Settings, Book, Zap, Sparkles, ChevronLeft, ChevronRight, CreditCard, Radio, Activity, DollarSign, Key, Lock, IndianRupee, ClipboardList, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasProPlan = ['Pro', 'Business', 'Advanced'].includes(user?.company?.plan);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo-container">
        <div className="logo gap-2">
          <img src="/Dark theme.png" alt="Flazly Logo" className="hidden dark:block w-11 h-11 object-contain transition-transform duration-300 hover:scale-105" />
          <img src="/Light Theme.png" alt="Flazly Logo" className="block dark:hidden w-11 h-11 object-contain transition-transform duration-300 hover:scale-105" />
          <span className="logo-text text-lg font-extrabold tracking-tight uppercase font-inter">
            <span className="logo-text-primary text-zinc-900 dark:text-white">Flaz</span><span className="text-logo-gradient">ly</span>
          </span>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="toggle-btn-inline"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="nav-links premium-scroll">
        {user?.roleCode === 'SUPER_ADMIN' ? (
          <>
            {/* Super Admin Group */}
            {!isCollapsed && <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mt-4 mb-1">Overview</div>}
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/revenue" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <IndianRupee size={20} />
              <span>Revenue</span>
            </NavLink>
            <NavLink to="/admin/activity" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ClipboardList size={20} />
              <span>Activity Log</span>
            </NavLink>

            {!isCollapsed && <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mt-4 mb-1">Management</div>}
            <NavLink to="/admin/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Clients</span>
            </NavLink>
            <NavLink to="/admin/usage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Activity size={20} />
              <span>API Usage</span>
            </NavLink>
            <NavLink to="/admin/pricing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <DollarSign size={20} />
              <span>Plan Pricing</span>
            </NavLink>
            <NavLink to="/admin/llm-keys" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Key size={20} />
              <span>LLM API Keys</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </>
        ) : (
          <>
            {/* General Group */}
            {!isCollapsed && <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mt-2 mb-1">General</div>}
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/leads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Leads</span>
            </NavLink>
            <NavLink to="/inbox" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <MessageSquare size={20} />
              <span>Inbox</span>
            </NavLink>

            {/* Automation Group */}
            {!isCollapsed && <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mt-4 mb-1">Automation</div>}
            <NavLink to="/knowledge" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Book size={20} />
              <span>Brain Base</span>
            </NavLink>
            {/* <NavLink to="/catalog" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ShoppingBag size={20} />
              <span>Product Catalog</span>
            </NavLink> */}
            <NavLink to="/automation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Zap size={20} />
              <span>Automation</span>
            </NavLink>
            {/* <NavLink to="/broadcasts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Radio size={20} />
              <span>Broadcasts {!hasProPlan && <Lock size={12} className="inline ml-1 text-zinc-400" />}</span>
            </NavLink> */}
            {user?.roleCode === 'CLIENT_ADMIN' && (
              <>
                <NavLink to="/ai-settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Sparkles size={20} />
                  <span>AI Persona {!hasProPlan && <Lock size={12} className="inline ml-1 text-zinc-400" />}</span>
                </NavLink>

                {/* Admin Group */}
                {!isCollapsed && <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mt-4 mb-1">Admin</div>}
                <NavLink to="/team" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Users size={20} />
                  <span>Team</span>
                </NavLink>
                <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <CreditCard size={20} />
                  <span>Billing</span>
                </NavLink>                
                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Settings size={20} />
                  <span>Settings</span>
                </NavLink>
              </>
            )}
          </>
        )}
      </nav>


    </aside>
  );
};

export default Sidebar;
