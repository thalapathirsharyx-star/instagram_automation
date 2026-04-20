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

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
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

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Company</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Details</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Stats</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading platform clients...</td>
                </tr>
              ) : filteredClients.map((client) => (
                <tr key={client.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '20px 24px' }}>
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
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--text-dim)" /> {client.country?.name || 'Global'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> Registered: {new Date(client.created_on).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
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
                  <td style={{ padding: '20px 24px' }}>
                    <StatusBadge status={client.status} />
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => handleToggleStatus(client.id)}
                        className="glass-card" 
                        style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--glass-border)' }}
                      >
                        {client.status ? 'Suspend' : 'Activate'}
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
      </div>
    </div>
  );
};

export default ClientManagement;
