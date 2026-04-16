import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar glass-card">
      <div className="logo">
        <div className="logo-icon">RZ</div>
        <span>ReplyZens</span>
      </div>
      
      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/leads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} /> Leads
        </NavLink>
        <NavLink to="/inbox" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} /> Inbox
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} /> Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{user?.email?.[0].toUpperCase() || 'U'}</div>
          <div className="details">
            <p className="name">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="role">{user?.role || 'Member'}</p>
          </div>
        </div>
        
        <button onClick={logout} className="nav-item logout-btn" style={{ width: '100%', marginTop: '16px', border: 'none', background: 'transparent' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
