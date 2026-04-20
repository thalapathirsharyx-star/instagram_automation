import React, { useState, useEffect, useRef } from 'react';
import { getLeads, getMessages } from '../api/crm.api';
import type { Lead, Message } from '../models/crm.models';
import { Send } from 'lucide-react';
import { io } from 'socket.io-client';

const Inbox: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeads();

    // Set up WebSocket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '/');
    const socket = io(socketUrl);
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('new_message', (data: any) => {
      console.log('New message received via WebSocket:', data);
      
      // Update messages list if this lead is currently selected
      const currentLead = selectedLeadRef.current;
      if (currentLead && (currentLead.id === data.lead_id || currentLead.instagram_handle === data.lead?.instagram_handle)) {
        setMessages(prev => [...prev, data]);
        setTimeout(scrollToBottom, 100);
      }

      // Always refresh leads list to show new leads or update existing ones
      fetchLeads();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const selectedLeadRef = useRef<Lead | null>(null);
  useEffect(() => {
    selectedLeadRef.current = selectedLead;
  }, [selectedLead]);

  const fetchLeads = async () => {
    try {
      const res = await getLeads();
      const data = res?.Data || [];
      setLeads(data);
      if (data.length > 0 && !selectedLead) {
        handleSelectLead(data[0]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    }
  };

  const handleSelectLead = async (lead: Lead) => {
    if (!lead) return;
    setSelectedLead(lead);
    try {
      const res = await getMessages(lead.id);
      setMessages(res?.Data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };

  return (
    <div className="inbox-container" style={{ display: 'flex', gap: '16px', height: '100%' }}>
      {/* Lead Sidebar */}
      <div className="lead-sidebar glass-card" style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-header" style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Conversations</h2>
        </div>
        <div className="lead-list premium-scroll" style={{ flexGrow: 1, overflowY: 'auto' }}>
          {leads.map((lead) => (
            <div 
              key={lead.id} 
              className={`lead-item ${selectedLead?.id === lead.id ? 'active' : ''}`}
              onClick={() => handleSelectLead(lead)}
              style={{
                display: 'flex', gap: '12px', padding: '16px', cursor: 'pointer',
                borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s',
                backgroundColor: selectedLead?.id === lead.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderLeft: selectedLead?.id === lead.id ? '4px solid var(--primary)' : 'none'
              }}
            >
              <div className="lead-avatar" style={{
                background: 'var(--primary)', width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600
              }}>
                {lead.customer_name[0]}
              </div>
              <div className="lead-info" style={{ flexGrow: 1, overflow: 'hidden' }}>
                <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="name" style={{ fontWeight: 500, fontSize: '0.95rem' }}>{lead.customer_name}</span>
                  <span className="status-badge" style={{
                    fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                    border: '1px solid var(--glass-border)', color: lead.lead_status === 'Hot' ? 'var(--hot)' : 'inherit'
                  }}>{lead.lead_status}</span>
                </div>
                <div className="handle" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>@{lead.instagram_handle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area glass-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedLead ? (
          <>
            <div className="chat-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedLead.customer_name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-dim)' }}>@{selectedLead.instagram_handle}</p>
              </div>
              <button className="action-btn" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--foreground)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Human Handoff</button>
            </div>

            <div className="chat-history premium-scroll" ref={chatHistoryRef} style={{ flexGrow: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`message-wrapper ${msg.direction === 'Outbound' ? 'outbound' : ''}`} style={{
                  maxWidth: '70%', alignSelf: msg.direction === 'Outbound' ? 'flex-end' : 'flex-start'
                }}>
                  <div className="message-bubble" style={{
                    padding: '12px 16px', borderRadius: '12px', background: msg.direction === 'Outbound' ? 'var(--primary)' : 'var(--glass-border)', color: msg.direction === 'Outbound' ? '#fff' : 'var(--foreground)'
                  }}>
                    <p className="text" style={{ margin: 0, lineHeight: 1.5 }}>{msg.message_text}</p>
                    <span className="time" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginTop: 4, textAlign: 'right' }}>
                      {(() => {
                        const d = new Date(msg.created_on);
                        return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      })()}
                    </span>
                  </div>
                  {msg.ai_notes && (
                    <div className="ai-logic" style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-dim)', borderLeft: '2px solid var(--primary)', paddingLeft: '8px' }}>
                      <span className="logic-tag" style={{ color: 'var(--primary)', fontWeight: 500, display: 'block' }}>AI Concept: {msg.action_taken}</span>
                      <p className="logic-detail">{msg.ai_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="chat-input" style={{ padding: '16px 24px', display: 'flex', gap: '12px', borderTop: '1px solid var(--glass-border)' }}>
              <input 
                type="text" 
                placeholder="Type a message (Manual override)..." 
                disabled 
                style={{ flexGrow: 1, background: 'var(--glass-border)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '8px 16px', color: 'var(--foreground)', outline: 'none' }}
              />
              <button className="send-btn" style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="no-selection" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            <p>Select a conversation to view DMs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
