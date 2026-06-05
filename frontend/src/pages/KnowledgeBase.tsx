import React, { useState, useEffect, useRef } from 'react';
import { Book, Plus, Trash2, Sparkles, FileText, UploadCloud, Loader2, MessageSquareQuote, HelpCircle, File, BrainCircuit, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

const KnowledgeBase: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'faqs' | 'facts'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Modal States
  const [activeModal, setActiveModal] = useState<'none' | 'upload' | 'faq' | 'fact'>('none');
  
  // Fact State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState('General');
  
  // FAQ State
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  
  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    
    try {
      setIsDeleting(true);
      const res = await api.delete(`/Instagram/KnowledgeBase/${confirmDeleteId}`);
      if (res.data.Success) {
        setItems(items.filter(item => item.id !== confirmDeleteId));
        toast.success('Knowledge item deleted from your Brain Base.');
      } else {
        toast.error('Failed to delete: ' + (res.data.Message || 'An error occurred.'));
      }
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast.error('An unexpected network error occurred.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleAddFact = async () => {
    if (!newTitle || !newContent) return;
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/KnowledgeBase', {
        title: newTitle,
        content: newContent,
        category: category
      });
      if (res.data.Success) {
        toast.success('Fact added successfully');
        closeModal();
        fetchKnowledge();
      } else {
        toast.error('Failed to save fact', res.data.Message);
      }
    } catch (error) {
      toast.error('Error saving fact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = async () => {
    if (!newQuestion || !newAnswer) return;
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/KnowledgeBase', {
        title: `FAQ: ${newQuestion}`,
        content: `Q: ${newQuestion}\nA: ${newAnswer}`,
        category: 'FAQ'
      });
      if (res.data.Success) {
        toast.success('FAQ added successfully');
        closeModal();
        fetchKnowledge();
      } else {
        toast.error('Failed to save FAQ', res.data.Message);
      }
    } catch (error) {
      toast.error('Error saving FAQ');
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
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.Success) {
        toast.success('Document uploaded', `${file.name} processed successfully.`);
        closeModal();
        fetchKnowledge();
      } else {
        toast.error('Upload failed', res.data.Message);
      }
    } catch (error) {
      toast.error('Upload error', 'Please ensure the file is a valid PDF or TXT.');
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setActiveModal('none');
    setNewTitle('');
    setNewContent('');
    setNewQuestion('');
    setNewAnswer('');
  };

  const formatFaqTitle = (title: string) => {
    if (title.toUpperCase().startsWith('FAQ:')) {
      return title.substring(4).trim();
    }
    return title;
  };

  const formatFaqContent = (content: string) => {
    const qIndex = content.toUpperCase().indexOf('Q:');
    const aIndex = content.toUpperCase().indexOf('A:');
    if (qIndex !== -1 && aIndex !== -1 && aIndex > qIndex) {
      return content.substring(aIndex + 2).trim();
    }
    return content;
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'documents') return item.category === 'Document';
    if (activeTab === 'faqs') return item.category === 'FAQ';
    if (activeTab === 'facts') return item.category !== 'Document' && item.category !== 'FAQ';
    return true;
  });

  const TabButton = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
        activeTab === id 
          ? 'bg-zinc-900 text-white shadow-md' 
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
      }`}
    >
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 font-sans animate-in fade-in duration-500" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">Brain Base</h1>
          <p className="text-sm text-zinc-500 font-medium max-w-xl">Upload documents, FAQs, and business context. The AI uses this data to answer customer questions automatically.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveModal('upload')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-700 font-bold hover:border-zinc-300 hover:bg-zinc-50 transition-all shadow-sm text-sm"
          >
            <UploadCloud size={16} className="text-violet-600" />
            <span className="hidden sm:inline">Upload PDF</span>
          </button>
          <button 
            onClick={() => setActiveModal('faq')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-700 font-bold hover:border-zinc-300 hover:bg-zinc-50 transition-all shadow-sm text-sm"
          >
            <HelpCircle size={16} className="text-blue-600" />
            <span className="hidden sm:inline">Add FAQ</span>
          </button>
          <button 
            onClick={() => setActiveModal('fact')}
            className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Fact</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-2 w-full overflow-x-auto">
          <TabButton id="all" label="All Assets" icon={BrainCircuit} />
          <TabButton id="documents" label="Documents" icon={File} />
          <TabButton id="faqs" label="FAQs" icon={MessageSquareQuote} />
          <TabButton id="facts" label="Facts" icon={FileText} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-zinc-500 font-medium">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            <span className="text-sm">Syncing Knowledge Base...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.length === 0 ? (
            <div className="bg-white border border-zinc-200 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
               <div className="w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 border border-violet-100 shadow-inner">
                  <BrainCircuit size={40} className="text-violet-500" />
               </div>
               <div className="max-w-md mx-auto">
                 <h3 className="text-xl font-bold text-zinc-900 mb-2">No knowledge base items yet</h3>
                 <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                   {activeTab === 'all' && "Your AI agent is currently un-trained. Click one of the buttons above to upload PDFs, store FAQs, or write business facts."}
                   {activeTab === 'documents' && "You haven't uploaded any documents. Upload PDFs to let the AI learn your business instantly."}
                   {activeTab === 'faqs' && "You haven't added any FAQs. Define specific Question & Answer pairs for the AI to memorize."}
                   {activeTab === 'facts' && "You haven't added any business facts. Store pricing, policies, or general data here."}
                 </p>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredItems.map((item) => {
                const isFaq = item.category === 'FAQ';
                const isDoc = item.category === 'Document';
                
                let iconColor = 'text-blue-600';
                let iconBg = 'bg-blue-50 border-blue-100';
                
                if (isFaq) {
                  iconColor = 'text-orange-600';
                  iconBg = 'bg-orange-50 border-orange-100';
                } else if (isDoc) {
                  iconColor = 'text-violet-600';
                  iconBg = 'bg-violet-50 border-violet-100';
                }

                return (
                  <div 
                    key={item.id} 
                    className="bg-white border border-zinc-200/80 rounded-2xl p-6 hover:shadow-md hover:border-zinc-300 transition-all duration-300 flex flex-col h-[280px] group relative"
                  >
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-start mb-5">
                        <div className={`p-2.5 rounded-xl border ${iconBg} ${iconColor} transition-transform group-hover:scale-105`}>
                          {isFaq ? <MessageSquareQuote size={18} strokeWidth={2.5}/> : 
                           isDoc ? <File size={18} strokeWidth={2.5}/> :
                           <FileText size={18} strokeWidth={2.5}/>}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-zinc-900 mb-2 group-hover:text-violet-700 transition-colors line-clamp-2">
                        {isFaq ? formatFaqTitle(item.title) : item.title}
                      </h3>
                      
                      <p className="text-[13px] text-zinc-500 leading-relaxed font-medium line-clamp-4">
                        {isFaq ? formatFaqContent(item.content) : item.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                        <Sparkles size={12} className="text-emerald-500" /> AI TRAINED
                      </div>
                      <button 
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Modals */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div className="flex items-center gap-3">
                {activeModal === 'upload' && <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><UploadCloud size={18} /></div>}
                {activeModal === 'faq' && <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><HelpCircle size={18} /></div>}
                {activeModal === 'fact' && <div className="p-2 bg-zinc-200 text-zinc-700 rounded-lg"><FileText size={18} /></div>}
                
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {activeModal === 'upload' ? 'Upload Document' : activeModal === 'faq' ? 'Add FAQ' : 'Add Business Fact'}
                  </h2>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              
              {activeModal === 'upload' && (
                <div 
                  onClick={() => !isSaving && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-zinc-200 rounded-2xl p-10 text-center bg-zinc-50/50 ${!isSaving ? 'cursor-pointer hover:border-violet-300 hover:bg-violet-50/50' : ''} transition-all duration-300 group`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" disabled={isSaving} />
                  {isSaving ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-violet-500" />
                      <p className="font-bold text-zinc-900">Analyzing content...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 shadow-sm group-hover:scale-105 transition-transform">
                        <UploadCloud size={24} className="text-violet-500" />
                      </div>
                      <h4 className="text-base font-bold text-zinc-900 mb-1">Click or drag file here</h4>
                      <p className="text-xs text-zinc-500 font-medium">Supports PDF and TXT. Max 10MB.</p>
                    </>
                  )}
                </div>
              )}

              {activeModal === 'faq' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Question</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Do you ship internationally?" 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Answer</label>
                    <textarea 
                      placeholder="Yes, we ship to over 50 countries..." 
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      rows={4}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {activeModal === 'fact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Return Policy" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none transition-all shadow-sm"
                      >
                        <option>General</option>
                        <option>Products / Services</option>
                        <option>Pricing</option>
                        <option>Policies</option>
                        <option>Location</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Fact Details</label>
                    <textarea 
                      placeholder="Paste business details here..." 
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={5}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none transition-all shadow-sm resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {activeModal !== 'upload' && (
              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3">
                <button onClick={closeModal} className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-lg font-bold hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-sm text-sm">Cancel</button>
                <button 
                  onClick={activeModal === 'faq' ? handleAddFaq : handleAddFact} 
                  disabled={isSaving || (activeModal === 'faq' ? (!newQuestion || !newAnswer) : (!newTitle || !newContent))} 
                  className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700 transition-colors shadow-sm text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Entry'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title="Delete Knowledge Base Entry"
        message="Are you sure you want to delete this data? It will be permanently removed from your AI's trained context."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default KnowledgeBase;
