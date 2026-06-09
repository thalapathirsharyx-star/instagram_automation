import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Loader2, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, Zap, Activity, Server, ArrowRightLeft, Check, CheckCircle, XCircle } from 'lucide-react';
import { getLLMKeys, updateLLMKeys } from '../api/admin.api';

const LLMKeys: React.FC = () => {
  const [keys, setKeys] = useState({ openai: '', gemini: '', groq: '', active_provider: 'openai', active_model: '' });
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    openai: false,
    gemini: false,
    groq: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; type: 'success' | 'error'; text: string }[]>([]);

  useEffect(() => {
    fetchKeys();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const res = await getLLMKeys();
      if (res?.Data) {
        setKeys(res.Data);
      }
    } catch (err: any) {
      showToast('error', err?.response?.data?.Message || 'Failed to load LLM provider keys.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateLLMKeys(keys);
      if (res.Type === 'Success' || (res as any).Type === 'S') {
        showToast('success', 'AI infrastructure settings synchronized.');
        fetchKeys();
      } else {
        showToast('error', res.Message || 'Failed to save settings.');
      }
    } catch (err: any) {
      showToast('error', err?.response?.data?.Message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = (field: string) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center text-muted-foreground font-medium">
        <Loader2 size={24} className="animate-spin mr-3 text-muted-foreground" /> Initializing AI Infrastructure...
      </div>
    );
  }

  const connectedCount = [keys.openai, keys.gemini, keys.groq].filter(k => k && k.trim() !== '').length;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Toast Notifications container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
              t.type === 'success' 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-card border-destructive/20 text-destructive shadow-rose-100/50'
            }`}
            style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {t.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertTriangle size={18} className="text-destructive" />}
            <span className="text-sm font-medium">{t.text}</span>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />

      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">AI Infrastructure</h2>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Manage the AI providers powering Flazly's automation, lead qualification, customer conversations, and autonomous AI agents.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
            <Server size={14} /> Connected Providers
          </div>
          <div className="text-2xl font-bold text-foreground">{connectedCount} <span className="text-sm font-medium text-muted-foreground">/ 3</span></div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap size={14} /> Active Engine
          </div>
          <div className="text-2xl font-bold text-foreground capitalize">
            {keys.active_provider === 'openai' ? 'OpenAI' : keys.active_provider === 'gemini' ? 'Gemini' : 'Groq'}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} /> System Health
          </div>
          <div className="flex items-center gap-2 text-2xl font-bold text-emerald-400">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
            <Activity size={14} /> Requests Today
          </div>
          <div className="text-2xl font-bold text-foreground">4,231</div>
        </div>
      </div>

      {/* Active Provider Highlight */}
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm mb-8 relative overflow-hidden group hover:border-primary/20 transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active Provider
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">
              {keys.active_provider === 'openai' ? 'OpenAI GPT-4' : keys.active_provider === 'gemini' ? 'Google Gemini Pro' : 'Groq Llama-3'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              Currently intercepting and processing all live user requests. This engine is highly integrated with the platform's core automation loop.
            </p>
            
            <div className="mt-8">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Currently Powering</span>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                {['AI Chat Agents', 'Instagram DM Automation', 'Lead Qualification', 'CRM Sync Workflows'].map(module => (
                  <div key={module} className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Check size={12} className="text-foreground" strokeWidth={3} />
                    </div>
                    {module}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-muted border border-border rounded-xl p-5 w-full lg:w-80 shrink-0 shadow-inner">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Change Default Engine</label>
            <div className="relative mb-4">
              <select 
                value={keys.active_provider}
                onChange={(e) => setKeys(prev => ({ ...prev, active_provider: e.target.value }))}
                className="w-full appearance-none bg-card border border-border rounded-lg py-3 pl-4 pr-10 text-sm font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-border transition-all cursor-pointer hover:border-zinc-400"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
                <option value="groq">Groq</option>
              </select>
              <ArrowRightLeft size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-5">Model Override (Optional)</label>
            <div className="relative mb-3">
              <input
                type="text"
                value={keys.active_model || ''}
                onChange={(e) => setKeys(prev => ({ ...prev, active_model: e.target.value }))}
                className="w-full bg-card border border-border rounded-lg py-2.5 px-4 text-sm font-mono text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-border transition-all hover:border-zinc-400"
                placeholder="e.g. gpt-4o, llama-3.3-70b-versatile"
              />
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
              Leave model blank to use defaults. Changes apply instantly to all production workflows.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Provider Connections</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Key size={14} className="text-muted-foreground" /> Masked keys are preserved on save
          </div>
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="btn-base btn-success px-5 disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* OpenAI Card */}
        <div className={`bg-card border ${keys.active_provider === 'openai' ? 'border-violet-400 ring-1 ring-violet-400 shadow-violet-100' : 'border-border hover:border-border'} rounded-2xl p-6 shadow-sm transition-all duration-200 group flex flex-col`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">OpenAI</h3>
                <p className="text-xs font-medium text-muted-foreground">GPT-4, GPT-3.5-Turbo</p>
              </div>
            </div>
            {keys.openai ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <CheckCircle size={12} /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20">
                <XCircle size={12} /> Missing
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">API Secret Key</label>
            <div className="relative group-focus-within:ring-2 ring-violet-500/20 rounded-lg transition-all">
              <input
                type={visibleFields.openai ? 'text' : 'password'}
                value={keys.openai}
                onChange={(e) => setKeys(prev => ({ ...prev, openai: e.target.value }))}
                placeholder="sk-..."
                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-3 pr-10 text-sm text-foreground focus:outline-none focus:border-border focus:bg-card transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('openai')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                {visibleFields.openai ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Last verified: Just now</span>
            <span className={keys.active_provider === 'openai' ? "text-foreground font-bold" : "text-muted-foreground"}>
              {keys.active_provider === 'openai' ? "Primary Engine" : "Backup Ready"}
            </span>
          </div>
        </div>

        {/* Gemini Card */}
        <div className={`bg-card border ${keys.active_provider === 'gemini' ? 'border-violet-400 ring-1 ring-violet-400 shadow-violet-100' : 'border-border hover:border-border'} rounded-2xl p-6 shadow-sm transition-all duration-200 group flex flex-col`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Google Gemini</h3>
                <p className="text-xs font-medium text-muted-foreground">Gemini 1.5 Pro / Flash</p>
              </div>
            </div>
            {keys.gemini ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <CheckCircle size={12} /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20">
                <XCircle size={12} /> Missing
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">API Secret Key</label>
            <div className="relative group-focus-within:ring-2 ring-violet-500/20 rounded-lg transition-all">
              <input
                type={visibleFields.gemini ? 'text' : 'password'}
                value={keys.gemini}
                onChange={(e) => setKeys(prev => ({ ...prev, gemini: e.target.value }))}
                placeholder="AIzaSy..."
                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-3 pr-10 text-sm text-foreground focus:outline-none focus:border-border focus:bg-card transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('gemini')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                {visibleFields.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Last verified: Just now</span>
            <span className={keys.active_provider === 'gemini' ? "text-foreground font-bold" : "text-muted-foreground"}>
              {keys.active_provider === 'gemini' ? "Primary Engine" : "Backup Ready"}
            </span>
          </div>
        </div>

        {/* Groq Card */}
        <div className={`bg-card border ${keys.active_provider === 'groq' ? 'border-violet-400 ring-1 ring-violet-400 shadow-violet-100' : 'border-border hover:border-border'} rounded-2xl p-6 shadow-sm transition-all duration-200 group flex flex-col`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Groq</h3>
                <p className="text-xs font-medium text-muted-foreground">Llama-3 Ultra-fast</p>
              </div>
            </div>
            {keys.groq ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <CheckCircle size={12} /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20">
                <XCircle size={12} /> Missing
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">API Secret Key</label>
            <div className="relative group-focus-within:ring-2 ring-violet-500/20 rounded-lg transition-all">
              <input
                type={visibleFields.groq ? 'text' : 'password'}
                value={keys.groq}
                onChange={(e) => setKeys(prev => ({ ...prev, groq: e.target.value }))}
                placeholder="gsk_..."
                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-3 pr-10 text-sm text-foreground focus:outline-none focus:border-border focus:bg-card transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => toggleVisibility('groq')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                {visibleFields.groq ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Last verified: Just now</span>
            <span className={keys.active_provider === 'groq' ? "text-foreground font-bold" : "text-muted-foreground"}>
              {keys.active_provider === 'groq' ? "Primary Engine" : "Backup Ready"}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LLMKeys;
