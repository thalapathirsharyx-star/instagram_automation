import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Leads from './pages/Leads';
import Settings from './pages/Settings';
import KnowledgeBase from './pages/KnowledgeBase';
// import ProductCatalog from './pages/ProductCatalog';
import UploadDocument from './pages/UploadDocument';
import AddFaq from './pages/AddFaq';
import AddFact from './pages/AddFact';
import Automation from './pages/Automation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import VerifyEmail from './pages/VerifyEmail';
import { PrivacyPolicy, TermsOfService, DataDeletion } from './pages/Legal';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ClientManagement from './pages/ClientManagement';
import AdminUsage from './pages/AdminUsage';
import AdminPricing from './pages/AdminPricing';
import AdminRevenue from './pages/AdminRevenue';
import AdminActivity from './pages/AdminActivity';
import LLMKeys from './pages/LLMKeys';
import AISettings from './pages/AISettings';
import Team from './pages/Team';
import AddTeamMember from './pages/AddTeamMember';
import Billing from './pages/Billing';
import Broadcasts from './pages/Broadcasts';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, login, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const hostname = window.location.hostname;
  const isLandingDomain = hostname === 'flazly.com' || hostname === 'www.flazly.com' || hostname.startsWith('landing.');

  const handleStopImpersonation = () => {
    const adminToken = localStorage.getItem('admin_token');
    const adminUserJson = localStorage.getItem('admin_user');
    
    if (adminToken && adminUserJson) {
      const adminUser = JSON.parse(adminUserJson);
      // Restore Super Admin session
      login(adminToken, adminUser);
      // Clean up backup storage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Redirect back to Admin clients list
      navigate('/admin/clients');
    }
  };
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Routing for landing page domain (flazly.com)
  if (isLandingDomain) {
    if (location.pathname === '/login') {
      window.location.href = 'https://app.flazly.com/login';
      return null;
    }
    if (location.pathname === '/signup') {
      window.location.href = 'https://app.flazly.com/signup';
      return null;
    }

    const landingPublicRoutes = ['/', '/privacy', '/terms', '/data-deletion'];
    const isLandingRoute = landingPublicRoutes.includes(location.pathname);

    if (isLandingRoute) {
      return (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Routing for main app domain (app.flazly.com)
  if (location.pathname === '/privacy') {
    window.location.href = 'https://flazly.com/privacy';
    return null;
  }
  if (location.pathname === '/terms') {
    window.location.href = 'https://flazly.com/terms';
    return null;
  }
  if (location.pathname === '/data-deletion') {
    window.location.href = 'https://flazly.com/data-deletion';
    return null;
  }
  if (location.pathname === '/landing') {
    return <Landing />;
  }

  const appPublicRoutes = ['/login', '/signup', '/verify-email'];
  const isAppPublicPage = appPublicRoutes.includes(location.pathname);

  // If user is logged in and tries to access login/signup, redirect to dashboard
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to={user?.roleCode === 'SUPER_ADMIN' ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  if (isAppPublicPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isImpersonating = !!localStorage.getItem('admin_token');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
      {isImpersonating && (
        <div className="bg-gradient-to-r from-amber-600 via-purple-700 to-amber-600 text-white px-6 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider shadow-lg border-b border-amber-500/20 animate-in slide-in-from-top duration-300" style={{ flexShrink: 0, zIndex: 9999 }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>Impersonating: <strong className="text-white underline">{user?.company?.name || 'Client Account'}</strong> (Read-Only Actions Restricted)</span>
          </div>
          <button 
            onClick={handleStopImpersonation}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer font-extrabold text-[10px]"
          >
            Stop Impersonation
          </button>
        </div>
      )}
      <div className="crm-layout" style={{ flex: 1, height: '100%', minHeight: 0, width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
        <Sidebar />

      <main className="content-area">
        <header className="top-header relative z-[100]">
          <div className="flex-grow"></div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 bg-white/5 rounded-xl text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 border border-white/5 hover:border-purple-500/20 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative cursor-pointer group">
              <div className="p-2.5 bg-white/5 rounded-xl text-zinc-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-all duration-300 border border-white/5 group-hover:border-purple-500/20">
                <Bell size={20} />
              </div>
              <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${theme === 'light' ? 'border-0' : 'border-2 border-[#0f0f14]'} shadow-lg group-hover:scale-110 transition-transform shadow-purple-500/30`}>3</span>
            </div>
            <div className="relative" onMouseLeave={() => setShowProfileDropdown(false)}>
              <div 
                className="flex items-center gap-3 pl-6 border-l border-white/5 cursor-pointer"
                onMouseEnter={() => setShowProfileDropdown(true)}
              >
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${user?.roleCode === 'SUPER_ADMIN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : (!user?.company?.plan || user?.company?.plan?.toUpperCase() === 'FREE' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20')}`}>
                      {user?.roleCode === 'SUPER_ADMIN' ? 'SUPER ADMIN' : (!user?.company?.plan || user?.company?.plan?.toUpperCase() === 'FREE' ? '14 DAYS TRIAL' : `${user?.company?.plan} PLAN`)}
                    </span>
                    <div className="text-sm font-bold text-zinc-100">{user?.email ? user.email.split('@')[0] : 'Guest'}</div>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Now
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 uppercase transition-transform hover:scale-105 border border-white/10">
                  {user?.email ? user.email[0] : 'G'}
                </div>
              </div>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full pt-2 w-48 z-50">
                  <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-white/10">
                      <div className="text-sm font-bold text-white truncate">{user?.email}</div>
                      <div className="text-xs text-zinc-500">{user?.role || 'Member'}</div>
                    </div>
                    <div className="p-1">
                      <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-medium"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
            {/* <Route path="/catalog" element={<ProtectedRoute><ProductCatalog /></ProtectedRoute>} /> */}
            <Route path="/knowledge/upload" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
            <Route path="/knowledge/add-faq" element={<ProtectedRoute><AddFaq /></ProtectedRoute>} />
            <Route path="/knowledge/add-fact" element={<ProtectedRoute><AddFact /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><Automation /></ProtectedRoute>} />
            <Route path="/broadcasts" element={<ProtectedRoute><Broadcasts /></ProtectedRoute>} />
            <Route path="/ai-settings" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute><ClientManagement /></ProtectedRoute>} />
            <Route path="/admin/usage" element={<ProtectedRoute><AdminUsage /></ProtectedRoute>} />
            <Route path="/admin/pricing" element={<ProtectedRoute><AdminPricing /></ProtectedRoute>} />
            <Route path="/admin/revenue" element={<ProtectedRoute><AdminRevenue /></ProtectedRoute>} />
            <Route path="/admin/activity" element={<ProtectedRoute><AdminActivity /></ProtectedRoute>} />
            <Route path="/admin/llm-keys" element={<ProtectedRoute><LLMKeys /></ProtectedRoute>} />
            
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/team/add" element={<ProtectedRoute><AddTeamMember /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            
            {/* Redirect logic */}
            <Route path="/" element={<Navigate to={user?.roleCode === 'SUPER_ADMIN' ? "/admin/dashboard" : "/dashboard"} replace />} />
            <Route path="*" element={<Navigate to={user?.roleCode === 'SUPER_ADMIN' ? "/admin/dashboard" : "/dashboard"} replace />} />
          </Routes>
        </div>
      </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

