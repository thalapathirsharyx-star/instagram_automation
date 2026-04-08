import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar glass-card">
      <div className="logo">
        <div className="logo-icon">IG</div>
        <span>CRM Assistant</span>
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

      <div className="user-info">
        <div className="avatar">Admin</div>
        <div className="details">
          <p className="name">Varun Anand</p>
          <p className="role">System Owner</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
