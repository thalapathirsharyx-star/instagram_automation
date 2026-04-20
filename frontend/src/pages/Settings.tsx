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
    <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
      {children}
    </div>
  </div>
);

import { connectInstagram } from '../api/crm.api';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionDetails, setConnectionDetails] = React.useState<{ name: string, id: string } | null>(null);

  React.useEffect(() => {
    // Check if SDK already exists
    if (!(window as any).FB) {
      const fbAppId = import.meta.env.VITE_FB_APP_ID || '955338716906984';
      
      // Load Facebook SDK
      (window as any).fbAsyncInit = function() {
        (window as any).FB.init({
          appId      : fbAppId,
          cookie     : true,
          xfbml      : true,
          version    : 'v21.0'
        });
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0] as any;
        if (d.getElementById(id)) return;
        js = d.createElement(s) as any; js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  }, []);

  const handleConnect = () => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      (window as any).FB.login((response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          
          // Send to backend
          connectInstagram(accessToken)
            .then(res => {
              if (res.Success) {
                setIsConnected(true);
                setConnectionDetails({
                  name: res.Data?.page_name || 'Instagram Account',
                  id: res.Data?.business_id || ''
                });
                alert('Instagram Account Linked Successfully!');
              } else {
                alert('Connection Failed: ' + (res.Message || 'Unknown Error'));
              }
            })
            .finally(() => setIsConnecting(false));
        } else {
          console.log('User cancelled login or did not fully authorize.');
          setIsConnecting(false);
        }
      }, { scope: 'instagram_manage_messages,pages_manage_metadata,pages_show_list,instagram_basic' });
    } catch (error) {
      console.error('FB Logic Error:', error);
      setIsConnecting(false);
    }
  };

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
        
        <SettingsCard 
          icon={Shield} 
          title="Meta Integration" 
          subtitle="Manage your Instagram and Facebook connections."
        >
          {isConnected ? (
            <div className="connection-success">
              <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Active Connection</span>
              </div>
              <div className="account-details" style={{ padding: '12px', background: 'var(--glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ background: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
                   {connectionDetails?.name[0]}
                 </div>
                 <div>
                   <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{connectionDetails?.name}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {connectionDetails?.id}</div>
                 </div>
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
                Connect your business account to start receiving and responding to Instagram DMs automatically.
              </p>
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="gradient-btn" 
                style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isConnecting ? 0.7 : 1 }}
              >
                {isConnecting ? 'Establishing Connection...' : 'Connect Instagram Account'}
              </button>
            </>
          )}
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
