import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Bot,
  User, 
  Database
} from 'lucide-react';

const SettingsCard: React.FC<{ icon: any, title: string, subtitle: string, children: React.ReactNode }> = ({ icon: Icon, title, subtitle, children }) => (
  <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ padding: '10px', background: 'var(--glass-border)', borderRadius: '12px' }}>
        <Icon size={24} className="text-primary" />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{subtitle}</p>
      </div>
    </div>
    <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {children}
    </div>
  </div>
);

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="settings-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header">
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Control Center</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>Configure your CRM integration and automation preferences.</p>
      </div>

      <div className="settings-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        
        {/* Meta Integration */}
        <SettingsCard 
          icon={Shield} 
          title="Meta Integration" 
          subtitle="Manage your Instagram and Facebook connections."
        >
          <div className="field-group">
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>App ID</label>
            <div className="glass-input" style={{ background: 'var(--glass-border)', padding: '10px 16px', borderRadius: '8px', fontSize: '0.9rem' }}>
              {import.meta.env.VITE_FB_APP_ID || '955338716906984'}
            </div>
          </div>
          <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ color: '#10b981' }}>Connected to Instagram Business Account</span>
          </div>
        </SettingsCard>

        {/* AI & Automation */}
        <SettingsCard 
          icon={Bot} 
          title="AI Automation" 
          subtitle="Configure how the AI interacts with your leads."
        >
          <div className="toggle-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>Auto-Reply Discovery</div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>Automatically answer basic lead inquiries.</p>
            </div>
            <div className="toggle active"></div>
          </div>
          <div className="toggle-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>Human Handoff Alerts</div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>Notify you when a lead needs urgent human attention.</p>
            </div>
            <div className="toggle active"></div>
          </div>
        </SettingsCard>

        {/* Webhooks & API */}
        <SettingsCard 
          icon={Database} 
          title="Webhooks & API" 
          subtitle="Real-time data synchronization settings."
        >
          <div className="field-group">
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Webhook URL</label>
            <div className="glass-input" style={{ background: 'var(--glass-border)', padding: '10px 16px', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              https://replyzens.com/v1/Instagram/Webhook
            </div>
          </div>
          <button className="text-btn" style={{ background: 'transparent', border: 'none', color: 'var(--primary)', padding: 0, textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer' }}>
            Test Webhook Connectivity
          </button>
        </SettingsCard>

        {/* Account Profile */}
        <SettingsCard 
          icon={User} 
          title="Account Profile" 
          subtitle="Your personal account information."
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
              {user?.email?.[0].toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{user?.email || 'admin@replyzens.com'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Administrator</div>
            </div>
          </div>
          <button className="glass-btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--foreground)', cursor: 'pointer', marginTop: '8px' }}>
            Edit Profile
          </button>
        </SettingsCard>

      </div>
    </div>
  );
};

export default Settings;
