import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Leads from './pages/Leads';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Landing from './pages/Landing';
import { PrivacyPolicy, TermsOfService, DataDeletion } from './pages/Legal';
import { Search, Bell } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const publicRoutes = ['/', '/login', '/privacy', '/terms', '/data-deletion'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  // If user is logged in and tries to access login, redirect to dashboard
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

