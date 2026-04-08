import React from 'react';

const Dashboard: React.FC = () => {
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
          <p style={{ fontSize: '1.8rem', fontWeight: 600 }}>42</p>
        </div>
        <div className="stat-card glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Hot Leads</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 600 }}>12</p>
        </div>
        <div className="stat-card glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '8px' }}>New Orders</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 600 }}>5</p>
        </div>
        <div className="stat-card glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Conv. Rate</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 600 }}>15%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
