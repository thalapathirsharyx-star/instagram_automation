import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert,
  Search,
  Filter,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CompanyAdminData {
  id: string;
  name: string;
  email: string;
  status: boolean;
  created_on: string;
  userCount: number;
  leadCount: number;
  country?: { name: string };
  currency?: { code: string };
  plan: string;
  plan_expires_at: string | null;
  monthly_ai_usage: number;
}

const StatusBadge: React.FC<{ status: boolean }> = ({ status }) => (
  <div className={`px-2.5 py-1 rounded-full text-[0.7rem] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
    status 
      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
  }`}>
    {status ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
    {status ? 'Active' : 'Suspended'}
  </div>
);

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<CompanyAdminData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleImpersonate = async (companyId: string) => {
    try {
      const originalToken = localStorage.getItem('token');
      const originalUser = localStorage.getItem('user');

      const response = await api.post(`/Company/Admin/Impersonate/${companyId}`);
      if (response.data.Type === 'S') {
        const { api_token, user: impersonatedUser } = response.data.result;

        // Backup original Super Admin credentials
        if (originalToken && originalUser) {
          localStorage.setItem('admin_token', originalToken);
          localStorage.setItem('admin_user', originalUser);
        }

        // Log in with impersonated client token
        login(api_token, impersonatedUser);

        // Redirect to client dashboard
        navigate('/dashboard');
      } else {
        alert('Impersonation failed: ' + (response.data.Message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Error initiating impersonation session.');
    }
  };

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

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/Company/Admin/ToggleStatus/${id}`);
      // Optimistic update or refetch
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: !c.status } : c));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Client Management</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>Monitor and manage all company tenants on the platform.</p>
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
          <button className="gradient-btn" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
            Register New Client
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>All Clients</h3>
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
                <th className="sticky-th-company" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Company</th>
                <th className="sticky-th" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Details</th>
                <th className="sticky-th" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Plan & Usage</th>
                <th className="sticky-th" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Stats</th>
                <th className="sticky-th" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</th>
                <th className="sticky-th" style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading platform clients...</td>
                </tr>
              ) : paginatedClients.map((client) => (
                <tr key={client.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td className="sticky-td-company" style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white' }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{client.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--text-dim)" /> {client.country?.name || 'Global'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> Registered: {new Date(client.created_on).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${client.plan !== 'Free' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                          {client.plan || 'Free'}
                        </span>
                        {client.plan_expires_at && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Expires: {new Date(client.plan_expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        AI Usage: <strong style={{ color: 'var(--text)' }}>{client.monthly_ai_usage || 0}</strong> msgs
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{client.userCount}</div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Users</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{client.leadCount}</div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Leads</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <StatusBadge status={client.status} />
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => handleToggleStatus(client.id)}
                        className="glass-card" 
                        style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--glass-border)' }}
                      >
                        {client.status ? 'Suspend' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleImpersonate(client.id)}
                        className="glass-card" 
                        style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--glass-border)', color: 'rgba(168,85,247,1)', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        Impersonate <ArrowRight size={14} />
                      </button>
                      <button className="glass-card" style={{ padding: '8px', cursor: 'pointer' }}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
            <strong style={{ color: 'var(--text)' }}>{filteredClients.length}</strong> clients
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

export default ClientManagement;
