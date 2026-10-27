import React, { useState, useEffect, useRef } from 'react';
import { getLeads, getMessages, sendMessage, claimConversation, releaseConversation } from '../api/crm.api';
import type { Lead, Message, ConversationHandoffResult } from '../models/crm.models';
import { Link } from 'react-router-dom';
import { Send, Loader2, Search, SearchX, Inbox as InboxIcon, MessageCircle, MessagesSquare, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';

/** Pulls the API's error message off an axios failure without resorting to `any`. */
const extractApiMessage = (err: unknown, fallback: string): string => {
  const message = (err as { response?: { data?: { Message?: string } } })?.response?.data?.Message;
  return message || fallback;
};

const formatTime = (value: string) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/** Thread-list timestamp: clock time today, short date before that. */
const formatListTime = (value: string) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// There is no read/unread state on a lead, so the list filters on what the data
// does carry: escalations waiting on a person, and threads the assistant holds.
type ThreadFilter = 'all' | 'needs_you' | 'assistant';
const THREAD_FILTERS: Record<ThreadFilter, { label: string; test: (lead: Lead) => boolean }> = {
  all: { label: 'All', test: () => true },
  needs_you: { label: 'Needs you', test: (lead) => lead.lead_status === 'Needs_Human' },
  assistant: { label: 'Assistant', test: (lead) => !lead.human_agent_active },
};

const Inbox: React.FC = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // Manual mode is server state, not a local toggle. Previously this was local-only, so
  // the AI kept auto-replying while the agent believed they had taken over.
  const [isTogglingMode, setIsTogglingMode] = useState(false);
  const [outsideWindow, setOutsideWindow] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [threadQuery, setThreadQuery] = useState('');
  const [threadFilter, setThreadFilter] = useState<ThreadFilter>('all');
  // Phones have room for one pane: the list, or the thread the person opened.
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
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
      setIsConnected(true);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
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

  const isManualMode = !!selectedLead?.human_agent_active;

  /**
   * Claims or releases the conversation on the server. Claiming suppresses the automation
   * engine for this thread and attributes outbound messages to this agent.
   */
  const handleToggleManualMode = async () => {
    if (!selectedLead || isTogglingMode) return;
    setIsTogglingMode(true);
    try {
      if (isManualMode) {
        const res = await releaseConversation(selectedLead.id);
        if (res.Success || res.Data) {
          applyLeadUpdate({ ...selectedLead, human_agent_active: false, assigned_agent_id: null });
          setOutsideWindow(false);
          toast.success('Handed back to the assistant.');
        } else {
          toast.error(res.Message || 'Could not hand the conversation back.');
        }
      } else {
        const res = await claimConversation(selectedLead.id);
        const data = (res.Data as ConversationHandoffResult | undefined);
        if (res.Success || data) {
          applyLeadUpdate({
            ...selectedLead,
            human_agent_active: true,
            assigned_agent_id: data?.assigned_agent_id ?? null,
            lead_status: 'Handoff'
          });
          setOutsideWindow(!!data?.outside_standard_window);
          toast.success('You have this conversation. The assistant will not reply.');
        } else {
          toast.error(res.Message || 'Could not take over the conversation.');
        }
      }
    } catch (err) {
      toast.error(extractApiMessage(err, 'Could not change who is handling this conversation.'));
    } finally {
      setIsTogglingMode(false);
    }
  };

  const applyLeadUpdate = (updated: Lead) => {
    setSelectedLead(updated);
    setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
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
      // The backend now reports Meta rejections rather than logging a phantom send.
      toast.error(extractApiMessage(error, 'Instagram did not accept the message.'));
    }
  };

  const query = threadQuery.trim().toLowerCase();
  const matchesQuery = (lead: Lead) =>
    !query ||
    lead.customer_name.toLowerCase().includes(query) ||
    lead.instagram_handle.toLowerCase().includes(query);
  const filterCounts: Record<ThreadFilter, number> = {
    all: leads.length,
    needs_you: leads.filter(THREAD_FILTERS.needs_you.test).length,
    assistant: leads.filter(THREAD_FILTERS.assistant.test).length,
  };
  const visibleLeads = leads.filter(lead => THREAD_FILTERS[threadFilter].test(lead) && matchesQuery(lead));

  return (
    // Fills the viewport under the 56px header, minus the content padding (16px a side on phones, 24px above 860px).
    <div className="flex h-[calc(100dvh-88px)] flex-col min-[861px]:h-[calc(100dvh-104px)]">
      <div className="surface flex min-h-0 flex-grow overflow-hidden">
        {/* Thread list. The page heading lives here, above the list it names. */}
        <div className={`${showThreadOnMobile ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-hairline bg-porcelain md:w-[300px] md:border-r lg:w-[320px]`}>
          <div className="shrink-0 space-y-2.5 border-b border-hairline px-3 pb-3 pt-3.5">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <h1 className="text-[18px] font-semibold tracking-[-0.014em] text-ink">Inbox</h1>
              <span
                className={isConnected ? 'chip chip-dot chip-go' : 'chip chip-dot chip-warn is-pulsing'}
                role="status"
              >
                {isConnected ? 'Live' : 'Reconnecting'}
              </span>
            </div>

            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="search"
                value={threadQuery}
                onChange={(e) => setThreadQuery(e.target.value)}
                placeholder="Search name or handle"
                className="field py-[7px] pl-8 text-[14px]"
                aria-label="Search conversations"
              />
            </div>

            <div className="segmented" role="group" aria-label="Filter conversations">
              {(Object.keys(THREAD_FILTERS) as ThreadFilter[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={threadFilter === key}
                  onClick={() => setThreadFilter(key)}
                >
                  {THREAD_FILTERS[key].label}
                  <span className="count">{filterCounts[key]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="premium-scroll flex-grow overflow-y-auto">
            {visibleLeads.length === 0 ? (
              leads.length === 0 ? (
                <div className="empty px-6 py-12">
                  <span className="empty-mark"><InboxIcon /></span>
                  <p className="empty-title">No conversations yet</p>
                  <p className="empty-body">Threads appear the moment someone messages your Instagram account.</p>
                  <Link to="/meta-integration" className="btn btn-sm">Check Instagram connection</Link>
                </div>
              ) : (
                <div className="empty px-6 py-12">
                  <span className="empty-mark"><SearchX /></span>
                  <p className="empty-title">Nothing matches</p>
                  <p className="empty-body">No conversation fits this search and filter.</p>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => { setThreadQuery(''); setThreadFilter('all'); }}
                  >
                    Clear filters
                  </button>
                </div>
              )
            ) : visibleLeads.map((lead) => {
              const isSelected = selectedLead?.id === lead.id;
              // The rail names who holds the thread: ink for a person on your
              // team, the accent for the assistant.
              const railClass = lead.human_agent_active ? 'rail-human' : 'rail-machine';
              return (
                <button
                  key={lead.id}
                  onClick={() => { handleSelectLead(lead); setShowThreadOnMobile(true); }}
                  aria-current={isSelected}
                  className={`flex w-full items-center gap-2.5 border-b border-hairline px-3 py-2.5 text-left transition-colors ${railClass} ${
                    isSelected ? 'bg-surface' : 'hover:bg-porcelain-deep'
                  }`}
                >
                  <span className="avatar-initial" style={{ width: 32, height: 32, fontSize: 13 }}>
                    {lead.customer_name[0]}
                  </span>
                  <span className="min-w-0 flex-grow">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-[14px] text-ink ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                        {lead.customer_name}
                      </span>
                      <span className="shrink-0 text-[12px] tabular-nums text-ink-faint">
                        {formatListTime(lead.last_message_time)}
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] text-ink-soft">@{lead.instagram_handle}</span>
                      {lead.lead_status === 'Needs_Human' && (
                        <span className="chip chip-dot chip-stop shrink-0 px-1.5 py-0 text-[12px]">Needs you</span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation */}
        <div className={`${showThreadOnMobile ? 'flex' : 'hidden md:flex'} min-w-0 flex-grow flex-col`}>
          {selectedLead ? (
            <>
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-hairline px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowThreadOnMobile(false)}
                    className="btn btn-ghost btn-icon btn-sm -ml-2 md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span className="avatar-initial">{selectedLead.customer_name[0]}</span>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-[17px] font-semibold leading-tight text-ink">
                      {selectedLead.customer_name}
                    </h2>
                    <p className="truncate text-[13px] text-ink-soft">@{selectedLead.instagram_handle}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className={`${isManualMode ? 'chip chip-dot chip-ink' : 'chip chip-dot chip-accent'} hidden sm:inline-flex`}>
                    {isManualMode ? 'You are replying' : 'Assistant is replying'}
                  </span>
                  <button
                    onClick={handleToggleManualMode}
                    disabled={isTogglingMode}
                    className={isManualMode ? 'btn' : 'btn btn-primary'}
                  >
                    {isTogglingMode && <Loader2 size={14} className="animate-spin" />}
                    {isManualMode ? 'Hand back to assistant' : 'Take over'}
                  </button>
                </div>
              </div>

              {isManualMode && outsideWindow && (
                <div className="shrink-0 border-b border-hairline bg-signal-warn-tint px-5 py-2 text-[13px] text-signal-warn">
                  The 24-hour reply window has closed. Your message will be sent with the human agent tag.
                </div>
              )}

              {/* Message history. Each message carries a rail in its actor's
                  colour, so who said what is legible without reading labels. */}
              <div
                className="premium-scroll flex flex-grow flex-col gap-5 overflow-y-auto bg-porcelain px-5 py-6 sm:px-8"
                ref={chatHistoryRef}
              >
                {messages.length === 0 && (
                  <div className="empty my-auto py-10">
                    <span className="empty-mark"><MessageCircle /></span>
                    <p className="empty-title">No messages yet</p>
                    <p className="empty-body">New messages in this thread land here as they arrive.</p>
                  </div>
                )}

                {messages.map((msg) => {
                  const isOutbound = msg.direction === 'Outbound';
                  // Outbound traffic is the assistant unless a person has the
                  // thread, in which case it is the person on your team.
                  const fromHuman = isOutbound && isManualMode;
                  const author = !isOutbound
                    ? (selectedLead?.customer_name || selectedLead?.instagram_handle || 'Customer')
                    : fromHuman ? 'You' : 'Assistant';

                  return (
                    <div
                      key={msg.id}
                      className={`flex max-w-[78%] flex-col gap-1.5 ${isOutbound ? 'self-end items-end' : 'self-start'}`}
                    >
                      <div className={`flex items-baseline gap-2 text-[13px] ${isOutbound ? 'flex-row-reverse' : ''}`}>
                        <span className="font-medium text-ink">{author}</span>
                        <span className="text-ink-faint">{formatTime(msg.created_on)}</span>
                      </div>

                      <div
                        className={`bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink ${
                          isOutbound
                            ? `${fromHuman ? 'rail-human' : 'rail-machine'} rounded-l-[10px] rounded-r-[2px] border-y border-r border-hairline`
                            : 'rounded-r-[10px] rounded-l-[2px] border-y border-l border-hairline border-l-[2px] border-l-[color:var(--hairline-strong)]'
                        }`}
                      >
                        {msg.message_text?.startsWith('[IMAGE]') ? (
                          <img
                            src={msg.message_text.replace('[IMAGE] ', '')}
                            alt="Shared by the customer"
                            className="max-w-full rounded-[6px]"
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.message_text}</p>
                        )}
                      </div>

                      {msg.ai_notes && (
                        <div className="rail-machine max-w-[52ch] self-start border-y border-r border-hairline bg-porcelain-deep px-3 py-2">
                          <p className="text-[13px] font-medium text-viridian">
                            Assistant: {String(msg.action_taken || 'note').replace(/_/g, ' ')}
                          </p>
                          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{msg.ai_notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Composer. Locked while the assistant holds the thread, and it
                  says why rather than appearing broken. */}
              <div className="shrink-0 border-t border-hairline p-3">
                {isManualMode ? (
                  <div className="flex items-end gap-2">
                    <input
                      type="text"
                      placeholder={`Message ${selectedLead.customer_name}`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                      className="field"
                      aria-label="Your reply"
                      autoFocus
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="btn btn-primary shrink-0"
                    >
                      <Send size={15} />
                      Send
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
                    <p className="text-[13px] text-ink-soft">
                      The assistant is replying to this conversation. Take it over to write yourself.
                    </p>
                    <button onClick={handleToggleManualMode} disabled={isTogglingMode} className="btn btn-sm">
                      {isTogglingMode && <Loader2 size={13} className="animate-spin" />}
                      Take over
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty flex-grow bg-porcelain">
              <span className="empty-mark"><MessagesSquare /></span>
              <p className="empty-title">Pick a conversation</p>
              <p className="empty-body">Choose a thread on the left to read it and step in if it needs you.</p>
              {filterCounts.needs_you > 0 && (
                <button type="button" className="btn btn-primary" onClick={() => setThreadFilter('needs_you')}>
                  Show the {filterCounts.needs_you} that need you
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
