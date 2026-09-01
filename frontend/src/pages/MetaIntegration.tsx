import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  X, 
  Smartphone, 
  Link2, 
  RefreshCw, 
  Info, 
  Check, 
  Sparkles,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { connectInstagram, getInstagramSettings, disconnectInstagram } from '../api/crm.api';

const MetaIntegration: React.FC = () => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<{ name: string, id: string } | null>(null);

  useEffect(() => {
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

  const handleDisconnect = async () => {
    try {
      await disconnectInstagram();
      setIsConnected(false);
      setConnectionDetails(null);
      toast.success('Account disconnected successfully.');
    } catch (e) {
      toast.error('Failed to disconnect account.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 font-sans animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-zinc-200/80 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-xl">
              <Shield size={22} strokeWidth={2.5} />
            </div>
            Meta Integration
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Connect and manage your Facebook Page and Instagram Professional account for automated AI DM responses and comment workflows.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
        
        {isLoadingStatus ? (
          <div className="flex items-center gap-3 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest">
            <div className="animate-spin w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full" />
            Validating Connection State...
          </div>
        ) : isConnected ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg w-fit border border-emerald-200 dark:border-emerald-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Connection Established
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white dark:bg-zinc-700 rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-sm flex items-center justify-center text-zinc-500 dark:text-zinc-300">
                  <Smartphone size={28} />
                </div>
                <div>
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">{connectionDetails?.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1 uppercase tracking-wider">
                    Meta Business ID: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{connectionDetails?.id}</span>
                  </div>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 text-xs font-semibold rounded-lg">
                <Check size={14} /> Active
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800">
              <button 
                onClick={handleDisconnect}
                className="px-5 py-2.5 bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-700 hover:border-rose-200 dark:hover:border-rose-800 rounded-lg font-semibold transition-colors text-sm shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <X size={16} /> Revoke Meta Access
              </button>

              <button
                onClick={() => setShowGuide(true)}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <Info size={14} /> View Configuration Guide
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 rounded-xl">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-blue-600 dark:text-blue-400" /> Connect Your Instagram Account
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                Link your Instagram Professional account to grant Flazly access to read and respond to direct messages and comments in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
              >
                {isConnecting ? <RefreshCw className="animate-spin" size={18} /> : <Link2 size={18} />}
                <span>{isConnecting ? 'Authenticating...' : 'Connect with Facebook'}</span>
              </button>
              <button 
                onClick={() => setShowGuide(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
              >
                <Info size={16} className="text-zinc-400"/> Setup Guide
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Required Meta Configuration</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">Please ensure these steps are completed before linking.</p>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900 font-bold text-xs">
                  1
                </div>
                <div className="pt-0.5">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">Switch to Professional Account</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    Open the Instagram App &gt; Settings &gt; Account Type. Make sure you are switched to a <strong className="text-zinc-700 dark:text-zinc-300">Business</strong> or <strong className="text-zinc-700 dark:text-zinc-300">Creator</strong> account.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900 font-bold text-xs">
                  2
                </div>
                <div className="pt-0.5">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">Link to a Facebook Page</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    On your Instagram profile, click Edit Profile &gt; Public Business Information &gt; Page. Select or create a Facebook Page to link.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900 font-bold text-xs">
                  3
                </div>
                <div className="pt-0.5">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">Allow Message Access</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    In Instagram Settings &gt; Privacy &gt; Messages. Scroll to the bottom and turn <strong className="text-emerald-600 font-bold uppercase text-[10px] bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 ml-1">On</strong> the "Allow Access to Messages" toggle.
                  </p>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleConnect}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <CheckCircle2 size={18} />
                <span>I've Completed These Steps</span>
              </button>
              <button 
                 onClick={() => setShowGuide(false)}
                 className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaIntegration;
