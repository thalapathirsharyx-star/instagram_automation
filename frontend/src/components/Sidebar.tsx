import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, Book, Zap, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo-container">
        <div className="logo">
          <div className="logo-icon">
            <Zap size={24} fill="white" />
          </div>
          <span className="logo-text">ReplyZens</span>
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
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Clients</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </>
        ) : (
          <>
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
            <NavLink to="/knowledge" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Book size={20} />
              <span>Brain Base</span>
            </NavLink>
            <NavLink to="/automation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Zap size={20} />
              <span>Automation</span>
            </NavLink>
            <NavLink to="/ai-settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Sparkles size={20} />
              <span>AI Persona</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{user?.email?.[0].toUpperCase() || 'U'}</div>
          <div className="details ml-3 overflow-hidden">
            <p className="font-semibold text-white truncate">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-zinc-400 font-medium">{user?.role || 'Member'}</p>
          </div>
        </div>

        <div className="border-t border-white/5 my-2 w-full divider" />

        <button onClick={logout} className="logout-btn w-full flex items-center gap-3">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
