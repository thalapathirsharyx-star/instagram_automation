import React, { useState, useEffect, useRef } from 'react';
import { getLeads, getMessages, sendMessage } from '../api/crm.api';
import type { Lead, Message } from '../models/crm.models';
import { Send, MessageSquare, Bot, Hand, CheckCircle2 } from 'lucide-react';
import { io } from 'socket.io-client';

const Inbox: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isManualMode, setIsManualMode] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [socketStatus, setSocketStatus] = useState<'Connecting...' | 'Connected 🟢' | 'Disconnected 🔴'>('Connecting...');
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeads();

    // Set up WebSocket connection dynamically from API base URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8001/api/v1' : '/api/v1');
    const socketUrl = import.meta.env.VITE_SOCKET_URL || apiBaseUrl.replace('/api/v1', '');
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io'
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server:', socket.id);
      setSocketStatus('Connected 🟢');
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
      setSocketStatus('Disconnected 🔴');
    });

    socket.on('disconnect', () => {
      setSocketStatus('Disconnected 🔴');
    });

    socket.on('new_message', (data: any) => {
      console.log('New message received via WebSocket:', data);

      // Update messages list if this lead is currently selected
      const currentLead = selectedLeadRef.current;
      const targetLeadId = data.lead_id || data.lead?.id;
      const targetHandle = data.instagram_handle || data.lead?.instagram_handle;

      if (currentLead && (currentLead.id === targetLeadId || currentLead.instagram_handle === targetHandle)) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
        setTimeout(() => {
          if (chatHistoryRef.current) chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }, 100);
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
      if (data.length > 0 && !selectedLeadRef.current) {
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
      setTimeout(() => {
        if (chatHistoryRef.current) chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedLead || !messageText.trim()) return;
    try {
      const res = await sendMessage(selectedLead.id, messageText);
      setMessageText('');
      
      // Update the UI immediately with the newly sent message
      if (res?.Data) {
        setMessages(prev => [...prev, res.Data]);
        setTimeout(() => {
          if (chatHistoryRef.current) chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500 pb-6 max-w-7xl mx-auto" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Inbox</h1>
          <p className="text-sm text-zinc-500 font-medium">Monitor and manage your AI-driven conversations.</p>
        </div>
      </div>

      <div className="flex bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden flex-grow min-h-0">
        {/* Lead Sidebar */}
        <div className="w-[320px] shrink-0 border-r border-zinc-200 flex flex-col bg-zinc-50/30">
          <div className="p-5 border-b border-zinc-100 bg-white">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Active Threads</h2>
          </div>
          <div className="flex-grow overflow-y-auto">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={`flex gap-3 p-4 cursor-pointer transition-all duration-200 relative group border-b border-zinc-100
                  ${selectedLead?.id === lead.id ? 'bg-violet-50/50' : 'hover:bg-zinc-50'}`}
                onClick={() => handleSelectLead(lead)}
              >
                {selectedLead?.id === lead.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600 rounded-r-md"></div>
                )}
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm border border-violet-200 shadow-sm shrink-0">
                  {lead.customer_name[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className={`font-bold text-sm truncate pr-2 ${selectedLead?.id === lead.id ? 'text-violet-900' : 'text-zinc-900'}`}>
                      {lead.customer_name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border shrink-0
                      ${lead.lead_status === 'Buyer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        lead.lead_status === 'Needs_Human' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
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
        <div className="flex-grow min-w-0 flex flex-col bg-zinc-50/50 relative">
          {selectedLead ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-zinc-200 bg-white flex justify-between items-center z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm border border-violet-200 shadow-sm">
                    {selectedLead.customer_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 leading-tight">{selectedLead.customer_name}</h3>
                    <p className="text-xs text-zinc-500 font-medium">@{selectedLead.instagram_handle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">Agent Status:</span>
                  <button
                    onClick={() => setIsManualMode(!isManualMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm border ${isManualMode
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                  >
                    {isManualMode ? <Hand size={14} /> : <CheckCircle2 size={14} />}
                    {isManualMode ? 'Manual Mode Active' : 'AI Mode Active'}
                  </button>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-grow p-6 sm:p-8 overflow-y-auto flex flex-col gap-6" ref={chatHistoryRef}>
                <div className="text-center py-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-200/50 px-3 py-1 rounded-full">Beginning of Conversation</span>
                </div>
                {messages.map((msg) => (
                  <div key={msg.id} className={`max-w-[85%] lg:max-w-[75%] flex flex-col ${msg.direction === 'Outbound' ? 'self-end items-end' : 'self-start items-start'} mb-2`}>

                    {/* Name and Timestamp Above Bubble */}
                    <div className={`flex items-center gap-2 mb-1.5 px-1 ${msg.direction === 'Outbound' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs font-medium text-zinc-600">
                        {msg.direction === 'Outbound' ? 'Flazly Assistant' : selectedLead?.customer_name || selectedLead?.instagram_handle || 'Customer'}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-400">
                        {(() => {
                          const d = new Date(msg.created_on);
                          return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        })()}
                      </span>
                      {msg.direction === 'Outbound' && !isManualMode && (
                        <Bot size={12} className="text-violet-400 ml-1" />
                      )}
                    </div>

                    {/* Chat Bubble */}
                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] font-normal leading-relaxed ${msg.direction === 'Outbound'
                      ? 'bg-[#F3E8FF] border border-[#E9D5FF] text-zinc-800 rounded-tr-sm'
                      : 'bg-white border border-zinc-100 shadow-sm text-zinc-800 rounded-tl-sm'
                      }`}>
                      {msg.message_text.startsWith('[IMAGE]') ? (
                        <img src={msg.message_text.replace('[IMAGE] ', '')} alt="Shared image" className="rounded-xl max-w-full h-auto" />
                      ) : (
                        <p className="whitespace-pre-wrap">
                          {msg.message_text}
                        </p>
                      )}
                    </div>


                    {msg.ai_notes && (
                      <div className="mt-2 text-[11px] text-zinc-500 bg-white p-3 rounded-xl border border-zinc-200 shadow-sm self-start">
                        <span className="text-violet-600 font-bold block mb-1 uppercase tracking-wider text-[9px] flex items-center gap-1">
                          <Bot size={10} /> AI Action: {msg.action_taken}
                        </span>
                        <p className="font-medium leading-relaxed italic">{msg.ai_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-zinc-200">
                <div className={`flex gap-3 bg-zinc-50 p-2 rounded-xl border transition-all duration-200 shadow-inner ${isManualMode ? 'border-zinc-300 focus-within:border-violet-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]' : 'border-zinc-200 opacity-80'
                  }`}>
                  <input
                    type="text"
                    placeholder={isManualMode ? "Type a message to " + selectedLead.customer_name + "..." : "AI is actively managing this conversation..."}
                    disabled={!isManualMode}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className={`flex-grow px-3 py-2 bg-transparent text-sm font-medium outline-none ${isManualMode ? 'text-zinc-900 placeholder-zinc-400' : 'text-zinc-400'}`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!isManualMode || !messageText.trim()}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isManualMode && messageText.trim()
                      ? 'bg-violet-600 text-white shadow-sm hover:bg-violet-700'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      }`}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-12 bg-zinc-50/50">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 border border-zinc-200 shadow-sm">
                <MessageSquare size={24} className="text-zinc-300" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Select a Thread</h3>
              <p className="text-sm font-medium text-zinc-500">Review AI interactions or jump in to manage the conversation manually.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
