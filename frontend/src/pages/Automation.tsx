import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MessageSquare, Save, Loader2, Bot, Settings, Moon, Repeat, Heart,
  AlertCircle, Link2, RefreshCw
} from 'lucide-react';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/Skeleton';
import CommentTriggers from '../components/automation/CommentTriggers';

type TabId = 'comment' | 'welcome' | 'advanced';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'comment', label: 'Comment-to-DM', icon: MessageSquare },
  { id: 'welcome', label: 'Welcome flow', icon: Bot },
  { id: 'advanced', label: 'Advanced logic', icon: Settings },
];

const Automation: React.FC = () => {
  const navigate = useNavigate();
  // The tab lives in the URL so a refresh or a shared link opens the same tab.
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabId = TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : 'comment';
  const setActiveTab = (id: TabId) => setSearchParams(id === 'comment' ? {} : { tab: id }, { replace: true });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const [autoFollowUp, setAutoFollowUp] = useState(false);
  const [autoFollowUpDelayHours, setAutoFollowUpDelayHours] = useState(24);
  const [autoFollowUpMessage, setAutoFollowUpMessage] = useState('');
  const [storyMentionEnabled, setStoryMentionEnabled] = useState(false);
  const [storyMentionMessage, setStoryMentionMessage] = useState('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [humanHandoffAlerts, setHumanHandoffAlerts] = useState(true);
  const [timezone, setTimezone] = useState('UTC');
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00');
  const [oooMessage, setOooMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // Saving after a failed load would overwrite the real settings with these defaults.
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (title: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') toast.success(title);
    else toast.error(title);
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      const res = await api.get('/Instagram/Settings');
      if (!res.data.Success) throw new Error('Unexpected response');
      {
        const d = res.data.Data;
        setIsConnected(!!d?.isConnected);
        setWelcomeMessage(d?.welcome_message || '');
        setAutoFollowUp(d?.auto_follow_up_enabled || false);
        setAutoFollowUpDelayHours(d?.auto_follow_up_delay_hours ?? 24);
        setAutoFollowUpMessage(d?.auto_follow_up_message || '');
        setStoryMentionEnabled(d?.story_mention_enabled || false);
        setStoryMentionMessage(d?.story_mention_message || '');
        if (d?.auto_reply_enabled !== undefined) setAutoReplyEnabled(d.auto_reply_enabled);
        if (d?.human_handoff_alerts !== undefined) setHumanHandoffAlerts(d.human_handoff_alerts);
        setTimezone(d?.timezone || 'UTC');
        setWorkingHoursStart(d?.working_hours_start || '09:00');
        setWorkingHoursEnd(d?.working_hours_end || '18:00');
        setOooMessage(d?.ooo_message || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoadFailed(true);
    } 
    finally { setIsLoading(false); }
  };

  const handleSaveWelcome = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/Welcome', { message: welcomeMessage });
      if (res.data.Success) showToast('Welcome message updated successfully!');
    } catch { showToast('Failed to save welcome message.', 'error'); } 
    finally { setIsSaving(false); }
  };

  const handleSaveAdvanced = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/Settings', { 
        auto_follow_up_enabled: autoFollowUp, auto_follow_up_delay_hours: autoFollowUpDelayHours,
        auto_follow_up_message: autoFollowUpMessage, story_mention_enabled: storyMentionEnabled,
        story_mention_message: storyMentionMessage, auto_reply_enabled: autoReplyEnabled,
        human_handoff_alerts: humanHandoffAlerts, timezone, working_hours_start: workingHoursStart,
        working_hours_end: workingHoursEnd, ooo_message: oooMessage
      });
      if (res.data.Success) showToast('Advanced settings updated successfully!');
    } catch { showToast('Failed to save settings.', 'error'); } 
    finally { setIsSaving(false); }
  };

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onTabKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === activeTab);
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setActiveTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  const settingsBlocked = isLoading || loadFailed;

  return (
    <div className="page">
      <div className="page-head mb-4">
        <div>
          <h1 className="page-title">Automation</h1>
          <p className="page-sub">Choose how Flazly replies to comments, greets new conversations and follows up, across your Instagram account.</p>
        </div>
      </div>

      <div className="tabs mb-6" role="tablist" aria-label="Automation type" onKeyDown={onTabKeyDown}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`automation-tab-${id}`}
            ref={(el) => { tabRefs.current[id] = el; }}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`automation-panel-${id}`}
            tabIndex={activeTab === id ? 0 : -1}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div id={`automation-panel-${activeTab}`} role="tabpanel" aria-labelledby={`automation-tab-${activeTab}`}>
          {!isLoading && !isConnected && (
            <div className="notice notice-warn mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-signal-warn" />
                <div>
                  <p className="notice-title">Instagram isn't connected yet</p>
                  <p className="notice-body">
                    Triggers and replies can't send anything until you link your account.
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/meta-integration')} className="btn btn-primary btn-sm">
                <Link2 size={14} /> Connect Instagram
              </button>
            </div>
          )}

          {loadFailed && activeTab !== 'comment' && (
            <div className="notice notice-stop mb-6" role="alert">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="notice-title">Couldn't load your automation settings</p>
                  <p className="notice-body">Saving is turned off until they load, so nothing gets overwritten.</p>
                </div>
              </div>
              <button type="button" onClick={fetchSettings} className="btn btn-sm">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {isLoading && activeTab !== 'comment' && (
            <div role="status" className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <span className="sr-only">Loading automation settings</span>
              {[0, 1].map((i) => (
                <div key={i} className="surface space-y-4 p-6" aria-hidden="true">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* COMMENT TO DM */}
          {activeTab === 'comment' && <CommentTriggers isConnected={isConnected} />}

          {/* WELCOME FLOW */}
          {activeTab === 'welcome' && !isLoading && (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section className="surface overflow-hidden">
                  <div className="surface-head">
                    <div>
                      <h2>Welcome message</h2>
                      <p>The first message sent to brand-new inbound conversations.</p>
                    </div>
                  </div>

                  <div className="surface-body">
                    <label htmlFor="welcome-message" className="sr-only">Welcome message</label>
                    <textarea
                      id="welcome-message"
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Hi there! Thanks for reaching out. How can I help you today?"
                      rows={5}
                      className="field"
                    />
                    <p className="field-hint text-right tabular-nums">{welcomeMessage.length} characters</p>
                  </div>

                  <div className="surface-foot justify-end">
                    <button onClick={handleSaveWelcome} disabled={isSaving || settingsBlocked} aria-busy={isSaving || undefined} className="btn btn-primary">
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save message
                    </button>
                  </div>
                </section>

                <section className="surface overflow-hidden">
                  <div className="surface-head">
                    <h2>Hand-off rules</h2>
                  </div>
                  <div className="surface-body">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <label htmlFor="typing-delay" className="text-[14px] font-medium text-ink">Typing delay</label>
                        <p className="text-[13px] text-ink-soft">Wait before replying so answers feel less instant.</p>
                      </div>
                      <select id="typing-delay" className="field sm:w-56">
                        <option>Instant (0s)</option>
                        <option>Natural (2-5s)</option>
                        <option>Deliberate (5-10s)</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>

              <section className="surface flex flex-col overflow-hidden lg:min-h-[420px]">
                <div className="surface-head">
                  <h2 className="text-[15px]">Preview</h2>
                  <span className="chip">How it looks in Instagram</span>
                </div>

                <div className="flex flex-grow flex-col gap-4 bg-porcelain p-4">
                  <div className="flex w-full flex-col items-start">
                    <div className="max-w-[85%] rounded-[16px] rounded-bl-[4px] border border-hairline bg-surface px-4 py-2.5 text-[14px] text-ink">
                      Hey! I saw your post.
                    </div>
                    <span className="ml-1 mt-1 text-[12px] text-ink-faint">Customer · 12:01 PM</span>
                  </div>

                  <div className="flex w-full flex-col items-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-[16px] rounded-br-[4px] bg-viridian px-4 py-2.5 text-[14px] text-on-accent">
                      {welcomeMessage || 'Your message will render exactly like this.'}
                    </div>
                    <span className="mr-1 mt-1 text-[12px] text-ink-faint">Assistant · 12:01 PM</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ADVANCED TAB */}
          {activeTab === 'advanced' && !isLoading && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section className="surface overflow-hidden">
                  <div className="surface-head">
                    <div>
                      <h2><span className="icon-tile is-sm"><Bot size={16} /></span>AI routing</h2>
                      <p>Core inference settings</p>
                    </div>
                  </div>
                  <div className="divide-y divide-hairline px-5">
                    <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
                      <span>
                        <span className="block text-[14px] font-medium text-ink">Automatic replies</span>
                        <span className="block text-[13px] text-ink-soft">Turn off to pause every automated reply, including AI answers and comment triggers.</span>
                      </span>
                      <input type="checkbox" role="switch" className="switch" checked={autoReplyEnabled} onChange={(e) => setAutoReplyEnabled(e.target.checked)} />
                    </label>
                    <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
                      <span>
                        <span className="block text-[14px] font-medium text-ink">Escalation alerts</span>
                        <span className="block text-[13px] text-ink-soft">Alert the dashboard when the AI hands a conversation to a person.</span>
                      </span>
                      <input type="checkbox" role="switch" className="switch" checked={humanHandoffAlerts} onChange={(e) => setHumanHandoffAlerts(e.target.checked)} />
                    </label>
                  </div>
                </section>

                <section className="surface overflow-hidden">
                  <div className="surface-head">
                    <div>
                      <h2><span className="icon-tile is-sm"><Repeat size={16} /></span>Follow-up drip</h2>
                      <p>Automatic follow-ups for leads who went quiet</p>
                    </div>
                  </div>
                  <div className="space-y-4 px-5 py-4">
                    <label className="flex cursor-pointer items-center justify-between gap-4">
                      <span className="text-[14px] font-medium text-ink">Send follow-ups</span>
                      <input type="checkbox" role="switch" className="switch" checked={autoFollowUp} onChange={(e) => setAutoFollowUp(e.target.checked)} />
                    </label>
                    {autoFollowUp && (
                      <div className="space-y-3 border-t border-hairline pt-4">
                        <div>
                          <label htmlFor="drip-delay" className="field-label">Wait before following up</label>
                          <select id="drip-delay" value={autoFollowUpDelayHours} onChange={(e) => setAutoFollowUpDelayHours(Number(e.target.value))} className="field">
                            <option value={1}>1 hour</option>
                            <option value={24}>24 hours (recommended)</option>
                            <option value={48}>48 hours</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="drip-message" className="field-label">Follow-up message</label>
                          <textarea id="drip-message" value={autoFollowUpMessage} onChange={(e) => setAutoFollowUpMessage(e.target.value)} placeholder="Just checking in!" className="field min-h-0" rows={2} />
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="surface overflow-hidden">
                  <div className="surface-head">
                    <div>
                      <h2><span className="icon-tile is-sm"><Heart size={16} /></span>Story mentions</h2>
                      <p>Thank people who mention you in their story</p>
                    </div>
                  </div>
                  <div className="space-y-4 px-5 py-4">
                    <label className="flex cursor-pointer items-center justify-between gap-4">
                      <span className="text-[14px] font-medium text-ink">Reply to mentions</span>
                      <input type="checkbox" role="switch" className="switch" checked={storyMentionEnabled} onChange={(e) => setStoryMentionEnabled(e.target.checked)} />
                    </label>
                    <div>
                      <label htmlFor="mention-message" className="field-label">Reply message</label>
                      <textarea id="mention-message" disabled={!storyMentionEnabled} value={storyMentionMessage} onChange={(e) => setStoryMentionMessage(e.target.value)} placeholder="Thanks for the mention! 💖" className="field min-h-0" rows={2} />
                    </div>
                  </div>
                </section>

                <section className="surface overflow-hidden">
                  <div className="surface-head">
                    <div>
                      <h2><span className="icon-tile is-sm"><Moon size={16} /></span>Away hours</h2>
                      <p>What customers hear outside working hours</p>
                    </div>
                  </div>
                  <div className="space-y-4 px-5 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="hours-start" className="field-label">Opens</label>
                        <input id="hours-start" type="time" value={workingHoursStart} onChange={e => setWorkingHoursStart(e.target.value)} className="field" />
                      </div>
                      <div>
                        <label htmlFor="hours-end" className="field-label">Closes</label>
                        <input id="hours-end" type="time" value={workingHoursEnd} onChange={e => setWorkingHoursEnd(e.target.value)} className="field" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="hours-tz" className="field-label">Time zone</label>
                      <select id="hours-tz" value={timezone} onChange={e => setTimezone(e.target.value)} className="field">
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (US)</option>
                        <option value="America/Los_Angeles">Pacific Time (US)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ooo-message" className="field-label">Away message</label>
                      <textarea id="ooo-message" value={oooMessage} onChange={e => setOooMessage(e.target.value)} placeholder="We are currently closed..." className="field min-h-0" rows={2} />
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleSaveAdvanced} disabled={isSaving || settingsBlocked} aria-busy={isSaving || undefined} className="btn btn-primary">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save advanced settings
                </button>
              </div>
            </>
          )}

      </div>
    </div>
  );
};

export default Automation;
