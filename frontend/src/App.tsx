import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Leads from './pages/Leads';
import Settings from './pages/Settings';
import KnowledgeBase from './pages/KnowledgeBase';
import Automation from './pages/Automation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import { PrivacyPolicy, TermsOfService, DataDeletion } from './pages/Legal';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ClientManagement from './pages/ClientManagement';
import AISettings from './pages/AISettings';
import { Search, Bell } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const publicRoutes = ['/', '/login', '/signup', '/privacy', '/terms', '/data-deletion'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  // If user is logged in and tries to access login, redirect to appropriate dashboard
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to={user?.roleCode === 'SUPER_ADMIN' ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
        <header className="top-header">
          <div className="flex items-center gap-6 flex-grow">
            <div className="relative group max-w-md w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search leads, messages, or documents..." 
                className="w3-input pl-12 w-full text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer group">
              <div className="p-2.5 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-all duration-300 border border-white/5">
                <Bell size={20} />
              </div>
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-900 shadow-sm group-hover:scale-110 transition-transform shadow-purple-500/50">3</span>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-zinc-100">{user?.email?.split('@')[0]}</div>
                <div className="text-[10px] font-bold text-purple-400/80 uppercase tracking-widest">Active Now</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 uppercase transition-transform hover:scale-105 border border-white/10">
                {user?.email?.[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="router-container">
          <Routes>
            {/* Client Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="/knowledge" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><Automation /></ProtectedRoute>} />
            <Route path="/ai-settings" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute><ClientManagement /></ProtectedRoute>} />
            
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* Redirect logic */}
            <Route path="/" element={<Navigate to={user?.roleCode === 'SUPER_ADMIN' ? "/admin/dashboard" : "/dashboard"} replace />} />
            <Route path="*" element={<Navigate to={user?.roleCode === 'SUPER_ADMIN' ? "/admin/dashboard" : "/dashboard"} replace />} />
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

