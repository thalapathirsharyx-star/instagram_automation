import React, { useState, useEffect, useRef } from 'react';
import { Book, Plus, Trash2, Sparkles, FileText, UploadCloud, Loader2, MessageSquareQuote, HelpCircle, File, BrainCircuit, X, Edit2 } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
      const payload = { title: newTitle, content: newContent, category: category };
      const res = editingId 
        ? await api.put(`/Instagram/KnowledgeBase/${editingId}`, payload)
        : await api.post('/Instagram/KnowledgeBase', payload);
        
      if (res.data.Success) {
        toast.success(editingId ? 'Fact updated successfully' : 'Fact added successfully');
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
      const payload = {
        title: `FAQ: ${newQuestion}`,
        content: `Q: ${newQuestion}\nA: ${newAnswer}`,
        category: 'FAQ'
      };
      const res = editingId 
        ? await api.put(`/Instagram/KnowledgeBase/${editingId}`, payload)
        : await api.post('/Instagram/KnowledgeBase', payload);
        
      if (res.data.Success) {
        toast.success(editingId ? 'FAQ updated successfully' : 'FAQ added successfully');
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

  const handleEditItem = (item: any) => {
    setEditingId(item.id);
    if (item.category === 'FAQ') {
      const qMatch = item.content.match(/Q:\s*(.*?)\nA:/);
      const aMatch = item.content.match(/A:\s*([\s\S]*)/);
      setNewQuestion(qMatch ? qMatch[1].trim() : item.title.replace('FAQ: ', ''));
      setNewAnswer(aMatch ? aMatch[1].trim() : item.content);
      setActiveModal('faq');
    } else {
      setNewTitle(item.title);
      setNewContent(item.content);
      setCategory(item.category);
      setActiveModal('fact');
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
    setEditingId(null);
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
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
    >
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Brain Base</h2>
          <p className="text-muted-foreground text-sm">Upload documents, FAQs, and business context. The AI uses this data to answer customer questions automatically.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveModal('upload')}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-muted-foreground font-bold hover:border-border hover:bg-muted transition-all shadow-sm text-sm"
          >
            <UploadCloud size={16} className="text-foreground" />
            <span className="hidden sm:inline">Upload PDF</span>
          </button>
          <button 
            onClick={() => setActiveModal('faq')}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-muted-foreground font-bold hover:border-border hover:bg-muted transition-all shadow-sm text-sm"
          >
            <HelpCircle size={16} className="text-blue-400" />
            <span className="hidden sm:inline">Add FAQ</span>
          </button>
          <button 
            onClick={() => setActiveModal('fact')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Fact</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-border pb-4">
        <div className="flex items-center gap-2 w-full overflow-x-auto">
          <TabButton id="all" label="All Assets" icon={BrainCircuit} />
          <TabButton id="documents" label="Documents" icon={File} />
          <TabButton id="faqs" label="FAQs" icon={MessageSquareQuote} />
          <TabButton id="facts" label="Facts" icon={FileText} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground font-medium">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-violet-600 rounded-full animate-spin"></div>
            <span className="text-sm">Syncing Knowledge Base...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
               <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
                  <BrainCircuit size={40} className="text-foreground" />
               </div>
               <div className="max-w-md mx-auto">
                 <h3 className="text-xl font-bold text-foreground mb-2">No knowledge base items yet</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed font-medium">
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
                
                let iconColor = 'text-blue-400';
                let iconBg = 'bg-blue-500/10 border-blue-500/20';
                
                if (isFaq) {
                  iconColor = 'text-orange-600';
                  iconBg = 'bg-orange-50 border-orange-100';
                } else if (isDoc) {
                  iconColor = 'text-foreground';
                  iconBg = 'bg-primary/10 border-primary/20';
                }

                return (
                  <div 
                    key={item.id} 
                    className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-border transition-all duration-300 flex flex-col h-[280px] group relative"
                  >
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-start mb-5">
                        <div className={`p-2.5 rounded-xl border ${iconBg} ${iconColor} transition-transform group-hover:scale-105`}>
                          {isFaq ? <MessageSquareQuote size={18} strokeWidth={2.5}/> : 
                           isDoc ? <File size={18} strokeWidth={2.5}/> :
                           <FileText size={18} strokeWidth={2.5}/>}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-foreground transition-colors line-clamp-2">
                        {isFaq ? formatFaqTitle(item.title) : item.title}
                      </h3>
                      
                      <p className="text-[13px] text-muted-foreground leading-relaxed font-medium line-clamp-4">
                        {isFaq ? formatFaqContent(item.content) : item.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                        <Sparkles size={12} className="text-emerald-400" /> AI TRAINED
                      </div>
                      <div className="flex items-center gap-1">
                        {item.category !== 'Document' && (
                          <button 
                            onClick={() => handleEditItem(item)}
                            className="p-1.5 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-card max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/50">
              <div className="flex items-center gap-3">
                {activeModal === 'upload' && <div className="p-2 bg-violet-100 text-foreground rounded-lg"><UploadCloud size={18} /></div>}
                {activeModal === 'faq' && <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><HelpCircle size={18} /></div>}
                {activeModal === 'fact' && <div className="p-2 bg-secondary text-muted-foreground rounded-lg"><FileText size={18} /></div>}
                
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {activeModal === 'upload' ? 'Upload Document' : 
                     activeModal === 'faq' ? (editingId ? 'Edit FAQ' : 'Add FAQ') : 
                     (editingId ? 'Edit Business Fact' : 'Add Business Fact')}
                  </h2>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-secondary rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              
              {activeModal === 'upload' && (
                <div 
                  onClick={() => !isSaving && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-border rounded-2xl p-10 text-center bg-muted/50 ${!isSaving ? 'cursor-pointer hover:border-violet-300 hover:bg-primary/10/50' : ''} transition-all duration-300 group`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" disabled={isSaving} />
                  {isSaving ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-foreground" />
                      <p className="font-bold text-foreground">Analyzing content...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border shadow-sm group-hover:scale-105 transition-transform">
                        <UploadCloud size={24} className="text-foreground" />
                      </div>
                      <h4 className="text-base font-bold text-foreground mb-1">Click or drag file here</h4>
                      <p className="text-xs text-muted-foreground font-medium">Supports PDF and TXT. Max 10MB.</p>
                    </>
                  )}
                </div>
              )}

              {activeModal === 'faq' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Question</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Do you ship internationally?" 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Answer</label>
                    <textarea 
                      placeholder="Yes, we ship to over 50 countries..." 
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      rows={4}
                      className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {activeModal === 'fact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Return Policy" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none transition-all shadow-sm"
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
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fact Details</label>
                    <textarea 
                      placeholder="Paste business details here..." 
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={5}
                      className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none transition-all shadow-sm resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {activeModal !== 'upload' && (
              <div className="px-6 py-4 bg-muted border-t border-border flex justify-end gap-3">
                <button onClick={closeModal} className="px-5 py-2.5 bg-card border border-border text-muted-foreground rounded-lg font-bold hover:bg-muted hover:border-border transition-colors shadow-sm text-sm">Cancel</button>
                <button 
                  onClick={activeModal === 'faq' ? handleAddFaq : handleAddFact} 
                  disabled={isSaving || (activeModal === 'faq' ? (!newQuestion || !newAnswer) : (!newTitle || !newContent))} 
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
