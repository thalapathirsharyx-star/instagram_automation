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
  AlertCircle,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

const SettingsCard: React.FC<{ icon: any, title: string, subtitle: string, children: React.ReactNode }> = ({ icon: Icon, title, subtitle, children }) => (
  <div className="border bg-card text-card-foreground shadow-sm rounded-xl flex flex-col gap-6 group hover:border-border transition-all duration-300 p-6 md:p-8">
    <div className="flex gap-4 items-start">
      <div className="p-3 bg-primary/10 text-foreground rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-sm border border-primary/20 shrink-0">
        <Icon size={22} strokeWidth={2.5}/>
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-[13px] text-muted-foreground font-medium mt-1 leading-relaxed">{subtitle}</p>
      </div>
    </div>
    <div className="flex flex-col gap-6 flex-grow pt-4 border-t border-border">
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
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleUpdateProfile = async () => {
    if (!profileEmail) {
      toast.error('Email is required.');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const res = await api.put('/User/UpdateProfile', { email: profileEmail });
      if (res.data.Type === 'S') {
        updateUser({ email: profileEmail });
        setIsEditingProfile(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(res.data.Message || 'Failed to update profile.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred while updating profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [humanHandoffAlerts, setHumanHandoffAlerts] = useState(true);

  // Password reset states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGoogleRegistered, setIsGoogleRegistered] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!isGoogleRegistered && !currentPassword) {
      toast.error("Current password is required.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.post('/User/ChangePassword', {
        old_password: isGoogleRegistered ? 'GoogleUser123!!' : currentPassword,
        password: newPassword
      });
      if (res.data.Type === 'S') {
        toast.success("Password changed successfully!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsGoogleRegistered(false);
      } else {
        toast.error(res.data.Message || "Failed to change password.");
      }
    } catch (err) {
      toast.error("An error occurred while changing password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

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
    try {
      const res = await api.post('/Auth/2fa/setup');
      if (res.data.Type === 'S') {
        const { qrCodeUrl, secret, recoveryCodes } = res.data.result;
        setQrCodeUrl(qrCodeUrl);
        setSecret(secret);
        setRecoveryCodes(recoveryCodes);
      } else {
        toast.error(res.data.Message || 'Failed to initialize 2FA');
        setIsSettingUp2Fa(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to initialize 2FA setup.');
      setIsSettingUp2Fa(false);
    }
  };

  const handleVerifyAndEnable2FA = async () => {
    if (!totpVerificationCode) return;
    setIsVerifying2Fa(true);
    try {
      const res = await api.post('/Auth/2fa/verify', { token: totpVerificationCode });
      if (res.data.Type === 'S') {
        updateUser({ twoFactorEnabled: true });
        toast.success('Two-Factor Authentication enabled successfully!');
        setIsSettingUp2Fa(false);
        setTotpVerificationCode('');
      } else {
        toast.error(res.data.Message || 'Invalid verification code');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to verify code.');
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
                toast.success('Instagram Account Linked Successfully!');
              } else {
                const message = (res.Message || '').toUpperCase();
                if (message.includes('META_NO_INSTAGRAM_LINKED')) {
                  setShowGuide(true);
                } else if (message.includes('META_APP_RESTRICTED')) {
                  toast.error(res.Message || 'Meta App Restricted.');
                } else {
                  toast.error('Connection Failed: ' + (res.Message || 'Unknown Error'));
                }
              }
            })
            .finally(() => setIsConnecting(false));
        } else {
          console.log('User cancelled login or did not fully authorize.');
          toast.error('Instagram connection cancelled.');
          setIsConnecting(false);
        }
      }, { scope: 'instagram_manage_messages,instagram_manage_comments,pages_manage_metadata,pages_read_engagement,pages_show_list,instagram_basic' });
    } catch (error) {
      console.error('FB Logic Error:', error);
      setIsConnecting(false);
    }
  };

  type TabType = 'profile' | 'meta' | 'webhooks';
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    ...(user?.roleCode !== 'SUPER_ADMIN' ? [
      { id: 'meta', label: 'Meta Integration', icon: Shield },
      { id: 'webhooks', label: 'Developer API', icon: Database }
    ] : [])
  ];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Platform Settings</h2>
          <p className="text-muted-foreground text-sm">Manage your personal profile, security preferences, and core system integrations.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-bold text-sm transition-all duration-200 border ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-muted-foreground" : "text-muted-foreground"} />
                  {tab.label}
                </div>
                {isActive && <ChevronRight size={14} className="text-muted-foreground" />}
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 max-w-3xl space-y-8">
          
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <SettingsCard 
                icon={User} 
                title="Account Details" 
                subtitle="Your primary authentication identity on the platform."
              >
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="flex gap-4 items-center mb-2">
                      <div className="w-12 h-12 bg-secondary text-muted-foreground rounded-full flex items-center justify-center border border-border font-bold text-lg shadow-sm uppercase shrink-0">
                        {profileEmail[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="flex-grow">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-border focus:ring-1 focus:ring-violet-500 outline-none transition-all mt-1 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                        className="btn-base btn-primary"
                      >
                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileEmail(user?.email || '');
                        }}
                        className="btn-base btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4 items-center mb-2">
                      <div className="w-12 h-12 bg-secondary text-muted-foreground rounded-full flex items-center justify-center border border-border font-bold text-lg shadow-sm uppercase shrink-0">
                        {user?.email?.[0] || 'A'}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-base">{user?.email || 'app.flazly@gmail.com'}</div>
                        <div className="text-xs text-muted-foreground font-medium mt-0.5">{user?.role || 'Administrator Access'}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="btn-base btn-secondary"
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </SettingsCard>

              <SettingsCard 
                icon={Lock} 
                title="Account Security" 
                subtitle="Manage your password and authentication methods."
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="googleAuth"
                      checked={isGoogleRegistered}
                      onChange={(e) => setIsGoogleRegistered(e.target.checked)}
                      className="w-4 h-4 rounded border-emerald-300 text-emerald-400 focus:ring-emerald-500/50 cursor-pointer"
                    />
                    <label htmlFor="googleAuth" className="text-xs font-bold text-emerald-400 cursor-pointer select-none">
                      I registered using Google (Skip current password validation)
                    </label>
                  </div>

                  {!isGoogleRegistered && (
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Current Password</label>
                      <input 
                        type="password"
                        placeholder="Enter your current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-border focus:ring-1 focus:ring-violet-500 outline-none transition-all mt-1 shadow-sm placeholder:text-muted-foreground"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">New Password</label>
                      <input 
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-border focus:ring-1 focus:ring-violet-500 outline-none transition-all mt-1 shadow-sm placeholder:text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input 
                        type="password"
                        placeholder="Retype your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-border focus:ring-1 focus:ring-violet-500 outline-none transition-all mt-1 shadow-sm placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handleChangePassword}
                      disabled={isChangingPassword || (!isGoogleRegistered && !currentPassword) || !newPassword || !confirmPassword}
                      className="btn-base btn-primary"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard 
                icon={Shield} 
                title="Multi-Factor Authentication" 
                subtitle="Add an extra layer of protection to your account using TOTP."
              >
                {isSettingUp2Fa ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-muted rounded-xl border border-border flex flex-col items-center gap-4 shadow-inner">
                      <p className="text-sm text-muted-foreground text-center font-medium">Scan this QR code with your authenticator app (e.g. Google Authenticator, Duo):</p>
                      {qrCodeUrl && (
                        <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
                          <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40" />
                        </div>
                      )}
                      <div className="text-center w-full max-w-sm mt-2">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest block mb-1">Manual Setup Key</span>
                        <code className="text-xs text-muted-foreground font-mono bg-card px-3 py-2 rounded-lg border border-border block select-all">{secret}</code>
                      </div>
                    </div>

                    {recoveryCodes.length > 0 && (
                      <div className="p-6 bg-destructive/10 rounded-xl border border-destructive/20">
                        <span className="text-[11px] text-destructive font-bold uppercase tracking-widest block mb-3 flex items-center gap-1.5">
                          <AlertCircle size={14}/> Save Backup Codes
                        </span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {recoveryCodes.map((code, idx) => (
                            <code key={idx} className="text-xs text-destructive font-mono bg-card px-2.5 py-1.5 rounded border border-destructive/20 text-center select-all shadow-sm">{code}</code>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-w-xs mx-auto">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 text-center block">Enter 6-Digit Code</label>
                      <input 
                        type="text"
                        placeholder="000 000"
                        value={totpVerificationCode}
                        onChange={(e) => setTotpVerificationCode(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:border-border focus:ring-1 focus:ring-violet-500 outline-none transition-all shadow-sm text-center font-mono tracking-[0.5em] text-xl"
                        maxLength={6}
                      />
                    </div>

                    <div className="flex justify-center gap-3 pt-4">
                      <button 
                        onClick={() => setIsSettingUp2Fa(false)}
                        className="btn-base btn-secondary"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleVerifyAndEnable2FA}
                        disabled={isVerifying2Fa || !totpVerificationCode}
                        className="btn-base btn-primary"
                      >
                        {isVerifying2Fa ? 'Verifying...' : 'Verify & Enable 2FA'}
                      </button>
                    </div>
                  </div>
                ) : user?.twoFactorEnabled ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      2FA Active
                    </div>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      Your account is currently protected by a secondary Time-based One-Time Password (TOTP).
                    </p>
                    <button 
                      onClick={() => setConfirmDisable2FA(true)}
                      className="btn-base btn-danger"
                    >
                      Disable Multi-Factor Authentication
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-[11px] uppercase tracking-widest bg-secondary px-3 py-1.5 rounded-lg w-fit border border-border">
                      <AlertCircle size={14} className="text-muted-foreground" />
                      2FA Inactive
                    </div>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xl">
                      Protect your account from unauthorized access by requiring a second form of authentication during sign in.
                    </p>
                    <button 
                      onClick={handleSetup2FA}
                      className="btn-base btn-primary"
                    >
                      Enable 2FA Now
                    </button>
                  </div>
                )}
              </SettingsCard>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 md:p-8">
                <div className="flex gap-4 items-start mb-4">
                  <div className="p-2.5 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 shrink-0">
                    <AlertCircle size={20} strokeWidth={2.5}/>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-destructive">Danger Zone</h3>
                    <p className="text-[13px] text-destructive font-medium mt-1 leading-relaxed">Irreversible account and data management actions.</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-destructive/20/50 mt-2">
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">
                    This action is permanent. All your access tokens, CRM logs, message metadata, and settings will be completely destroyed.
                  </p>
                  <button 
                    onClick={() => toast.error('Account deletion has been temporarily paused for Meta App Review verification.')}
                    className="btn-base btn-danger"
                  >
                    Delete Account & Purge Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meta' && user?.roleCode !== 'SUPER_ADMIN' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <SettingsCard 
                icon={Shield} 
                title="Meta Integration" 
                subtitle="Connect and manage your Facebook Page and Instagram Professional account."
              >
                {isLoadingStatus ? (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl border border-border text-muted-foreground font-bold text-xs uppercase tracking-widest">
                    <div className="animate-spin w-4 h-4 border-2 border-border border-t-transparent rounded-full" />
                    Validating Connection State...
                  </div>
                ) : isConnected ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Connection established
                    </div>
                    
                    <div className="p-5 bg-muted rounded-xl border border-border shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-card rounded-lg border border-border shadow-sm flex items-center justify-center text-muted-foreground">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{connectionDetails?.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-widest">Meta Business ID: {connectionDetails?.id}</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={async () => {
                          try {
                            await disconnectInstagram();
                            setIsConnected(false);
                            setConnectionDetails(null);
                            toast.success('Account disconnected successfully.');
                          } catch (e) {
                            toast.error('Failed to disconnect account.');
                          }
                        }}
                        className="btn-base btn-danger"
                      >
                        <X size={16} /> Revoke Meta Access
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      Link your Instagram Professional account to grant Flazly access to read and respond to direct messages and comments.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="btn-base btn-primary flex-1 sm:flex-none"
                      >
                        {isConnecting ? <RefreshCw className="animate-spin" size={18} /> : <Link2 size={18} />}
                        <span>{isConnecting ? 'Authenticating...' : 'Connect with Facebook'}</span>
                      </button>
                      <button 
                        onClick={() => setShowGuide(true)}
                        className="btn-base btn-secondary flex-1 sm:flex-none"
                      >
                        <Info size={16} className="text-muted-foreground"/> Setup Guide
                      </button>
                    </div>
                  </div>
                )}
              </SettingsCard>
            </div>
          )}

          {activeTab === 'webhooks' && user?.roleCode !== 'SUPER_ADMIN' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <SettingsCard 
                icon={Database} 
                title="Developer Infrastructure" 
                subtitle="Configure payload destinations and API endpoints."
              >
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Inbound Webhook URL</label>
                  <div className="bg-muted p-4 rounded-xl border border-border text-sm font-mono text-muted-foreground truncate shadow-inner select-all">
                    {`${window.location.origin}/api/v1/Instagram/Webhook`}
                  </div>
                  <button className="btn-base btn-secondary text-xs mt-2">
                    <Zap size={14} className="text-amber-500" /> Dispatch Test Event
                  </button>
                </div>
              </SettingsCard>
            </div>
          )}
          
        </div>
      </div>

      {/* Meta Link Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-card max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/50">
              <div>
                <h2 className="text-lg font-bold text-foreground">Required Meta Configuration</h2>
                <p className="text-xs text-muted-foreground font-medium mt-1">Please ensure these steps are completed before linking.</p>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center shrink-0 border border-blue-500/20 shadow-sm font-bold">
                  1
                </div>
                <div className="pt-1">
                  <h4 className="font-bold text-foreground text-sm mb-1">Switch to Professional Account</h4>
                  <p className="text-muted-foreground text-sm">
                    Open the Instagram App &gt; Settings &gt; Account Type. Make sure you are switched to a <strong className="text-muted-foreground">Business</strong> or <strong className="text-muted-foreground">Creator</strong> account.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center shrink-0 border border-blue-500/20 shadow-sm font-bold">
                  2
                </div>
                <div className="pt-1">
                  <h4 className="font-bold text-foreground text-sm mb-1">Link to a Facebook Page</h4>
                  <p className="text-muted-foreground text-sm">
                    On your Instagram profile, click Edit Profile &gt; Public Business Information &gt; Page. Select or create a Facebook Page to link.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center shrink-0 border border-blue-500/20 shadow-sm font-bold">
                  3
                </div>
                <div className="pt-1">
                  <h4 className="font-bold text-foreground text-sm mb-1">Allow Message Access</h4>
                  <p className="text-muted-foreground text-sm">
                    In Instagram Settings &gt; Privacy &gt; Messages. Scroll to the bottom and turn <strong className="text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 ml-1">On</strong> the "Allow Access to Messages" toggle.
                  </p>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-muted border-t border-border flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleConnect}
                className="btn-base btn-primary flex-1"
              >
                <CheckCircle2 size={18} />
                <span>I've Completed These Steps</span>
              </button>
              <button 
                 onClick={() => setShowGuide(false)}
                 className="btn-base btn-secondary flex-1 sm:flex-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDisable2FA}
        title="Disable Multi-Factor Authentication"
        message="Are you sure you want to disable 2FA? This will significantly decrease your account security and leave it vulnerable to unauthorized access."
        confirmText="Disable Protection"
        cancelText="Keep Protected"
        type="danger"
        isLoading={isDisabling2FA}
        onConfirm={handleDisable2FA}
        onCancel={() => setConfirmDisable2FA(false)}
      />
    </div>
  );
};

export default Settings;
