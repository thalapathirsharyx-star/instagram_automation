import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Loader2, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { getLLMKeys, updateLLMKeys } from '../api/admin.api';

const LLMKeys: React.FC = () => {
  const [keys, setKeys] = useState({ openai: '', gemini: '', groq: '' });
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    openai: false,
    gemini: false,
    groq: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const res = await getLLMKeys();
      if (res?.Data) {
        setKeys(res.Data);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.Message || 'Failed to load LLM provider keys.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await updateLLMKeys(keys);
      if (res.Type === 'Success' || (res as any).Type === 'S') {
        setMessage({ type: 'success', text: res.Message || 'LLM provider keys saved successfully.' });
        fetchKeys();
      } else {
        setMessage({ type: 'error', text: res.Message || 'Failed to save keys.' });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.Message || 'An unexpected error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = (field: string) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        <Loader2 size={24} className="animate-spin mr-2" /> Loading Provider Configurations...
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header">
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#18181b' }}>LLM Provider Keys</h1>
        <p style={{ margin: '8px 0 0', color: '#71717a' }}>Configure global API access credentials for LLM models powering customer chat agents.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex gap-3 items-center ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-bold'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 max-w-3xl">
        {/* OpenAI Key */}
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px', transition: 'border-color 0.3s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ padding: '8px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '8px' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#18181b', fontSize: '1.1rem', fontWeight: 600 }}>OpenAI API Key</h3>
              <p style={{ margin: '2px 0 0', color: '#71717a', fontSize: '0.8rem' }}>Powering GPT-4 and GPT-3.5 models.</p>
            </div>
          </div>
          <div className="relative">
              <input
                type={visibleFields.openai ? 'text' : 'password'}
                value={keys.openai}
                onChange={(e) => setKeys(prev => ({ ...prev, openai: e.target.value }))}
                placeholder="sk-..."
                style={{ width: '100%', padding: '12px 48px 12px 16px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '10px', color: '#18181b', outline: 'none', fontSize: '0.95rem' }}
              />
            <button
              type="button"
              onClick={() => toggleVisibility('openai')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {visibleFields.openai ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Gemini Key */}
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px', transition: 'border-color 0.3s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#18181b', fontSize: '1.1rem', fontWeight: 600 }}>Google Gemini API Key</h3>
              <p style={{ margin: '2px 0 0', color: '#71717a', fontSize: '0.8rem' }}>Powering Gemini Flash and Pro models.</p>
            </div>
          </div>
          <div className="relative">
              <input
                type={visibleFields.gemini ? 'text' : 'password'}
                value={keys.gemini}
                onChange={(e) => setKeys(prev => ({ ...prev, gemini: e.target.value }))}
                placeholder="AIzaSy..."
                style={{ width: '100%', padding: '12px 48px 12px 16px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '10px', color: '#18181b', outline: 'none', fontSize: '0.95rem' }}
              />
            <button
              type="button"
              onClick={() => toggleVisibility('gemini')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {visibleFields.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Groq Key */}
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px', transition: 'border-color 0.3s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px' }}>
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#18181b', fontSize: '1.1rem', fontWeight: 600 }}>Groq API Key</h3>
              <p style={{ margin: '2px 0 0', color: '#71717a', fontSize: '0.8rem' }}>Powering ultra-fast Llama-3 inference models.</p>
            </div>
          </div>
          <div className="relative">
              <input
                type={visibleFields.groq ? 'text' : 'password'}
                value={keys.groq}
                onChange={(e) => setKeys(prev => ({ ...prev, groq: e.target.value }))}
                placeholder="gsk_..."
                style={{ width: '100%', padding: '12px 48px 12px 16px', background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '10px', color: '#18181b', outline: 'none', fontSize: '0.95rem' }}
              />
            <button
              type="button"
              onClick={() => toggleVisibility('groq')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {visibleFields.groq ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={12} color="#a855f7" />
            Note: Masked keys like `xxxx...xxxx` will not be overwritten on save.
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm"
            style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            <span>Save Provider Keys</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LLMKeys;
