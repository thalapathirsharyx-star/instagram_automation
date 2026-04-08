import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import { Search, Bell } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="crm-layout">
        <Sidebar />

        <main className="content-area">
          <header className="top-header glass-card">
            <div className="search-bar">
              <Search size={18} color="var(--text-dim)" />
              <input type="text" placeholder="Search leads or messages..." />
            </div>
            <div className="notifications" style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} />
              <span className="badge" style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: 'var(--hot)', fontSize: '0.65rem',
                padding: '2px 5px', borderRadius: '50%'
              }}>3</span>
            </div>
          </header>

          <div className="router-container">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Inbox />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/settings" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
