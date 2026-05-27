import React, { useState, useEffect } from 'react';
import {
  listBroadcasts,
  createBroadcast,
  deleteBroadcast,
  sendBroadcast,
  getAudienceCount,
} from '../api/broadcast.api';
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
  draft:     { label: 'Draft',     color: 'bg-zinc-800 text-zinc-400',                     icon: <Clock size={12} /> },
  scheduled: { label: 'Scheduled', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Clock size={12} /> },
  sending:   { label: 'Sending',   color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',       icon: <Loader2 size={12} className="animate-spin" /> },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
  failed:    { label: 'Failed',    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',     icon: <XCircle size={12} /> },
};

const LEAD_STATUSES = ['New', 'Hot', 'Buyer', 'Lost', 'Handoff'];

const Broadcasts: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);

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
    if (!form.name.trim() || !form.message.trim()) {
      setError('Name and message are required.');
      return;
    }
    setError('');
    setIsCreating(true);
    try {
      const res = await createBroadcast(form);
      if (res.Type === 'Success') {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this broadcast? This cannot be undone.')) return;
    try {
      await deleteBroadcast(id);
      fetchBroadcasts();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Send this broadcast to all matching leads right now?')) return;
    setIsSending(id);
    try {
      const res = await sendBroadcast(id);
      if (res.Type === 'Success') {
        fetchBroadcasts();
      } else {
        alert(res.Message || 'Failed to send');
      }
    } catch (err: any) {
      alert(err?.response?.data?.Message || 'Send failed');
    } finally {
      setIsSending(null);
    }
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
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Broadcasts</h1>
          <p className="text-zinc-400 font-medium">Send bulk messages to your leads and contacts.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="w3-button-primary px-6 shadow-glow-purple self-start"
        >
          <Plus size={18} />
          <span>{showCreate ? 'Cancel' : 'New Broadcast'}</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="w3-card border border-purple-500/20 relative overflow-visible">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Radio size={20} />
            </div>
            <h3 className="text-lg font-bold text-zinc-100">Create Broadcast</h3>
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
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-purple-500/50 outline-none transition-colors"
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
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-zinc-700'
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
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-zinc-500 border border-white/5 hover:text-zinc-300 transition-all"
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
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:border-purple-500/50 outline-none transition-colors resize-none"
                placeholder="Write your broadcast message here..."
              />
              <div className="mt-1.5 text-right text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                {form.message.length} characters
              </div>
            </div>

            {/* Audience Preview + Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreviewAudience}
                  disabled={isCountLoading}
                  className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-xl text-sm font-bold text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-2"
                >
                  {isCountLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                  Preview Audience
                </button>
                {audienceCount !== null && (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-purple-400">
                    <Users size={14} />
                    {audienceCount} {audienceCount === 1 ? 'lead' : 'leads'} matched
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w3-button-primary px-8 shadow-glow-purple"
              >
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                <span>Create Broadcast</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcasts List */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="w3-card border border-white/5 p-12 text-center text-zinc-500">
            <Loader2 size={24} className="animate-spin mx-auto mb-3" />
            Loading broadcasts...
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="w3-card border border-white/5 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mb-5 border border-white/5">
              <Radio className="text-zinc-600" size={32} />
            </div>
            <h3 className="text-lg font-bold text-zinc-300 mb-2">No Broadcasts Yet</h3>
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
                className="w3-card border border-white/5 hover:border-purple-500/20 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Info */}
                  <div className="flex-grow space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-zinc-100">{bc.name}</h3>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 font-medium line-clamp-2">{bc.message}</p>

                    {/* Filters Display */}
                    {bc.filters?.lead_status?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Audience:</span>
                        {bc.filters.lead_status.map((s: string) => (
                          <span key={s} className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20">
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
                      <div className="flex items-center gap-6 pr-6 border-r border-white/5">
                        <div className="text-center">
                          <div className="text-lg font-black text-zinc-100">{bc.sent_count}</div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-rose-400">{bc.failed_count}</div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-purple-400">{bc.total_recipients}</div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total</div>
                        </div>
                      </div>
                    )}

                    {/* Progress bar for sending */}
                    {bc.broadcast_status === 'sending' && (
                      <div className="w-24">
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
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
                          className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
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

      {/* Info Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="w3-card bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/20 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="font-bold flex items-center gap-2 mb-4 text-purple-200">
              <Sparkles size={18} /> Broadcast Tips
            </h4>
            <ul className="space-y-2 text-sm font-medium text-purple-100/80">
              <li>• Keep messages under 500 characters for best engagement</li>
              <li>• Filter by "Hot" leads for highest conversion rates</li>
              <li>• Instagram limits ~200 messages/hour per account</li>
              <li>• Avoid spammy language to prevent account restrictions</li>
            </ul>
          </div>
          <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-purple-500 opacity-20 blur-xl" />
        </div>

        <div className="w3-card border border-white/5 lg:col-span-2">
          <h4 className="text-lg font-bold text-zinc-100 mb-6">Broadcast Analytics</h4>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 text-center">
              <div className="text-2xl font-black text-zinc-100">{broadcasts.length}</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Total Campaigns</div>
            </div>
            <div className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 text-center">
              <div className="text-2xl font-black text-emerald-400">
                {broadcasts.reduce((sum, b) => sum + (b.sent_count || 0), 0)}
              </div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Messages Sent</div>
            </div>
            <div className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 text-center">
              <div className="text-2xl font-black text-purple-400">
                {broadcasts.reduce((sum, b) => sum + (b.total_recipients || 0), 0)}
              </div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Total Recipients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Broadcasts;
