import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Bot,
  User, 
  Database,
  ExternalLink,
  Info,
  CheckCircle2,
  X,
  Smartphone,
  ToggleRight,
  Link2,
  Zap,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const SettingsCard: React.FC<{ icon: any, title: string, subtitle: string, children: React.ReactNode }> = ({ icon: Icon, title, subtitle, children }) => (
  <div className="w3-card flex flex-col gap-6 group hover:border-purple-500/30 transition-all duration-500 border-white/5">
    <div className="flex gap-4 items-center">
      <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-500/20 transition-all duration-500 shadow-inner border border-purple-500/20">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">{title}</h3>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">{subtitle}</p>
      </div>
    </div>
    <div className="flex flex-col gap-6 flex-grow pt-4 border-t border-white/5">
      {children}
    </div>
  </div>
);

import { connectInstagram, getInstagramSettings, updateInstagramSettings } from '../api/crm.api';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = React.useState(true);
  const [showGuide, setShowGuide] = React.useState(false);
  const [connectionDetails, setConnectionDetails] = React.useState<{ name: string, id: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileEmail, setProfileEmail] = React.useState(user?.email || '');
  const [notification, setNotification] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);

  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  React.useEffect(() => {
    setIsLoadingStatus(true);
    getInstagramSettings().then(res => {
      if (res.Success && res.Data?.isConnected) {
        setIsConnected(true);
        setConnectionDetails({
          name: res.Data.page_name,
          id: res.Data.business_id
        });
      }
    }).catch(err => console.error('Failed to fetch IG settings:', err))
      .finally(() => setIsLoadingStatus(false));

    const fbAppId = import.meta.env.VITE_FB_APP_ID || '955338716906984';

    if (!(window as any).FB) {
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
    } else {
      (window as any).FB.init({
        appId      : fbAppId,
        cookie     : true,
        xfbml      : true,
        version    : 'v21.0'
      });
    }
  }, []);

  const handleConnect = () => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      (window as any).FB.login((response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          
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
                const message = (res.Message || '').toUpperCase();
                if (message.includes('META_NO_INSTAGRAM_LINKED')) {
                  setShowGuide(true);
                } else if (message.includes('META_APP_RESTRICTED')) {
                  alert(res.Message);
                } else {
                  alert('Connection Failed: ' + (res.Message || 'Unknown Error'));
                }
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
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Control Center</h1>
          <p className="text-zinc-400 font-medium">Configure your CRM integration and automation preferences.</p>
        </div>
        {notification && (
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold animate-in zoom-in duration-300 border
            ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {notification.type === 'success' ? <Sparkles size={16} /> : <AlertCircle size={16} />}
            {notification.message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        <SettingsCard 
          icon={Shield} 
          title="Meta Integration" 
          subtitle="Manage your Instagram and Facebook connections."
        >
          {isLoadingStatus ? (
            <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 text-zinc-400 font-bold text-xs uppercase tracking-widest">
              <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
              Verifying Connection...
            </div>
          ) : isConnected ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Connection
              </div>
              
              <div className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 shadow-inner">
                <div className="text-sm font-bold text-zinc-100">{connectionDetails?.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">Business ID: {connectionDetails?.id}</div>
              </div>

              <button 
                onClick={() => {
                  setIsConnected(false);
                  setConnectionDetails(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-500 font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                <X size={14} /> Disconnect Account
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                Connect your business account to start receiving and responding to Instagram DMs automatically.
              </p>
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w3-button-primary w-full justify-center shadow-glow-purple"
              >
                {isConnecting ? <RefreshCw className="animate-spin" size={18} /> : <Link2 size={18} />}
                <span>{isConnecting ? 'Linking Account...' : 'Connect Instagram'}</span>
              </button>
              <button 
                onClick={() => setShowGuide(true)}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest"
              >
                <Info size={14} /> Link Instructions Guide
              </button>
            </div>
          )}
        </SettingsCard>

        {showGuide && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-6 animate-in fade-in duration-300">
            <div className="w3-card max-w-xl w-full p-10 relative animate-in zoom-in-95 duration-500 shadow-2xl bg-zinc-900 border-white/10">
              <button 
                onClick={() => setShowGuide(false)}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-zinc-100 mb-2">Let's Link Your Account</h2>
                <p className="text-zinc-400 font-medium leading-relaxed">Meta requires specific settings to be enabled before we can automate your DMs.</p>
              </div>

              <div className="space-y-8">
                
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-100 mb-1">Step 1: Switch to Professional</h4>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                      In the Instagram App &gt; Settings &gt; Account Type. Switch to <strong className="text-zinc-200">Business</strong> or <strong className="text-zinc-200">Creator</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Link2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-100 mb-1">Step 2: Link to Facebook Page</h4>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                      Edit Profile &gt; Public Business Information &gt; Page. Select or create a Facebook Page.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/20">
                    <ToggleRight size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-100 mb-1">Step 3: Allow Message Access</h4>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                      Settings &gt; Privacy &gt; Messages. Turn <strong className="text-emerald-400 uppercase tracking-widest text-[10px]">ON</strong> "Allow Access to Messages" at the bottom.
                    </p>
                  </div>
                </div>

              </div>

              <div className="mt-12 space-y-4">
                <button 
                  onClick={handleConnect}
                  className="w3-button-primary w-full justify-center py-4"
                >
                  <CheckCircle2 size={20} />
                  <span>I've Done These Steps</span>
                </button>
                <button 
                   onClick={() => setShowGuide(false)}
                   className="w-full py-3 text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        <SettingsCard 
          icon={Bot} 
          title="AI Automation" 
          subtitle="Configure how the AI interacts with your leads."
        >
          <div className="flex justify-between items-center p-5 bg-zinc-900/50 rounded-2xl border border-white/5">
            <div>
              <div className="font-bold text-zinc-100 mb-1">Auto-Reply Discovery</div>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">Automatically answer basic lead inquiries.</p>
            </div>
            <div className="w-12 h-6 bg-purple-500 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex justify-between items-center p-5 bg-zinc-900/50 rounded-2xl border border-white/5">
            <div>
              <div className="font-bold text-zinc-100 mb-1">Human Handoff Alerts</div>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">Notify team when a lead needs human attention.</p>
            </div>
            <div className="w-12 h-6 bg-purple-500 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard 
          icon={Database} 
          title="Webhooks & API" 
          subtitle="Real-time data synchronization settings."
        >
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Webhook Endpoint</label>
            <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 text-sm font-mono text-zinc-400 truncate shadow-inner">
              https://replyzens.com/v1/Instagram/Webhook
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest">
              <Zap size={14} /> Test Connectivity
            </button>
          </div>
        </SettingsCard>

        <SettingsCard 
          icon={User} 
          title="Account Profile" 
          subtitle="Your personal account information."
        >
          {isEditingProfile ? (
            <div className="space-y-4">
              <div className="flex gap-4 items-center mb-2">
                <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 font-bold text-xl shadow-inner uppercase">
                  {profileEmail[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-grow">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 outline-none transition-all mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setIsEditingProfile(false);
                    setNotification({ type: 'success', message: 'Profile updated successfully! (Mock)' });
                  }}
                  className="w-fit px-6 py-2.5 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all shadow-sm text-sm"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileEmail(user?.email || '');
                  }}
                  className="w-fit px-6 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-zinc-300 font-bold hover:bg-zinc-700 hover:text-white transition-all shadow-sm text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-4 items-center mb-4">
                <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 font-bold text-xl shadow-inner uppercase">
                  {user?.email?.[0] || 'A'}
                </div>
                <div>
                  <div className="font-bold text-zinc-100">{user?.email || 'admin@replyzens.com'}</div>
                  <div className="text-xs text-zinc-500 font-medium mt-0.5">{user?.role || 'Administrator Access'}</div>
                </div>
              </div>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="w-fit px-6 py-3 bg-zinc-800 border border-white/10 rounded-xl text-zinc-300 font-bold hover:bg-zinc-700 hover:text-white transition-all shadow-sm"
              >
                Edit Profile Details
              </button>
            </>
          )}
        </SettingsCard>

      </div>
    </div>
  );
};

export default Settings;
