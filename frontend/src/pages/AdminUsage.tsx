import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Server } from 'lucide-react';
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
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="dashboard-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Tenant API Usage</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>Monitor AI token consumption and limits across all accounts.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={18} color="var(--text-dim)" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Usage Metrics</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              Showing {filteredClients.length} tenants
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <Filter size={18} />
          </button>
        </div>

        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
                <th className="sticky-th-company" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Client</th>
                <th className="sticky-th" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Current Plan</th>
                <th className="sticky-th" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Monthly AI Credits Used</th>
                <th className="sticky-th" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading usage data...</td>
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

                return (
                  <tr key={client.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td className="sticky-td-company" style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                          <Server size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{client.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${client.plan !== 'Free' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                        {client.plan || 'Free'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {usage.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>/ {limit.toLocaleString()}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: percent > 90 ? '#ef4444' : percent > 75 ? '#fbbf24' : 'var(--primary)', borderRadius: '10px' }}></div>
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: percent > 90 ? '#ef4444' : 'var(--text-dim)', width: '35px' }}>
                          {percent}%
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid var(--glass-border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'rgba(255,255,255,0.01)',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Showing <strong style={{ color: 'var(--text)' }}>{filteredClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
            <strong style={{ color: 'var(--text)' }}>{Math.min(currentPage * itemsPerPage, filteredClients.length)}</strong> of{' '}
            <strong style={{ color: 'var(--text)' }}>{filteredClients.length}</strong> tenants
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalPages <= 1}
              className="glass-card"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: (currentPage === 1 || totalPages <= 1) ? 'not-allowed' : 'pointer',
                opacity: (currentPage === 1 || totalPages <= 1) ? 0.4 : 1,
                border: '1px solid var(--glass-border)'
              }}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? 'gradient-btn' : 'glass-card'}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: currentPage === pageNum ? 'none' : '1px solid var(--glass-border)'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="glass-card"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: (currentPage === totalPages || totalPages <= 1) ? 'not-allowed' : 'pointer',
                opacity: (currentPage === totalPages || totalPages <= 1) ? 0.4 : 1,
                border: '1px solid var(--glass-border)'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsage;
