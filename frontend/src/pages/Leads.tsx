import React, { useState, useEffect } from 'react';
import { getLeads } from '../api/crm.api';
import type { Lead } from '../models/crm.models';
import { Search, Filter, ExternalLink, Calendar, MessageCircle, MoreHorizontal } from 'lucide-react';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="flex flex-col gap-8 h-full animate-in fade-in duration-700">
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
              className="w3-input pl-12 w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/50 border border-white/5 rounded-xl text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white transition-all shadow-sm">
            <Filter size={18} />
            <span>Filter</span>
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
                <th className="px-8 py-5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Engagement</th>
                <th className="px-8 py-5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Last Signal</th>
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
                    No leads found matching your criteria.
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
                    <div className="flex items-center gap-2 text-zinc-400 font-medium">
                      <MessageCircle size={14} className="text-zinc-600" />
                      <span>--</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-zinc-400 font-medium">
                      <Calendar size={14} className="text-zinc-600" />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 bg-zinc-800/50 border border-white/5 rounded-xl text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/20 transition-all shadow-sm" title="View Intelligence">
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
    </div>
  );
};

export default Leads;
