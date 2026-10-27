import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, MessageSquare, Save, Loader2, Info, Send, Bot, Zap, Plus, 
  Trash2, GitBranch, Play, ArrowRight, Clock, Settings, Layers, 
  HelpCircle, Activity, Workflow, Moon, Repeat, Heart, CheckCircle2, 
  AlertCircle, Link2
} from 'lucide-react';
import api from '../lib/axios';
import PlaybookCanvas from '../components/PlaybookCanvas';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface PlaybookStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  title: string;
  value: string;
}

interface CommentTrigger {
  id: string;
  postTitle: string;
  keyword: string;
  replyMessage: string;
  isActive: boolean;
}

const Automation: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'playbook' | 'comment' | 'welcome' | 'advanced'>('comment');
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
  const [isSaving, setIsSaving] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const { toast } = useToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [playbookSteps, setPlaybookSteps] = useState<PlaybookStep[]>([]);
  const [commentTriggers, setCommentTriggers] = useState<CommentTrigger[]>([]);

  const [newPostTitle, setNewPostTitle] = useState('Latest Reel');
  const [newKeyword, setNewKeyword] = useState('');
  const [newReplyMessage, setNewReplyMessage] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchPlaybook();
    fetchCommentTriggers();
  }, []);

  const showToast = (title: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') toast.success(title);
    else toast.error(title);
  };

  const fetchCommentTriggers = async () => {
    try {
      const res = await api.get('/Instagram/CommentTriggers');
      if (res.data.Success && Array.isArray(res.data.Data)) {
        setCommentTriggers(res.data.Data.map((item: any) => ({
          id: item.id, postTitle: item.post_title, keyword: item.keyword,
          replyMessage: item.reply_message, isActive: item.is_active
        })));
      }
    } catch (error) { console.error('Error fetching comment triggers:', error); }
  };

  const fetchPlaybook = async () => {
    try {
      const res = await api.get('/Instagram/Playbook');
      if (res.data.Success && Array.isArray(res.data.Data) && res.data.Data.length > 0) {
        setPlaybookSteps(res.data.Data);
      } else if (res.data.Success) {
        setPlaybookSteps([
          { id: '1', type: 'trigger', title: 'When user sends DM containing keyword', value: 'price, cost, buy' },
          { id: '2', type: 'action', title: 'Send Automated Catalog & Pricing Menu', value: 'Flazly Pro Catalog Link' }
        ]);
      }
    } catch (error) { console.error('Error fetching playbook:', error); }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/Instagram/Settings');
      if (res.data.Success) {
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
        setWorkingHoursEnd(d?.working_hours_end || '18:05'); // Maintain layout
        setOooMessage(d?.ooo_message || '');
      }
    } catch (error) { console.error('Error fetching settings:', error); } 
    finally { setIsLoading(false); }
  };

  const handleSavePlaybook = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/Playbook', { steps: playbookSteps });
      if (res.data.Success) showToast('Playbook saved successfully!');
    } catch (error) { showToast('Failed to save playbook.', 'error'); } 
    finally { setIsSaving(false); }
  };

  const handleSaveWelcome = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/Welcome', { message: welcomeMessage });
      if (res.data.Success) showToast('Welcome message updated successfully!');
    } catch (error) { showToast('Failed to save welcome message.', 'error'); } 
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
    } catch (error) { showToast('Failed to save settings.', 'error'); } 
    finally { setIsSaving(false); }
  };

  const addPlaybookStep = (type: 'trigger' | 'condition' | 'action' | 'delay') => {
    const titles = { trigger: 'Trigger:', condition: 'Condition:', action: 'Action:', delay: 'Delay:' };
    setPlaybookSteps(prev => [...prev, { id: Date.now().toString(), type, title: titles[type], value: '' }]);
  };

  const updateStepValue = (id: string, value: string) => setPlaybookSteps(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  const updateStepTitle = (id: string, title: string) => setPlaybookSteps(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  const deleteStep = (id: string) => setPlaybookSteps(prev => prev.filter(s => s.id !== id));

  const addCommentTrigger = async () => {
    if (!newKeyword.trim() || !newReplyMessage.trim()) return showToast('Keyword and Reply Message cannot be empty.', 'error');
    try {
      const res = await api.post('/Instagram/CommentTriggers', {
        postTitle: newPostTitle, keyword: newKeyword.toUpperCase().trim(), replyMessage: newReplyMessage
      });
      if (res.data.Success) {
        const item = res.data.Data;
        setCommentTriggers([{ id: item.id, postTitle: item.post_title, keyword: item.keyword, replyMessage: item.reply_message, isActive: item.is_active }, ...commentTriggers]);
        setNewKeyword(''); setNewReplyMessage(''); showToast('Comment trigger created successfully!');
      }
    } catch (error) { showToast('Failed to create trigger.', 'error'); }
  };

  const toggleCommentTrigger = async (id: string) => {
    try {
      const res = await api.post(`/Instagram/CommentTriggers/${id}/toggle`);
      if (res.data.Success) {
        setCommentTriggers(commentTriggers.map(t => t.id === id ? { ...t, isActive: res.data.Data.is_active } : t));
        showToast('Trigger updated successfully!');
      }
    } catch (error) { showToast('Failed to update trigger status.', 'error'); }
  };

  const deleteCommentTrigger = async () => {
    if (!confirmDeleteId) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/Instagram/CommentTriggers/${confirmDeleteId}`);
      if (res.data.Success) {
        setCommentTriggers(commentTriggers.filter(t => t.id !== confirmDeleteId));
        showToast('Trigger deleted successfully!');
      }
    } catch (error) { showToast('Failed to delete trigger.', 'error'); } 
    finally { setIsDeleting(false); setConfirmDeleteId(null); }
  };

  const tabs: { id: typeof activeTab; label: string; icon: React.ElementType }[] = [
    // { id: 'playbook', label: 'Playbook builder', icon: GitBranch },
    { id: 'comment', label: 'Comment-to-DM', icon: MessageSquare },
    { id: 'welcome', label: 'Welcome flow', icon: Bot },
    { id: 'advanced', label: 'Advanced logic', icon: Settings },
  ];

  return (
    <div className="page">
      <div className="page-head mb-4">
        <div>
          <h1 className="page-title">Automation</h1>
          <p className="page-sub">Configure how AI intercepts conversations, replies to comments, and manages conditional playbooks across your Instagram account.</p>
        </div>
      </div>

      <div className="tabs mb-6" role="tablist" aria-label="Automation type">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="surface empty">
          <Loader2 size={22} className="animate-spin text-ink-faint" />
          <p className="empty-body">Loading automation settings…</p>
        </div>
      ) : (
        <>
          {!isConnected && (
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

          {/* PLAYBOOK BUILDER */}
          {activeTab === 'playbook' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 lg:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-100">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                        <Activity className="text-violet-600" size={20} /> Qualification Sequence
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1 font-medium">Design the chronological steps AI uses to evaluate leads.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active
                      </span>
                      <button 
                        onClick={() => setShowCanvas(true)}
                        className="flex items-center gap-2 text-xs font-medium text-white bg-zinc-900 px-4 py-2.5 rounded-lg shadow-sm hover:bg-zinc-800 transition-colors"
                      >
                        <Workflow size={14} /> Visual Canvas
                      </button>
                    </div>
                  </div>

                  <div className="relative pl-16 space-y-10 py-2">
                    {playbookSteps.map((step, idx) => {
                      let badgeColor = "bg-violet-50 text-violet-700 border-violet-200";
                      let iconBg = "bg-violet-100 text-violet-600 border-violet-200";
                      
                      if (step.type === 'trigger') {
                        badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                        iconBg = "bg-blue-100 text-blue-600 border-blue-200";
                      } else if (step.type === 'condition') {
                        badgeColor = "bg-orange-50 text-orange-700 border-orange-200";
                        iconBg = "bg-orange-100 text-orange-600 border-orange-200";
                      } else if (step.type === 'delay') {
                        badgeColor = "bg-zinc-100 text-zinc-700 border-zinc-200";
                        iconBg = "bg-zinc-100 text-zinc-600 border-zinc-200";
                      }

                      return (
                        <div key={step.id} className="relative group/node">
                          {idx !== playbookSteps.length - 1 && (
                            <div className="absolute -left-[33px] top-8 bottom-[-3rem] w-px border-l-2 border-dashed border-zinc-200 z-0"></div>
                          )}

                          <div className={`absolute -left-[48px] top-3 w-8 h-8 rounded-full ${iconBg} border flex items-center justify-center font-medium text-xs shadow-sm z-10`}>
                            {idx + 1}
                          </div>

                          <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-violet-300 transition-all shadow-sm relative group">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3 w-full">
                                <span className={`text-[13px] font-medium  px-2 py-1 rounded border ${badgeColor}`}>
                                  {step.type}
                                </span>
                                <input 
                                  type="text"
                                  value={step.title}
                                  onChange={(e) => updateStepTitle(step.id, e.target.value)}
                                  className="bg-transparent border-none text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 rounded px-1.5 w-full max-w-sm text-sm"
                                />
                              </div>
                              <button onClick={() => deleteStep(step.id)} className="text-zinc-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <input 
                              type="text"
                              value={step.value}
                              onChange={(e) => updateStepValue(step.id, e.target.value)}
                              placeholder="Type rule, keyword, or payload..."
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-12 pt-6 border-t border-zinc-100 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex gap-2">
                      <button onClick={() => addPlaybookStep('trigger')} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-medium transition-colors">
                        + Trigger
                      </button>
                      <button onClick={() => addPlaybookStep('condition')} className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-md text-xs font-medium transition-colors">
                        + Condition
                      </button>
                      <button onClick={() => addPlaybookStep('action')} className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-md text-xs font-medium transition-colors">
                        + Action
                      </button>
                      <button onClick={() => addPlaybookStep('delay')} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-md text-xs font-medium transition-colors">
                        + Delay
                      </button>
                    </div>
                    <button onClick={handleSavePlaybook} disabled={isSaving} className="bg-violet-600 text-white hover:bg-violet-700 transition-colors px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50">
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Sequence
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
                  <div className="relative z-10">
                    <h4 className="font-semibold flex items-center gap-2 mb-3 text-white text-lg">
                      <Sparkles size={20} className="text-violet-200" /> Playbook Engine
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-violet-100/90 mb-5">
                      Flazly sequences allow you to map deterministic paths alongside AI generation. Control exactly what links are sent when conditions are met.
                    </p>
                    <button className="w-full bg-white text-violet-700 hover:bg-violet-50 transition-colors shadow-sm py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2">
                      <Play size={14} /> Run Test Simulation
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-base font-semibold text-zinc-900 mb-5">Sequence Telemetry</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                      <span className="text-sm font-medium text-zinc-500">Executions</span>
                      <span className="text-sm font-medium text-zinc-900">1,482</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                      <span className="text-sm font-medium text-zinc-500">Success Rate</span>
                      <span className="text-sm font-medium text-emerald-600">98.4%</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-zinc-500">Avg. Dwell Time</span>
                      <span className="text-sm font-medium text-zinc-900">4.5 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMMENT TO DM */}
          {activeTab === 'comment' && (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section className="surface overflow-hidden">
                  <div className="surface-head">
                    <div>
                      <h2><span className="icon-tile is-sm"><Plus size={16} /></span>New comment trigger</h2>
                      <p>Send a DM automatically when someone comments a keyword.</p>
                    </div>
                  </div>

                  <div className="surface-body space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label htmlFor="trigger-post" className="field-label">Target post</label>
                        <select
                          id="trigger-post"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          className="field"
                        >
                          <option>Latest Reel</option>
                          <option>Reel: 10x Your Sales</option>
                          <option>All Posts & Reels</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="trigger-keyword" className="field-label">Trigger keyword</label>
                        <input
                          id="trigger-keyword"
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="e.g. LINK or GROW"
                          className="field"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="trigger-reply" className="field-label">DM to send</label>
                      <textarea
                        id="trigger-reply"
                        value={newReplyMessage}
                        onChange={(e) => setNewReplyMessage(e.target.value)}
                        placeholder="Hey! Thanks for commenting. Here is the link you requested..."
                        rows={3}
                        className="field"
                      />
                    </div>
                  </div>

                  <div className="surface-foot justify-end">
                    <button onClick={addCommentTrigger} className="btn btn-primary">
                      <Plus size={16} /> Create trigger
                    </button>
                  </div>
                </section>

                <section className="surface overflow-hidden">
                  <div className="surface-head">
                    <h2>
                      <span className="icon-tile is-sm is-neutral"><MessageSquare size={16} /></span>
                      Active triggers
                      <span className="chip">{commentTriggers.length}</span>
                    </h2>
                  </div>

                  {commentTriggers.length === 0 ? (
                    <div className="empty py-10">
                      <span className="empty-mark"><MessageSquare /></span>
                      <p className="empty-title">No triggers yet</p>
                      <p className="empty-body">Create one above and matching comments get a DM within seconds.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-hairline">
                      {commentTriggers.map((trigger) => (
                        <li key={trigger.id} className="flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center">
                          <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="chip chip-accent">Keyword: {trigger.keyword}</span>
                              <span className="text-[13px] text-ink-soft">on {trigger.postTitle}</span>
                            </div>
                            <p className="truncate text-[14px] text-ink">
                              <span className="mr-1 text-ink-faint">Sends</span>{trigger.replyMessage}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
                              <input
                                type="checkbox"
                                role="switch"
                                className="switch"
                                checked={trigger.isActive}
                                onChange={() => toggleCommentTrigger(trigger.id)}
                              />
                              {trigger.isActive ? 'On' : 'Off'}
                            </label>
                            <button
                              onClick={() => setConfirmDeleteId(trigger.id)}
                              className="btn btn-ghost btn-icon btn-sm is-danger"
                              aria-label={`Delete trigger ${trigger.keyword}`}
                              title="Delete trigger"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <aside className="notice notice-info block">
                <p className="notice-title flex items-center gap-2">
                  <Zap size={16} className="text-viridian" /> Why keyword triggers work
                </p>
                <p className="notice-body mt-1.5 leading-relaxed">
                  They bridge public engagement and private sales. Someone who comments "GROW" has asked
                  for the follow-up, so the DM lands as a reply, not a cold message.
                </p>
              </aside>
            </div>
          )}

          {/* WELCOME FLOW */}
          {activeTab === 'welcome' && (
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
                    <button onClick={handleSaveWelcome} disabled={isSaving} aria-busy={isSaving || undefined} className="btn btn-primary">
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
          {activeTab === 'advanced' && (
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
                        <span className="block text-[14px] font-medium text-ink">Auto-reply</span>
                        <span className="block text-[13px] text-ink-soft">Let the AI answer questions no rule covers.</span>
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
                <button onClick={handleSaveAdvanced} disabled={isSaving} aria-busy={isSaving || undefined} className="btn btn-primary">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save advanced settings
                </button>
              </div>
            </>
          )}

        </>
      )}

      {showCanvas && (
        <PlaybookCanvas
          initialSteps={playbookSteps}
          onClose={() => setShowCanvas(false)}
          onSave={async (steps) => {
            setPlaybookSteps(steps);
            try {
              setIsSaving(true);
              const res = await api.post('/Instagram/Playbook', { steps });
              if (res.data.Success) {
                showToast('Playbook Flow saved successfully!');
                setShowCanvas(false);
              }
            } catch (error) { showToast('Failed to save playbook.', 'error'); }
            finally { setIsSaving(false); }
          }}
        />
      )}

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title="Delete Trigger"
        message="Are you sure you want to delete this mapping?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={deleteCommentTrigger}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default Automation;
