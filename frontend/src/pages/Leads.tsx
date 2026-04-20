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
      const res = await getLeads();
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
    <div className="leads-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Lead Management</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>Manage and track your discovered Instagram leads.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <div className="search-input glass-card" style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '8px' }}>
            <Search size={18} color="var(--text-dim)" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', outline: 'none' }}
            />
          </div>
          <button className="glass-card hover-glow" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid var(--glass-border)', color: 'var(--foreground)' }}>
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      <div className="leads-table-container glass-card premium-scroll" style={{ flexGrow: 1, overflowX: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontWeight: 500, fontSize: '0.85rem' }}>CUSTOMER</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontWeight: 500, fontSize: '0.85rem' }}>STATUS</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontWeight: 500, fontSize: '0.85rem' }}>TOTAL MSGS</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontWeight: 500, fontSize: '0.85rem' }}>LAST ACTIVITY</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: '100px', textAlign: 'center' }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '100px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No leads found.
                </td>
              </tr>
            ) : filteredLeads.map((lead) => (
              <tr key={lead.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '10px', 
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem', fontWeight: 700
                    }}>
                      {lead.customer_name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{lead.customer_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>@{lead.instagram_handle}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                    background: lead.lead_status === 'Hot' ? 'rgba(99, 102, 241, 0.15)' : 'var(--glass)',
                    color: lead.lead_status === 'Hot' ? 'var(--primary)' : 'var(--foreground)',
                    border: '1px solid ' + (lead.lead_status === 'Hot' ? 'rgba(99, 102, 241, 0.3)' : 'var(--glass-border)')
                  }}>
                    {lead.lead_status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
                    <MessageCircle size={14} />
                    <span>--</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    <Calendar size={14} />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button className="icon-btn-glass" title="View Conversation">
                      <ExternalLink size={16} />
                    </button>
                    <button className="icon-btn-glass">
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
  );
};

export default Leads;
