import React, { useState, useEffect } from 'react';
import { Activity, Search, Server, Cloud, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '../lib/axios';

const AdminUsage: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/Company/Admin/All');
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">AI usage by client</h1>
          <p className="page-sub">Monitor API consumption, token utilization, and rate limits across all SaaS accounts.</p>
        </div>
        <div className="field-icon w-full sm:w-72">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search name or email"
            aria-label="Search tenants"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field"
          />
        </div>
      </div>

      <section className="surface overflow-hidden">
        <div className="surface-head">
          <h2>
            Usage this month
            {!isLoading && <span className="chip">{filteredClients.length} tenants</span>}
          </h2>
          <Activity size={16} className="text-ink-faint" aria-hidden="true" />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan</th>
                <th className="num">AI queries this month</th>
                <th>Capacity used</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex items-center justify-center gap-2.5 py-14 text-ink-soft">
                      <Loader2 size={16} className="animate-spin" /> Loading usage…
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty py-12">
                      <span className="empty-mark"><Cloud /></span>
                      <p className="empty-title">No tenants found</p>
                      <p className="empty-body">Try a different search.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.map((client) => {
                // Hardcoded limits matching backend PlanLimits
                let limit = 250;
                if (client.plan === 'Essential') limit = 2500;
                if (client.plan === 'Pro') limit = 25000;
                if (client.plan === 'Business') limit = 75000;
                if (client.plan === 'Advanced') limit = 250000;

                const usage = client.monthly_ai_usage || 0;
                const percent = Math.min(100, Math.round((usage / limit) * 100));
                const level = percent > 90 ? 'stop' : percent > 75 ? 'warn' : 'ok';

                return (
                  <tr key={client.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="icon-tile is-neutral"><Server size={17} /></span>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink">{client.name || 'Unknown'}</div>
                          <div className="truncate text-[13px] text-ink-soft">{client.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={client.plan && client.plan !== 'Free' ? 'chip chip-accent' : 'chip'}>
                        {client.plan || 'Free'}
                      </span>
                    </td>
                    <td className="num">
                      <span className="font-semibold text-ink">{usage.toLocaleString()}</span>
                      <span className="text-[13px] text-ink-soft"> / {limit.toLocaleString()}</span>
                    </td>
                    <td>
                      <div className="flex w-44 items-center gap-3">
                        <div
                          className="meter flex-grow"
                          role="progressbar"
                          aria-label={`${client.name || 'Client'} capacity used`}
                          aria-valuenow={percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <span
                            style={{ width: `${percent}%` }}
                            className={level === 'stop' ? '!bg-signal-stop' : level === 'warn' ? '!bg-signal-warn' : ''}
                          />
                        </div>
                        <span className={`w-10 text-right text-[13px] font-medium tabular-nums ${
                          level === 'stop' ? 'text-signal-stop' : level === 'warn' ? 'text-signal-warn' : 'text-ink-soft'
                        }`}>
                          {percent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <nav className="surface-foot" aria-label="Pagination">
          <p className="text-[13px] text-ink-soft">
            Showing <span className="font-medium text-ink">{filteredClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span>–
            <span className="font-medium text-ink">{Math.min(currentPage * itemsPerPage, filteredClients.length)}</span> of{' '}
            <span className="font-medium text-ink">{filteredClients.length}</span> tenants
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalPages <= 1}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                aria-current={currentPage === pageNum ? 'page' : undefined}
                className={`btn btn-icon btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      </section>
    </div>
  );
};

export default AdminUsage;
