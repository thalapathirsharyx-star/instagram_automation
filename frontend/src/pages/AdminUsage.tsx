import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Server, Cloud, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenant AI Usage</h2>
          <p className="text-zinc-500 text-sm">Monitor API consumption, token utilization, and rate limits across all SaaS accounts.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-foreground transition-colors" />
            <input 
              type="text" 
              placeholder="Search tenants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-foreground placeholder-zinc-400 focus:outline-none focus:border-border focus:ring-1 focus:ring-violet-500 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-zinc-500 font-semibold hover:bg-muted hover:border-border transition-all shadow-sm">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="border bg-card text-card-foreground shadow-sm rounded-xl flex flex-col min-h-0 flex-grow">
        
        {/* Table Header Row */}
        <div className="px-6 py-4 border-b border-border bg-muted flex justify-between items-center shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-foreground">Infrastructure Metrics</h3>
            <span className="px-2.5 py-0.5 bg-secondary text-zinc-500 rounded-full text-xs font-bold">{filteredClients.length} Tenants</span>
          </div>
          <Activity size={16} className="text-zinc-500" />
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-grow">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-card z-10 shadow-[0_1px_0_rgba(228,228,231,1)]">
              <tr>
                <th className="h-10 px-4 text-left align-middle font-medium text-zinc-500 bg-muted/50">Client Identity</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-zinc-500 bg-muted/50">Subscription Tier</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-zinc-500 bg-muted/50">Monthly AI Queries</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-zinc-500 bg-muted/50">Capacity Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-24">
                    <div className="flex flex-col items-center justify-center gap-4 text-zinc-500">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-violet-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Aggregating telemetry...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 border border-border">
                        <Cloud size={24} className="text-zinc-500" />
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-1">No tenants found</h3>
                      <p className="text-zinc-500 text-sm">Adjust search or check database connection.</p>
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
                
                let percentColor = 'bg-emerald-500';
                let textColor = 'text-emerald-400';
                if (percent > 90) {
                  percentColor = 'bg-rose-500';
                  textColor = 'text-destructive';
                } else if (percent > 75) {
                  percentColor = 'bg-warning';
                  textColor = 'text-warning';
                } else if (percent > 50) {
                  percentColor = 'bg-blue-500';
                  textColor = 'text-blue-400';
                }

                return (
                  <tr key={client.id} className="hover:bg-muted transition-colors duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-zinc-500 font-bold border border-border shadow-sm shrink-0">
                          <Server size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{client.name || 'Unknown'}</span>
                          <span className="text-xs text-zinc-500 font-medium mt-0.5">{client.email || 'No email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                        ${client.plan !== 'Free' ? 'bg-primary/10 text-foreground border-primary/20' : 'bg-secondary text-zinc-500 border-border'}`}>
                        {client.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-foreground">{usage.toLocaleString()}</span>
                        <span className="text-[11px] font-semibold text-zinc-500">/ {limit.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-40">
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${percentColor}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${textColor}`}>
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

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-border bg-card flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 rounded-b-2xl">
          <div className="text-xs font-medium text-zinc-500">
            Showing <strong className="text-foreground">{filteredClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
            <strong className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredClients.length)}</strong> of{' '}
            <strong className="text-foreground">{filteredClients.length}</strong> tenants
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalPages <= 1}
              className="p-1.5 border border-border rounded-md bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card text-zinc-500 transition-colors shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
                    currentPage === pageNum 
                      ? 'bg-primary text-zinc-900 shadow-sm' 
                      : 'bg-card text-zinc-500 hover:bg-muted border border-transparent hover:border-border'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="p-1.5 border border-border rounded-md bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card text-zinc-500 transition-colors shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsage;
