import React, { useState, useEffect, useRef } from 'react';
import { getLeads, getMessages, sendMessage } from '../api/crm.api';
import type { Lead, Message } from '../models/crm.models';
import { Send, MessageSquare } from 'lucide-react';
import { io } from 'socket.io-client';

const Inbox: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isManualMode, setIsManualMode] = useState(false);
  const [messageText, setMessageText] = useState('');
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

  const handleSendMessage = async () => {
    if (!selectedLead || !messageText.trim()) return;
    try {
      await sendMessage(selectedLead.id, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Inbox</h1>
          <p className="text-zinc-400 font-medium">Monitor and manage your AI-driven conversations.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-grow min-h-0">
        {/* Lead Sidebar */}
      <div className="w-[340px] shrink-0 bg-zinc-900/80 backdrop-blur-xl rounded-3xl flex flex-col overflow-hidden border border-white/5 shadow-xl">
        <div className="p-6 border-b border-white/5 bg-zinc-900/50">
          <h2 className="text-lg font-bold text-zinc-100">Active Threads</h2>
        </div>
        <div className="flex-grow overflow-y-auto premium-scroll">
          {leads.map((lead) => (
            <div 
              key={lead.id} 
              className={`flex gap-4 p-4 mx-3 my-2 rounded-[1.25rem] cursor-pointer transition-all duration-300 relative group
                ${selectedLead?.id === lead.id ? 'bg-purple-500/15 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border border-transparent hover:bg-zinc-800/50 hover:border-white/5'}`}
              onClick={() => handleSelectLead(lead)}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-lg shadow-inner border border-purple-500/20">
                {lead.customer_name[0]}
              </div>
              <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold truncate ${selectedLead?.id === lead.id ? 'text-purple-400' : 'text-zinc-200'}`}>
                    {lead.customer_name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter border
                    ${lead.lead_status === 'Buyer' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      lead.lead_status === 'Needs_Human' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      'bg-zinc-800 text-zinc-400 border-white/5'}`}>
                    {lead.lead_status}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-medium truncate">@{lead.instagram_handle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow min-w-0 bg-zinc-900/80 backdrop-blur-xl rounded-3xl flex flex-col overflow-hidden border border-white/5 shadow-xl">
        {selectedLead ? (
          <>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/80 backdrop-blur-sm z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold border border-white/5">
                  {selectedLead.customer_name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 leading-tight">{selectedLead.customer_name}</h3>
                  <p className="text-xs text-zinc-500 font-medium">@{selectedLead.instagram_handle}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsManualMode(!isManualMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border shadow-sm ${
                  isManualMode 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                    : 'bg-zinc-800 text-zinc-300 border-white/5 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {isManualMode ? 'AI Paused' : 'Human Handoff'}
              </button>
            </div>

            <div className="flex-grow p-8 overflow-y-auto premium-scroll flex flex-col gap-6 bg-zinc-950/50" ref={chatHistoryRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`max-w-[60%] flex flex-col ${msg.direction === 'Outbound' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`p-4 rounded-[1.5rem] shadow-sm border ${
                    msg.direction === 'Outbound' 
                      ? 'bg-purple-600 border-purple-500 text-white rounded-tr-md shadow-purple-500/20' 
                      : 'bg-zinc-900 border-white/10 text-zinc-200 rounded-tl-md'
                  }`}>
                    {msg.message_text.startsWith('[IMAGE]') ? (
                      <img src={msg.message_text.replace('[IMAGE] ', '')} alt="Shared image" className="rounded-2xl max-w-full h-auto border border-white/10" />
                    ) : (
                      <p className="text-sm leading-relaxed font-medium">{msg.message_text}</p>
                    )}
                    <span className={`text-[10px] mt-2 block ${msg.direction === 'Outbound' ? 'opacity-80' : 'text-zinc-500'} text-right font-bold`}>
                      {(() => {
                        const d = new Date(msg.created_on);
                        return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      })()}
                    </span>
                  </div>
                  {msg.ai_notes && (
                    <div className="mt-3 max-w-[90%] text-[11px] text-zinc-400 bg-purple-500/5 p-3 rounded-xl border border-purple-500/20 backdrop-blur-sm">
                      <span className="text-purple-400 font-bold block mb-1 uppercase tracking-widest text-[9px]">AI Reasoning: {msg.action_taken}</span>
                      <p className="font-medium leading-relaxed">{msg.ai_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 bg-zinc-900/80 border-t border-white/5 backdrop-blur-sm">
              <div className="flex gap-3 bg-zinc-950 p-2 rounded-[1.25rem] border border-white/5 focus-within:border-purple-500/50 transition-all duration-300 shadow-inner">
                <input 
                  type="text" 
                  placeholder={isManualMode ? "Type a message..." : "AI is managing this conversation..."} 
                  disabled={!isManualMode} 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className={`flex-grow px-4 py-2 bg-transparent text-sm font-medium outline-none ${isManualMode ? 'text-zinc-100' : 'text-zinc-500'}`}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!isManualMode || !messageText.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    isManualMode && messageText.trim() 
                      ? 'bg-purple-500 text-white border-purple-500 shadow-glow-purple hover:bg-purple-600' 
                      : 'bg-zinc-800 text-zinc-500 border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-zinc-500 p-12 text-center bg-zinc-950/30">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <MessageSquare size={40} className="opacity-20 text-zinc-400" />
            </div>
            <p className="text-lg font-bold text-zinc-400">Select a Thread</p>
            <p className="text-sm font-medium mt-1">Review AI interactions and manage handoffs.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
