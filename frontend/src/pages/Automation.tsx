import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Save, Loader2, Info, Send, Bot, Zap } from 'lucide-react';
import api from '../lib/axios';

const Automation: React.FC = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to get token
  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/Instagram/Settings');
      if (res.data.Success) {
        // Assuming welcome_message is returned in the settings
        // Actually, I need to make sure getIntegrationSettings returns it
        setWelcomeMessage(res.data.Data?.welcome_message || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/Welcome', { message: welcomeMessage });
      if (res.data.Success) {
        alert('Automation settings updated successfully!');
      }
    } catch (error) {
      console.error('Error saving automation settings:', error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="automation-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header">
        <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Zap className="text-sky-500" /> Automation Center
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>
          Configure how your AI agent behaves when interacting with customers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Welcome Message Card */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquare className="text-sky-500" /> Welcome Message
                </h3>
                <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                  This message is sent automatically to every **new customer** who DMs you for the first time.
                </p>
              </div>
              <div className="toggle active"></div>
            </div>

            <div style={{ position: 'relative' }}>
              <textarea 
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="e.g. Hi there! Thanks for reaching out. Our team will be with you shortly. In the meantime, how can we help you?"
                rows={6}
                style={{ 
                  width: '100%', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  background: 'var(--glass-border)', 
                  border: '1px solid transparent',
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none',
                  transition: 'border 0.3s'
                }}
                className="focus-border-primary"
              />
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {welcomeMessage.length} characters
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gradient-btn" 
                style={{ padding: '12px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </div>

          {/* AI Response Settings */}
          <div className="glass-card" style={{ padding: '32px' }}>
             <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot className="text-sky-500" /> AI Response Logic
             </h3>
             <p style={{ margin: '8px 0 24px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                Fine-tune how the AI generates replies after the initial welcome.
             </p>

             <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--glass-border)', borderRadius: '12px' }}>
                   <div>
                      <div style={{ fontWeight: 600 }}>Response Delay</div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>Simulate human typing by adding a small delay.</p>
                   </div>
                   <select style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: 'none' }}>
                      <option>Instant</option>
                      <option>2-5 seconds</option>
                      <option>5-10 seconds</option>
                   </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--glass-border)', borderRadius: '12px' }}>
                   <div>
                      <div style={{ fontWeight: 600 }}>Human Handoff</div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>Notify team if AI cannot answer a question.</p>
                   </div>
                   <div className="toggle active"></div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px', background: 'var(--primary-soft)' }}>
            <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} className="text-sky-500" /> Pro Tip
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-dim)' }}>
              A warm welcome message increases customer trust by 40%. Keep it short, friendly, and set clear expectations for when a human might jump in.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0' }}>Preview</h4>
            <div style={{ background: 'var(--glass-border)', borderRadius: '12px', padding: '16px', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-dim)', marginBottom: '8px', fontSize: '0.75rem' }}>Customer DMs you...</div>
              <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '14px 14px 14px 2px', width: 'fit-content', maxWidth: '80%', marginBottom: '12px' }}>
                Hello!
              </div>
              <div style={{ color: 'var(--text-dim)', textAlign: 'right', marginBottom: '8px', fontSize: '0.75rem' }}>Your Agent replies...</div>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '10px 14px', borderRadius: '14px 14px 2px 14px', width: 'fit-content', maxWidth: '80%', marginLeft: 'auto' }}>
                {welcomeMessage || 'Your welcome message will appear here.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automation;
