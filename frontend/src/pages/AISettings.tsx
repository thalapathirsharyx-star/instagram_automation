import React, { useState, useEffect } from 'react';
import { Bot, Save, Loader2, MessageSquare, Sparkles, Cpu, Lightbulb, CheckCircle2 } from 'lucide-react';
import { getAIPrompt, updateAIPrompt } from '../api/crm.api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UpgradeOverlay from '../components/UpgradeOverlay';

const tonePrompts: Record<string, string> = {
  Professional: "Maintain a professional, polite, and formal tone. Use proper language and avoid slang.",
  Friendly: "Maintain a warm, friendly, and helpful tone. Use emojis and polite terms.",
  Salesy: "Maintain an energetic, persuasive, and sales-focused tone. Highlight product benefits and encourage purchase.",
  Casual: "Maintain a relaxed, casual, and informal tone. Speak like a friend."
};

/** The preset whose line the prompt currently starts with, if any. */
const toneInPrompt = (prompt: string) =>
  Object.keys(tonePrompts).find((key) => prompt.split('\n').some((line) => line === `Tone: ${tonePrompts[key]}`)) || null;

const guardrails = [
  { label: 'Persona', body: <>Give the agent a name, role, and specific vocabulary to use.</>, tone: 'is-neutral' },
  { label: 'Empathy', body: <>Instruct the AI to mirror the customer's language.</>, tone: 'is-neutral' },
  { label: 'Restrictions', body: <>Say plainly what the AI <strong className="font-semibold text-signal-stop">cannot</strong> do (e.g. "Never promise refunds").</>, tone: 'is-stop' },
];

const AISettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentPlan = user?.company?.plan || 'Free';
  const hasProPlan = ['Pro', 'Business', 'Advanced'].includes(currentPlan);
  const [prompt, setPrompt] = useState('');
  // What the server has, so the page can say whether there is anything to save.
  const [savedPrompt, setSavedPrompt] = useState('');
  const tone = toneInPrompt(prompt);
  const isDirty = prompt !== savedPrompt;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      setIsLoading(true);
      const res = await getAIPrompt();
      setPrompt(res?.Data?.prompt || '');
      setSavedPrompt(res?.Data?.prompt || '');
    } catch (error) {
      console.error('Error fetching prompt:', error);
      toast.error('Failed to load AI prompt');
    } finally {
      setIsLoading(false);
    }
  };

  // Leaving with unsaved instructions asks first, as the browser allows.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const handleToneSelect = (selectedTone: string) => {
    const toneInstruction = tonePrompts[selectedTone];
    const tonePrefix = "Tone: ";

    const lines = prompt.split('\n');
    const filteredLines = lines.filter(line => !line.startsWith(tonePrefix));

    const newPrompt = [`${tonePrefix}${toneInstruction}`, ...filteredLines].join('\n').trim();
    setPrompt(newPrompt);
  };

  const handleSave = async () => {
    if (!hasProPlan) {
      setShowUpgradePrompt(true);
      return;
    }
    try {
      setIsSaving(true);
      await updateAIPrompt(prompt);
      setSavedPrompt(prompt);
      toast.success('System instructions updated');
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.error('Failed to update system instructions');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="surface empty">
          <Loader2 size={22} className="animate-spin text-ink-faint" />
          <p className="empty-body">Loading your AI persona…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page relative">
      {showUpgradePrompt && <UpgradeOverlay feature="System Instructions" onClose={() => setShowUpgradePrompt(false)} />}

      <div className="page-head">
        <div>
          <h1 className="page-title">AI persona</h1>
          <p className="page-sub">Define the core personality, rules of engagement, and base logic for your AI conversational agent.</p>
        </div>
        <div className="page-actions">
          <span className="text-[13px] text-ink-soft" role="status" aria-live="polite">
            {isDirty
              ? <span className="chip chip-dot chip-warn">Unsaved changes</span>
              : <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-signal-go" /> All changes saved</span>}
          </span>
          {isDirty && (
            <button className="btn" onClick={() => setPrompt(savedPrompt)} disabled={isSaving}>
              Discard
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving || !isDirty} aria-busy={isSaving || undefined}>
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSaving ? 'Saving…' : 'Save instructions'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <section className="surface flex flex-col overflow-hidden lg:col-span-2">
          <div className="surface-head">
            <h2 className="text-[15px]">
              <span className="icon-tile is-sm"><Cpu size={16} /></span>
              <label htmlFor="system-prompt">System instructions</label>
            </h2>
            <span className="tabular text-[13px] text-ink-faint">{prompt.length.toLocaleString()} characters</span>
          </div>

          <textarea
            id="system-prompt"
            className="min-h-[420px] w-full flex-grow resize-y bg-surface p-5 text-[15px] leading-[1.7] text-ink outline-none placeholder:text-ink-faint focus-visible:bg-porcelain lg:min-h-[520px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="You are Flazly, a highly intelligent..."
            spellCheck="false"
          />

          <div className="surface-foot flex-nowrap items-start justify-start gap-3">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-viridian" />
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Keep the <code className="rounded bg-surface px-1 py-0.5 text-ink">${'{'}context{'}'}</code>,{' '}
              <code className="rounded bg-surface px-1 py-0.5 text-ink">${'{'}historyText{'}'}</code> and{' '}
              <code className="rounded bg-surface px-1 py-0.5 text-ink">${'{'}messageText{'}'}</code> variables in the
              prompt so the AI can read your Brain base and the conversation.
            </p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="surface p-5">
            <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-ink">
              <span className="icon-tile is-sm"><Sparkles size={16} /></span> Tone
            </h2>
            <p className="mb-4 mt-1.5 text-[13px] text-ink-soft">Pick a preset to rewrite the tone line at the top of the instructions.</p>

            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tone preset">
              {Object.keys(tonePrompts).map((t) => (
                <button
                  key={t}
                  onClick={() => handleToneSelect(t)}
                  aria-pressed={tone === t}
                  className={`btn ${tone === t ? 'border-viridian bg-viridian-tint text-viridian' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="mb-4 flex items-center gap-2.5 text-[16px] font-semibold text-ink">
              <span className="icon-tile is-sm is-neutral"><MessageSquare size={16} /></span> Guardrails
            </h2>
            <ul className="space-y-4">
              {guardrails.map((g) => (
                <li key={g.label}>
                  <p className="flex items-center gap-2 text-[13px] font-medium text-ink-soft">
                    <span className={`h-1.5 w-1.5 rounded-full ${g.tone === 'is-stop' ? 'bg-signal-stop' : 'bg-ink-faint'}`} />
                    {g.label}
                  </p>
                  <p className="ml-3.5 mt-1 text-[14px] leading-relaxed text-ink">{g.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <aside className="notice notice-info block">
            <p className="notice-title flex items-center gap-2"><Bot size={16} className="text-viridian" /> Changes apply right away</p>
            <p className="notice-body mt-1.5 leading-relaxed">
              Saved instructions are used for every new message from the moment you save.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
