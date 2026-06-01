import React, { useState, useEffect } from 'react';
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
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

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

import { connectInstagram, getInstagramSettings, updateInstagramSettings, disconnectInstagram } from '../api/crm.api';
import api from '../lib/axios';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<{ name: string, id: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [humanHandoffAlerts, setHumanHandoffAlerts] = useState(true);

  // 2FA states
  const [isSettingUp2Fa, setIsSettingUp2Fa] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [totpVerificationCode, setTotpVerificationCode] = useState('');
  const [isVerifying2Fa, setIsVerifying2Fa] = useState(false);
  const [confirmDisable2FA, setConfirmDisable2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  const handleSetup2FA = async () => {
    setIsSettingUp2Fa(true);
    setNotification(null);
    try {
      const res = await api.post('/Auth/2fa/setup');
      if (res.data.Type === 'S') {
        const { qrCodeUrl, secret, recoveryCodes } = res.data.result;
        setQrCodeUrl(qrCodeUrl);
        setSecret(secret);
        setRecoveryCodes(recoveryCodes);
      } else {
        showNotification(res.data.Message || 'Failed to initialize 2FA', 'error');
        setIsSettingUp2Fa(false);
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to initialize 2FA setup.', 'error');
      setIsSettingUp2Fa(false);
    }
  };

  const handleVerifyAndEnable2FA = async () => {
    if (!totpVerificationCode) return;
    setIsVerifying2Fa(true);
    setNotification(null);
    try {
      const res = await api.post('/Auth/2fa/verify', { token: totpVerificationCode });
      if (res.data.Type === 'S') {
        updateUser({ twoFactorEnabled: true });
        showNotification('Two-Factor Authentication enabled successfully!', 'success');
        setIsSettingUp2Fa(false);
        setTotpVerificationCode('');
      } else {
        showNotification(res.data.Message || 'Invalid verification code', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to verify code.', 'error');
    } finally {
      setIsVerifying2Fa(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsDisabling2FA(true);
      const res = await api.post('/Auth/2fa/disable');
      if (res.data.Type === 'S') {
        updateUser({ twoFactorEnabled: false });
        showNotification('Two-Factor Authentication disabled successfully.', 'success');
      } else {
        showNotification(res.data.Message || 'Failed to disable 2FA', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to disable 2FA.', 'error');
    } finally {
      setIsDisabling2FA(false);
      setConfirmDisable2FA(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  React.useEffect(() => {
    setIsLoadingStatus(true);
    getInstagramSettings().then(res => {
      if (res.Success && res.Data?.isConnected) {
        setIsConnected(true);
        setConnectionDetails({
          name: res.Data.page_name,
          id: res.Data.business_id
        });
        if (res.Data.auto_reply_enabled !== undefined) setAutoReplyEnabled(res.Data.auto_reply_enabled);
        if (res.Data.human_handoff_alerts !== undefined) setHumanHandoffAlerts(res.Data.human_handoff_alerts);
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
      }, { scope: 'instagram_manage_messages,instagram_manage_comments,pages_manage_metadata,pages_read_engagement,pages_show_list,instagram_basic,business_management' });
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {user?.roleCode !== 'SUPER_ADMIN' && (
          <>
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
              
              <div className="p-5 bg-zinc-800 rounded-2xl border border-white/5 shadow-inner">
                <div className="text-sm font-bold text-zinc-100">{connectionDetails?.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">Business ID: {connectionDetails?.id}</div>
              </div>

              <button 
                onClick={async () => {
                  try {
                    await disconnectInstagram();
                    setIsConnected(false);
                    setConnectionDetails(null);
                    showNotification('Account disconnected successfully.', 'success');
                  } catch (e) {
                    showNotification('Failed to disconnect account.', 'error');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl font-bold uppercase tracking-widest transition-all text-xs shadow-sm"
              >
                <X size={16} /> Disconnect Account
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
          icon={Database} 
          title="Webhooks & API" 
          subtitle="Real-time data synchronization settings."
        >
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Webhook Endpoint</label>
            <div className="bg-zinc-800 p-4 rounded-2xl border border-white/5 text-sm font-mono text-zinc-500 truncate shadow-inner">
              https://replyzens.in/api/v1/Instagram/Webhook
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest">
              <Zap size={14} /> Test Connectivity
            </button>
          </div>
        </SettingsCard>
          </>
        )}

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
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:border-purple-500/50 outline-none transition-all mt-1 shadow-inner"
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
                  <div className="font-bold text-zinc-100">{user?.email || 'admin@replyzens.in'}</div>
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

        <SettingsCard 
          icon={Shield} 
          title="Security & 2FA" 
          subtitle="Keep your account secure with Multi-Factor Authentication."
        >
          {isSettingUp2Fa ? (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                <p className="text-xs text-zinc-400 text-center font-medium">Scan this QR code with your authenticator app (e.g. Google Authenticator, Duo):</p>
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 bg-white p-2 rounded-xl" />
                )}
                <div className="text-center w-full">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">Secret Key</span>
                  <code className="text-xs text-purple-400 font-mono bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 select-all">{secret}</code>
                </div>
              </div>

              {recoveryCodes.length > 0 && (
                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest block mb-2">Save these recovery codes:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code, idx) => (
                      <code key={idx} className="text-xs text-zinc-300 font-mono bg-zinc-800/80 px-2.5 py-1 rounded border border-white/5 text-center select-all">{code}</code>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Verification Code</label>
                <input 
                  type="text"
                  placeholder="000000"
                  value={totpVerificationCode}
                  onChange={(e) => setTotpVerificationCode(e.target.value)}
                  className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:border-purple-500/50 outline-none transition-all shadow-inner text-center font-mono tracking-widest text-lg"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleVerifyAndEnable2FA}
                  disabled={isVerifying2Fa || !totpVerificationCode}
                  className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all text-sm disabled:opacity-50"
                >
                  {isVerifying2Fa ? 'Enabling...' : 'Verify & Enable'}
                </button>
                <button 
                  onClick={() => setIsSettingUp2Fa(false)}
                  className="w-fit px-6 py-3 bg-zinc-800 border border-white/10 rounded-xl text-zinc-300 font-bold hover:bg-zinc-700 hover:text-white transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : user?.twoFactorEnabled ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                2FA Enabled
              </div>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                Your account is currently protected by a secondary authentication layer.
              </p>
              <button 
                onClick={() => setConfirmDisable2FA(true)}
                className="w-full py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-50 hover:text-white border border-rose-500/20 rounded-xl font-bold uppercase tracking-widest transition-all text-xs shadow-sm animate-in fade-in"
              >
                Disable Multi-Factor Authentication
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg w-fit border border-rose-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                2FA Disabled
              </div>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                Add an extra layer of security to your account by scanning a QR code with an authenticator app.
              </p>
              <button 
                onClick={handleSetup2FA}
                className="w-full py-3 bg-purple-500/15 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/30 rounded-xl font-bold uppercase tracking-widest transition-all text-xs shadow-glow-purple"
              >
                Set Up 2FA Now
              </button>
            </div>
          )}
        </SettingsCard>

      </div>
      <ConfirmModal
        isOpen={confirmDisable2FA}
        title="Disable Two-Factor Authentication"
        message="Are you sure you want to disable Two-Factor Authentication? This will significantly decrease your account security."
        confirmText="Disable 2FA"
        cancelText="Keep Enabled"
        type="danger"
        isLoading={isDisabling2FA}
        onConfirm={handleDisable2FA}
        onCancel={() => setConfirmDisable2FA(false)}
      />
    </div>
  );
};

export default Settings;
