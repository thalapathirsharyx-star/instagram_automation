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
  HelpCircle
} from 'lucide-react';
import api from '../lib/axios';

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
  const [activeTab, setActiveTab] = useState<'playbook' | 'comment' | 'welcome'>('playbook');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Visual Playbook Builder State
  const [playbookSteps, setPlaybookSteps] = useState<PlaybookStep[]>([
    { id: '1', type: 'trigger', title: 'When user sends DM containing keyword', value: 'price, cost, buy' },
    { id: '2', type: 'condition', title: 'Check if business hours', value: '9:00 AM - 6:00 PM' },
    { id: '3', type: 'action', title: 'Send Automated Catalog & Pricing Menu', value: 'ReplyZens Pro Catalog Link' },
    { id: '4', type: 'delay', title: 'Wait before next action', value: '2 hours' },
    { id: '5', type: 'action', title: 'Send follow-up query', value: 'Did you find what you were looking for?' }
  ]);

  // Comment-to-DM Trigger State
  const [commentTriggers, setCommentTriggers] = useState<CommentTrigger[]>([
    { 
      id: '1', 
      postTitle: 'Reel: 10x Your Instagram Sales in 2026', 
      keyword: 'GROW', 
      replyMessage: 'Hey! Thanks for commenting. Here is your private signup link for ReplyZens Pro: https://replyzens.com/pro',
      isActive: true 
    },
    { 
      id: '2', 
      postTitle: 'Post: How RAG works for Social Media Leads', 
      keyword: 'BRAIN', 
      replyMessage: 'Thanks for the support! Here is our comprehensive handbook on CRM RAG setups: https://replyzens.com/handbook',
      isActive: true 
    }
  ]);

  // New Trigger Form State
  const [newPostTitle, setNewPostTitle] = useState('Latest Reel');
  const [newKeyword, setNewKeyword] = useState('');
  const [newReplyMessage, setNewReplyMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/Instagram/Settings');
      if (res.data.Success) {
        setWelcomeMessage(res.data.Data?.welcome_message || '');
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
        alert('Welcome message updated successfully!');
      }
    } catch (error) {
      console.error('Error saving welcome message:', error);
      alert('Failed to save welcome message.');
    } finally {
      setIsSaving(false);
    }
  };

  // Playbook Handlers
  const addPlaybookStep = (type: 'trigger' | 'condition' | 'action' | 'delay') => {
    const defaultTitles = {
      trigger: 'Trigger: When keyword matches',
      condition: 'Condition: Check lead profile',
      action: 'Action: Send reply / tag lead',
      delay: 'Delay: Wait duration'
    };
    const defaultValues = {
      trigger: 'info, details',
      condition: 'Is email present?',
      action: 'Send lead qualification catalog',
      delay: '15 minutes'
    };
    const newStep: PlaybookStep = {
      id: Date.now().toString(),
      type,
      title: defaultTitles[type],
      value: defaultValues[type]
    };
    setPlaybookSteps([...playbookSteps, newStep]);
  };

  const updateStepValue = (id: string, value: string) => {
    setPlaybookSteps(playbookSteps.map(step => step.id === id ? { ...step, value } : step));
  };

  const updateStepTitle = (id: string, title: string) => {
    setPlaybookSteps(playbookSteps.map(step => step.id === id ? { ...step, title } : step));
  };

  const deleteStep = (id: string) => {
    setPlaybookSteps(playbookSteps.filter(step => step.id !== id));
  };

  // Comment Handlers
  const addCommentTrigger = () => {
    if (!newKeyword || !newReplyMessage) {
      alert('Please fill in all trigger details.');
      return;
    }
    const newTrigger: CommentTrigger = {
      id: Date.now().toString(),
      postTitle: newPostTitle,
      keyword: newKeyword.toUpperCase().trim(),
      replyMessage: newReplyMessage,
      isActive: true
    };
    setCommentTriggers([...commentTriggers, newTrigger]);
    setNewKeyword('');
    setNewReplyMessage('');
  };

  const toggleCommentTrigger = (id: string) => {
    setCommentTriggers(commentTriggers.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

  const deleteCommentTrigger = (id: string) => {
    setCommentTriggers(commentTriggers.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      
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
        </div>
      </div>

      {/* VIEW RENDERERS */}
      {activeTab === 'playbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Visual Playbook Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="w3-card border-white/5">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
                    <Layers className="text-purple-400" size={22} /> Lead Qualification Flow
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1 font-medium">Design the sequence AI uses to capture customer info.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active</span>
                </div>
              </div>

              {/* Visual Timeline Nodes */}
              <div className="relative pl-8 border-l-2 border-dashed border-zinc-800/80 space-y-12 py-2 ml-4">
                {playbookSteps.map((step, idx) => {
                  let badgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                  if (step.type === 'trigger') badgeColor = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                  if (step.type === 'condition') badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  if (step.type === 'delay') badgeColor = "bg-zinc-800 text-zinc-400 border-white/5";

                  return (
                    <div key={step.id} className="relative group/node">
                      
                      {/* Node circle on timeline */}
                      <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center group-hover/node:border-purple-500 transition-colors">
                        <span className="text-[10px] font-bold text-zinc-400">{idx + 1}</span>
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
    </div>
  );
};

export default Automation;
