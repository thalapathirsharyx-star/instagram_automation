import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, UploadCloud, Loader2, MessageSquareQuote, HelpCircle, File, BrainCircuit, X, Edit2 } from 'lucide-react';
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  // The upload zone says "drag", so it has to accept a drop, not only a click.
  const handleFileDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (isSaving) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!/\.(pdf|txt)$/i.test(file.name)) {
      toast.error('Unsupported file', 'Upload a PDF or TXT file.');
      return;
    }
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
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

  const tabs: { id: typeof activeTab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'all', label: 'All assets', icon: BrainCircuit, count: items.length },
    { id: 'documents', label: 'Documents', icon: File, count: items.filter(i => i.category === 'Document').length },
    { id: 'faqs', label: 'FAQs', icon: MessageSquareQuote, count: items.filter(i => i.category === 'FAQ').length },
    { id: 'facts', label: 'Facts', icon: FileText, count: items.filter(i => i.category !== 'Document' && i.category !== 'FAQ').length },
  ];

  // Escape closes the editor, as it does every other dialog in the app.
  useEffect(() => {
    if (activeModal === 'none') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isSaving) closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal, isSaving]);

  const modalTitle =
    activeModal === 'upload' ? 'Upload document'
      : activeModal === 'faq' ? (editingId ? 'Edit FAQ' : 'Add FAQ')
        : (editingId ? 'Edit business fact' : 'Add business fact');
  const modalIcon = activeModal === 'upload' ? UploadCloud : activeModal === 'faq' ? HelpCircle : FileText;
  const ModalIcon = modalIcon;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Brain base</h1>
          <p className="page-sub">Upload documents, FAQs, and business context. The AI uses this data to answer customer questions automatically.</p>
        </div>

        <div className="page-actions">
          <button onClick={() => setActiveModal('upload')} className="btn">
            <UploadCloud size={16} /> Upload PDF
          </button>
          <button onClick={() => setActiveModal('faq')} className="btn">
            <HelpCircle size={16} /> Add FAQ
          </button>
          <button onClick={() => setActiveModal('fact')} className="btn btn-primary">
            <Plus size={16} /> Add fact
          </button>
        </div>
      </div>

      <div className="tabs mb-6" role="tablist" aria-label="Knowledge type">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={16} /> {label}
            {!isLoading && <span className="chip px-1.5 py-0 text-[12px]">{count}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="surface empty">
          <Loader2 size={22} className="animate-spin text-ink-faint" />
          <p className="empty-body">Loading your brain base…</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="surface empty">
          <span className="empty-mark"><BrainCircuit /></span>
          <p className="empty-title">
            {activeTab === 'all' ? 'No knowledge yet' : `No ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} yet`}
          </p>
          <p className="empty-body">
            {activeTab === 'all' && "Your AI agent hasn't been trained yet. Upload PDFs, store FAQs, or write business facts."}
            {activeTab === 'documents' && "You haven't uploaded any documents. Upload PDFs to let the AI learn your business instantly."}
            {activeTab === 'faqs' && "You haven't added any FAQs. Define specific question and answer pairs for the AI to memorize."}
            {activeTab === 'facts' && "You haven't added any business facts. Store pricing, policies, or general data here."}
          </p>
          <button
            onClick={() => setActiveModal(activeTab === 'documents' ? 'upload' : activeTab === 'faqs' ? 'faq' : 'fact')}
            className="btn btn-primary"
          >
            <Plus size={16} />
            {activeTab === 'documents' ? 'Upload a document' : activeTab === 'faqs' ? 'Add an FAQ' : 'Add a fact'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const isFaq = item.category === 'FAQ';
            const isDoc = item.category === 'Document';
            const Icon = isFaq ? MessageSquareQuote : isDoc ? File : FileText;
            const title = isFaq ? formatFaqTitle(item.title) : item.title;

            return (
              <article key={item.id} className="surface flex flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className={`icon-tile is-sm ${isFaq ? 'tone-peach' : isDoc ? 'tone-blue' : 'tone-lavender'}`}>
                    <Icon size={16} />
                  </span>
                  <span className="chip">{item.category}</span>
                </div>

                <h3 className="mb-1.5 line-clamp-2 text-[15px] font-semibold text-ink">{title}</h3>
                <p className="line-clamp-4 flex-grow text-[14px] leading-relaxed text-ink-soft">
                  {isFaq ? formatFaqContent(item.content) : item.content}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                  <span className="chip chip-dot chip-go">Trained</span>
                  <div className="flex items-center gap-1">
                    {!isDoc && (
                      <button
                        onClick={() => handleEditItem(item)}
                        className="btn btn-ghost btn-icon btn-sm"
                        aria-label={`Edit ${title}`}
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="btn btn-ghost btn-icon btn-sm is-danger"
                      aria-label={`Delete ${title}`}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeModal !== 'none' && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isSaving) closeModal(); }}>
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="kb-modal-title"
            className="modal"
            onSubmit={(e) => {
              e.preventDefault();
              if (activeModal === 'faq') handleAddFaq();
              else if (activeModal === 'fact') handleAddFact();
            }}
          >
            <div className="modal-head">
              <div className="flex items-center gap-3">
                <span className="icon-tile is-sm"><ModalIcon size={16} /></span>
                <h2 id="kb-modal-title">{modalTitle}</h2>
              </div>
              <button type="button" onClick={closeModal} disabled={isSaving} className="btn btn-ghost btn-icon btn-sm" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body space-y-5">
              {activeModal === 'upload' && (
                <>
                  <input
                    id="kb-modal-file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt"
                    className="peer sr-only"
                    disabled={isSaving}
                  />
                  <label
                    htmlFor="kb-modal-file"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    aria-busy={isSaving || undefined}
                    className={`flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed px-6 py-10 text-center transition-colors peer-focus-visible:border-viridian ${
                      isSaving ? 'cursor-progress border-hairline' : 'cursor-pointer border-hairline-strong hover:border-viridian hover:bg-porcelain'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={28} className="mb-3 animate-spin text-viridian" />
                        <p className="text-[15px] font-semibold text-ink">Analyzing content…</p>
                      </>
                    ) : (
                      <>
                        <span className="icon-tile mb-3 h-11 w-11"><UploadCloud size={20} /></span>
                        <p className="text-[15px] font-semibold text-ink">Click or drag a file here</p>
                        <p className="mt-1 text-[13px] text-ink-soft">PDF or TXT, up to 10 MB.</p>
                      </>
                    )}
                  </label>
                </>
              )}

              {activeModal === 'faq' && (
                <>
                  <div>
                    <label htmlFor="kb-question" className="field-label">Question</label>
                    <input
                      id="kb-question"
                      type="text"
                      placeholder="e.g. Do you ship internationally?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="field"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor="kb-answer" className="field-label">Answer</label>
                    <textarea
                      id="kb-answer"
                      placeholder="Yes, we ship to over 50 countries..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      rows={4}
                      className="field"
                    />
                  </div>
                </>
              )}

              {activeModal === 'fact' && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="kb-title" className="field-label">Title</label>
                      <input
                        id="kb-title"
                        type="text"
                        placeholder="e.g. Return policy"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="field"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label htmlFor="kb-category" className="field-label">Category</label>
                      <select
                        id="kb-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="field"
                      >
                        <option>General</option>
                        <option>Products / Services</option>
                        <option>Pricing</option>
                        <option>Policies</option>
                        <option>Location</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="kb-content" className="field-label">Fact details</label>
                    <textarea
                      id="kb-content"
                      placeholder="Paste business details here..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={5}
                      className="field"
                    />
                  </div>
                </>
              )}
            </div>

            {activeModal !== 'upload' && (
              <div className="modal-foot">
                <button type="button" onClick={closeModal} disabled={isSaving} className="btn">Cancel</button>
                <button
                  type="submit"
                  disabled={isSaving || (activeModal === 'faq' ? (!newQuestion || !newAnswer) : (!newTitle || !newContent))}
                  aria-busy={isSaving || undefined}
                  className="btn btn-primary"
                >
                  {isSaving && <Loader2 size={15} className="animate-spin" />}
                  {editingId ? 'Save changes' : 'Save entry'}
                </button>
              </div>
            )}
          </form>
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
