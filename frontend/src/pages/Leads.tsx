import React, { useState, useEffect } from 'react';
import { getLeads } from '../api/crm.api';
import type { Lead } from '../models/crm.models';
import { Search, ExternalLink, Loader2, X, RefreshCw } from 'lucide-react';

const STATUS_FILTERS = ['All', 'New', 'Hot', 'Handoff', 'Buyer', 'Lost'] as const;

const statusChipClass = (status?: string) => {
  switch (status) {
    case 'Buyer': return 'chip chip-go';
    case 'Hot': return 'chip chip-accent';
    case 'Needs_Human': return 'chip chip-stop';
    case 'Handoff': return 'chip chip-ink';
    case 'Lost': return 'chip';
    default: return 'chip';
  }
};

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  // Escape closes the detail panel, so the keyboard alone gets you back out.
  useEffect(() => {
    if (!selectedLead) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedLead(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedLead]);

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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.instagram_handle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.lead_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-sub">Everyone the assistant has talked to, scored by how close they are to buying.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              placeholder="Search name or handle"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field w-full pl-8 sm:w-64"
              aria-label="Search leads"
            />
          </div>
          <button onClick={fetchLeads} className="btn" disabled={isLoading}>
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : undefined} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters are the content's own statuses, so they double as a legend. */}
      <div className="segmented mb-4 w-fit max-w-full" role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map(status => {
          const count = status === 'All' ? leads.length : leads.filter(l => l.lead_status === status).length;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
            >
              {status} <span className="count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="surface overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Status</th>
                <th>Handled by</th>
                <th>Last intent</th>
                <th className="num">Score</th>
                <th><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex items-center justify-center gap-2.5 py-16 text-ink-soft">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading leads</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">
                      <p className="empty-title">
                        {leads.length === 0 ? 'No leads yet' : 'Nothing matches that'}
                      </p>
                      <p className="empty-body">
                        {leads.length === 0
                          ? 'Leads appear here as soon as someone messages your Instagram account.'
                          : 'Clear the search or pick a different status.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="avatar-initial">{lead.customer_name[0]}</span>
                      <div className="min-w-0">
                        {/* The row is clickable for the mouse; this button is the keyboard's way in. */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                          className="block max-w-full truncate rounded-[4px] text-left font-medium text-ink hover:text-viridian"
                        >
                          {lead.customer_name}
                        </button>
                        <div className="truncate text-[13px] text-ink-soft">@{lead.instagram_handle}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={statusChipClass(lead.lead_status)}>
                      {String(lead.lead_status || 'New').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={lead.human_agent_active ? 'chip chip-ink' : 'chip chip-accent'}>
                      {lead.human_agent_active ? 'Your team' : 'Assistant'}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate text-ink-soft">{lead.last_intent || '—'}</td>
                  <td className="num">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className="meter w-16 shrink-0">
                        <span style={{ width: `${Math.min(Number(lead.lead_score || 0) * 10, 100)}%` }} />
                      </span>
                      <span className="w-4 text-right font-medium">{Number(lead.lead_score || 0).toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="w-10 text-right">
                    <ExternalLink size={15} className="inline text-ink-faint" aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredLeads.length > 0 && (
          <div className="border-t border-hairline px-4 py-2.5 text-[13px] text-ink-soft">
            {filteredLeads.length === leads.length
              ? `${leads.length} ${leads.length === 1 ? 'lead' : 'leads'}`
              : `${filteredLeads.length} of ${leads.length} leads`}
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="modal-backdrop" onClick={() => setSelectedLead(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-name"
            className="modal modal-lg max-w-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div className="flex min-w-0 items-center gap-3">
                <span className="avatar-initial" style={{ width: 42, height: 42, fontSize: 17 }}>
                  {selectedLead.customer_name[0]}
                </span>
                <div className="min-w-0">
                  <h2 id="lead-name" className="truncate">{selectedLead.customer_name}</h2>
                  <p className="truncate text-[13px] text-ink-soft">@{selectedLead.instagram_handle}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="btn btn-ghost btn-icon btn-sm" aria-label="Close" autoFocus>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="stat-row mb-5">
                <div className="stat">
                  <span className="stat-label">Score</span>
                  <span className="stat-figure">
                    {Number(selectedLead.lead_score || 0).toFixed(0)}
                    <span className="text-[17px] font-normal text-ink-faint"> / 10</span>
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Status</span>
                  <span className="mt-1 block">
                    <span className={statusChipClass(selectedLead.lead_status)}>
                      {String(selectedLead.lead_status || 'New').replace(/_/g, ' ')}
                    </span>
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Last intent</span>
                  <span className="mt-1.5 block text-[15px] text-ink">{selectedLead.last_intent || '—'}</span>
                </div>
              </div>

              <h3 className="section-title mb-2 text-[17px]">What they talked about</h3>
              <p className="prose-measure mb-6 text-[15px] leading-relaxed text-ink-soft">
                {selectedLead.conversation_summary ||
                  'No summary yet. The assistant writes one once the conversation has a few messages in it.'}
              </p>

              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <>
                  <h3 className="section-title mb-2 text-[17px]">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.tags.map((tag, idx) => (
                      <span key={idx} className="chip">{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="modal-foot justify-between">
              <span className="text-[13px] text-ink-soft">
                Last message {new Date(selectedLead.last_message_time || Date.now()).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setSelectedLead(null)} className="btn">Close</button>
                <button
                  onClick={() => window.open(`https://instagram.com/${selectedLead.instagram_handle}`, '_blank', 'noopener')}
                  className="btn btn-primary"
                >
                  <ExternalLink size={15} />
                  Open on Instagram
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
