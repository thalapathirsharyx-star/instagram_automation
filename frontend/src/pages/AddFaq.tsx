import React, { useState } from 'react';
import { HelpCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="page">
      <Link to="/knowledge" className="page-back">
        <ArrowLeft size={16} /> Back to Brain base
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">Add a question</h1>
          <p className="page-sub">Add a frequently asked question to train your AI.</p>
        </div>
      </div>

      <form
        className="surface page-narrow overflow-hidden"
        onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
      >
        <div className="surface-head">
          <h2><span className="icon-tile is-sm"><HelpCircle size={16} /></span>Question and answer</h2>
        </div>
        <div className="surface-body space-y-5">
          <div>
            <label htmlFor="faq-question" className="field-label">Question</label>
            <input
              id="faq-question"
              type="text"
              placeholder="e.g. Do you ship internationally?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="faq-answer" className="field-label">Answer</label>
            <textarea
              id="faq-answer"
              placeholder="Yes, we ship to over 50 countries..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={5}
              className="field"
              required
            />
            <p className="field-hint">Write it the way you would answer a customer in a DM.</p>
          </div>
        </div>
        <div className="surface-foot justify-end">
          <button type="button" onClick={() => navigate('/knowledge')} className="btn">Cancel</button>
          <button
            type="submit"
            disabled={isSaving || !newQuestion || !newAnswer}
            aria-busy={isSaving || undefined}
            className="btn btn-primary"
          >
            {isSaving && <Loader2 size={15} className="animate-spin" />}
            Save FAQ
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFaq;
