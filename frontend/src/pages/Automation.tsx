import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Save, 
  Loader2, 
  Info, 
  Send, 
  Bot, 
  Zap, 
  Plus, 
  Trash2, 
  GitBranch, 
  Play, 
  ArrowRight, 
  Clock, 
  Settings,
  Layers,
  HelpCircle,
  Activity,
  Workflow,
  Moon,
  Repeat,
  Heart
} from 'lucide-react';
import api from '../lib/axios';
import PlaybookCanvas from '../components/PlaybookCanvas';

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
  const [activeTab, setActiveTab] = useState<'playbook' | 'comment' | 'welcome' | 'advanced'>('playbook');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Advanced Settings State
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
  const [toastMessage, setToastMessage] = useState<{title: string, type: 'success' | 'error'} | null>(null);

  const showToast = (title: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Visual Playbook Builder State
  const [playbookSteps, setPlaybookSteps] = useState<PlaybookStep[]>([]);

  // Comment-to-DM Trigger State
  const [commentTriggers, setCommentTriggers] = useState<CommentTrigger[]>([]);

  // New Trigger Form State
  const [newPostTitle, setNewPostTitle] = useState('Latest Reel');
  const [newKeyword, setNewKeyword] = useState('');
  const [newReplyMessage, setNewReplyMessage] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchPlaybook();
    fetchCommentTriggers();
  }, []);

  const fetchCommentTriggers = async () => {
    try {
      const res = await api.get('/Instagram/CommentTriggers');
      if (res.data.Success && Array.isArray(res.data.Data)) {
        const mapped = res.data.Data.map((item: any) => ({
          id: item.id,
          postTitle: item.post_title,
          keyword: item.keyword,
          replyMessage: item.reply_message,
          isActive: item.is_active
        }));
        setCommentTriggers(mapped);
      }
    } catch (error) {
      console.error('Error fetching comment triggers:', error);
    }
  };

  const fetchPlaybook = async () => {
    try {
      const res = await api.get('/Instagram/Playbook');
      if (res.data.Success && Array.isArray(res.data.Data) && res.data.Data.length > 0) {
        setPlaybookSteps(res.data.Data);
      } else if (res.data.Success && (!res.data.Data || res.data.Data.length === 0)) {
        // If empty, we can provide a default example or leave empty
        setPlaybookSteps([
          { id: '1', type: 'trigger', title: 'When user sends DM containing keyword', value: 'price, cost, buy' },
          { id: '2', type: 'action', title: 'Send Automated Catalog & Pricing Menu', value: 'ReplyZens Pro Catalog Link' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching playbook:', error);
    }
  };

  const handleSavePlaybook = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/Playbook', { steps: playbookSteps });
      if (res.data.Success) {
        showToast('Playbook saved successfully!');
      }
    } catch (error) {
      console.error('Error saving playbook:', error);
      showToast('Failed to save playbook.', 'error');
    } finally {
      setIsSaving(false);
    }
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
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWelcome = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/Welcome', { message: welcomeMessage });
      if (res.data.Success) {
        showToast('Welcome message updated successfully!');
      }
    } catch (error) {
      console.error('Error saving welcome message:', error);
      showToast('Failed to save welcome message.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAdvanced = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/Settings', { 
        auto_follow_up_enabled: autoFollowUp,
        auto_follow_up_delay_hours: autoFollowUpDelayHours,
        auto_follow_up_message: autoFollowUpMessage,
        story_mention_enabled: storyMentionEnabled,
        story_mention_message: storyMentionMessage,
        auto_reply_enabled: autoReplyEnabled,
        human_handoff_alerts: humanHandoffAlerts,
        timezone,
        working_hours_start: workingHoursStart,
        working_hours_end: workingHoursEnd,
        ooo_message: oooMessage
      });
      if (res.data.Success) {
        showToast('Advanced settings updated successfully!');
      }
    } catch (error) {
      console.error('Error saving advanced settings:', error);
      showToast('Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Playbook Handlers
  const addPlaybookStep = (type: 'trigger' | 'condition' | 'action' | 'delay') => {
    const defaultTitles = {
      trigger: 'Trigger:',
      condition: 'Condition:',
      action: 'Action:',
      delay: 'Delay:'
    };
    const defaultValues = {
      trigger: '',
      condition: '',
      action: '',
      delay: ''
    };
    const newStep: PlaybookStep = {
      id: Date.now().toString(),
      type,
      title: defaultTitles[type],
      value: defaultValues[type]
    };
    setPlaybookSteps(prev => [...prev, newStep]);
  };

  const updateStepValue = (id: string, value: string) => {
    setPlaybookSteps(prev => prev.map(step => step.id === id ? { ...step, value } : step));
  };

  const updateStepTitle = (id: string, title: string) => {
    setPlaybookSteps(prev => prev.map(step => step.id === id ? { ...step, title } : step));
  };

  const deleteStep = (id: string) => {
    setPlaybookSteps(prev => prev.filter(step => step.id !== id));
  };

  // Comment Handlers
  const addCommentTrigger = async () => {
    if (!newKeyword || !newReplyMessage) {
      showToast('Please fill in all trigger details.', 'error');
      return;
    }
    try {
      const res = await api.post('/Instagram/CommentTriggers', {
        postTitle: newPostTitle,
        keyword: newKeyword.toUpperCase().trim(),
        replyMessage: newReplyMessage
      });
      if (res.data.Success) {
        const item = res.data.Data;
        const newTrigger: CommentTrigger = {
          id: item.id,
          postTitle: item.post_title,
          keyword: item.keyword,
          replyMessage: item.reply_message,
          isActive: item.is_active
        };
        setCommentTriggers([newTrigger, ...commentTriggers]);
        setNewKeyword('');
        setNewReplyMessage('');
        showToast('Comment trigger created successfully!');
      }
    } catch (error) {
      console.error('Error creating comment trigger:', error);
      showToast('Failed to create trigger.', 'error');
    }
  };

  const toggleCommentTrigger = async (id: string) => {
    try {
      const res = await api.post(`/Instagram/CommentTriggers/${id}/toggle`);
      if (res.data.Success) {
        setCommentTriggers(commentTriggers.map(t => 
          t.id === id ? { ...t, isActive: res.data.Data.is_active } : t
        ));
        showToast('Trigger updated successfully!');
      }
    } catch (error) {
      console.error('Error toggling comment trigger:', error);
      showToast('Failed to update trigger status.', 'error');
    }
  };

  const deleteCommentTrigger = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trigger?')) return;
    try {
      const res = await api.delete(`/Instagram/CommentTriggers/${id}`);
      if (res.data.Success) {
        setCommentTriggers(commentTriggers.filter(t => t.id !== id));
        showToast('Trigger deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting comment trigger:', error);
      showToast('Failed to delete trigger.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10 relative">
      
      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/5 backdrop-blur-md">
          {toastMessage.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <span className="text-xs font-bold text-emerald-500">✓</span>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
              <span className="text-xs font-bold text-red-500">!</span>
            </div>
          )}
          <span className="font-semibold text-sm text-slate-800 dark:text-zinc-100">{toastMessage.title}</span>
        </div>
      )}

      {/* HEADER & TABS */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Automation Center</h1>
          <p className="text-zinc-400 font-medium">Create visual playbooks, keyword reply flows, and set auto-responders.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-zinc-900/60 p-1.5 rounded-2xl border border-white/5 self-start">
          <button 
            onClick={() => setActiveTab('playbook')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'playbook' 
                ? 'bg-purple-600 text-white shadow-glow-purple' 
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <GitBranch size={16} />
            <span>Playbook Builder</span>
          </button>
          <button 
            onClick={() => setActiveTab('comment')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'comment' 
                ? 'bg-purple-600 text-white shadow-glow-purple' 
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <MessageSquare size={16} />
            <span>Comment-to-DM</span>
          </button>
          <button 
            onClick={() => setActiveTab('welcome')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'welcome' 
                ? 'bg-purple-600 text-white shadow-glow-purple' 
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <MessageSquare size={16} />
            <span>Welcome Message</span>
          </button>
          <button 
            onClick={() => setActiveTab('advanced')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'advanced' 
                ? 'bg-purple-600 text-white shadow-glow-purple' 
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Settings size={16} />
            <span>Advanced AI</span>
          </button>
        </div>
      </div>

      {/* VIEW RENDERERS */}
      {activeTab === 'playbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Visual Playbook Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="w3-card border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
                    <Activity className="text-purple-400" size={22} /> Lead Qualification Flow
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1 font-medium">Design the sequence AI uses to capture customer info.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    ACTIVE
                  </span>
                  <button 
                    onClick={() => setShowCanvas(true)}
                    className="flex items-center gap-2 text-xs font-bold text-white bg-zinc-950 dark:bg-white dark:text-zinc-950 px-4 py-2 rounded-lg shadow-sm transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-800 dark:border-transparent"
                  >
                    <Workflow size={14} /> Open Canvas
                  </button>
                </div>
              </div>

              {/* Visual Timeline Nodes */}
              <div className="relative pl-8 space-y-12 py-2 ml-4">
                {playbookSteps.map((step, idx) => {
                  let badgeColor = "bg-purple-100 text-purple-700 border-transparent dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
                  if (step.type === 'trigger') badgeColor = "bg-sky-100 text-sky-700 border-transparent dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
                  if (step.type === 'condition') badgeColor = "bg-amber-100 text-amber-700 border-transparent dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
                  if (step.type === 'delay') badgeColor = "bg-zinc-100 text-zinc-700 border-transparent dark:bg-zinc-800 dark:text-zinc-400 dark:border-white/5";

                  return (
                    <div key={step.id} className="relative group/node">
                      
                      {/* Dotted line to next node */}
                      {idx !== playbookSteps.length - 1 && (
                        <div className="absolute -left-[40px] top-7 bottom-[-3.5rem] w-px border-l-2 border-dashed border-slate-300 dark:border-white/10 z-0"></div>
                      )}

                      {/* Node circle on timeline */}
                      <div className="absolute -left-[53px] top-1.5 w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-700 flex items-center justify-center group-hover/node:border-purple-500 transition-colors z-10">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">{idx + 1}</span>
                      </div>

                      {/* Node Card */}
                      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all shadow-md relative">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${badgeColor}`}>
                              {step.type}
                            </span>
                            <input 
                              type="text"
                              value={step.title}
                              onChange={(e) => updateStepTitle(step.id, e.target.value)}
                              placeholder={`Enter ${step.type} title...`}
                              className="bg-transparent border-none text-zinc-200 font-bold focus:outline-none focus:ring-1 focus:ring-purple-500/30 rounded px-1 w-64 text-sm"
                            />
                          </div>
                          <button 
                            onClick={() => deleteStep(step.id)}
                            className="text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/5 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <input 
                          type="text"
                          value={step.value}
                          onChange={(e) => updateStepValue(step.id, e.target.value)}
                          placeholder="Type your rule, keyword, or action here..."
                          className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 font-medium focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Node Menu */}
              <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-4 items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mr-2">Add Step:</span>
                <button 
                  onClick={() => addPlaybookStep('trigger')}
                  className="px-4 py-2 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 border border-sky-500/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Trigger
                </button>
                <button 
                  onClick={() => addPlaybookStep('condition')}
                  className="px-4 py-2 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 border border-amber-500/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Condition
                </button>
                <button 
                  onClick={() => addPlaybookStep('action')}
                  className="px-4 py-2 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 border border-purple-500/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Action
                </button>
                <button 
                  onClick={() => addPlaybookStep('delay')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 border border-white/5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Delay
                </button>
                <div className="ml-auto">
                  <button 
                    onClick={handleSavePlaybook} 
                    disabled={isSaving}
                    className="w3-button-primary px-6 shadow-glow-purple h-full"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span className="ml-2">Save Playbook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - playbooks instructions */}
          <div className="space-y-8">
            <div className="w3-card bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/20 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-purple-200">
                  <Sparkles size={18} /> Smart Playbooks
                </h4>
                <p className="text-sm font-medium leading-relaxed text-purple-100/80 mb-4">
                  ReplyZens playbooks allow you to map out paths the AI should steer leads through. Ask for key criteria, evaluate intent, and handover to sales seamlessly.
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                    <Play size={12} /> Test Flow
                  </button>
                </div>
              </div>
              <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-purple-500 opacity-20 blur-xl" />
            </div>

            <div className="w3-card border-white/5">
              <h4 className="text-lg font-bold text-zinc-100 mb-6">Playbook Analytics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-sm font-medium text-zinc-400">Total Runs</span>
                  <span className="text-sm font-bold text-zinc-100">1,482 times</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-sm font-medium text-zinc-400">Completion Rate</span>
                  <span className="text-sm font-bold text-zinc-100">68.4%</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-zinc-400">Avg. Delay Time</span>
                  <span className="text-sm font-bold text-zinc-100">4.5 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Comment List / Database table */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Create New Trigger Card */}
            <div className="w3-card border-white/5">
              <h3 className="text-xl font-bold text-zinc-100 mb-2 flex items-center gap-3">
                <Plus size={22} className="text-purple-400" /> Create Comment Trigger
              </h3>
              <p className="text-sm text-zinc-400 mb-8 font-medium">Link post comments containing specific keywords to a personalized DM payload.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-semibold text-zinc-300 block mb-2">Instagram Post / Reel</label>
                  <select 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 px-4 py-3 rounded-xl text-sm font-bold text-zinc-300 outline-none"
                  >
                    <option>Latest Reel</option>
                    <option>Reel: 10x Your Instagram Sales in 2026</option>
                    <option>Post: How RAG works for Social Media Leads</option>
                    <option>All Posts & Reels</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-300 block mb-2">Comment Keyword</label>
                  <input 
                    type="text" 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="e.g. GROW" 
                    className="w-full w3-input px-4 py-3 text-sm font-medium shadow-sm bg-zinc-900/50 border-white/5"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="text-sm font-semibold text-zinc-300 block mb-2">Automated Reply Message (Sent to DM)</label>
                <textarea 
                  value={newReplyMessage}
                  onChange={(e) => setNewReplyMessage(e.target.value)}
                  placeholder="Hey! Thanks for commenting. Here is the link..." 
                  rows={4}
                  className="w-full w3-input p-4 text-sm font-medium shadow-sm bg-zinc-900/50 border-white/5 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={addCommentTrigger}
                  className="w3-button-primary px-8 shadow-glow-purple"
                >
                  <Plus size={18} />
                  <span>Create Trigger</span>
                </button>
              </div>
            </div>

            {/* Mappings Table */}
            <div className="w3-card border-white/5">
              <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
                <MessageSquare size={22} className="text-purple-400" /> Active Comment Triggers
              </h3>

              <div className="space-y-4">
                {commentTriggers.map((trigger) => (
                  <div key={trigger.id} className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-purple-500/25 transition-all">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">
                            Keyword: {trigger.keyword}
                          </span>
                          <span className="text-xs font-medium text-zinc-400">
                            On: {trigger.postTitle}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                          {trigger.replyMessage}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Toggle active switch */}
                        <div 
                          onClick={() => toggleCommentTrigger(trigger.id)}
                          className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${
                            trigger.isActive ? 'bg-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.3)]' : 'bg-zinc-800 border border-white/5'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                            trigger.isActive ? 'right-1' : 'left-1'
                          }`}></div>
                        </div>

                        <button 
                          onClick={() => deleteCommentTrigger(trigger.id)}
                          className="text-zinc-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/5 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Instructions Panel */}
          <div className="space-y-8">
            <div className="w3-card bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/20 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-purple-200">
                  <Zap size={18} /> Instagram Marketing
                </h4>
                <p className="text-sm font-medium leading-relaxed text-purple-100/80">
                  Setting Comment-to-DM triggers is the single most effective way to turn general social media engagements into tracked pipeline leads. Use clear keywords like "GROW" or "DETAILS" on your reels to capture sales leads immediately.
                </p>
              </div>
              <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-purple-500 opacity-20 blur-xl" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'welcome' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Welcome Message Card */}
            <div className="w3-card border-white/5">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-grow pr-12">
                  <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20"><MessageSquare size={20} /></div> Welcome Message
                  </h3>
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                    Sent automatically to every <strong className="text-purple-400">new customer</strong> who DMs you for the first time.
                  </p>
                </div>
                <div className="w-12 h-6 bg-purple-500 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="relative group">
                <textarea 
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="e.g. Hi there! Thanks for reaching out..."
                  rows={6}
                  className="w-full w3-input p-6 text-base font-medium resize-none shadow-sm focus:ring-4 focus:ring-purple-500/10 bg-zinc-900/50 border-white/5"
                />
                <div className="absolute bottom-4 right-6 text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-white/5">
                  {welcomeMessage.length} CHARACTERS
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSaveWelcome} 
                  disabled={isSaving}
                  className="w3-button-primary px-10 shadow-glow-purple"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  <span>Save Automation</span>
                </button>
              </div>
            </div>

            {/* AI Response Settings */}
            <div className="w3-card border-white/5">
               <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20"><Bot size={20} /></div> AI Response Logic
               </h3>
               <p className="text-sm text-zinc-400 font-medium mb-8">
                  Fine-tune how the AI generates replies after the initial welcome.
               </p>

               <div className="space-y-4">
                  <div className="flex justify-between items-center p-6 bg-zinc-900/50 rounded-2xl border border-white/5">
                     <div>
                        <div className="font-bold text-zinc-100 mb-1">Response Delay</div>
                        <p className="text-xs text-zinc-500 font-medium">Simulate human typing by adding a small delay.</p>
                     </div>
                     <select className="bg-zinc-800 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold text-zinc-300 outline-none">
                        <option>Instant</option>
                        <option>2-5 seconds</option>
                        <option>5-10 seconds</option>
                     </select>
                  </div>

                  <div className="flex justify-between items-center p-6 bg-zinc-900/50 rounded-2xl border border-white/5">
                     <div>
                        <div className="font-bold text-zinc-100 mb-1">Human Handoff</div>
                        <p className="text-xs text-zinc-500 font-medium">Notify team if AI cannot answer a question.</p>
                     </div>
                     <div className="w-12 h-6 bg-purple-500 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="w3-card bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/20 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-purple-200">
                  <Sparkles size={18} /> Pro Tip
                </h4>
                <p className="text-sm font-medium leading-relaxed text-purple-100/80">
                  A warm welcome message increases customer trust by 40%. Keep it short, friendly, and set clear expectations for when a human might jump in.
                </p>
              </div>
              <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-purple-500 opacity-20 blur-xl" />
            </div>

            <div className="w3-card border-white/5">
              <h4 className="text-lg font-bold text-zinc-100 mb-6">Live Preview</h4>
              <div className="bg-zinc-900/50 rounded-3xl p-6 border border-white/5 shadow-inner">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Customer DMs...</span>
                    <div className="bg-zinc-800 text-zinc-300 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm font-medium border border-white/5">
                      Hello! 👋
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 mr-1 text-right">Your AI replies...</span>
                    <div className="bg-purple-600 text-white p-4 rounded-2xl rounded-tr-none shadow-[0_4px_15px_rgba(147,51,234,0.3)] text-sm font-medium border border-purple-500">
                      {welcomeMessage || 'Your welcome message will appear here.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            } catch (error) {
              console.error('Error saving playbook:', error);
              showToast('Failed to save playbook.', 'error');
            } finally {
              setIsSaving(false);
            }
          }}
        />
      )}
      {/* ADVANCED TAB */}
      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          
          {/* AI Automation */}
          <div className="w3-card flex flex-col h-full border-white/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl shadow-inner border border-purple-500/20">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">AI Routing & Discovery</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure how the AI interacts with new leads.</p>
              </div>
            </div>

            <div className="flex-grow space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h4 className="text-sm font-medium text-zinc-100">Auto-Reply Discovery</h4>
                  <p className="text-xs text-zinc-400 mt-1">Automatically answer basic lead inquiries using Brain Base.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={autoReplyEnabled} onChange={(e) => setAutoReplyEnabled(e.target.checked)} />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h4 className="text-sm font-medium text-zinc-100">Human Handoff Alerts</h4>
                  <p className="text-xs text-zinc-400 mt-1">Notify your team when a lead requires human attention.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={humanHandoffAlerts} onChange={(e) => setHumanHandoffAlerts(e.target.checked)} />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={handleSaveAdvanced}
                disabled={isSaving}
                className="btn-primary w-full sm:w-auto"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Auto Follow-up */}
          <div className="w3-card flex flex-col h-full border-white/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl shadow-inner border border-purple-500/20">
                <Repeat size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Drip Campaigns</h3>
                <p className="text-xs text-zinc-400 mt-1">Automatically follow up with silent hot leads.</p>
              </div>
            </div>

            <div className="flex-grow space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h4 className="text-sm font-medium text-zinc-100">Enable Auto Follow-Up</h4>
                  <p className="text-xs text-zinc-400 mt-1">If a lead hasn't replied, AI sends a check-in DM.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={autoFollowUp} onChange={(e) => setAutoFollowUp(e.target.checked)} />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {autoFollowUp && (
                <div className="space-y-4 border-t border-white/5 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Follow-Up Delay Time</label>
                    <select 
                      value={autoFollowUpDelayHours} 
                      onChange={(e) => setAutoFollowUpDelayHours(Number(e.target.value))} 
                      className="w-full bg-zinc-900 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-300 outline-none focus:border-purple-500/50"
                    >
                      <option value={1}>1 hour of silence</option>
                      <option value={6}>6 hours of silence</option>
                      <option value={12}>12 hours of silence</option>
                      <option value={24}>24 hours of silence (Recommended)</option>
                      <option value={48}>48 hours of silence</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Custom Follow-Up Nudge Template</label>
                    <textarea 
                      value={autoFollowUpMessage} 
                      onChange={(e) => setAutoFollowUpMessage(e.target.value)}
                      placeholder="e.g. Hey! Just checking in to see if you had any other questions or needed help with anything?"
                      rows={3}
                      className="w-full w3-input min-h-[80px] text-sm resize-none text-zinc-100 p-3"
                    />
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex gap-3">
                  <Info className="text-blue-500 flex-shrink-0" size={18} />
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    This directly increases sales by recovering abandoned conversations. The AI will send a gentle nudge ONLY if the customer was marked as a "Hot" lead and you sent the last message.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={handleSaveAdvanced}
                disabled={isSaving}
                className="btn-primary w-full sm:w-auto"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Out of Office */}
          <div className="w3-card flex flex-col h-full border-white/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl shadow-inner border border-purple-500/20">
                <Moon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Away Mode (OOO)</h3>
                <p className="text-xs text-zinc-400 mt-1">Set expectations when you are closed.</p>
              </div>
            </div>

            <div className="flex-grow space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Start Time</label>
                  <input type="time" value={workingHoursStart} onChange={e => setWorkingHoursStart(e.target.value)} className="w3-input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">End Time</label>
                  <input type="time" value={workingHoursEnd} onChange={e => setWorkingHoursEnd(e.target.value)} className="w3-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Timezone</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w3-input text-sm text-zinc-100">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (US)</option>
                  <option value="America/Los_Angeles">Pacific Time (US)</option>
                  <option value="Europe/London">London (UK)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Out of Office Fallback Message</label>
                <textarea 
                  value={oooMessage} 
                  onChange={e => setOooMessage(e.target.value)}
                  placeholder="e.g. We are currently closed. A human will review this chat tomorrow morning."
                  className="w3-input min-h-[100px] text-sm resize-none text-zinc-100"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={handleSaveAdvanced}
                disabled={isSaving}
                className="btn-primary w-full sm:w-auto"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>
          
          {/* Story Mentions */}
          <div className="w3-card flex flex-col h-full border-white/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl shadow-inner border border-pink-500/20">
                <Heart size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Story Mentions</h3>
                <p className="text-xs text-zinc-400 mt-1">Reward followers who tag you in their Stories.</p>
              </div>
            </div>

            <div className="flex-grow space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h4 className="text-sm font-medium text-zinc-100">Enable Story Replies</h4>
                  <p className="text-xs text-zinc-400 mt-1">Instantly DM users who mention you.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={storyMentionEnabled} onChange={(e) => setStoryMentionEnabled(e.target.checked)} />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Automated DM Content</label>
                <textarea 
                  value={storyMentionMessage} 
                  onChange={e => setStoryMentionMessage(e.target.value)}
                  placeholder="Thanks for the shoutout! 💖 Here is a 10% discount code for your next purchase: STORY10"
                  className="w3-input min-h-[100px] text-sm resize-none text-zinc-100"
                />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={handleSaveAdvanced}
                disabled={isSaving}
                className="btn-primary w-full sm:w-auto"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Automation;
