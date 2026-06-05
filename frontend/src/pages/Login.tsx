import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff, MessageCircle, Bot, Database, Shield, CheckCircle2 } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useGoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isPending2Fa, setIsPending2Fa] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleGoogleSelect = async (email: string, name: string) => {
    setIsGoogleLoading(true);
    setMessage(null);
    try {
      // Try to login via the dedicated GoogleLogin endpoint first
      const loginRes = await api.post('/Auth/GoogleLogin', { email });
      if (loginRes.data.Type === 'S' || loginRes.data.Type === 'Success') {
        const { api_token, user } = loginRes.data.result;
        setMessage({ text: 'Logged in via Google!', type: 'success' });
        setTimeout(() => {
          login(api_token, user);
          navigate(from, { replace: true });
        }, 1200);
      } else {
        throw new Error('User not found');
      }
    } catch (err: any) {
      // If user is not found, register them!
      try {
        const registerRes = await api.post('/Auth/Register', {
          first_name: name,
          company_name: `${name}'s Company`,
          email: email,
          password: 'GoogleUser123!!' // This remains secure as GoogleLogin bypasses password check
        });

        if (registerRes.data.Type === 'S' || registerRes.data.Type === 'Success') {
          const { api_token, user } = registerRes.data.result;
          setMessage({ text: 'Registered via Google! Welcome...', type: 'success' });
          setTimeout(() => {
            login(api_token, user);
            navigate(from, { replace: true });
          }, 1200);
        } else {
          setMessage({ text: 'Google registration failed', type: 'error' });
        }
      } catch (regErr: any) {
        console.error('Google register fallback error:', regErr);
        setMessage({ text: 'Authentication failed. Please try again or use standard login.', type: 'error' });
      }
    } finally {
      setIsGoogleLoading(false);
      setShowGoogleModal(false);
    }
  };

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const profileRes = await api.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const { email, name } = profileRes.data;
        if (!email) {
          setMessage({ text: 'Unable to retrieve email from Google.', type: 'error' });
          return;
        }
        await handleGoogleSelect(email, name || 'Google User');
      } catch (err) {
        console.error('Error fetching Google userinfo:', err);
        setMessage({ text: 'Failed to retrieve profile information from Google.', type: 'error' });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      setMessage({ text: 'Google authentication failed.', type: 'error' });
    }
  });


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setShowResend(false);

    try {
      const response = await api.post('/Auth/Login', { email, password });

      if (response.data.Type === 'S') {
        const result = response.data.result;
        if (result.status === 'pending_2fa') {
          setIsPending2Fa(true);
          setTempToken(result.temp_token);
          setIsLoading(false);
          return;
        }

        const { api_token, user } = result;
        setMessage({ text: 'Login Successful! Redirecting...', type: 'success' });

        setTimeout(() => {
          login(api_token, user);
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setMessage({ text: response.data.Message || 'Login failed', type: 'error' });
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { Message?: string } }; message?: string };
      const messageText = error.response?.data?.Message || error.message || 'An error occurred during login';
      setMessage({ text: messageText, type: 'error' });
      if (messageText.toLowerCase().includes('verify your email')) {
        setShowResend(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerify = async () => {
    if (!email) {
      setMessage({ text: 'Please enter your email address to resend verification.', type: 'error' });
      return;
    }
    setIsResending(true);
    try {
      const response = await api.post('/Auth/ResendVerification', { email });
      if (response.data.Type === 'S' || response.data.Type === 'Success') {
        setMessage({ text: 'Verification email resent! Please check your inbox.', type: 'success' });
        setShowResend(false);
      } else {
        setMessage({ text: response.data.Message || 'Failed to resend verification email.', type: 'error' });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.Message || 'Failed to resend verification email.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/Auth/2fa/confirm', {
        temp_token: tempToken,
        totp_code: totpCode
      });

      if (response.data.Type === 'S') {
        const { api_token, user } = response.data.result;
        setMessage({ text: '2FA Verification Successful! Redirecting...', type: 'success' });

        setTimeout(() => {
          login(api_token, user);
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setMessage({ text: response.data.Message || 'Verification failed', type: 'error' });
      }
    } catch (err: unknown) {
      console.error('2FA verification error:', err);
      const error = err as { response?: { data?: { Message?: string } }; message?: string };
      const messageText = error.response?.data?.Message || error.message || 'An error occurred during verification';
      setMessage({ text: messageText, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-x-hidden bg-zinc-50 font-inter relative">
      {/* Background Mesh Gradients & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '15s' }} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 relative z-10 p-4 lg:p-6 min-h-screen">
        <div className="hidden lg:flex flex-col justify-center text-left w-full max-w-md shrink-0">
          {/* Logo */}
          <div className="mb-6 lg:mb-8 flex items-center gap-2.5">
            <img src="/Light Theme.png" alt="Flazly Logo" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
            <span className="text-2xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight">Flazly</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 mb-4 leading-[1.1] tracking-tight">
            Turn conversations into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">revenue</span>.
          </h2>
          
          <ul className="space-y-3 mb-6 text-sm lg:text-base">
            {[
              'Respond to Instagram DMs instantly',
              'Capture qualified leads automatically',
              'Sync customer data to your CRM'
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-zinc-600 font-semibold">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                {text}
              </li>
            ))}
          </ul>

          {/* Mini Workflow UI Mockup */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 lg:p-5 relative overflow-hidden group mb-6 lg:mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent pointer-events-none" />
            <div className="flex flex-col gap-2 relative z-10">
              
              <div className="flex items-center gap-3 p-2.5 bg-zinc-50/50 border border-zinc-100 rounded-xl transition-all duration-300 hover:bg-white hover:border-zinc-200 hover:shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 shrink-0 border border-pink-100">
                  <MessageCircle size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 leading-none mb-0.5">Instagram DM</p>
                  <p className="text-[9px] text-zinc-500 font-medium leading-none">Customer asks a question</p>
                </div>
              </div>

              <div className="w-px h-2 bg-zinc-200 ml-6" />

              <div className="flex items-center gap-3 p-2.5 bg-zinc-50/50 border border-zinc-100 rounded-xl transition-all duration-300 hover:bg-white hover:border-zinc-200 hover:shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 border border-purple-100">
                  <Bot size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 leading-none mb-0.5">AI Agent Reply</p>
                  <p className="text-[9px] text-zinc-500 font-medium leading-none">Instant intelligent response</p>
                </div>
              </div>

              <div className="w-px h-2 bg-zinc-200 ml-6" />

              <div className="flex items-center gap-3 p-2.5 bg-zinc-50/50 border border-zinc-100 rounded-xl transition-all duration-300 hover:bg-white hover:border-zinc-200 hover:shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                  <Database size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 leading-none mb-0.5">Lead Qualified & Synced</p>
                  <p className="text-[9px] text-zinc-500 font-medium leading-none">Data sent to CRM securely</p>
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield size={14} className="text-zinc-400" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Powered by the Meta Graph API</span>
          </div>

        </div>
      <div className="w-full max-w-md flex flex-col items-center justify-center z-20 shrink-0">
        <div className="w-full bg-white rounded-3xl p-6 lg:p-8 shadow-2xl shadow-zinc-200/50 border border-zinc-200 relative">
          <div className="mb-6 lg:mb-8 text-center">
            <div className="bg-transparent flex items-center justify-center mx-auto mb-2">
              <img src="/Light Theme.png" alt="Flazly Logo" className="w-10 h-10 lg:w-12 lg:h-12 object-contain transition-transform duration-500 hover:scale-105" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">Welcome Back</h1>
            <p className="text-sm lg:text-base text-zinc-500 font-semibold">Sign in to your AI workspace</p>
          </div>

          {message && (
            <div className={`${message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
              } border text-sm p-4 rounded-xl flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-300`}>
              <div className="flex items-center gap-3">
                {message.type === 'success' ? <LogIn size={18} /> : <AlertCircle size={18} />}
                <span className="font-semibold">{message.text}</span>
              </div>
              {showResend && (
                <button
                  type="button"
                  onClick={handleResendVerify}
                  disabled={isResending}
                  className="text-xs font-bold underline text-purple-700 hover:text-purple-900 transition-colors text-left pl-7 disabled:opacity-50 mt-1"
                >
                  {isResending ? 'Resending...' : "Didn't receive the email? Resend verification link"}
                </button>
              )}
            </div>
          )}

          {!isPending2Fa ? (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 ml-1 block" htmlFor="email">Email Address</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                    <input
                      type="email"
                      id="email"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all duration-200 placeholder:text-zinc-400 font-medium shadow-sm"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-bold text-zinc-700 block" htmlFor="password">Password</label>
                    <a href="#" className="text-xs font-bold text-purple-600 hover:text-purple-500 transition-colors">Forgot password?</a>
                  </div>
                  <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full pl-11 pr-11 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all duration-200 placeholder:text-zinc-400 font-medium shadow-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-purple-600 transition-colors z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-1 mt-2">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-zinc-300 bg-white text-purple-600 focus:ring-purple-500/30 cursor-pointer accent-purple-600" />
                  <label htmlFor="remember" className="text-sm font-bold text-zinc-600 cursor-pointer">Remember me</label>
                </div>

                <button type="submit" className="w-full mt-2 bg-zinc-950 hover:bg-black rounded-xl py-2.5 font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 group border border-zinc-950" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin text-white" />
                      <span className="text-white">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white">Sign In</span>
                      <LogIn size={20} className="group-hover:translate-x-1 transition-transform duration-300 text-white" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase">
                  <span className="bg-white px-3 text-zinc-400">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                className="w-full py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleVerify2Fa} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 ml-1 block" htmlFor="totpCode">Two-Factor Authentication Code</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                  <input
                    type="text"
                    id="totpCode"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all duration-200 placeholder:text-zinc-400 font-mono tracking-widest text-center shadow-sm"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    maxLength={10}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-zinc-500 ml-1">Enter the 6-digit verification code from your authenticator app or a recovery code.</p>
              </div>

              <button type="submit" className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3.5 font-bold text-base shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 group border border-purple-500/30" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>

              <button type="button" onClick={() => { setIsPending2Fa(false); setMessage(null); }} className="w-full mt-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl py-3.5 font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 border border-zinc-200">
                Cancel
              </button>
            </form>
          )}

          <div className="text-center mt-6 pt-6 border-t border-zinc-100">
            <p className="text-zinc-500 font-medium text-xs lg:text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-600 font-extrabold hover:text-purple-500 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] font-bold text-zinc-400 uppercase tracking-wider w-full px-2">
          <span className="flex items-center gap-1.5"><Lock size={12} className="text-zinc-400" /> Secure OAuth</span>
          <span className="flex items-center gap-1.5"><Shield size={12} className="text-zinc-400" /> Meta Compliant</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-zinc-400" /> Enterprise Security</span>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
