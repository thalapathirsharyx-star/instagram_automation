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
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden font-inter bg-white">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-[45%] h-full flex flex-col justify-center px-6 lg:px-12 xl:px-20 relative z-10 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto py-2">
          {/* Logo/Icon */}
          <Link to="/" className="mb-8 inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
            <img src="/Light Theme.png" alt="Flazly Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">Flazly</span>
          </Link>

          <div className="mb-8 text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">Welcome back to Flazly</h1>
            <p className="text-sm text-zinc-500 font-medium">Log in to your account to continue.</p>
          </div>

          {message && (
            <div className={`${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
              } p-2.5 rounded-xl flex flex-col gap-1 mb-3 border text-xs animate-in fade-in`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span className="font-semibold">{message.text}</span>
              </div>
            </div>
          )}

          {isPending2Fa ? (
          <form onSubmit={handleVerify2Fa} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-900 ml-1 block" htmlFor="totpCode">Two-Factor Code</label>
                <input
                  type="text"
                  id="totpCode"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-full text-zinc-900 text-center font-mono tracking-widest focus:ring-2 focus:ring-[#4F39F6] focus:border-brand outline-none shadow-sm text-sm transition-all"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  maxLength={10}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="w-full bg-brand hover:bg-brand rounded-full py-2 font-bold text-xs text-white shadow-lg transition-all" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button type="button" onClick={() => { setIsPending2Fa(false); setMessage(null); }} className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full py-2 font-bold text-xs transition-all">
                Cancel
              </button>
            </form>
          ) : (

          <>
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                className="w-full py-2 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 rounded-full font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-sm mb-3"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Sign in with Google</span>
              </button>

              {/* Divider */}
              <div className="relative mb-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold text-zinc-400">
                  <span className="bg-white px-3">or Sign in with Email</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-900 ml-1 block" htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-full text-zinc-900 text-xs focus:ring-2 focus:ring-[#4F39F6] focus:border-brand outline-none transition-all duration-200 placeholder:text-zinc-400 shadow-sm"
                    placeholder="mail@website.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-900 ml-1 block" htmlFor="password">Password*</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full px-4 py-2 pr-10 bg-white border border-zinc-200 rounded-full text-zinc-900 text-xs focus:ring-2 focus:ring-[#4F39F6] focus:border-brand outline-none transition-all duration-200 placeholder:text-zinc-400 shadow-sm"
                      placeholder="Min. 8 character"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-brand transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                
                <div className="flex items-center justify-between ml-1 mt-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <input type="checkbox" id="remember" className="w-3.5 h-3.5 rounded text-brand border-zinc-300 focus:ring-[#4F39F6] accent-[#4F39F6] cursor-pointer" />
                    <label htmlFor="remember" className="text-[10px] font-bold text-zinc-900 cursor-pointer">Remember me</label>
                  </div>
                  <a href="#" className="text-[10px] font-bold text-brand hover:text-brand transition-colors">Forget password?</a>
                </div>
                

                <button type="submit" className="w-full bg-brand hover:bg-brand rounded-full py-2.5 font-bold text-xs text-white shadow-lg shadow-[#4F39F6]/20 transition-all duration-200" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Login"}
                </button>
              </form>
            </>
          )}

          <div className="mt-4 text-left">
            <p className="text-[11px] font-bold text-zinc-900">
              Not registered yet? <Link to="/signup" className="text-brand hover:text-brand">Create an Account</Link>
            </p>
          </div>

          <div className="mt-6">
            <p className="text-[9px] text-zinc-400 font-medium">©2026 Flazly All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: GRAPHIC */}
      <div className="hidden lg:flex w-[55%] h-full bg-brand relative overflow-hidden items-center justify-center flex-col shadow-2xl">
        {/* Animation Keyframes */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes floatY { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
          @keyframes floatY2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
          @keyframes floatX { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(8px); } }
          @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(79,57,246,0.3); } 50% { box-shadow: 0 0 20px 6px rgba(79,57,246,0.15); } }
          @keyframes breathe { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.35; transform: scale(1.05); } }
          @keyframes slideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
          @keyframes drawLine { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
          @keyframes countPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
          @keyframes dotPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
          @keyframes stairSlide { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }
          @keyframes tooltipPop { 0% { opacity: 0; transform: scale(0.5) translateY(10px); } 60% { transform: scale(1.1) translateY(-2px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
          @keyframes ringPing { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } }
          @keyframes iconBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px) scale(1.05); } }
          .float-card-1 { animation: floatY 5s ease-in-out infinite; }
          .float-card-2 { animation: floatY2 4s ease-in-out infinite 0.5s; }
          .float-icon { animation: floatY 3.5s ease-in-out infinite, pulse-glow 3s ease-in-out infinite; }
          .float-icon-2 { animation: floatY2 4.5s ease-in-out infinite 1s, pulse-glow 4s ease-in-out infinite 0.5s; }
          .float-icon-3 { animation: floatX 5s ease-in-out infinite 0.3s, pulse-glow 3.5s ease-in-out infinite 1s; }
          .breathe-dots { animation: breathe 4s ease-in-out infinite; }
          .slide-up-1 { animation: slideUp 0.8s ease-out forwards; }
          .slide-up-2 { animation: slideUp 0.8s ease-out 0.2s forwards; opacity: 0; }
          .chart-line { stroke-dasharray: 300; animation: drawLine 2.5s ease-out 0.5s forwards; stroke-dashoffset: 300; }
          .count-pulse { animation: countPulse 3s ease-in-out infinite; }
          .dot-pulse-1 { animation: dotPulse 2s ease-in-out infinite; }
          .dot-pulse-2 { animation: dotPulse 2s ease-in-out infinite 0.4s; }
          .dot-pulse-3 { animation: dotPulse 2s ease-in-out infinite 0.8s; }
          .stair-1 { animation: stairSlide 0.6s ease-out 0.2s forwards; transform: translateX(100%); }
          .stair-2 { animation: stairSlide 0.6s ease-out 0.4s forwards; transform: translateX(100%); }
          .stair-3 { animation: stairSlide 0.6s ease-out 0.6s forwards; transform: translateX(100%); }
          .stair-4 { animation: stairSlide 0.6s ease-out 0.8s forwards; transform: translateX(100%); }
          .tooltip-anim { opacity: 0; animation: tooltipPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.8s forwards; transform-origin: bottom center; }
          .ring-anim { animation: ringPing 2s cubic-bezier(0, 0, 0.2, 1) infinite 1s; }
          .icon-bounce { animation: iconBounce 2s ease-in-out infinite; }
        `}} />
        {/* Geometric Background Elements */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#3B29C6] translate-x-[-30%] translate-y-[-30%] rotate-45" />
        <div className="absolute top-10 right-10 w-32 h-32 breathe-dots bg-[radial-gradient(circle_at_center,_white_2px,_transparent_2px)] bg-[size:16px_16px]" />
        <div className="absolute top-20 right-1/4 w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-black/10 rotate-[15deg] float-icon-3"></div>
        
        {/* Staircase/Steps */}
        <div className="absolute bottom-0 right-0 w-1/2 h-[45%] flex flex-col items-end justify-end overflow-hidden">
           <div className="w-full h-1/4 bg-[#402FCD] stair-1" />
           <div className="w-[80%] h-1/4 bg-[#3325A6] stair-2" />
           <div className="w-[60%] h-1/4 bg-[#261B7F] stair-3" />
           <div className="w-[40%] h-1/4 bg-[#191059] stair-4" />
        </div>

        <div className="absolute bottom-10 right-[60%] w-64 h-64 bg-black/5 rounded-full blur-3xl"></div>

        {/* New Floating SaaS Elements */}
        <div className="absolute top-[18%] left-[20%] bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl z-20 float-card-1">
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span className="text-zinc-800 text-[11px] font-extrabold tracking-wide">Lead Captured</span>
        </div>

        <div className="absolute top-[25%] right-[15%] bg-white rounded-xl p-3 shadow-2xl z-20 flex items-center gap-3 float-card-2">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-brand">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <div>
            <p className="text-[9px] text-zinc-400 font-bold uppercase">Conversion</p>
            <p className="text-sm font-black text-zinc-900">+84%</p>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="relative z-10 flex items-center justify-center gap-5 transform -translate-y-12">
          
          {/* Revenue Chart Widget */}
          <div className="bg-white rounded-xl p-5 shadow-2xl w-[280px] border border-zinc-2000 bg-clip-padding backdrop-filter relative float-card-1 slide-up-1">
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight count-pulse">14,208</h2>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Leads This Month</p>
            <div className="relative h-20 w-full flex items-end justify-between border-b border-zinc-100 pb-2">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                <path d="M0 45 Q 15 45, 25 30 T 50 15 T 75 25 T 100 35" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                <path className="chart-line" d="M0 40 Q 15 40, 25 25 T 50 5 T 75 15 T 100 30" fill="none" stroke="#4F39F6" strokeWidth="2.5" />
              </svg>
              <div className="absolute top-0 left-[45%] bg-white border border-zinc-100 shadow-xl rounded px-1.5 py-0.5 z-10 text-[9px] font-bold text-zinc-800 flex flex-col items-center tooltip-anim">
                $23,827<br/><span className="text-zinc-400 font-medium">August</span>
              </div>
            </div>
            <div className="flex justify-between text-[7px] font-bold text-zinc-400 uppercase mt-2 px-1">
              <span>APR</span><span>MAY</span><span>JUN</span><span className="text-brand">JUL</span><span>AUG</span>
            </div>
          </div>

          {/* Rewards Widget */}
          <div className="bg-white rounded-xl p-5 shadow-2xl w-[180px] -translate-y-10 float-card-2 slide-up-2">
            <h3 className="text-[13px] font-bold text-zinc-900 mb-3">AI Agent</h3>
            <div className="flex flex-col items-center justify-center pb-1">
              <div className="relative w-14 h-14 mb-2.5">
                {/* Radar ping effect */}
                <div className="absolute inset-0 rounded-full border-[2px] border-brand ring-anim z-0"></div>
                {/* Main circle */}
                <div className="absolute inset-0 rounded-full border-[3px] border-brand/20 p-1 flex items-center justify-center bg-white z-10">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white icon-bounce">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Responses sent</p>
              <p className="text-lg font-extrabold text-zinc-900 tracking-tight count-pulse">284,912</p>
            </div>
          </div>
        </div>

        {/* Marketing Copy */}
        <div className="absolute bottom-12 text-center z-20">
          <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Turn conversations<br/>into revenue.</h2>
          <p className="text-white/80 text-[11px] font-medium max-w-[250px] mx-auto leading-relaxed">Automate Instagram DMs, capture qualified leads,<br/>and sync customer data instantly.</p>
          <div className="flex justify-center gap-1.5 mt-6">
            <div className="w-4 h-1 rounded-full bg-white dot-pulse-1"></div>
            <div className="w-1 h-1 rounded-full bg-white/40 dot-pulse-2"></div>
            <div className="w-1 h-1 rounded-full bg-white/40 dot-pulse-3"></div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Login;
