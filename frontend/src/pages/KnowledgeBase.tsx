import React, { useState, useEffect, useRef } from 'react';
import { Book, Plus, Trash2, Search, Sparkles, FileText, UploadCloud, Loader2, MessageSquareQuote, HelpCircle, X } from 'lucide-react';
import api from '../lib/axios';

const KnowledgeBase: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [addMode, setAddMode] = useState<'text' | 'faq' | 'upload'>('text');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [category, setCategory] = useState('General');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/Instagram/KnowledgeBase');
      setItems(res.data.Data || []);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    let finalTitle = newTitle;
    let finalContent = newContent;

    if (addMode === 'faq') {
      if (!newQuestion || !newAnswer) return;
      finalTitle = `FAQ: ${newQuestion}`;
      finalContent = `Q: ${newQuestion}\nA: ${newAnswer}`;
    }

    if (!finalTitle || !finalContent) return;
    
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/KnowledgeBase', {
        title: finalTitle,
        content: finalContent,
        category: addMode === 'faq' ? 'FAQ' : category
      });

      if (res.data.Success) {
        setItems([res.data.Data, ...items]);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving knowledge:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/KnowledgeBase/Upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.Success) {
        setItems([res.data.Data, ...items]);
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please ensure it is a PDF or TXT.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this knowledge item?')) return;
    
    try {
      const res = await api.delete(`/Instagram/KnowledgeBase/${id}`);
      if (res.data.Success) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting knowledge:', error);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setNewTitle('');
    setNewContent('');
    setNewQuestion('');
    setNewAnswer('');
    setCategory('General');
  };

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Brain Base</h1>
          <p className="text-zinc-400 font-medium">Train your AI with documents, FAQs, and business facts.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setIsAdding(true); setAddMode('upload'); }}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-800/50 border border-white/5 rounded-xl text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
          >
            <UploadCloud size={18} className="text-purple-400" />
            <span>Upload</span>
          </button>
          <button 
            onClick={() => { setIsAdding(true); setAddMode('faq'); }}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-800/50 border border-white/5 rounded-xl text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
          >
            <HelpCircle size={18} className="text-purple-400" />
            <span>Add FAQ</span>
          </button>
          <button 
            onClick={() => { setIsAdding(true); setAddMode('text'); }}
            className="w3-button-primary shadow-glow-purple"
          >
            <Plus size={18} />
            <span>Add Fact</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="w3-card p-10 border-purple-500/20 bg-zinc-900 animate-in slide-in-from-top-4 duration-500 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
              {addMode === 'upload' && <><div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20"><UploadCloud size={20} /></div> Upload Document</>}
              {addMode === 'faq' && <><div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20"><HelpCircle size={20} /></div> Add FAQ</>}
              {addMode === 'text' && <><div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20"><FileText size={20} /></div> Add Knowledge Fact</>}
            </h3>
            <button onClick={resetForm} className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl transition-all border border-transparent hover:border-white/5">
              <X size={20} />
            </button>
          </div>

          {addMode === 'upload' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-3xl p-16 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".pdf,.txt" 
                className="hidden"
              />
              {isSaving ? (
                <div className="flex flex-col items-center gap-6">
                  <Loader2 size={48} className="animate-spin text-purple-500" />
                  <p className="font-bold text-zinc-100 text-lg">Analyzing content...</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <UploadCloud size={40} className="text-purple-400" />
                  </div>
                  <h4 className="text-xl font-bold text-zinc-100 mb-2">Drop your file here</h4>
                  <p className="text-zinc-400 font-medium max-w-sm mx-auto">Supports PDF and TXT. AI will process the text into searchable knowledge.</p>
                </>
              )}
            </div>
          ) : addMode === 'faq' ? (
            <div className="space-y-6 max-w-2xl">
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
              <div className="flex justify-end gap-4 pt-4">
                <button onClick={resetForm} className="px-6 py-3 text-zinc-500 font-bold hover:text-zinc-300">Cancel</button>
                <button onClick={handleAdd} disabled={isSaving} className="w3-button-primary px-10">
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : 'Save FAQ'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl">
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
              <div className="flex justify-end gap-4 pt-4">
                <button onClick={resetForm} className="px-6 py-3 text-zinc-500 font-bold hover:text-zinc-300">Cancel</button>
                <button onClick={handleAdd} disabled={isSaving} className="w3-button-primary px-10">
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : 'Save Fact'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 size={48} className="animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {items.map((item) => (
            <div key={item.id} className="w3-card group h-full flex flex-col hover:border-purple-500/30 transition-all duration-500 border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all duration-500 border border-purple-500/20 shadow-inner">
                  {item.category === 'FAQ' ? <MessageSquareQuote size={20} /> : 
                   item.category === 'Document' ? <UploadCloud size={20} /> :
                   <FileText size={20} />}
                </div>
                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 border border-white/5 px-2 py-1 rounded-md uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-zinc-100 mb-3 group-hover:text-purple-400 transition-colors">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium line-clamp-4">
                  {item.content}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                  <Sparkles size={12} /> AI READY
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {items.length === 0 && !isAdding && (
            <div className="col-span-full w3-card py-24 text-center flex flex-col items-center justify-center border-dashed border-white/10 bg-zinc-900/30">
               <div className="w-24 h-24 bg-zinc-800 border border-white/5 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                  <Book size={48} className="text-purple-500/50" />
               </div>
               <div className="max-w-md">
                 <h3 className="text-2xl font-bold text-zinc-100 mb-3">AI Brain Base</h3>
                 <p className="text-zinc-400 font-medium leading-relaxed mb-10">Upload business documents or add FAQs to turn this AI into an expert on your business.</p>
               </div>
               <div className="flex gap-4">
                 <button onClick={() => { setIsAdding(true); setAddMode('upload'); }} className="px-8 py-3.5 bg-zinc-800/50 border border-white/5 rounded-xl font-bold text-zinc-300 hover:bg-zinc-800 transition-all shadow-sm hover:text-white">Upload PDF</button>
                 <button onClick={() => { setIsAdding(true); setAddMode('faq'); }} className="w3-button-primary px-10 shadow-glow-purple">Add First FAQ</button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
