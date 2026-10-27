import React, { useState } from 'react';
import { FileText, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="page">
      <Link to="/knowledge" className="page-back">
        <ArrowLeft size={16} /> Back to Brain base
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">Add a fact</h1>
          <p className="page-sub">Add text-based information about your business.</p>
        </div>
      </div>

      <form
        className="surface page-narrow overflow-hidden"
        onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
      >
        <div className="surface-head">
          <h2><span className="icon-tile is-sm"><FileText size={16} /></span>Fact details</h2>
        </div>
        <div className="surface-body space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="fact-title" className="field-label">Title</label>
              <input
                id="fact-title"
                type="text"
                placeholder="e.g. Return policy"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="fact-category" className="field-label">Category</label>
              <select
                id="fact-category"
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
            <label htmlFor="fact-content" className="field-label">Knowledge content</label>
            <textarea
              id="fact-content"
              placeholder="Paste details here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={7}
              className="field"
              required
            />
          </div>
        </div>
        <div className="surface-foot justify-end">
          <button type="button" onClick={() => navigate('/knowledge')} className="btn">Cancel</button>
          <button
            type="submit"
            disabled={isSaving || !newTitle || !newContent}
            aria-busy={isSaving || undefined}
            className="btn btn-primary"
          >
            {isSaving && <Loader2 size={15} className="animate-spin" />}
            Save fact
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFact;
