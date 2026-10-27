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
import { ConfirmModal } from '../components/ConfirmModal';
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
  draft:     { label: 'Draft',     color: 'chip',             icon: <Clock size={12} /> },
  scheduled: { label: 'Scheduled', color: 'chip chip-warn',   icon: <Clock size={12} /> },
  sending:   { label: 'Sending',   color: 'chip chip-accent', icon: <Loader2 size={12} className="animate-spin" /> },
  completed: { label: 'Completed', color: 'chip chip-go',     icon: <CheckCircle2 size={12} /> },
  failed:    { label: 'Failed',    color: 'chip chip-stop',   icon: <XCircle size={12} /> },
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

  // Custom modal states
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading?: boolean;
    confirmText?: string;
    type?: 'danger' | 'primary';
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
      confirmText: 'Delete',
      type: 'danger',
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
      confirmText: 'Send now',
      type: 'primary',
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

  const totalSent = broadcasts.reduce((sum, b) => sum + (b.sent_count || 0), 0);
  const totalRecipients = broadcasts.reduce((sum, b) => sum + (b.total_recipients || 0), 0);

  return (
    <div className="page relative">
      {showUpgradePrompt && <UpgradeOverlay feature="Broadcasts" onClose={() => setShowUpgradePrompt(false)} />}

      <div className="page-head">
        <div>
          <h1 className="page-title">Broadcasts</h1>
          <p className="page-sub">Send bulk messages to your leads and contacts.</p>
        </div>
        {showCreate ? (
          <button onClick={() => setShowCreate(false)} className="btn">
            Cancel
          </button>
        ) : (
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            <Plus size={16} /> New broadcast
          </button>
        )}
      </div>

      <div className="stack">
        {showCreate && (
          <form onSubmit={handleCreate} className="surface overflow-hidden">
            <div className="surface-head">
              <h2><span className="icon-tile is-sm"><Radio size={16} /></span>Create broadcast</h2>
            </div>

            <div className="surface-body space-y-5">
              {error && (
                <div className="notice notice-stop" role="alert">
                  <p className="notice-body flex items-start gap-2">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    {error}
                  </p>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="bc-name" className="field-label">Campaign name</label>
                  <input
                    id="bc-name"
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="field"
                    placeholder="e.g. Weekly product drop"
                  />
                </div>

                <fieldset>
                  <legend className="field-label flex items-center gap-1.5">
                    <Filter size={13} /> Target audience
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-pressed={form.filters.lead_status.length === 0}
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          filters: { ...prev.filters, lead_status: [] }
                        }));
                        setAudienceCount(null);
                      }}
                      className={`btn btn-sm ${form.filters.lead_status.length === 0 ? 'border-viridian bg-viridian-tint text-viridian' : ''}`}
                    >
                      All leads
                    </button>
                    {LEAD_STATUSES.map(status => {
                      const on = form.filters.lead_status.includes(status);
                      return (
                        <button
                          key={status}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleLeadStatus(status)}
                          className={`btn btn-sm ${on ? 'border-viridian bg-viridian-tint text-viridian' : ''}`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div>
                <label htmlFor="bc-message" className="field-label">Message</label>
                <textarea
                  id="bc-message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="field"
                  placeholder="Write your broadcast message here..."
                />
                <p className={`field-hint text-right tabular-nums ${form.message.length > 500 ? 'text-signal-warn' : ''}`}>
                  {form.message.length} characters{form.message.length > 500 ? ' · long messages get fewer replies' : ''}
                </p>
              </div>
            </div>

            <div className="surface-foot">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreviewAudience}
                  disabled={isCountLoading}
                  aria-busy={isCountLoading || undefined}
                  className="btn btn-sm"
                >
                  {isCountLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                  Preview audience
                </button>
                {audienceCount !== null && (
                  <span className="flex items-center gap-1.5 text-[14px] font-medium text-ink" role="status">
                    <Users size={14} className="text-ink-soft" />
                    {audienceCount} {audienceCount === 1 ? 'lead' : 'leads'} matched
                  </span>
                )}
              </div>
              <button type="submit" disabled={isCreating} aria-busy={isCreating || undefined} className="btn btn-primary">
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Create broadcast
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="surface empty">
            <Loader2 size={22} className="animate-spin text-ink-faint" />
            <p className="empty-body">Loading broadcasts…</p>
          </div>
        ) : broadcasts.length === 0 ? (
          !showCreate && (
            <div className="surface empty">
              <span className="empty-mark"><Radio /></span>
              <p className="empty-title">No broadcasts yet</p>
              <p className="empty-body">
                Send one message to many leads at once, filtered by lead status.
              </p>
              <button onClick={() => setShowCreate(true)} className="btn btn-primary">
                <Plus size={16} /> New broadcast
              </button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {broadcasts.map((bc) => {
              const cfg = getStatusConfig(bc.broadcast_status);
              const progress = bc.total_recipients > 0
                ? Math.round(((bc.sent_count + bc.failed_count) / bc.total_recipients) * 100)
                : 0;

              return (
                <article key={bc.id} className="surface p-5">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-grow space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-[16px] font-semibold text-ink">{bc.name}</h3>
                        <span className={cfg.color}>{cfg.icon} {cfg.label}</span>
                      </div>
                      <p className="line-clamp-2 text-[14px] text-ink-soft">{bc.message}</p>

                      {bc.filters?.lead_status?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] text-ink-faint">Audience</span>
                          {bc.filters.lead_status.map((s: string) => (
                            <span key={s} className="chip chip-accent">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-5">
                      {(bc.broadcast_status === 'completed' || bc.broadcast_status === 'sending') && (
                        <dl className="flex items-center gap-5 tabular-nums lg:border-r lg:border-hairline lg:pr-5">
                          <div className="text-center">
                            <dt className="text-[13px] text-ink-soft">Sent</dt>
                            <dd className="text-[17px] font-semibold text-ink">{bc.sent_count}</dd>
                          </div>
                          <div className="text-center">
                            <dt className="text-[13px] text-ink-soft">Failed</dt>
                            <dd className={`text-[17px] font-semibold ${bc.failed_count ? 'text-signal-stop' : 'text-ink'}`}>{bc.failed_count}</dd>
                          </div>
                          <div className="text-center">
                            <dt className="text-[13px] text-ink-soft">Total</dt>
                            <dd className="text-[17px] font-semibold text-ink">{bc.total_recipients}</dd>
                          </div>
                        </dl>
                      )}

                      {bc.broadcast_status === 'sending' && (
                        <div className="w-28" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Sending progress">
                          <div className="meter"><span style={{ width: `${progress}%` }} /></div>
                          <div className="mt-1 text-center text-[13px] tabular-nums text-ink-soft">{progress}%</div>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        {(bc.broadcast_status === 'draft' || bc.broadcast_status === 'scheduled') && (
                          <button
                            onClick={() => handleSend(bc.id)}
                            disabled={isSending === bc.id}
                            aria-busy={isSending === bc.id || undefined}
                            className="btn btn-primary btn-sm"
                          >
                            {isSending === bc.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Send now
                          </button>
                        )}
                        {bc.broadcast_status !== 'sending' && (
                          <button
                            onClick={() => handleDelete(bc.id)}
                            className="btn btn-ghost btn-icon btn-sm is-danger"
                            aria-label={`Delete ${bc.name}`}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <section className="surface p-5">
            <h2 className="mb-3 flex items-center gap-2.5 text-[16px] font-semibold text-ink">
              <span className="icon-tile is-sm"><Sparkles size={16} /></span>
              Broadcast tips
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-[14px] text-ink-soft marker:text-ink-faint">
              <li>Keep messages under 500 characters for best engagement.</li>
              <li>Filter by "Hot" leads for the highest conversion rates.</li>
              <li>Instagram allows roughly 200 messages an hour per account.</li>
              <li>Avoid spammy language to prevent account restrictions.</li>
            </ul>
          </section>

          <section className="lg:col-span-2">
            <h2 className="sr-only">Broadcast analytics</h2>
            <div className="metric-grid">
              {[
                { label: 'Total campaigns', value: broadcasts.length, icon: Radio, tone: 'tone-blue' },
                { label: 'Messages sent', value: totalSent, icon: Send, tone: 'tone-peach' },
                { label: 'Total recipients', value: totalRecipients, icon: Users, tone: 'tone-mint' },
              ].map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className={`metric ${tone}`}>
                  <div className="metric-head">
                    <span className="metric-label">{label}</span>
                    <span className="icon-tile is-sm"><Icon size={16} /></span>
                  </div>
                  <span className="metric-figure">{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText || 'Confirm'}
        type={confirmConfig.type || 'primary'}
        isLoading={confirmConfig.isLoading}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {alertConfig.isOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setAlertConfig(prev => ({ ...prev, isOpen: false })); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="bc-alert-title" className="modal max-w-md">
            <div className="modal-head border-b-0 pb-2">
              <div className="flex items-start gap-3">
                <span className="icon-tile is-sm is-stop"><AlertTriangle size={16} /></span>
                <div>
                  <h3 id="bc-alert-title">{alertConfig.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{alertConfig.message}</p>
                </div>
              </div>
            </div>
            <div className="modal-foot mt-3">
              <button
                type="button"
                autoFocus
                onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                className="btn"
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
