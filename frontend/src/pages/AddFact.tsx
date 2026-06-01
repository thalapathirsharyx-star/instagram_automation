import React, { useState } from 'react';
import { FileText, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';

const AddFact: React.FC = () => {
  const { toast } = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!newTitle || !newContent) return;
    
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/KnowledgeBase', {
        title: newTitle,
        content: newContent,
        category: category
      });

      if (res.data.Success) {
        toast.success('Knowledge fact saved', 'The business fact has been successfully saved to your Brain Base.');
        navigate('/knowledge');
      } else {
        toast.error('Failed to save fact', res.data.Message || 'Could not save fact to Brain Base.');
      }
    } catch (error: any) {
      console.error('Error saving knowledge:', error);
      toast.error('Error saving fact', 'An unexpected network error occurred.');
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
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors font-medium"
          >
            <ArrowLeft size={18} /> Back to Brain Base
          </button>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Add Knowledge Fact</h1>
          <p className="text-zinc-400 font-medium">Add text-based information about your business.</p>
        </div>
      </div>

      <div className="w3-card p-10 border-purple-500/20 bg-zinc-900 animate-in slide-in-from-bottom-4 duration-500 shadow-xl max-w-3xl">
        <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3 mb-8">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
            <FileText size={20} />
          </div> 
          Fact Details
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Title</label>
              <input 
                type="text" 
                placeholder="e.g. Return Policy" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w3-input w-full shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w3-input w-full shadow-sm appearance-none cursor-pointer"
              >
                <option>General</option>
                <option>Products / Services</option>
                <option>Pricing</option>
                <option>Policies</option>
                <option>Location</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Knowledge Content</label>
            <textarea 
              placeholder="Paste details here..." 
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={6}
              className="w3-input w-full shadow-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-white/5 mt-8">
            <button onClick={() => navigate('/knowledge')} className="px-6 py-3 text-zinc-500 font-bold hover:text-zinc-300">Cancel</button>
            <button onClick={handleAdd} disabled={isSaving || !newTitle || !newContent} className="w3-button-primary px-10">
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : 'Save Fact'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFact;
