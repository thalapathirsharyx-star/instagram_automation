import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  X, 
  Smartphone, 
  Link2, 
  RefreshCw, 
  Info, 
  Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { connectInstagram, getInstagramSettings, disconnectInstagram } from '../api/crm.api';

const MetaIntegration: React.FC = () => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<{ name: string, id: string } | null>(null);
  const [connectionWarnings, setConnectionWarnings] = useState<string[]>([]);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    setIsLoadingStatus(true);
    getInstagramSettings().then(res => {
      if (res.Success && res.Data?.isConnected) {
        setIsConnected(true);
        setConnectionDetails({
          name: res.Data.page_name || 'Connected Account',
          id: res.Data.business_id || ''
        });
        // The token monitor flags revoked or soon-to-expire access; tell the user to
        // reconnect rather than letting automation fail silently.
        if (res.Data.needs_reconnect) {
          setConnectionWarnings([
            res.Data.connection_detail ||
            'Instagram access needs to be renewed. Please reconnect the account.'
          ]);
        }
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
                const warnings: string[] = res.Data?.warnings || [];
                setConnectionWarnings(warnings);
                if (warnings.length > 0) {
                  toast.error('Account linked, but some permissions are missing. See the warnings below.');
                } else {
                  toast.success('Instagram Account Linked Successfully!');
                }
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
      }, {
        // Facebook Login for Business: the permissions actually granted are the ones
        // selected in the login configuration (config_id) in the Meta App Dashboard.
        // `scope` is ignored whenever config_id is present, so this list is documentation
        // of what the configuration must contain — keep the two in sync.
        //
        // These are the "Instagram API with Facebook Login" permissions. The
        // instagram_business_* family belongs to Business Login for Instagram
        // (graph.instagram.com) and does NOT apply to this flow.
        // https://developers.facebook.com/docs/instagram-platform/overview/
        //
        // pages_manage_metadata is required to subscribe the Page to webhooks; without it
        // no message or comment notifications are ever delivered.
        config_id: import.meta.env.VITE_FB_CONFIG_ID || '1765463831255418',
        scope: [
          'instagram_basic',
          'instagram_manage_messages',
          'instagram_manage_comments',
          'pages_show_list',
          'pages_read_engagement',
          'pages_manage_metadata',
          'public_profile'
        ].join(',')
      });
    } catch (error) {
      console.error('FB Logic Error:', error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectInstagram();
      setIsConnected(false);
      setConnectionDetails(null);
      toast.success('Account disconnected successfully.');
    } catch (e) {
      toast.error('Failed to disconnect account.');
    } finally {
      setIsDisconnecting(false);
      setConfirmDisconnect(false);
    }
  };

  // Escape closes the setup guide, as it does every other dialog.
  useEffect(() => {
    if (!showGuide) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowGuide(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showGuide]);

  const steps = [
    {
      title: 'Switch to a professional account',
      body: <>Instagram app → Settings → Account type. Choose <strong className="font-medium text-ink">Business</strong> or <strong className="font-medium text-ink">Creator</strong>.</>,
    },
    {
      title: 'Link a Facebook Page',
      body: <>On your profile: Edit profile → Public business information → Page. Select or create a Page to link.</>,
    },
    {
      title: 'Allow access to messages',
      body: <>Instagram Settings → Privacy → Messages. At the bottom, turn on <strong className="font-medium text-ink">Allow access to messages</strong>.</>,
    },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Instagram connection</h1>
          <p className="page-sub">
            Connect your Facebook Page and Instagram professional account so the assistant can answer DMs and comments.
          </p>
        </div>
      </div>

      <section className="surface page-narrow overflow-hidden">
        <div className="surface-head">
          <h2><span className="icon-tile is-sm"><Shield size={16} /></span>Meta account</h2>
          {!isLoadingStatus && (
            isConnected
              ? <span className="chip chip-dot chip-go">Connected</span>
              : <span className="chip chip-dot">Not connected</span>
          )}
        </div>

        {isLoadingStatus ? (
          <div className="surface-body flex items-center gap-3 text-[14px] text-ink-soft" role="status">
            <Loader2 size={18} className="animate-spin text-ink-faint" />
            Checking the connection…
          </div>
        ) : isConnected ? (
          <>
            <div className="surface-body space-y-5">
              <div className="flex items-center gap-4 rounded-[10px] border border-hairline bg-porcelain p-4">
                <span className="icon-tile is-neutral h-12 w-12"><Smartphone size={22} /></span>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-semibold text-ink">{connectionDetails?.name}</p>
                  <p className="mt-0.5 text-[13px] text-ink-soft">
                    Meta Business ID <code className="select-all text-ink">{connectionDetails?.id}</code>
                  </p>
                </div>
              </div>

              {connectionWarnings.length > 0 && (
                <div className="notice notice-warn block">
                  <p className="notice-title flex items-center gap-2">
                    <Info size={16} className="text-signal-warn" /> Connection is incomplete
                  </p>
                  <ul className="notice-body mt-2 list-disc space-y-1 pl-5">
                    {connectionWarnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                  <p className="notice-body mt-2">
                    Reconnect and approve every permission Facebook asks for, otherwise real-time
                    DM and comment automation will not receive events.
                  </p>
                </div>
              )}
            </div>

            <div className="surface-foot">
              <button onClick={() => setShowGuide(true)} className="btn btn-ghost btn-sm">
                <Info size={15} /> Setup guide
              </button>
              <button onClick={() => setConfirmDisconnect(true)} className="btn btn-danger-soft btn-sm">
                <X size={15} /> Revoke Meta access
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="surface-body">
              <p className="text-[15px] text-ink">Connect your Instagram professional account</p>
              <p className="mt-1 text-[14px] text-ink-soft">
                Flazly gets permission to read and reply to direct messages and comments in real time.
                You can revoke it here at any time.
              </p>
            </div>
            <div className="surface-foot">
              <button onClick={() => setShowGuide(true)} className="btn btn-sm">
                <Info size={15} /> Setup guide
              </button>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                aria-busy={isConnecting || undefined}
                className="btn btn-primary"
              >
                {isConnecting ? <RefreshCw className="animate-spin" size={16} /> : <Link2 size={16} />}
                {isConnecting ? 'Connecting…' : 'Connect with Facebook'}
              </button>
            </div>
          </>
        )}
      </section>

      {showGuide && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowGuide(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="meta-guide-title" className="modal">
            <div className="modal-head">
              <div>
                <h2 id="meta-guide-title">Before you connect</h2>
                <p className="mt-1 text-[14px] text-ink-soft">Complete these steps in Instagram first.</p>
              </div>
              <button onClick={() => setShowGuide(false)} className="btn btn-ghost btn-icon btn-sm" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <ol className="modal-body space-y-5">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-viridian-tint text-[13px] font-semibold text-viridian">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-ink">{step.title}</p>
                    <p className="mt-0.5 text-[14px] leading-relaxed text-ink-soft">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="modal-foot">
              <button onClick={() => setShowGuide(false)} className="btn">Cancel</button>
              <button onClick={handleConnect} disabled={isConnecting} aria-busy={isConnecting || undefined} className="btn btn-primary">
                {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                I've done these steps
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDisconnect}
        title="Revoke Meta access?"
        message="Flazly stops receiving your Instagram messages and comments, and every automation pauses until you connect again."
        confirmText="Revoke access"
        cancelText="Keep connected"
        type="danger"
        isLoading={isDisconnecting}
        onConfirm={handleDisconnect}
        onCancel={() => setConfirmDisconnect(false)}
      />
    </div>
  );
};

export default MetaIntegration;
