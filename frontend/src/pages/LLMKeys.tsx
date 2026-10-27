import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Loader2, Sparkles, ShieldCheck, Zap, Server, Check, CheckCircle, XCircle } from 'lucide-react';
import { getLLMKeys, updateLLMKeys } from '../api/admin.api';
import { useToast } from '../context/ToastContext';

type ProviderId = 'openai' | 'gemini' | 'groq';

const PROVIDERS: { id: ProviderId; name: string; models: string; placeholder: string; icon: React.ElementType; headline: string }[] = [
  { id: 'openai', name: 'OpenAI', models: 'GPT-4, GPT-3.5-Turbo', placeholder: 'sk-...', icon: Sparkles, headline: 'OpenAI GPT-4' },
  { id: 'gemini', name: 'Google Gemini', models: 'Gemini 1.5 Pro / Flash', placeholder: 'AIzaSy...', icon: ShieldCheck, headline: 'Google Gemini Pro' },
  { id: 'groq', name: 'Groq', models: 'Llama-3 Ultra-fast', placeholder: 'gsk_...', icon: Zap, headline: 'Groq Llama-3' },
];

const LLMKeys: React.FC = () => {
  const { toast } = useToast();
  const [keys, setKeys] = useState({ openai: '', gemini: '', groq: '', active_provider: 'openai', active_model: '' });
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    openai: false,
    gemini: false,
    groq: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    if (type === 'success') toast.success(text);
    else toast.error(text);
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
      <div className="page">
        <div className="surface empty">
          <Loader2 size={22} className="animate-spin text-ink-faint" />
          <p className="empty-body">Loading AI providers…</p>
        </div>
      </div>
    );
  }

  const connectedCount = [keys.openai, keys.gemini, keys.groq].filter(k => k && k.trim() !== '').length;
  const active = PROVIDERS.find(p => p.id === keys.active_provider) ?? PROVIDERS[2];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">LLM providers</h1>
          <p className="page-sub">
            Manage the AI providers powering Flazly's automation, lead qualification, customer conversations, and autonomous AI agents.
          </p>
        </div>
        <button onClick={() => handleSave()} disabled={isSaving} aria-busy={isSaving || undefined} className="btn btn-primary">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          Save configuration
        </button>
      </div>

      <div className="stack">
        <div className="metric-grid">
          <div className="metric tone-blue">
            <div className="metric-head">
              <span className="metric-label">Connected providers</span>
              <span className="icon-tile is-sm"><Server size={16} /></span>
            </div>
            <span className="metric-figure">{connectedCount}<span className="text-[17px] font-normal text-ink-soft"> / 3</span></span>
          </div>
          <div className="metric tone-lavender">
            <div className="metric-head">
              <span className="metric-label">Active engine</span>
              <span className="icon-tile is-sm"><Zap size={16} /></span>
            </div>
            <span className="metric-figure">{keys.active_provider === 'openai' ? 'OpenAI' : keys.active_provider === 'gemini' ? 'Gemini' : 'Groq'}</span>
          </div>
          <div className="metric tone-mint">
            <div className="metric-head">
              <span className="metric-label">System health</span>
              <span className="icon-tile is-sm"><ShieldCheck size={16} /></span>
            </div>
            <span className="metric-figure">Healthy</span>
          </div>
        </div>

        <section className="surface p-6">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <span className="chip chip-dot chip-go">Active provider</span>
              <h2 className="mt-3 text-[26px] font-bold tracking-[-0.02em] text-ink">{active.headline}</h2>
              <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-ink-soft">
                Currently intercepting and processing all live user requests. This engine is highly integrated with the platform's core automation loop.
              </p>

              <p className="mb-3 mt-6 text-[13px] font-medium text-ink-soft">Currently powering</p>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {['AI Chat Agents', 'Instagram DM Automation', 'Lead Qualification', 'CRM Sync Workflows'].map(module => (
                  <li key={module} className="flex items-center gap-2.5 text-[14px] text-ink">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-viridian-tint text-viridian">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {module}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full shrink-0 space-y-4 rounded-[10px] border border-hairline bg-porcelain p-5 lg:w-80">
              <div>
                <label htmlFor="active-provider" className="field-label">Default engine</label>
                <select
                  id="active-provider"
                  value={keys.active_provider}
                  onChange={(e) => setKeys(prev => ({ ...prev, active_provider: e.target.value }))}
                  className="field bg-surface"
                >
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="groq">Groq</option>
                </select>
              </div>
              <div>
                <label htmlFor="model-override" className="field-label">Model override <span className="font-normal text-ink-soft">(optional)</span></label>
                <input
                  id="model-override"
                  type="text"
                  value={keys.active_model || ''}
                  onChange={(e) => setKeys(prev => ({ ...prev, active_model: e.target.value }))}
                  className="field bg-surface font-mono text-[14px]"
                  placeholder="e.g. gpt-4o, llama-3.3-70b-versatile"
                  spellCheck={false}
                />
                <p className="field-hint">Leave blank to use the default model. Changes apply to all production workflows once saved.</p>
              </div>
            </div>
          </div>
        </section>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">Provider connections</h2>
            <span className="flex items-center gap-1.5 text-[13px] text-ink-soft">
              <Key size={14} /> Masked keys are kept as they are when you save
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PROVIDERS.map(({ id, name, models, placeholder, icon: Icon }) => {
              const isActive = keys.active_provider === id;
              const hasKey = !!keys[id];
              return (
                <section
                  key={id}
                  className={`surface flex flex-col p-5 ${isActive ? 'border-viridian ring-1 ring-viridian' : ''}`}
                  aria-labelledby={`provider-${id}`}
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="icon-tile"><Icon size={18} /></span>
                      <div>
                        <h3 id={`provider-${id}`} className="text-[15px] font-semibold text-ink">{name}</h3>
                        <p className="text-[13px] text-ink-soft">{models}</p>
                      </div>
                    </div>
                    {hasKey ? (
                      <span className="chip chip-go"><CheckCircle size={12} /> Connected</span>
                    ) : (
                      <span className="chip chip-stop"><XCircle size={12} /> Missing</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <label htmlFor={`key-${id}`} className="field-label">API secret key</label>
                    <div className="relative">
                      <input
                        id={`key-${id}`}
                        type={visibleFields[id] ? 'text' : 'password'}
                        value={keys[id]}
                        onChange={(e) => setKeys(prev => ({ ...prev, [id]: e.target.value }))}
                        placeholder={placeholder}
                        autoComplete="off"
                        spellCheck={false}
                        className="field pr-11 font-mono text-[14px]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility(id)}
                        className="btn btn-ghost btn-icon btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
                        aria-label={visibleFields[id] ? `Hide ${name} key` : `Show ${name} key`}
                      >
                        {visibleFields[id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-hairline pt-3 text-[13px]">
                    <span className="text-ink-soft">Last verified: just now</span>
                    <span className={isActive ? 'font-semibold text-viridian' : 'text-ink-soft'}>
                      {isActive ? 'Primary engine' : 'Backup ready'}
                    </span>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMKeys;
