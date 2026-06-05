import React, { useState, useEffect } from 'react';
import { getLeads } from '../api/crm.api';
import type { Lead } from '../models/crm.models';
import { Search, Filter, ExternalLink, Calendar, MessageCircle, MoreHorizontal } from 'lucide-react';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const res = await getLeads(true);
      setLeads(res?.Data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.instagram_handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Lead Intelligence</h1>
          <p className="text-zinc-400 font-medium">Manage and track your AI-discovered Instagram leads.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w3-input !pl-12 w-64 shadow-sm"
            />
          </div>
          <button onClick={fetchLeads} className="flex items-center gap-2 px-5 py-3 bg-zinc-800/50 border border-white/5 rounded-xl text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white transition-all shadow-sm">
            <Filter size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="w3-card p-0 overflow-hidden flex-grow shadow-lg border-white/5 flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-white/5">
                <th className="px-8 py-5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Customer Profile</th>
                <th className="px-8 py-5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Pipeline Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">AI Score</th>
                <th className="px-8 py-5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Last Intent</th>
                <th className="px-8 py-5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-32">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-zinc-500 font-medium">
                    Connect your Instagram account to start receiving leads.
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-purple-500/5 transition-colors duration-300 group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform border border-white/10">
                        {lead.customer_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">{lead.customer_name}</div>
                        <div className="text-xs text-zinc-500 font-medium mt-0.5">@{lead.instagram_handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border
                      ${lead.lead_status === 'Hot' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border-white/5'}`}>
                      {lead.lead_status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
                          style={{ width: `${Math.min(Number(lead.lead_score || 0) * 10, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-300">{Number(lead.lead_score || 0).toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-zinc-400 font-medium italic">
                      <MessageCircle size={14} className="text-zinc-600" />
                      <span>{lead.last_intent || 'General Inquiry'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedLead(lead)}
                        className="p-2.5 bg-zinc-800/50 border border-white/5 rounded-xl text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/20 transition-all shadow-sm" title="View Intelligence"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2.5 bg-zinc-800/50 border border-white/5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-all shadow-sm">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Intelligence Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/10">
                  {selectedLead.customer_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedLead.customer_name}</h2>
                  <p className="text-sm text-zinc-500 font-medium">@{selectedLead.instagram_handle}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <MoreHorizontal size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Summary Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  Conversation Intelligence Summary
                </h3>
                <div className="p-5 rounded-2xl bg-zinc-800 border border-white/5 text-zinc-300 leading-relaxed font-medium">
                  {selectedLead.conversation_summary || "The AI is still analyzing this conversation. A detailed summary will appear after more interactions."}
                </div>
              </div>

              {/* Stats & Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-800 border border-white/5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Lead Health Score</p>
                  <p className="text-2xl font-bold text-white">{Number(selectedLead.lead_score || 0).toFixed(0)} <span className="text-xs text-zinc-500 font-medium">/ 10</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-800 border border-white/5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Detected Intent</p>
                  <p className="text-lg font-bold text-purple-400 capitalize">{selectedLead.last_intent || 'Enquiry'}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Intelligence Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase rounded-lg border border-purple-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-6 bg-zinc-800 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                <Calendar size={14} />
                <span>Last updated: {new Date(selectedLead.last_message_time || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="px-6 py-2.5 bg-zinc-800 border border-white/5 rounded-xl text-zinc-300 font-bold hover:bg-zinc-700 transition-all shadow-sm"
                >
                  Close
                </button>
                <button 
                  onClick={() => window.open(`https://instagram.com/direct/t/${selectedLead.instagram_handle}`, '_blank')}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  Contact on Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
