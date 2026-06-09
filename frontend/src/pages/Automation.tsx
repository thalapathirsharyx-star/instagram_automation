import React, { useState, useEffect } from 'react';
import { 
  Sparkles, MessageSquare, Save, Loader2, Info, Send, Bot, Zap, Plus, 
  Trash2, GitBranch, Play, ArrowRight, Clock, Settings, Layers, 
  HelpCircle, Activity, Workflow, Moon, Repeat, Heart, CheckCircle2, 
  AlertCircle 
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
  const [activeTab, setActiveTab] = useState<'playbook' | 'comment' | 'welcome' | 'advanced'>('comment');
  const [welcomeMessage, setWelcomeMessage] = useState('');

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

  const TabButton = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`btn-base ${activeTab === id 
        ? 'btn-primary' 
        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 border border-transparent'}`}
    >
      <Icon size={16} /> <span>{label}</span>
    </button>
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automation Workflows</h2>
          <p className="text-zinc-500 text-sm">Configure how AI intercepts conversations, replies to comments, and manages conditional playbooks across your Instagram account.</p>
        </div>

        <div className="flex items-center bg-muted p-1.5 rounded-xl border border-border shrink-0 shadow-sm">
          {/* <TabButton id="playbook" label="Playbook Builder" icon={GitBranch} /> */}
          <TabButton id="comment" label="Comment-to-DM" icon={MessageSquare} />
          <TabButton id="welcome" label="Welcome Flow" icon={Bot} />
          <TabButton id="advanced" label="Advanced Logic" icon={Settings} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-zinc-500 font-medium">
          <Loader2 size={24} className="animate-spin mr-3 text-foreground" /> Loading Automation Config...
        </div>
      ) : (
        <>
          {/* PLAYBOOK BUILDER */}
          {activeTab === 'playbook' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Activity className="text-foreground" size={20} /> Qualification Sequence
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1 font-medium">Design the chronological steps AI uses to evaluate leads.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                      </span>
                      <button 
                        onClick={() => setShowCanvas(true)}
                        className="flex items-center gap-2 text-xs font-bold text-zinc-900 bg-primary px-4 py-2.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
                      >
                        <Workflow size={14} /> Visual Canvas
                      </button>
                    </div>
                  </div>

                  <div className="relative pl-16 space-y-10 py-2">
                    {playbookSteps.map((step, idx) => {
                      let badgeColor = "bg-primary/10 text-foreground border-primary/20";
                      let iconBg = "bg-brand text-foreground border-primary/20";
                      
                      if (step.type === 'trigger') {
                        badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                        iconBg = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                      } else if (step.type === 'condition') {
                        badgeColor = "bg-orange-50 text-orange-700 border-orange-200";
                        iconBg = "bg-orange-100 text-orange-600 border-orange-200";
                      } else if (step.type === 'delay') {
                        badgeColor = "bg-secondary text-zinc-500 border-border";
                        iconBg = "bg-secondary text-zinc-500 border-border";
                      }

                      return (
                        <div key={step.id} className="relative group/node">
                          {idx !== playbookSteps.length - 1 && (
                            <div className="absolute -left-[33px] top-8 bottom-[-3rem] w-px border-l-2 border-dashed border-border z-0"></div>
                          )}

                          <div className={`absolute -left-[48px] top-3 w-8 h-8 rounded-full ${iconBg} border flex items-center justify-center font-bold text-xs shadow-sm z-10`}>
                            {idx + 1}
                          </div>

                          <div className="bg-card border border-border rounded-xl p-5 hover:border-violet-300 transition-all shadow-sm relative group">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3 w-full">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${badgeColor}`}>
                                  {step.type}
                                </span>
                                <input 
                                  type="text"
                                  value={step.title}
                                  onChange={(e) => updateStepTitle(step.id, e.target.value)}
                                  className="bg-transparent border-none text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 rounded px-1.5 w-full max-w-sm text-sm"
                                />
                              </div>
                              <button onClick={() => deleteStep(step.id)} className="text-zinc-500 hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <input 
                              type="text"
                              value={step.value}
                              onChange={(e) => updateStepValue(step.id, e.target.value)}
                              placeholder="Type rule, keyword, or payload..."
                              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-border focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex gap-2">
                      <button onClick={() => addPlaybookStep('trigger')} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-bold transition-colors">
                        + Trigger
                      </button>
                      <button onClick={() => addPlaybookStep('condition')} className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-md text-xs font-bold transition-colors">
                        + Condition
                      </button>
                      <button onClick={() => addPlaybookStep('action')} className="px-3 py-1.5 bg-primary/10 hover:bg-brand text-foreground border border-primary/20 rounded-md text-xs font-bold transition-colors">
                        + Action
                      </button>
                      <button onClick={() => addPlaybookStep('delay')} className="px-3 py-1.5 bg-secondary hover:bg-secondary text-zinc-500 border border-border rounded-md text-xs font-bold transition-colors">
                        + Delay
                      </button>
                    </div>
                    <button onClick={handleSavePlaybook} disabled={isSaving} className="btn-base btn-success px-6 disabled:opacity-50">
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Sequence
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl shadow-md p-6 text-zinc-900 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-card/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
                  <div className="relative z-10">
                    <h4 className="font-bold flex items-center gap-2 mb-3 text-zinc-900 text-lg">
                      <Sparkles size={20} className="text-violet-200" /> Playbook Engine
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-violet-100/90 mb-5">
                      Flazly sequences allow you to map deterministic paths alongside AI generation. Control exactly what links are sent when conditions are met.
                    </p>
                    <button className="w-full bg-card text-foreground hover:bg-primary/10 transition-colors shadow-sm py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2">
                      <Play size={14} /> Run Test Simulation
                    </button>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h4 className="text-base font-bold text-foreground mb-5">Sequence Telemetry</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm font-medium text-zinc-500">Executions</span>
                      <span className="text-sm font-bold text-foreground">1,482</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm font-medium text-zinc-500">Success Rate</span>
                      <span className="text-sm font-bold text-emerald-400">98.4%</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-zinc-500">Avg. Dwell Time</span>
                      <span className="text-sm font-bold text-foreground">4.5 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMMENT TO DM */}
          {activeTab === 'comment' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                    <Plus size={20} className="text-foreground" /> New Comment Trigger
                  </h3>
                  <p className="text-sm text-zinc-500 mb-6 font-medium">Map post comments directly to AI-driven DM workflows.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Target Post</label>
                      <select 
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full bg-muted border border-border px-4 py-2.5 rounded-lg text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-border transition-all"
                      >
                        <option>Latest Reel</option>
                        <option>Reel: 10x Your Sales</option>
                        <option>All Posts & Reels</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Trigger Keyword</label>
                      <input 
                        type="text" 
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="e.g. LINK or GROW" 
                        className="w-full bg-muted border border-border px-4 py-2.5 rounded-lg text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-border transition-all"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Automated DM Payload</label>
                    <textarea 
                      value={newReplyMessage}
                      onChange={(e) => setNewReplyMessage(e.target.value)}
                      placeholder="Hey! Thanks for commenting. Here is the link you requested..." 
                      rows={3}
                      className="w-full bg-muted border border-border p-4 rounded-lg text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-border transition-all resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <button onClick={addCommentTrigger} className="btn-base btn-primary px-6">
                      <Plus size={16} /> Create Trigger
                    </button>
                  </div>
                </div>

                <div className="border bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <MessageSquare size={18} className="text-foreground" /> Active Mappings
                    </h3>
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {commentTriggers.length === 0 ? (
                      <div className="p-12 text-center text-zinc-500 text-sm">No triggers configured yet.</div>
                    ) : commentTriggers.map((trigger) => (
                      <div key={trigger.id} className="p-6 hover:bg-muted transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 max-w-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-brand text-foreground rounded border border-primary/20">
                              IF: {trigger.keyword}
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-500">
                              Target: {trigger.postTitle}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-500 font-medium truncate">
                            <span className="text-zinc-500 font-bold mr-1">THEN:</span> {trigger.replyMessage}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={trigger.isActive} onChange={() => toggleCommentTrigger(trigger.id)} />
                            <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                          <button onClick={() => setConfirmDeleteId(trigger.id)} className="text-zinc-500 hover:text-destructive transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                  <h4 className="font-bold flex items-center gap-2 mb-2 text-foreground">
                    <Zap size={18} className="text-foreground" /> Conversion Strategy
                  </h4>
                  <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                    Keyword triggers bridge the gap between public engagement and private sales. When a user comments "GROW", they are granting implicit permission to initiate a DM sequence.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* WELCOME FLOW */}
          {activeTab === 'welcome' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Onboarding Payload</h3>
                      <p className="text-zinc-500 text-sm">The first message sent to net-new inbound conversations.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea 
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Hi there! Thanks for reaching out. How can I help you today?"
                      rows={5}
                      className="w-full bg-muted border border-border p-4 rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-border transition-all resize-none"
                    />
                    <div className="absolute bottom-3 right-4 text-[10px] font-bold text-zinc-500 bg-card px-2 py-0.5 rounded border border-border">
                      {welcomeMessage.length} CHARS
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end pt-4 border-t border-border">
                    <button onClick={handleSaveWelcome} disabled={isSaving} className="btn-base btn-success px-6 disabled:opacity-50">
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Payload
                    </button>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-6">Global Hand-off Rules</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-foreground text-sm">Artificial Typing Delay</div>
                        <p className="text-[11px] text-zinc-500 font-medium">Inject latency to simulate human response times.</p>
                      </div>
                      <select className="bg-muted border border-border px-3 py-2 rounded-lg text-sm font-semibold text-foreground outline-none">
                        <option>Instant (0s)</option>
                        <option>Natural (2-5s)</option>
                        <option>Deliberate (5-10s)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-[500px] flex flex-col">
                  <h4 className="text-sm font-bold text-foreground mb-6 flex justify-between items-center">
                    Simulated Output <span className="text-[10px] bg-secondary text-zinc-500 px-2 py-1 rounded">PREVIEW</span>
                  </h4>
                  
                  <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2">
                    <div className="flex flex-col items-start w-full">
                      <div className="bg-secondary text-foreground px-4 py-2.5 rounded-2xl rounded-bl-sm text-[13px] font-medium max-w-[85%]">
                        Hey! I saw your post.
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 ml-1 font-medium">Customer • 12:01 PM</span>
                    </div>
                    
                    <div className="flex flex-col items-end w-full mt-2">
                      <div className="bg-blue-500 text-zinc-900 px-4 py-2.5 rounded-2xl rounded-br-sm text-[13px] font-medium max-w-[85%] shadow-sm whitespace-pre-wrap">
                        {welcomeMessage || 'Your message will render exactly like this.'}
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 mr-1 font-medium">AI Agent • 12:01 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADVANCED TAB */}
          {activeTab === 'advanced' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              
              {/* Routing */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-brand text-foreground rounded-lg">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">AI Routing Engine</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Core inference settings</p>
                  </div>
                </div>
                
                <div className="space-y-5 flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Auto-Reply Enable</h4>
                      <p className="text-[11px] text-zinc-500">Allow AI to answer unmapped queries</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoReplyEnabled} onChange={(e) => setAutoReplyEnabled(e.target.checked)} />
                      <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Escalation Alerts</h4>
                      <p className="text-[11px] text-zinc-500">Ping dashboard when AI stops</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={humanHandoffAlerts} onChange={(e) => setHumanHandoffAlerts(e.target.checked)} />
                      <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Drip */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Repeat size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Retention Drip</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Automatic unread follow-ups</p>
                  </div>
                </div>

                <div className="space-y-4 flex-grow">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <span className="text-sm font-bold text-foreground">Enable Drip Campaign</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoFollowUp} onChange={(e) => setAutoFollowUp(e.target.checked)} />
                      <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  {autoFollowUp && (
                    <div className="space-y-3 pt-2">
                      <select value={autoFollowUpDelayHours} onChange={(e) => setAutoFollowUpDelayHours(Number(e.target.value))} className="w-full bg-muted border border-border px-3 py-2 rounded-lg text-sm font-semibold text-foreground outline-none">
                        <option value={1}>1 hour delay</option>
                        <option value={24}>24 hours delay (Recommended)</option>
                        <option value={48}>48 hours delay</option>
                      </select>
                      <textarea value={autoFollowUpMessage} onChange={(e) => setAutoFollowUpMessage(e.target.value)} placeholder="Just checking in!" className="w-full bg-muted border border-border p-3 rounded-lg text-sm resize-none" rows={2}/>
                    </div>
                  )}
                </div>
              </div>

              {/* Mentions */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-pink-100 text-brand rounded-lg">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Story Mentions</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Engage brand advocates</p>
                  </div>
                </div>

                <div className="space-y-4 flex-grow">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <span className="text-sm font-bold text-foreground">Auto-Reply to Mentions</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={storyMentionEnabled} onChange={(e) => setStoryMentionEnabled(e.target.checked)} />
                      <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <textarea disabled={!storyMentionEnabled} value={storyMentionMessage} onChange={(e) => setStoryMentionMessage(e.target.value)} placeholder="Thanks for the mention! 💖" className="w-full bg-muted border border-border p-3 rounded-lg text-sm resize-none disabled:opacity-50" rows={2}/>
                </div>
              </div>

              {/* OOO */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-brand text-brand rounded-lg">
                    <Moon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Away Operations</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Manage expectations during downtime</p>
                  </div>
                </div>

                <div className="space-y-3 flex-grow">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="time" value={workingHoursStart} onChange={e => setWorkingHoursStart(e.target.value)} className="bg-muted border border-border px-3 py-2 rounded-lg text-sm font-semibold text-foreground outline-none" />
                    <input type="time" value={workingHoursEnd} onChange={e => setWorkingHoursEnd(e.target.value)} className="bg-muted border border-border px-3 py-2 rounded-lg text-sm font-semibold text-foreground outline-none" />
                  </div>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full bg-muted border border-border px-3 py-2 rounded-lg text-sm font-semibold text-foreground outline-none">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (US)</option>
                    <option value="America/Los_Angeles">Pacific Time (US)</option>
                  </select>
                  <textarea value={oooMessage} onChange={e => setOooMessage(e.target.value)} placeholder="We are currently closed..." className="w-full bg-muted border border-border p-3 rounded-lg text-sm resize-none" rows={2}/>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="mt-6 flex justify-end">
              <button onClick={handleSaveAdvanced} disabled={isSaving} className="btn-base btn-success px-8 disabled:opacity-50">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save All Advanced Rules
              </button>
            </div>
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
