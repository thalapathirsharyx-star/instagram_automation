import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Leads from './pages/Leads';
import Settings from './pages/Settings';
import MetaIntegration from './pages/MetaIntegration';
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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
import CommentsManager from './pages/CommentsManager';
import { Sun, Moon, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';

/** Signed-out account pages: reachable without a session, served on the app domain. */
const ACCOUNT_PATHS = ['/login', '/signup', '/verify-email', '/forgot-password'];
const ACCOUNT_PATH_PREFIXES = ['/ResetPassword/', '/reset-password/'];

const isAccountPath = (pathname: string) =>
  ACCOUNT_PATHS.includes(pathname) || ACCOUNT_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

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

  // Scroll to the hash target if the URL has one, else to the top.
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(location.hash.slice(1));
    // Arriving from another route, the section is not in the DOM yet. A fixed
    // delay guessed at that; this watches for it across a few frames instead,
    // then gives up rather than scrolling to the wrong place.
    let attempts = 0;
    let frame = requestAnimationFrame(function find() {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ block: 'start' });
      } else if (attempts++ < 90) {
        frame = requestAnimationFrame(find);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [location]);

  // Routing for landing page domain (flazly.com) OR unauthenticated root / /landing
  if (isLandingDomain || location.pathname === '/landing' || (location.pathname === '/' && !isAuthenticated)) {
    // Account pages live on the app domain. Emailed links (verification,
    // password reset) can arrive on the marketing domain, so forward the whole
    // path and query instead of only /login and /signup.
    if (isLandingDomain && isAccountPath(location.pathname)) {
      window.location.href = `https://app.flazly.com${location.pathname}${location.search}`;
      return null;
    }

    const landingPublicRoutes = ['/', '/landing', '/privacy', '/terms', '/data-deletion'];
    const isLandingRoute = landingPublicRoutes.includes(location.pathname);

    if (isLandingRoute) {
      return (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    } else if (isLandingDomain) {
      return <Navigate to="/" replace />;
    }
  }

  // Routing for legal pages on any domain - render directly without redirecting
  if (location.pathname === '/privacy') {
    return <PrivacyPolicy />;
  }
  if (location.pathname === '/terms') {
    return <TermsOfService />;
  }
  if (location.pathname === '/data-deletion') {
    return <DataDeletion />;
  }
  if (location.pathname === '/landing') {
    return <Landing />;
  }

  const isAppPublicPage = isAccountPath(location.pathname);

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* The reset email builds this exact casing; the lowercase form is an alias. */}
        <Route path="/ResetPassword/:userId" element={<ResetPassword />} />
        <Route path="/reset-password/:userId" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isImpersonating = !!localStorage.getItem('admin_token');

  // The plan is the one piece of account state worth standing in the header: it
  // decides what the person can reach, and a free plan is the prompt to upgrade.
  const plan = user?.company?.plan;
  const isFreePlan = !plan || plan.toUpperCase() === 'FREE';
  const planLabel = user?.roleCode === 'SUPER_ADMIN'
    ? 'Administrator'
    : isFreePlan ? 'Free plan' : `${plan} plan`;
  const planChipClass = user?.roleCode === 'SUPER_ADMIN'
    ? 'chip chip-warn'
    : isFreePlan ? 'chip' : 'chip chip-accent';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
      {isImpersonating && (
        <div
          className="flex items-center justify-between gap-4 px-5 py-2 text-[13px] bg-signal-warn text-on-signal"
          style={{ flexShrink: 0, zIndex: 9999 }}
        >
          <span>
            You are viewing <strong>{user?.company?.name || 'a client account'}</strong> as an
            administrator. Actions that change their data are blocked.
          </span>
          <button
            onClick={handleStopImpersonation}
            className="shrink-0 rounded-[6px] border border-white/40 px-3 py-1 font-medium transition-colors hover:bg-white/15"
          >
            Return to my account
          </button>
        </div>
      )}
      <div className="crm-layout" style={{ flex: 1, height: '100%', minHeight: 0, width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
        <Sidebar />

      <main className="content-area">
        <header className="top-header relative z-[100]">
          <div className="flex-grow" />
          <div className="flex items-center gap-2">
            <span className={planChipClass}>{planLabel}</span>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn btn-quiet btn-icon"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative ml-1 pl-3 border-l border-hairline" onMouseLeave={() => setShowProfileDropdown(false)}>
              <button
                className="flex items-center gap-2.5 py-1"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onClick={() => setShowProfileDropdown((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={showProfileDropdown}
              >
                <span className="hidden text-[13px] text-ink-soft sm:block">
                  {user?.email ? user.email.split('@')[0] : 'Guest'}
                </span>
                <span className="avatar-initial" style={{ width: 30, height: 30 }}>
                  {user?.email ? user.email[0] : 'G'}
                </span>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full w-56 pt-2 z-50" role="menu">
                  <div className="surface-lifted overflow-hidden">
                    <div className="border-b border-hairline p-3">
                      <div className="truncate text-[13px] font-medium text-ink">{user?.email}</div>
                      <div className="text-[13px] text-ink-soft">{user?.role || 'Member'}</div>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[15px] text-ink-soft transition-colors hover:bg-porcelain-deep hover:text-ink"
                        role="menuitem"
                      >
                        <LogOut size={16} />
                        Sign out
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
            <Route path="/comments-manager" element={<ProtectedRoute><CommentsManager /></ProtectedRoute>} />
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
            
            <Route path="/meta-integration" element={<ProtectedRoute><MetaIntegration /></ProtectedRoute>} />
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

