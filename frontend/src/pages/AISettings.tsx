import React, { useState, useEffect } from 'react';
import { Bot, Save, RefreshCw, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { getAIPrompt, updateAIPrompt } from '../api/crm.api';

const AISettings: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      setIsLoading(true);
      const res = await getAIPrompt();
      setPrompt(res?.Data?.prompt || '');
    } catch (error) {
      console.error('Error fetching prompt:', error);
      setNotification({ type: 'error', message: 'Failed to load AI prompt' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateAIPrompt(prompt);
      setNotification({ type: 'success', message: 'AI Persona updated successfully!' });
    } catch (error) {
      console.error('Error updating prompt:', error);
      setNotification({ type: 'error', message: 'Failed to update AI Persona' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <RefreshCw className="animate-spin" size={32} style={{ color: '#0ea5e9' }} />
      </div>
    );
  }

  return (
    <div className="ai-settings-page">
      <header className="ai-header">
        <div className="title-section">
          <div className="icon-box">
            <Bot size={28} />
          </div>
          <div className="text-box">
            <h1>AI Persona</h1>
            <p>Define how Maya interacts with your customers</p>
          </div>
        </div>
        
        <div className="action-section">
          {notification && (
            <div className={`notification-pill ${notification.type}`}>
              {notification.type === 'success' ? <Sparkles size={14} /> : <AlertCircle size={14} />}
              {notification.message}
            </div>
          )}
          <button 
            className="save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{isSaving ? 'Saving...' : 'Save Persona'}</span>
          </button>
        </div>
      </header>

      <div className="ai-content-grid">
        <div className="editor-card glass-card">
          <div className="card-header">
            <div className="label">
              <Sparkles className="sparkle-icon" size={18} />
              <span>System Instructions</span>
            </div>
            <div className="engine-badge">Llama-3.3 Powered</div>
          </div>
          
          <textarea
            className="prompt-editor"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe Maya's personality and rules here..."
          />
          
          <div className="pro-tip">
            <AlertCircle size={18} />
            <div className="tip-content">
              <strong>Pro Tip:</strong> Use <span>${'{'}context{'}'}</span>, <span>${'{'}historyText{'}'}</span>, and <span>${'{'}messageText{'}'}</span> to keep Maya context-aware.
            </div>
          </div>
        </div>

        <aside className="ai-sidebar">
          <div className="info-card glass-card">
            <h3><MessageSquare size={18} /> Personality Tips</h3>
            <ul>
              <li>
                <strong>Tone:</strong> Be specific. Example: "Maya is warm, polite, and uses 'Akka/Anna' for respect."
              </li>
              <li>
                <strong>Tamil/Tanglish:</strong> Instruct her to maintain the user's language style.
              </li>
              <li>
                <strong>Guardrails:</strong> Define what she *cannot* do (e.g., "Don't promise discounts").
              </li>
            </ul>
          </div>

          <div className="help-card glass-card">
            <h3>Need Help?</h3>
            <p>
              Maya uses these instructions as her primary "brain." Updates are instant for all new chats.
            </p>
          </div>
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ai-settings-page {
          padding: 24px;
          animation: fadeIn 0.4s ease-out;
          color: #1e293b;
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 400px;
        }

        .ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 20px;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-box {
          width: 56px;
          height: 56px;
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(14, 165, 233, 0.2);
        }

        .text-box h1 {
          font-size: 1.75rem;
          margin: 0;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .text-box p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 0.95rem;
        }

        .action-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .save-btn {
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .save-btn:hover {
          background: #0284c7;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .ai-content-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .ai-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .editor-card {
          padding: 24px;
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 1.1rem;
          color: #0f172a;
        }

        .sparkle-icon {
          color: #f59e0b;
        }

        .engine-badge {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .prompt-editor {
          width: 100%;
          min-height: 500px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          color: #1e293b;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.95rem;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }

        .prompt-editor:focus {
          border-color: #0ea5e9;
          background: #fff;
        }

        .pro-tip {
          margin-top: 20px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 16px;
          border-radius: 12px;
          display: flex;
          gap: 12px;
          color: #0369a1;
        }

        .tip-content {
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .tip-content span {
          background: #e0f2fe;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          color: #0ea5e9;
          font-weight: 600;
        }

        .ai-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-card, .help-card {
          padding: 24px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
        }

        .info-card h3, .help-card h3 {
          margin: 0 0 16px;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0f172a;
        }

        .info-card ul {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .info-card li {
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .info-card li strong {
          color: #0f172a;
          display: block;
          margin-bottom: 2px;
        }

        .help-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #fff 100%);
        }

        .help-card p {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.6;
        }

        .notification-pill {
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .notification-pill.success {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #10b981;
        }

        .notification-pill.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #ef4444;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default AISettings;
