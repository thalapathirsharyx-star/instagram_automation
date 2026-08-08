import React, { useState, useEffect } from 'react';
import {
  listBroadcasts,
  createBroadcast,
  deleteBroadcast,
  sendBroadcast,
  getAudienceCount,
} from '../api/broadcast.api';
import { useAuth } from '../context/AuthContext';
import UpgradeOverlay from '../components/UpgradeOverlay';
import {
  Radio,
  Plus,
  Trash2,
  Send,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Sparkles,
  Zap,
  Eye,
  Filter,
  Info,
  GitMerge,
  MessageSquare,
  Timer,
  Play,
  Settings2,
  Workflow,
} from 'lucide-react';

interface BroadcastItem {
  id: string;
  name: string;
  message: string;
  broadcast_status: string;
  filters: any;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft:     { label: 'Draft',     color: 'bg-zinc-100 text-zinc-500',                     icon: <Clock size={12} /> },
  scheduled: { label: 'Scheduled', color: 'bg-warning/10 text-warning border-amber-500/20', icon: <Clock size={12} /> },
  sending:   { label: 'Sending',   color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',       icon: <Loader2 size={12} className="animate-spin" /> },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
  failed:    { label: 'Failed',    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',     icon: <XCircle size={12} /> },
};

const LEAD_STATUSES = ['New', 'Hot', 'Buyer', 'Lost', 'Handoff'];

const Broadcasts: React.FC = () => {
  const { user } = useAuth();
  const currentPlan = user?.company?.plan || 'Free';
  const hasProPlan = ['Pro', 'Business', 'Advanced'].includes(currentPlan);
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('one-time');

  // Custom modal states
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Form state
  const [form, setForm] = useState({
    name: '',
    message: '',
    filters: {
      lead_status: [] as string[],
      is_qualified: null as boolean | null,
    },
  });

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      setIsLoading(true);
      const res = await listBroadcasts();
      if (res?.Data) setBroadcasts(res.Data);
      else if (Array.isArray(res)) setBroadcasts(res);
    } catch (err) {
      console.error('Failed to fetch broadcasts', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasProPlan) {
      setShowUpgradePrompt(true);
      return;
    }
    if (!form.name.trim() || !form.message.trim()) {
      setError('Name and message are required.');
      return;
    }
    setError('');
    setIsCreating(true);
    try {
      const res = await createBroadcast(form);
      if (res.Type === 'Success' || (res as any).Type === 'S') {
        setForm({ name: '', message: '', filters: { lead_status: [], is_qualified: null } });
        setShowCreate(false);
        setAudienceCount(null);
        fetchBroadcasts();
      } else {
        setError(res.Message || 'Failed to create broadcast');
      }
    } catch (err: any) {
      setError(err?.response?.data?.Message || 'An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this broadcast campaign? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteBroadcast(id);
          fetchBroadcasts();
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err) {
          console.error('Delete failed', err);
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
          setAlertConfig({
            isOpen: true,
            title: 'Delete Failed',
            message: 'An error occurred while deleting the campaign.'
          });
        }
      }
    });
  };

  const handleSend = (id: string) => {
    if (!hasProPlan) {
      setShowUpgradePrompt(true);
      return;
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Launch Broadcast',
      message: 'Are you sure you want to send this broadcast message to all matching leads right now?',
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isLoading: true }));
        setIsSending(id);
        try {
          const res = await sendBroadcast(id);
          if (res.Type === 'Success' || (res as any).Type === 'S') {
            fetchBroadcasts();
            setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
          } else {
            setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
            setAlertConfig({
              isOpen: true,
              title: 'Send Failed',
              message: res.Message || 'Failed to dispatch the broadcast.'
            });
          }
        } catch (err: any) {
          setConfirmConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
          setAlertConfig({
            isOpen: true,
            title: 'Send Failed',
            message: err?.response?.data?.Message || 'An unexpected error occurred during dispatch.'
          });
        } finally {
          setIsSending(null);
        }
      }
    });
  };

  const handlePreviewAudience = async () => {
    setIsCountLoading(true);
    try {
      const res = await getAudienceCount(form.filters);
      if (res?.Data !== undefined) setAudienceCount(res.Data);
    } catch (err) {
      console.error('Audience count failed', err);
    } finally {
      setIsCountLoading(false);
    }
  };

  const toggleLeadStatus = (status: string) => {
    setForm(prev => {
      const current = prev.filters.lead_status;
      const updated = current.includes(status)
        ? current.filter(s => s !== status)
        : [...current, status];
      return { ...prev, filters: { ...prev.filters, lead_status: updated } };
    });
    setAudienceCount(null);
  };

  const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <div className="relative flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      {showUpgradePrompt && <UpgradeOverlay feature="Broadcasts" onClose={() => setShowUpgradePrompt(false)} />}
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-zinc-900">Broadcasts</h1>
            <button 
              onClick={() => setShowTipsModal(true)}
              className="text-zinc-400 hover:text-brand transition-colors mt-1"
              title="Broadcast Tips"
            >
              <Info size={22} />
            </button>
          </div>
          <p className="text-zinc-500 font-medium">Send bulk messages to your leads and contacts.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Top Right Analytics */}
          <div className="flex items-center gap-6 bg-white border border-zinc-200 rounded-xl px-6 py-3 shadow-sm">
            <div className="text-center">
              <div className="text-xl font-black text-zinc-900">{broadcasts.length}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Campaigns</div>
            </div>
            <div className="w-px h-8 bg-zinc-200"></div>
            <div className="text-center">
              <div className="text-xl font-black text-emerald-500">
                {broadcasts.reduce((sum, b) => sum + (b.sent_count || 0), 0)}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Sent</div>
            </div>
            <div className="w-px h-8 bg-zinc-200"></div>
            <div className="text-center">
              <div className="text-xl font-black text-brand">
                {broadcasts.reduce((sum, b) => sum + (b.total_recipients || 0), 0)}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Recipients</div>
            </div>
          </div>

          {activeTab === 'one-time' && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="btn-primary h-[60px] px-6 shadow-glow-purple whitespace-nowrap"
            >
              <Plus size={18} />
              <span>{showCreate ? 'Cancel' : 'New Broadcast'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-px mb-2">
        <button
          onClick={() => setActiveTab('one-time')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'one-time'
              ? 'border-brand text-brand'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
          }`}
        >
          <Send size={16} /> One-Time Broadcasts
        </button>
        <button
          onClick={() => setActiveTab('drip')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'drip'
              ? 'border-brand text-brand'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
          }`}
        >
          <Workflow size={16} /> Drip Sequences <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] uppercase tracking-wider ml-1">Pro</span>
        </button>
      </div>

      {activeTab === 'one-time' && (
        <div className="flex flex-col gap-8">

      {/* Create Form */}
      {showCreate && (
        <div className="card-standard border border-brand/20 relative overflow-visible">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-200">
            <div className="p-2.5 bg-brand/10 text-brand rounded-xl border border-brand/20">
              <Radio size={20} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Create Broadcast</h3>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-bold flex gap-2 items-start">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Campaign Name</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:border-brand/50 outline-none transition-colors"
                  placeholder="e.g. Weekly Product Drop Announcement"
                />
              </div>

              {/* Audience Filters */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                  <Filter size={12} className="inline mr-1" /> Target Audience
                </label>
                <div className="flex flex-wrap gap-2">
                  {LEAD_STATUSES.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleLeadStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        form.filters.lead_status.includes(status)
                          ? 'bg-brand/20 text-brand border-brand/30'
                          : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        filters: { ...prev.filters, lead_status: [] }
                      }));
                      setAudienceCount(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-500 transition-all"
                  >
                    All Leads
                  </button>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Message Content</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:border-brand/50 outline-none transition-colors resize-none"
                placeholder="Write your broadcast message here..."
              />
              <div className="mt-1.5 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {form.message.length} characters
              </div>
            </div>

            {/* Audience Preview + Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreviewAudience}
                  disabled={isCountLoading}
                  className="px-4 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-700 transition-colors flex items-center gap-2"
                >
                  {isCountLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                  Preview Audience
                </button>
                {audienceCount !== null && (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-brand">
                    <Users size={14} />
                    {audienceCount} {audienceCount === 1 ? 'lead' : 'leads'} matched
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary px-8 shadow-glow-purple"
              >
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                <span>Create Broadcast</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcasts List */}
      {!showCreate && (
        <div className="grid gap-6">
          {isLoading ? (
          <div className="card-standard border border-zinc-200 p-12 text-center text-zinc-500">
            <Loader2 size={24} className="animate-spin mx-auto mb-3" />
            Loading broadcasts...
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="card-standard border border-zinc-200 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-5 border border-zinc-200">
              <Radio className="text-zinc-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-zinc-500 mb-2">No Broadcasts Yet</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Create your first broadcast to send bulk messages to your Instagram leads. Filter by lead status, tags, and more.
            </p>
          </div>
        ) : (
          broadcasts.map((bc) => {
            const cfg = getStatusConfig(bc.broadcast_status);
            const progress = bc.total_recipients > 0
              ? Math.round(((bc.sent_count + bc.failed_count) / bc.total_recipients) * 100)
              : 0;

            return (
              <div
                key={bc.id}
                className="card-standard border border-zinc-200 hover:border-brand/20 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Info */}
                  <div className="flex-grow space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-zinc-900">{bc.name}</h3>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium line-clamp-2">{bc.message}</p>

                    {/* Filters Display */}
                    {bc.filters?.lead_status?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Audience:</span>
                        {bc.filters.lead_status.map((s: string) => (
                          <span key={s} className="text-[10px] font-bold px-2 py-0.5 bg-brand/10 text-brand rounded-md border border-brand/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Stats + Actions */}
                  <div className="flex items-center gap-6 shrink-0">
                    {/* Stats */}
                    {(bc.broadcast_status === 'completed' || bc.broadcast_status === 'sending') && (
                      <div className="flex items-center gap-6 pr-6 border-r border-zinc-200">
                        <div className="text-center">
                          <div className="text-lg font-black text-zinc-900">{bc.sent_count}</div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-rose-400">{bc.failed_count}</div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-brand">{bc.total_recipients}</div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total</div>
                        </div>
                      </div>
                    )}

                    {/* Progress bar for sending */}
                    {bc.broadcast_status === 'sending' && (
                      <div className="w-24">
                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-bold text-zinc-500 mt-1 text-center">{progress}%</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {(bc.broadcast_status === 'draft' || bc.broadcast_status === 'scheduled') && (
                        <button
                          onClick={() => handleSend(bc.id)}
                          disabled={isSending === bc.id}
                          className="px-4 py-2 bg-emerald-500 text-zinc-900 font-bold text-xs rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {isSending === bc.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Send Now
                        </button>
                      )}
                      {bc.broadcast_status !== 'sending' && (
                        <button
                          onClick={() => handleDelete(bc.id)}
                          className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      )}
      </div>
      )}

      {activeTab === 'drip' && (
        <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-500">
          {/* Sequence List / Sidebar */}
          <div className="w-full xl:w-1/3 flex flex-col gap-4">
            <div className="card-standard border border-zinc-200 p-0 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-zinc-200 bg-zinc-50/80 flex justify-between items-center">
                <h3 className="font-bold text-zinc-900">Your Sequences</h3>
                <button className="text-brand hover:bg-brand/10 p-1.5 rounded-lg transition-colors">
                  <Plus size={18} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="p-5 rounded-2xl border-2 border-brand bg-brand/5 cursor-pointer transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-brand text-sm">Abandoned Cart Recovery</h4>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mb-4">4 steps • 1,240 Enrolled</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-zinc-700 pt-3 border-t border-brand/10">
                    <span className="flex items-center gap-1.5"><MessageSquare size={14} className="text-brand/60" /> 840 Sent</span>
                    <span className="flex items-center gap-1.5"><Zap size={14} className="text-warning" /> 12% Conv.</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-zinc-200 hover:border-zinc-300 bg-white cursor-pointer transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-zinc-900 text-sm">Welcome Series (New Leads)</h4>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">Draft</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">3 steps • 0 Enrolled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Sequence Builder */}
          <div className="w-full xl:w-2/3">
            <div className="card-standard border border-zinc-200 bg-[#f8f9fa] p-8 min-h-[600px] relative shadow-inner overflow-hidden">
              {/* Background grid pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#18181b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              
              <div className="absolute top-6 right-6 flex gap-3 z-20">
                <button className="btn-base bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm px-4"><Settings2 size={16} /> Settings</button>
                <button className="btn-primary shadow-glow-purple px-5"><Play size={16} /> Start Sequence</button>
              </div>

              <div className="max-w-md mx-auto pt-14 flex flex-col items-center relative z-10">
                
                {/* Trigger Block */}
                <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm text-center relative hover:border-brand transition-colors cursor-pointer group hover:shadow-md">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
                    <Users size={22} />
                  </div>
                  <h4 className="font-bold text-zinc-900 mb-1">Sequence Trigger</h4>
                  <p className="text-xs text-zinc-500 font-medium">When lead status changes to "Hot"</p>
                </div>

                {/* Arrow */}
                <div className="w-px h-10 bg-zinc-300 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand hover:text-white hover:border-brand transition-all text-zinc-400 opacity-0 group-hover:opacity-100">
                    <Plus size={12} />
                  </div>
                </div>

                {/* Message Block */}
                <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm relative hover:border-brand transition-colors cursor-pointer group text-left hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center border border-sky-100">
                        <MessageSquare size={18} />
                      </div>
                      <h4 className="font-bold text-zinc-900">Send Message 1</h4>
                    </div>
                  </div>
                  <div className="bg-zinc-50/80 rounded-xl p-3.5 text-xs text-zinc-700 font-medium border border-zinc-200/60 leading-relaxed">
                    "Hey {'{{name}}'}! Saw you were checking out our latest summer collection..."
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-px h-10 bg-zinc-300 relative"></div>

                {/* Delay Block */}
                <div className="bg-white border-2 border-warning/30 rounded-full px-6 py-2.5 shadow-sm relative flex items-center gap-2 cursor-pointer hover:border-warning hover:bg-warning/5 transition-colors">
                  <Timer size={16} className="text-warning" />
                  <span className="text-xs font-black text-zinc-700 uppercase tracking-wide">Wait 24 Hours</span>
                </div>

                {/* Arrow */}
                <div className="w-px h-10 bg-zinc-300 relative"></div>

                {/* Condition Block */}
                <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm relative hover:border-brand transition-colors cursor-pointer group hover:shadow-md">
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100">
                      <GitMerge size={18} />
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-900 text-center mb-1">Condition Check</h4>
                  <p className="text-xs text-zinc-500 font-medium text-center">If no reply from user</p>
                </div>

                {/* Arrow */}
                <div className="w-px h-10 bg-zinc-300 relative"></div>

                {/* Message Block 2 */}
                <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm relative hover:border-brand transition-colors cursor-pointer group text-left hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100">
                        <MessageSquare size={18} />
                      </div>
                      <h4 className="font-bold text-zinc-900">Send Follow-Up</h4>
                    </div>
                  </div>
                  <div className="bg-zinc-50/80 rounded-xl p-3.5 text-xs text-zinc-700 font-medium border border-zinc-200/60 leading-relaxed">
                    "Just checking in! As a thank you, here is 10% off using code SUMMER10..."
                  </div>
                </div>
                
                {/* Add Step Button */}
                <div className="mt-8">
                  <button className="w-12 h-12 bg-white border-2 border-dashed border-zinc-300 rounded-full flex items-center justify-center text-zinc-400 hover:text-brand hover:border-brand hover:bg-brand/5 transition-all shadow-sm">
                    <Plus size={20} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips Modal */}
      {showTipsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="card-standard max-w-md w-full border border-zinc-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl pointer-events-none rounded-full -translate-y-1/2 translate-x-1/4"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand/10 text-brand">
                  <Sparkles size={20} />
                </div>
                Broadcast Tips
              </h3>
              <button onClick={() => setShowTipsModal(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors bg-zinc-50 hover:bg-zinc-100 p-2 rounded-full">
                <XCircle size={18} />
              </button>
            </div>
            
            <ul className="space-y-4 text-sm font-medium text-zinc-600 relative z-10 bg-zinc-50/50 rounded-xl p-4 border border-zinc-100">
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_8px_rgba(79,57,246,0.8)]" /> 
                <p>Keep messages under <strong className="text-zinc-900 font-bold">500 characters</strong> for best engagement.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_8px_rgba(79,57,246,0.8)]" /> 
                <p>Filter by <strong className="text-zinc-900 font-bold">"Hot" leads</strong> for highest conversion rates.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_8px_rgba(79,57,246,0.8)]" /> 
                <p>Instagram limits <strong className="text-zinc-900 font-bold">~200 messages/hour</strong> per account.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_8px_rgba(79,57,246,0.8)]" /> 
                <p>Avoid spammy language to prevent account restrictions.</p>
              </li>
            </ul>
            
            <div className="mt-6 relative z-10">
              <button
                onClick={() => setShowTipsModal(false)}
                className="w-full btn-primary py-3 font-bold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="card-standard max-w-md w-full border border-brand/20 bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-warning mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-black text-zinc-900">{confirmConfig.title}</h3>
            </div>
            <p className="text-sm text-zinc-500 font-medium mb-6">{confirmConfig.message}</p>
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                disabled={confirmConfig.isLoading}
                className="px-5 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmConfig.onConfirm}
                disabled={confirmConfig.isLoading}
                className="px-6 py-2 bg-brand hover:bg-brand text-zinc-900 font-bold text-sm rounded-xl shadow-lg shadow-purple-650/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {confirmConfig.isLoading && <Loader2 size={14} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="card-standard max-w-md w-full border border-rose-500/20 bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-450 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-black text-zinc-900">{alertConfig.title}</h3>
            </div>
            <p className="text-sm text-zinc-500 font-medium mb-6">{alertConfig.message}</p>
            <div className="flex justify-end pt-4 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                className="px-6 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-350 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Broadcasts;
