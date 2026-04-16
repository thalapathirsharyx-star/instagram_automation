import React, { useState, useEffect } from 'react';
import { getBalance, getLeads } from '../api/crm.api';

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [leadCount, setLeadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      const [balanceRes, leadsRes] = await Promise.all([
        getBalance(),
        getLeads()
      ]);
      
      setBalance(balanceRes?.Data ?? 0);
      setLeadCount(leadsRes?.Data?.length ?? 0);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dashboard-page glass-card flex flex-col items-center justify-center gap-4" style={{ padding: '32px', height: '100%' }}>
        <h2 className="text-xl font-semibold text-destructive">Failed to load dashboard</h2>
        <p className="text-text-dim">There was an error connecting to the server.</p>
        <button onClick={fetchStats} className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all">
          Try Again
        </button>
      </div>
    );
  }

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
          <p style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--primary)' }}>${Number(balance).toFixed(2)}</p>
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
