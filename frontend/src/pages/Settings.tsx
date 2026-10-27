import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ShieldCheck,
  User,
  Code2,
  CheckCircle2,
  X,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * One settings section: a titled card whose body is a stack of rows and whose
 * footer carries the section's hint and its save action, so every section
 * commits on its own.
 */
const SettingsSection: React.FC<{
  title: string;
  description: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: 'danger';
  children: React.ReactNode;
}> = ({ title, description, badge, footer, tone, children }) => (
  <section
    className={`surface overflow-hidden ${tone === 'danger' ? 'border-[color:color-mix(in_oklab,var(--signal-stop)_35%,transparent)]' : ''}`}
  >
    <header className="flex items-start justify-between gap-4 px-6 pt-5">
      <div className="min-w-0">
        <h2 className={`text-[16px] font-semibold ${tone === 'danger' ? 'text-signal-stop' : 'text-ink'}`}>{title}</h2>
        <p className="mt-1 text-[14px] text-ink-soft">{description}</p>
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </header>
    <div className="divide-y divide-hairline px-6">{children}</div>
    {footer && (
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-porcelain px-6 py-3">
        {footer}
      </footer>
    )}
  </section>
);

/** A label on the left, its control on the right; stacks on narrow screens. */
const SettingRow: React.FC<{
  label: string;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
}> = ({ label, description, htmlFor, children }) => (
  <div className="grid gap-2 py-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center sm:gap-6">
    <div>
      <label htmlFor={htmlFor} className="block text-[14px] font-medium text-ink">{label}</label>
      {description && <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>}
    </div>
    <div className="min-w-0">{children}</div>
  </div>
);

const PasswordField: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
  invalid?: boolean;
}> = ({ id, value, onChange, visible, onToggle, autoComplete, invalid }) => (
  <div className="relative">
    <input
      id={id}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid || undefined}
      className={`field pr-10 ${invalid ? 'border-signal-stop' : ''}`}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[6px] p-1 text-ink-faint transition-colors hover:text-ink"
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
);

/** A numbered step in a setup flow. */
const SetupStep: React.FC<{ n: number; title: string; description: string; children?: React.ReactNode }> = ({ n, title, description, children }) => (
  <li className="flex gap-4">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-viridian-tint text-[13px] font-semibold text-viridian">
      {n}
    </span>
    <div className="min-w-0 flex-grow">
      <p className="text-[14px] font-medium text-ink">{title}</p>
      <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  </li>
);

import { connectInstagram, getInstagramSettings, updateInstagramSettings, disconnectInstagram } from '../api/crm.api';
import api from '../lib/axios';

