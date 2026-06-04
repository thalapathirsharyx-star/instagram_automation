import React, { useState, useEffect } from 'react';
import { Bot, Save, RefreshCw, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { getAIPrompt, updateAIPrompt } from '../api/crm.api';
import { useAuth } from '../context/AuthContext';
import UpgradeOverlay from '../components/UpgradeOverlay';

const tonePrompts: Record<string, string> = {
  Professional: "Maintain a professional, polite, and formal tone. Use proper language and avoid slang.",
  Friendly: "Maintain a warm, friendly, and helpful tone. Use emojis and polite terms like 'Akka/Anna'.",
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
    
    // Add the new tone instruction at the top for visibility.
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
      setNotification({ type: 'success', message: 'AI Persona updated successfully!' });
    } catch (error) {
      console.error('Error updating prompt:', error);
      setNotification({ type: 'error', message: 'Failed to update AI Persona' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <RefreshCw className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      {showUpgradePrompt && <UpgradeOverlay feature="AI Persona" onClose={() => setShowUpgradePrompt(false)} />}
      <header className="flex justify-between items-end">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-inner">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-1">AI Persona</h1>
            <p className="text-zinc-400 font-medium">Define how Flazly interacts with your customers</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {notification && (
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold animate-in zoom-in duration-300 border
              ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {notification.type === 'success' ? <Sparkles size={16} /> : <AlertCircle size={16} />}
              {notification.message}
            </div>
          )}
          <button 
            className="w3-button-primary shadow-glow-purple"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{isSaving ? 'Saving...' : 'Save Persona'}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
        <div className="lg:col-span-2 w3-card shadow-lg flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
              <Sparkles className="text-purple-400" size={18} />
              <span className="uppercase tracking-widest text-[11px] text-zinc-400">System Instructions</span>
            </div>
            <div className="px-3 py-1 bg-zinc-800 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
              Llama-3.3 Powered
            </div>
          </div>
          
          <textarea
            className="flex-grow w-full min-h-[500px] w3-input p-6 text-sm font-medium font-mono leading-relaxed resize-none focus:ring-4 focus:ring-purple-500/10 bg-zinc-950/50 border-white/5"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe Flazly's personality and rules here..."
          />
          
          <div className="mt-6 flex gap-4 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 shadow-sm shrink-0 border border-purple-500/30">
              <AlertCircle size={18} />
            </div>
            <p className="text-xs text-purple-200/80 font-medium leading-relaxed">
              <strong className="text-purple-300">Pro Tip:</strong> Use <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-purple-400 border border-white/5">${'{'}context{'}'}</code>, <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-purple-400 border border-white/5">${'{'}historyText{'}'}</code>, and <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-purple-400 border border-white/5">${'{'}messageText{'}'}</code> to keep Flazly context-aware.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="w3-card bg-gradient-to-br from-zinc-900 to-zinc-950 border-white/5 text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Sparkles size={18} className="text-purple-400" /> AI Tone Preset
            </h3>
            <p className="text-xs text-zinc-400 font-medium mb-4">Select a preset to quickly set the tone of Flazly's responses.</p>
            <div className="grid grid-cols-2 gap-3">
              {['Professional', 'Friendly', 'Salesy', 'Casual'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleToneSelect(t)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                    tone === t 
                      ? 'bg-purple-500 text-white border-purple-500 shadow-glow-purple' 
                      : 'bg-zinc-800 text-zinc-300 border-white/5 hover:bg-zinc-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="w3-card bg-gradient-to-br from-zinc-900 to-zinc-950 border-white/5 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                <MessageSquare size={18} className="text-purple-400" /> Personality Tips
              </h3>
              <ul className="space-y-6">
                <li className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tone</span>
                  <p className="text-sm font-medium opacity-80 leading-relaxed text-zinc-300">"Flazly is warm, polite, and uses 'Akka/Anna' for respect."</p>
                </li>
                <li className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Language</span>
                  <p className="text-sm font-medium opacity-80 leading-relaxed text-zinc-300">Instruct her to maintain the user's language style (Tamil/English).</p>
                </li>
                <li className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Guardrails</span>
                  <p className="text-sm font-medium opacity-80 leading-relaxed text-zinc-300">Define what she <strong className="text-rose-400">cannot</strong> do (e.g., "Don't promise discounts").</p>
                </li>
              </ul>
            </div>
            <Bot className="absolute -bottom-10 -right-10 w-48 h-48 text-white opacity-5" />
          </div>

          <div className="w3-card bg-purple-500/5 border-purple-500/10">
            <h3 className="font-bold text-zinc-100 mb-4 flex items-center gap-2"><Sparkles size={16} className="text-purple-400" /> Need Help?</h3>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed">
              Flazly uses these instructions as its primary "brain." Updates are instant for all new incoming chats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
