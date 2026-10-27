import React, { useState, useEffect } from 'react';
import { getLeads } from '../api/crm.api';
import type { Lead } from '../models/crm.models';
import { Search, ExternalLink, Loader2, X, RefreshCw } from 'lucide-react';
import { formatScore, scorePercent, leadStatusLabel } from '../lib/leadStatus';
import { LeadStatusChip, HandlerChip } from '../components/LeadStatusChip';

// Every status the backend sets, so no lead is reachable only through "All".
const STATUS_FILTERS = ['All', 'New', 'Hot', 'Needs_Human', 'Handoff', 'Buyer', 'Lost'] as const;

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
      {/* Phones get a select: seven segments do not fit and would scroll out of sight. */}
      <label className="mb-4 block sm:hidden">
        <span className="sr-only">Filter by status</span>
        <select
          className="field"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof STATUS_FILTERS[number])}
        >
          {STATUS_FILTERS.map((status) => {
            const count = status === 'All' ? leads.length : leads.filter(l => l.lead_status === status).length;
            return (
              <option key={status} value={status}>
                {status === 'All' ? 'All statuses' : leadStatusLabel(status)} ({count})
              </option>
            );
          })}
        </select>
      </label>

      <div className="segmented mb-4 hidden w-fit max-w-full sm:flex" role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map(status => {
          const count = status === 'All' ? leads.length : leads.filter(l => l.lead_status === status).length;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
            >
              {status === 'All' ? 'All' : leadStatusLabel(status)} <span className="count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="surface overflow-hidden">
        <div className="table-wrap">
          <table className="data-table is-stacked">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Status</th>
                <th>Handled by</th>
                <th className="max-lg:hidden">Last intent</th>
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
                  <td data-label="Status"><LeadStatusChip status={lead.lead_status} /></td>
                  <td data-label="Handled by"><HandlerChip human={lead.human_agent_active} /></td>
                  <td data-label="Last intent" className="max-w-[220px] truncate text-ink-soft max-lg:hidden">{lead.last_intent || '—'}</td>
                  <td data-label="Score" className="num">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className="meter w-16 shrink-0 max-lg:hidden" aria-hidden="true">
                        <span style={{ width: `${scorePercent(lead.lead_score)}%` }} />
                      </span>
                      <span className="w-7 text-right font-medium">{formatScore(lead.lead_score)}</span>
                    </div>
                  </td>
                  <td className="w-10 text-right is-stacked-hide">
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
                    {formatScore(selectedLead.lead_score)}
                    <span className="text-[17px] font-normal text-ink-faint"> / 10</span>
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Status</span>
                  <span className="mt-1 block">
                    <LeadStatusChip status={selectedLead.lead_status} />
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
                Last message {new Date(selectedLead.last_message_time || Date.now()).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
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