const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<{ name: string, id: string } | null>(null);
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleRegistered, setIsGoogleRegistered] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  /**
   * Performs the erasure the published data-deletion instructions describe: disconnects
   * Meta, deletes all Instagram-derived records for this workspace, and signs the user out.
   */
  const handlePurgeData = async () => {
    setIsPurging(true);
    try {
      const res = await api.post('/Instagram/PurgeData');
      if (res.data?.Type === 'S' || res.data?.Success || res.data?.Data?.Success) {
        toast.success('Your account data has been permanently deleted.');
        setConfirmPurge(false);
        setTimeout(() => logout(), 1500);
      } else {
        toast.error(res.data?.Message || 'Failed to delete your data. Please contact support.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.Message || 'Failed to delete your data. Please contact support.');
    } finally {
      setIsPurging(false);
    }
  };
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
          name: res.Data.page_name || 'Connected Account',
          id: res.Data.business_id || ''
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
      }, { config_id: import.meta.env.VITE_FB_CONFIG_ID || '1765463831255418' });
    } catch (error) {
      console.error('FB Logic Error:', error);
      setIsConnecting(false);
    }
  };

  type TabType = 'profile' | 'security' | 'webhooks';
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'meta') {
      navigate('/meta-integration', { replace: true });
      return;
    }
    if (tabParam && ['profile', 'security', 'webhooks'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [location, navigate]);

  // The tab lives in the URL so a section can be linked to and survives a reload.
  const selectTab = (tab: TabType) => {
    setActiveTab(tab);
    navigate({ search: `?tab=${tab}` }, { replace: true });
  };

  const isSuperAdmin = user?.roleCode === 'SUPER_ADMIN';
  const navGroups: { label: string; items: { id: TabType; label: string; icon: React.ElementType }[] }[] = [
    {
      label: 'Account',
      items: [
        { id: 'profile', label: 'General', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
      ],
    },
    ...(!isSuperAdmin ? [{
      label: 'Workspace',
      items: [{ id: 'webhooks' as TabType, label: 'Developer API', icon: Code2 }],
    }] : []),
  ];

  const webhookUrl = `${window.location.origin}/api/v1/Instagram/Webhook`;
  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success('Webhook URL copied.');
    } catch {
      toast.error('Could not copy. Select the URL and copy it manually.');
    }
  };

  const profileDirty = profileEmail.trim() !== (user?.email || '');
  const passwordReady = (isGoogleRegistered || !!currentPassword) && !!newPassword && !!confirmPassword;
  const passwordMismatch = !!confirmPassword && newPassword !== confirmPassword;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your profile, sign-in security and workspace integrations.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[208px_minmax(0,1fr)]">
        {/* Section navigation. A row of pills on small screens, a list beside the content on wide ones. */}
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
          {navGroups.map((group) => (
            <div key={group.label} className="contents md:block">
              <p className="hidden px-3 pb-1.5 pt-4 text-[12px] font-medium text-ink-faint first:pt-0 md:block">
                {group.label}
              </p>
              {group.items.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectTab(id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[14px] transition-colors md:w-full ${
                      isActive
                        ? 'bg-viridian-tint font-semibold text-viridian'
                        : 'font-medium text-ink-soft hover:bg-porcelain-deep hover:text-ink'
                    }`}
                  >
                    <Icon size={17} className={isActive ? 'text-viridian' : 'text-ink-faint'} />
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="min-w-0 max-w-3xl space-y-6">
          {activeTab === 'profile' && (
            <>
              <SettingsSection
                title="Profile"
                description="Your sign-in identity on Flazly."
                footer={
                  <>
                    <p className="text-[13px] text-ink-soft">Used to sign in and for account notifications.</p>
                    <div className="flex gap-2">
                      {profileDirty && (
                        <button type="button" className="btn btn-sm" onClick={() => setProfileEmail(user?.email || '')}>
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleUpdateProfile}
                        disabled={!profileDirty || isUpdatingProfile}
                      >
                        {isUpdatingProfile && <Loader2 size={13} className="animate-spin" />}
                        Save
                      </button>
                    </div>
                  </>
                }
              >
                <SettingRow label="Avatar" description="Generated from your email address.">
                  <span className="avatar-initial" style={{ width: 44, height: 44, fontSize: 17 }}>
                    {(user?.email?.[0] || '?').toUpperCase()}
                  </span>
                </SettingRow>
                <SettingRow label="Email address" htmlFor="profile-email">
                  <input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="field"
                  />
                </SettingRow>
                <SettingRow label="Role" description="Set by your workspace owner.">
                  <span className="chip">{user?.role || '—'}</span>
                </SettingRow>
              </SettingsSection>

              <SettingsSection title="Danger zone" description="Irreversible actions on this workspace." tone="danger">
                <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-ink">Delete account and purge data</p>
                    <p className="mt-0.5 max-w-[52ch] text-[13px] text-ink-soft">
                      Permanently removes your Instagram connection, access tokens, leads, conversations and knowledge base.
                    </p>
                  </div>
                  <button type="button" onClick={() => setConfirmPurge(true)} className="btn btn-danger btn-sm shrink-0">
                    Delete account
                  </button>
                </div>
              </SettingsSection>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <SettingsSection
                title="Password"
                description="Change the password you use to sign in."
                footer={
                  <>
                    <p className={`text-[13px] ${passwordMismatch ? 'text-signal-stop' : 'text-ink-soft'}`}>
                      {passwordMismatch ? 'The new passwords do not match.' : 'At least 6 characters.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword || !passwordReady || passwordMismatch}
                      className="btn btn-primary btn-sm"
                    >
                      {isChangingPassword && <Loader2 size={13} className="animate-spin" />}
                      Update password
                    </button>
                  </>
                }
              >
                <div className="py-5">
                  <label htmlFor="googleAuth" className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-hairline bg-porcelain px-4 py-3">
                    <input
                      type="checkbox"
                      id="googleAuth"
                      checked={isGoogleRegistered}
                      onChange={(e) => setIsGoogleRegistered(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--viridian)]"
                    />
                    <span>
                      <span className="block text-[14px] font-medium text-ink">I signed up with Google</span>
                      <span className="block text-[13px] text-ink-soft">
                        You have never set a password, so there is no current one to enter.
                      </span>
                    </span>
                  </label>
                </div>

                {!isGoogleRegistered && (
                  <SettingRow label="Current password" htmlFor="current-password">
                    <PasswordField
                      id="current-password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      visible={showCurrentPassword}
                      onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                      autoComplete="current-password"
                    />
                  </SettingRow>
                )}
                <SettingRow label="New password" htmlFor="new-password">
                  <PasswordField
                    id="new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    visible={showNewPassword}
                    onToggle={() => setShowNewPassword(!showNewPassword)}
                    autoComplete="new-password"
                  />
                </SettingRow>
                <SettingRow label="Confirm new password" htmlFor="confirm-password">
                  <PasswordField
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    autoComplete="new-password"
                    invalid={passwordMismatch}
                  />
                </SettingRow>
              </SettingsSection>

              <SettingsSection
                title="Two-factor authentication"
                description="Require a code from an authenticator app when you sign in."
                badge={
                  user?.twoFactorEnabled
                    ? <span className="chip chip-dot chip-go">Enabled</span>
                    : <span className="chip chip-dot">Off</span>
                }
                footer={
                  isSettingUp2Fa ? (
                    <>
                      <p className="text-[13px] text-ink-soft">2FA turns on once the code is verified.</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setIsSettingUp2Fa(false)} className="btn btn-sm">
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyAndEnable2FA}
                          disabled={isVerifying2Fa || totpVerificationCode.length < 6}
                          className="btn btn-primary btn-sm"
                        >
                          {isVerifying2Fa && <Loader2 size={13} className="animate-spin" />}
                          Verify and enable
                        </button>
                      </div>
                    </>
                  ) : user?.twoFactorEnabled ? (
                    <>
                      <p className="text-[13px] text-ink-soft">Turning it off makes your account easier to break into.</p>
                      <button type="button" onClick={() => setConfirmDisable2FA(true)} className="btn btn-sm text-signal-stop">
                        Disable 2FA
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[13px] text-ink-soft">Works with Google Authenticator, 1Password, Authy and others.</p>
                      <button type="button" onClick={handleSetup2FA} className="btn btn-primary btn-sm">
                        Set up 2FA
                      </button>
                    </>
                  )
                }
              >
                {isSettingUp2Fa ? (
                  <ol className="space-y-6 py-5">
                    <SetupStep n={1} title="Scan the QR code" description="Open your authenticator app and scan this code, or enter the key by hand.">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex h-[168px] w-[168px] shrink-0 items-center justify-center rounded-[10px] border border-hairline bg-white p-3">
                          {qrCodeUrl
                            ? <img src={qrCodeUrl} alt="Two-factor setup QR code" className="h-full w-full" />
                            : <Loader2 size={20} className="animate-spin text-ink-faint" />}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="field-label">Setup key</p>
                          <code className="block select-all break-all rounded-[10px] border border-hairline bg-porcelain px-3 py-2 text-[13px] text-ink">
                            {secret || '…'}
                          </code>
                        </div>
                      </div>
                    </SetupStep>

                    {recoveryCodes.length > 0 && (
                      <SetupStep n={2} title="Save your recovery codes" description="Each code signs you in once if you lose your device. Store them somewhere safe; they are not shown again.">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {recoveryCodes.map((code) => (
                            <code key={code} className="select-all rounded-[8px] border border-hairline bg-porcelain px-2 py-1.5 text-center text-[13px] text-ink">
                              {code}
                            </code>
                          ))}
                        </div>
                      </SetupStep>
                    )}

                    <SetupStep n={recoveryCodes.length > 0 ? 3 : 2} title="Enter the 6-digit code" description="Type the code your app shows now to confirm it is set up.">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="000000"
                        value={totpVerificationCode}
                        onChange={(e) => setTotpVerificationCode(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => { if (e.key === 'Enter' && totpVerificationCode.length === 6) handleVerifyAndEnable2FA(); }}
                        className="field max-w-[200px] text-center font-mono text-[18px] tracking-[0.4em]"
                        maxLength={6}
                        aria-label="Verification code"
                      />
                    </SetupStep>
                  </ol>
                ) : (
                  <div className="flex items-start gap-3 py-5">
                    <span className={`mt-0.5 shrink-0 ${user?.twoFactorEnabled ? 'text-signal-go' : 'text-ink-faint'}`}>
                      {user?.twoFactorEnabled ? <ShieldCheck size={20} /> : <Shield size={20} />}
                    </span>
                    <p className="text-[14px] text-ink-soft">
                      {user?.twoFactorEnabled
                        ? 'Your account asks for a one-time code from your authenticator app at every sign-in.'
                        : 'Add a second step at sign-in so a stolen password alone cannot open your account.'}
                    </p>
                  </div>
                )}
              </SettingsSection>
            </>
          )}

          {activeTab === 'webhooks' && !isSuperAdmin && (
            <SettingsSection
              title="Webhook"
              description="Where Meta delivers Instagram messages, comments and story replies."
              footer={
                <p className="text-[13px] text-ink-soft">
                  Paste this into the Webhooks section of your Meta app, subscribed to the Instagram object.
                </p>
              }
            >
              <SettingRow label="Callback URL" description="Read-only." htmlFor="webhook-url">
                <div className="flex gap-2">
                  <input
                    id="webhook-url"
                    readOnly
                    value={webhookUrl}
                    onFocus={(e) => e.target.select()}
                    className="field min-w-0 font-mono text-[13px]"
                  />
                  <button type="button" onClick={copyWebhookUrl} className="btn shrink-0" aria-label="Copy webhook URL">
                    <Copy size={15} />
                    Copy
                  </button>
                </div>
              </SettingRow>
            </SettingsSection>
          )}
        </div>
      </div>

      {/* Meta Link Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm sm:p-6">
          <div className="surface-lifted w-full max-w-xl overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="meta-guide-title">
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5">
              <div>
                <h2 id="meta-guide-title" className="text-[18px] font-semibold text-ink">Finish setting up Instagram</h2>
                <p className="mt-1 text-[14px] text-ink-soft">Complete these steps in Instagram, then try linking again.</p>
              </div>
              <button type="button" onClick={() => setShowGuide(false)} className="btn btn-quiet btn-icon" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <ol className="space-y-6 px-6 py-6">
              <SetupStep n={1} title="Switch to a professional account" description="Instagram app → Settings → Account type. Choose Business or Creator." />
              <SetupStep n={2} title="Link a Facebook Page" description="Edit profile → Public business information → Page. Select or create a Page to link." />
              <SetupStep n={3} title="Allow access to messages" description={'Settings → Privacy → Messages. Turn on "Allow access to messages" at the bottom.'} />
            </ol>

            <div className="flex flex-col-reverse gap-2 border-t border-hairline bg-porcelain px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowGuide(false)} className="btn">
                Cancel
              </button>
              <button type="button" onClick={handleConnect} disabled={isConnecting} className="btn btn-primary">
                {isConnecting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                I've done these steps
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

      <ConfirmModal
        isOpen={confirmPurge}
        title="Delete Account & Purge Data"
        message="This permanently deletes your Instagram connection, access tokens, leads, conversations and knowledge base. This cannot be undone."
        confirmText="Delete Everything"
        cancelText="Cancel"
        type="danger"
        isLoading={isPurging}
        onConfirm={handlePurgeData}
        onCancel={() => setConfirmPurge(false)}
      />
    </div>
  );
};

export default Settings;
