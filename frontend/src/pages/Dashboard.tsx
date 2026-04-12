import React, { useState, useEffect } from 'react';
import { getBalance, getLeads } from '../api/crm.api';

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [leadCount, setLeadCount] = useState<number>(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const balanceRes = await getBalance();
      setBalance(balanceRes.Data);
      
      const leadsRes = await getLeads();
      setLeadCount(leadsRes.Data.length);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div className="dashboard-page glass-card" style={{ padding: '32px', height: '100%' }}>
      <h1>CRM Dashboard</h1>
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '20px', 
        marginTop: '24px' 
      }}>
        <div className="stat-card glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Total Leads</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 600 }}>{leadCount}</p>
        </div>
        <div className="stat-card glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--primary)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Wallet Balance</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--primary)' }}>${balance.toFixed(2)}</p>
        </div>
        <div className="stat-card glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Hot Leads</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 600 }}>12</p>
        </div>
        <div className="stat-card glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '8px' }}>New Orders</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 600 }}>5</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
