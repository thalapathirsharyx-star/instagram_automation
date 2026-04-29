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

  // Helper to get token
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
    <div className="kb-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Book className="text-sky-500" /> Brain Base
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>
            Train your AI by uploading documents, adding FAQs, or pasting text facts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => { setIsAdding(true); setAddMode('upload'); }}
            className="glass-card hover-glow" 
            style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <UploadCloud size={18} className="text-sky-500" /> Upload Document
          </button>
          <button 
            onClick={() => { setIsAdding(true); setAddMode('faq'); }}
            className="glass-card hover-glow" 
            style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <HelpCircle size={18} className="text-sky-500" /> Add FAQ
          </button>
          <button 
            onClick={() => { setIsAdding(true); setAddMode('text'); }}
            className="gradient-btn" 
            style={{ padding: '10px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Add Fact
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="glass-card animate-in fade-in slide-in-from-top-4 duration-300" style={{ padding: '32px', border: '1px solid var(--primary-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              {addMode === 'upload' && <><UploadCloud className="text-sky-500" /> Upload Business Document</>}
              {addMode === 'faq' && <><HelpCircle className="text-sky-500" /> Add New FAQ</>}
              {addMode === 'text' && <><FileText className="text-sky-500" /> Add General Knowledge</>}
            </h3>
            <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
          </div>

          {addMode === 'upload' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                border: '2px dashed var(--glass-border)', 
                borderRadius: '16px', 
                padding: '48px', 
                textAlign: 'center', 
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              className="hover-glow"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".pdf,.txt" 
                style={{ display: 'none' }} 
              />
              {isSaving ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <Loader2 size={40} className="animate-spin text-sky-500" />
                  <p>Processing and analyzing document...</p>
                </div>
              ) : (
                <>
                  <UploadCloud size={48} className="text-sky-500" style={{ marginBottom: '16px', opacity: 0.6 }} />
                  <h4 style={{ margin: '0 0 8px 0' }}>Click to select or drag & drop</h4>
                  <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>Supports PDF and TXT files. AI will extract all text automatically.</p>
                </>
              )}
            </div>
          ) : addMode === 'faq' ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>Customer Question</label>
                <input 
                  type="text" 
                  placeholder="e.g. Do you ship internationally?" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="glass-input"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--glass-border)', border: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>AI Answer</label>
                <textarea 
                  placeholder="Yes, we ship to over 50 countries including UK, Canada, and Australia..." 
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--glass-border)', border: 'none', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={handleAdd} disabled={isSaving} className="gradient-btn" style={{ padding: '12px 32px', borderRadius: '12px' }}>
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save FAQ'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Return Policy" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="glass-input"
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--glass-border)', border: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ padding: '14px', borderRadius: '12px', background: 'var(--glass-border)', border: 'none', color: 'var(--text-main)' }}
                  >
                    <option>General</option>
                    <option>Products / Services</option>
                    <option>Pricing</option>
                    <option>Policies</option>
                    <option>Location</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>Content</label>
                <textarea 
                  placeholder="Paste details here..." 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--glass-border)', border: 'none', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={handleAdd} disabled={isSaving} className="gradient-btn" style={{ padding: '12px 32px', borderRadius: '12px' }}>
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Knowledge'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Loader2 size={40} className="animate-spin text-sky-500" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {items.map((item) => (
            <div key={item.id} className="glass-card hover-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ padding: '8px', background: 'var(--primary-soft)', borderRadius: '10px' }}>
                  {item.category === 'FAQ' ? <MessageSquareQuote size={20} className="text-sky-500" /> : 
                   item.category === 'Document' ? <UploadCloud size={20} className="text-sky-500" /> :
                   <FileText size={20} className="text-sky-500" />}
                </div>
                <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--glass-border)', borderRadius: '6px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {item.category}
                </span>
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: 'var(--text-main)' }}>{item.title}</h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.88rem', 
                  color: 'var(--text-dim)', 
                  lineHeight: 1.6, 
                  display: '-webkit-box', 
                  WebkitLineClamp: 4, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden' 
                }}>
                  {item.content}
                </p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                  <Sparkles size={14} /> AI Ready
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  style={{ color: '#ef4444', background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', opacity: 0.6 }}
                  className="hover-opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {items.length === 0 && !isAdding && (
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '80px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
               <div style={{ padding: '24px', background: 'var(--primary-soft)', borderRadius: '24px' }}>
                  <Book size={48} className="text-sky-500" />
               </div>
               <div style={{ maxWidth: '400px' }}>
                 <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem' }}>Your AI is waiting to learn</h3>
                 <p style={{ margin: 0, color: 'var(--text-dim)', lineHeight: 1.6 }}>Upload your business documents or add FAQs to turn this AI into an expert on your business.</p>
               </div>
               <div style={{ display: 'flex', gap: '12px' }}>
                 <button onClick={() => { setIsAdding(true); setAddMode('upload'); }} className="glass-card" style={{ padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--glass-border)' }}>Upload PDF</button>
                 <button onClick={() => { setIsAdding(true); setAddMode('faq'); }} className="gradient-btn" style={{ padding: '12px 32px', borderRadius: '12px' }}>Add My First FAQ</button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
