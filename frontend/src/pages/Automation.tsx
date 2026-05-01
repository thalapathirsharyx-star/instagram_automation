import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Save, Loader2, Info, Send, Bot, Zap } from 'lucide-react';
import api from '../lib/axios';

const Automation: React.FC = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/Welcome', { message: welcomeMessage });
      if (res.data.Success) {
        alert('Automation settings updated successfully!');
      }
    } catch (error) {
      console.error('Error saving automation settings:', error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Automation Center</h1>
          <p className="text-zinc-400 font-medium">Configure how your AI agent behaves when interacting with customers.</p>
        </div>
      </div>

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
                onClick={handleSave} 
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
    </div>
  );
};

export default Automation;
