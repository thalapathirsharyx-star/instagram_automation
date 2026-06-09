import React, { useState, useEffect } from 'react';
import { getLeads } from '../api/crm.api';
import type { Lead } from '../models/crm.models';
import { Search, Filter, ExternalLink, Calendar, MessageCircle, MoreHorizontal, Download, X, Sparkles, Tag, BrainCircuit } from 'lucide-react';

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
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lead Intelligence</h2>
          <p className="text-muted-foreground text-sm">Manage and track your AI-discovered Instagram pipeline.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-foreground placeholder-zinc-400 focus:outline-none focus:border-border focus:ring-1 focus:ring-violet-500 transition-all shadow-sm"
            />
          </div>
          <button onClick={fetchLeads} className="btn-base btn-secondary">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="btn-base btn-primary">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="border bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Customer Profile</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Pipeline Status</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">AI Score</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Detected Intent</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-24">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-violet-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Syncing CRM Data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 border border-border">
                        <Search size={24} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-1">No leads found</h3>
                      <p className="text-muted-foreground text-sm">Connect your Instagram account or adjust search filters.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted transition-colors duration-200 group cursor-pointer" onClick={() => setSelectedLead(lead)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-foreground font-bold text-sm border border-primary/20 shadow-sm shrink-0">
                        {lead.customer_name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-foreground transition-colors">{lead.customer_name}</span>
                        <span className="text-xs text-muted-foreground font-medium mt-0.5">@{lead.instagram_handle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                      ${lead.lead_status === 'Hot' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        lead.lead_status === 'Buyer' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        lead.lead_status === 'Lost' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-secondary text-muted-foreground border-border'}`}>
                      {lead.lead_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 w-32">
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(Number(lead.lead_score || 0) * 10, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{Number(lead.lead_score || 0).toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                      <MessageCircle size={14} className="text-muted-foreground" />
                      <span className="truncate max-w-[150px]">{lead.last_intent || 'General Inquiry'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                        className="btn-base btn-secondary px-2" title="View Intelligence"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="btn-base btn-secondary px-2"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination/Footer (Mocked for structure) */}
        {!isLoading && filteredLeads.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-muted/50 flex justify-between items-center text-xs font-medium text-muted-foreground">
            <span>Showing {filteredLeads.length} leads</span>
            <div className="flex gap-2">
              <button className="btn-base btn-secondary">Previous</button>
              <button className="btn-base btn-secondary">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over or Modal for Lead Intelligence */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedLead(null)}>
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-foreground font-bold text-xl border border-primary/20 shadow-sm shrink-0">
                  {selectedLead.customer_name[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedLead.customer_name}</h2>
                  <p className="text-xs text-muted-foreground font-medium">@{selectedLead.instagram_handle}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-muted rounded-lg border flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5"><BrainCircuit size={12}/> AI Health Score</p>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight">{Number(selectedLead.lead_score || 0).toFixed(0)}<span className="text-sm text-muted-foreground font-medium ml-1">/ 10</span></p>
                </div>
                <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5"><Sparkles size={12}/> Detected Intent</p>
                  <p className="text-xl font-bold text-foreground capitalize truncate">{selectedLead.last_intent || 'General Enquiry'}</p>
                </div>
              </div>

              {/* Summary Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Conversation Summary</h3>
                <div className="p-5 rounded-xl bg-card border border-border text-muted-foreground leading-relaxed font-medium text-sm shadow-sm">
                  {selectedLead.conversation_summary || "The AI is currently analyzing this conversation. A detailed semantic summary will appear after more interactions are recorded."}
                </div>
              </div>

              {/* Tags */}
              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5"><Tag size={14} className="text-muted-foreground"/> CRM Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-secondary text-muted-foreground text-[11px] font-bold uppercase tracking-wider rounded border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-muted border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                <Calendar size={14} />
                <span>Last engaged: {new Date(selectedLead.last_message_time || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="btn-base btn-secondary flex-1 sm:flex-none"
                >
                  Close
                </button>
                <button 
                  onClick={() => window.open(`https://instagram.com/direct/t/${selectedLead.instagram_handle}`, '_blank')}
                  className="btn-base btn-primary flex-1 sm:flex-none"
                >
                  <ExternalLink size={16} />
                  Open in Instagram
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
