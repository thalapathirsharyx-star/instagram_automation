import React, { useState } from 'react';
import { HelpCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';

const AddFaq: React.FC = () => {
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!newQuestion || !newAnswer) return;
    
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/KnowledgeBase', {
        title: `FAQ: ${newQuestion}`,
        content: `Q: ${newQuestion}\nA: ${newAnswer}`,
        category: 'FAQ'
      });

      if (res.data.Success) {
        toast.success('FAQ added successfully', 'The question & answer have been added to your Brain Base.');
        navigate('/knowledge');
      } else {
        toast.error('Failed to save FAQ', res.data.Message || 'Could not save FAQ to Brain Base.');
      }
    } catch (error: any) {
      console.error('Error saving FAQ:', error);
      toast.error('Error saving FAQ', 'An unexpected network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <button 
            onClick={() => navigate('/knowledge')}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-4 transition-colors font-medium"
          >
            <ArrowLeft size={18} /> Back to Brain Base
          </button>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Add FAQ</h1>
          <p className="text-zinc-500 font-medium">Add a frequently asked question to train your AI.</p>
        </div>
      </div>

      <div className="card-standard p-10 border-brand/20 bg-primary animate-in slide-in-from-bottom-4 duration-500 shadow-xl max-w-2xl">
        <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3 mb-8">
          <div className="p-2 bg-brand/10 rounded-lg text-brand border border-brand/20">
            <HelpCircle size={20} />
          </div> 
          Question & Answer
        </h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Question</label>
            <input 
              type="text" 
              placeholder="e.g. Do you ship internationally?" 
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w3-input w-full shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Answer</label>
            <textarea 
              placeholder="Yes, we ship to over 50 countries..." 
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={4}
              className="w3-input w-full shadow-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 mt-8">
            <button onClick={() => navigate('/knowledge')} className="px-6 py-3 text-zinc-500 font-bold hover:text-zinc-500">Cancel</button>
            <button onClick={handleAdd} disabled={isSaving || !newQuestion || !newAnswer} className="btn-primary px-10">
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : 'Save FAQ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFaq;
