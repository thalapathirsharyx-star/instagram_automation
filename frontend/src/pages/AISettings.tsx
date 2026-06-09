import React, { useState, useEffect } from 'react';
import { Bot, Save, RefreshCw, MessageSquare, Sparkles, AlertCircle, Cpu, Zap, Lightbulb } from 'lucide-react';
import { getAIPrompt, updateAIPrompt } from '../api/crm.api';
import { useAuth } from '../context/AuthContext';
import UpgradeOverlay from '../components/UpgradeOverlay';

const tonePrompts: Record<string, string> = {
  Professional: "Maintain a professional, polite, and formal tone. Use proper language and avoid slang.",
  Friendly: "Maintain a warm, friendly, and helpful tone. Use emojis and polite terms.",
  Salesy: "Maintain an energetic, persuasive, and sales-focused tone. Highlight product benefits and encourage purchase.",
  Casual: "Maintain a relaxed, casual, and informal tone. Speak like a friend."
};

const AISettings: React.FC = () => {
  const { user } = useAuth();
  const currentPlan = user?.company?.plan || 'Free';
  const hasProPlan = ['Pro', 'Business', 'Advanced'].includes(currentPlan);
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      setIsLoading(true);
      const res = await getAIPrompt();
      setPrompt(res?.Data?.prompt || '');
    } catch (error) {
      console.error('Error fetching prompt:', error);
      setNotification({ type: 'error', message: 'Failed to load AI prompt' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneSelect = (selectedTone: string) => {
    setTone(selectedTone);
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
      setNotification({ type: 'success', message: 'System Instructions updated successfully!' });
    } catch (error) {
      console.error('Error updating prompt:', error);
      setNotification({ type: 'error', message: 'Failed to update System Instructions' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-violet-600 rounded-full animate-spin"></div>
          <span className="text-sm">Loading Neural Config...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      {showUpgradePrompt && <UpgradeOverlay feature="System Instructions" onClose={() => setShowUpgradePrompt(false)} />}
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 pointer-events-none">
          <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 animate-in slide-in-from-right-8 ${
            notification.type === 'success' 
              ? 'bg-primary border-primary text-primary-foreground' 
              : 'bg-card border-destructive/20 text-destructive shadow-rose-100/50'
          }`}>
            {notification.type === 'success' ? <Sparkles size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-destructive" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Instructions</h2>
          <p className="text-muted-foreground text-sm">Define the core personality, rules of engagement, and base logic for your AI conversational agent.</p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-70"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            <span>{isSaving ? 'Compiling...' : 'Save Instructions'}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
        
        {/* Main Editor */}
        <div className="lg:col-span-2 border bg-card text-card-foreground shadow-sm rounded-xl flex flex-col overflow-hidden relative">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Cpu className="text-foreground" size={18} />
              <span>Base Prompt Overlay</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-card border border-border rounded-md text-[10px] font-bold text-muted-foreground uppercase tracking-wider shadow-sm">
              <Zap size={10} className="text-amber-500" /> Llama-3.3 Engine
            </div>
          </div>
          
          <textarea
            className="flex-grow w-full min-h-[500px] p-6 text-[13px] font-medium font-mono text-foreground leading-relaxed resize-none focus:ring-0 focus:outline-none bg-card placeholder-zinc-300"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="You are Flazly, a highly intelligent..."
            spellCheck="false"
            style={{ lineHeight: '1.7' }}
          />
          
          <div className="p-4 bg-primary/10 border-t border-primary/20 flex items-start gap-3">
            <div className="p-1.5 bg-violet-100 rounded text-foreground shrink-0 mt-0.5">
              <Lightbulb size={16} />
            </div>
            <p className="text-xs text-foreground/80 font-medium leading-relaxed">
              <strong className="text-foreground">Pro Tip:</strong> Ensure dynamic context is injected. Maintain the <code className="bg-card px-1.5 py-0.5 rounded text-foreground font-bold border border-primary/20 shadow-sm mx-0.5">${'{'}context{'}'}</code>, <code className="bg-card px-1.5 py-0.5 rounded text-foreground font-bold border border-primary/20 shadow-sm mx-0.5">${'{'}historyText{'}'}</code>, and <code className="bg-card px-1.5 py-0.5 rounded text-foreground font-bold border border-primary/20 shadow-sm mx-0.5">${'{'}messageText{'}'}</code> variables in the prompt so the AI can read Brain Base data.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Tone Presets */}
          <div className="border bg-card text-card-foreground shadow-sm rounded-xl p-6">
            <h3 className="text-base font-bold flex items-center gap-2 mb-2 text-foreground">
              <Sparkles size={18} className="text-foreground" /> Interaction Tone
            </h3>
            <p className="text-xs text-muted-foreground font-medium mb-5">Click a preset to instantly update the prompt's tone instructions.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {['Professional', 'Friendly', 'Salesy', 'Casual'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleToneSelect(t)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                    tone === t 
                      ? 'bg-primary/10 text-foreground border-violet-300 ring-1 ring-violet-300 shadow-sm' 
                      : 'bg-card text-muted-foreground border-border hover:border-border hover:bg-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Personality Guardrails */}
          <div className="bg-muted border border-border rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base font-bold flex items-center gap-2 mb-6 text-foreground">
                <MessageSquare size={18} className="text-blue-400" /> Guardrails
              </h3>
              <ul className="space-y-5">
                <li className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div> Persona
                  </span>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed ml-3">Give the agent a name, role, and specific vocabulary to use.</p>
                </li>
                <li className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div> Empathy
                  </span>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed ml-3">Instruct the AI to mirror the customer's language natively.</p>
                </li>
                <li className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div> Restrictions
                  </span>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed ml-3">Explicitly declare what the AI <strong className="text-destructive">cannot</strong> do (e.g. "Never promise refunds").</p>
                </li>
              </ul>
            </div>
            <Bot className="absolute -bottom-10 -right-10 w-48 h-48 text-zinc-200 opacity-50" strokeWidth={1} />
          </div>

          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl shadow-md p-6 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-card/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-primary-foreground">
                <Cpu size={16} className="text-violet-200" /> Live Updates
              </h3>
              <p className="text-sm font-medium leading-relaxed text-violet-100/90">
                Any modifications saved to the System Instructions are instantly propagated to the Inference Engine. All new incoming chats will immediately adopt this new logic layer.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AISettings;
