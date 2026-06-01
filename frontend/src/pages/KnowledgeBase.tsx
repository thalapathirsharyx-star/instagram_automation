import React, { useState, useEffect } from 'react';
import { Book, Plus, Trash2, Sparkles, FileText, UploadCloud, Loader2, MessageSquareQuote, HelpCircle, File } from 'lucide-react';
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
        toast.success('Knowledge item deleted', 'The item has been removed from your Brain Base.');
      } else {
        toast.error('Failed to delete', res.data.Message || 'An error occurred while deleting.');
      }
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast.error('Error deleting knowledge', 'An unexpected network error occurred.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
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

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Brain Base</h1>
          <p className="text-zinc-400 font-medium">Train your AI with documents, FAQs, and business facts.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/knowledge/upload')}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-800/50 border border-white/5 rounded-xl text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <UploadCloud size={18} className="text-purple-400" />
            <span>Upload</span>
          </button>
          <button 
            onClick={() => navigate('/knowledge/add-faq')}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-800/50 border border-white/5 rounded-xl text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <HelpCircle size={18} className="text-purple-400" />
            <span>Add FAQ</span>
          </button>
          <button 
            onClick={() => navigate('/knowledge/add-fact')}
            className="w3-button-primary shadow-glow-purple cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Fact</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 gap-8">
        {[
          { id: 'all', label: 'All Knowledge' },
          { id: 'documents', label: 'Documents' },
          { id: 'faqs', label: 'FAQs' },
          { id: 'facts', label: 'Business Facts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === tab.id 
                ? 'text-purple-400 font-extrabold' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 size={48} className="animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.length === 0 ? (
            <div className="w3-card py-24 text-center flex flex-col items-center justify-center border-dashed border-white/10 bg-zinc-900/30">
               <div className="w-24 h-24 bg-zinc-800 border border-white/5 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                  <Book size={48} className="text-purple-500/50" />
               </div>
               <div className="max-w-md">
                 <h3 className="text-2xl font-bold text-zinc-100 mb-3">No items found</h3>
                 <p className="text-zinc-400 font-medium leading-relaxed mb-10">
                   {activeTab === 'all' && "You haven't uploaded or added any knowledge yet."}
                   {activeTab === 'documents' && "You haven't uploaded any documents yet."}
                   {activeTab === 'faqs' && "You haven't added any FAQs yet."}
                   {activeTab === 'facts' && "You haven't added any business facts yet."}
                 </p>
               </div>
               <div className="flex gap-4">
                 {activeTab === 'documents' && (
                   <button onClick={() => navigate('/knowledge/upload')} className="w3-button-primary px-10 shadow-glow-purple">Upload Document</button>
                 )}
                 {activeTab === 'faqs' && (
                   <button onClick={() => navigate('/knowledge/add-faq')} className="w3-button-primary px-10 shadow-glow-purple">Add FAQ</button>
                 )}
                 {activeTab === 'facts' && (
                   <button onClick={() => navigate('/knowledge/add-fact')} className="w3-button-primary px-10 shadow-glow-purple">Add Fact</button>
                 )}
                 {activeTab === 'all' && (
                   <>
                     <button onClick={() => navigate('/knowledge/upload')} className="px-8 py-3.5 bg-zinc-800/50 border border-white/5 rounded-xl font-bold text-zinc-300 hover:bg-zinc-800 transition-all shadow-sm hover:text-white">Upload PDF</button>
                     <button onClick={() => navigate('/knowledge/add-faq')} className="w3-button-primary px-10 shadow-glow-purple">Add First FAQ</button>
                   </>
                 )}
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {filteredItems.map((item) => {
                const isFaq = item.category === 'FAQ';
                const isDoc = item.category === 'Document';
                
                return (
                  <div 
                    key={item.id} 
                    className="w3-card group flex flex-col justify-between hover:border-purple-500/30 transition-all duration-500 border-white/5 h-[300px]"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all duration-500 border border-purple-500/20 shadow-inner">
                          {isFaq ? <MessageSquareQuote size={18} /> : 
                           isDoc ? <File size={18} /> :
                           <FileText size={18} />}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 border border-white/5 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-zinc-100 mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                        {isFaq ? formatFaqTitle(item.title) : item.title}
                      </h3>
                      
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium line-clamp-5">
                        {isFaq ? formatFaqContent(item.content) : item.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                        <Sparkles size={10} /> AI READY
                      </div>
                      <button 
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
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
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title="Delete Knowledge Item"
        message="Are you sure you want to delete this knowledge item? This action will permanently remove it from your AI's trained context."
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
