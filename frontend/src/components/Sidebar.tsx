import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, Book, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">
          <Zap size={24} fill="white" />
        </div>
        <span>ReplyZens</span>
      </div>

      <nav className="nav-links">
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
            <p className="font-semibold text-slate-900 truncate">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-slate-500 font-medium">{user?.role || 'Member'}</p>
          </div>
        </div>

        <button onClick={logout} className="nav-item logout-btn w-full mt-4 flex items-center gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
