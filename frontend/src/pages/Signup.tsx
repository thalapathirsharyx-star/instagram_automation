import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, UserPlus, AlertCircle, Loader2, Eye, EyeOff, MessageCircle, Bot, Database, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useGoogleLogin } from '@react-oauth/google';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    companyName: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
          navigate('/dashboard', { replace: true });
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
            navigate('/dashboard', { replace: true });
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


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/Auth/Register', {
        first_name: formData.firstName,
        company_name: formData.companyName,
        email: formData.email,
        password: formData.password
      });

      if (response.data.Type === 'S') {
        const result = response.data.result;
        if (result && result.status === 'pending_verification') {
          setMessage({ text: result.message || 'Registration successful! Please check your email to verify your account.', type: 'success' });
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          const { api_token, user } = result;
          setMessage({ text: 'Account created! Fueling up your dashboard...', type: 'success' });
          setTimeout(() => {
            login(api_token, user);
            navigate('/dashboard', { replace: true });
          }, 1500);
        }
      } else {
        setMessage({ text: response.data.Message || 'Signup failed', type: 'error' });
      }
    } catch (err: unknown) {
      console.error('Signup error:', err);
      const error = err as { response?: { data?: { Message?: string } }; message?: string };
      const messageText = error.response?.data?.Message || error.message || 'An error occurred during signup';
      setMessage({ text: messageText, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden font-inter bg-white">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-[45%] h-full flex flex-col justify-center px-6 lg:px-12 xl:px-20 relative z-10 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto py-2">
          {/* Logo/Icon */}
          <div className="mb-6 flex items-center gap-2">
            <img src="/Light Theme.png" alt="Flazly Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-extrabold text-zinc-900 tracking-tight">Flazly</span>
          </div>

          <div className="mb-8 text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">Create an account</h1>
            <p className="text-sm text-zinc-500 font-medium">Start automating your Instagram today.</p>
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

              <form onSubmit={handleSignup} className="space-y-3">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-900 ml-1 block" htmlFor="firstName">Name*</label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-full text-zinc-900 text-xs focus:ring-2 focus:ring-[#4F39F6] focus:border-[#4F39F6] outline-none transition-all duration-200 placeholder:text-zinc-400 shadow-sm"
                    placeholder="John Doe"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-900 ml-1 block" htmlFor="companyName">Company*</label>
                  <input
                    type="text"
                    id="companyName"
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-full text-zinc-900 text-xs focus:ring-2 focus:ring-[#4F39F6] focus:border-[#4F39F6] outline-none transition-all duration-200 placeholder:text-zinc-400 shadow-sm"
                    placeholder="Acme Corp"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-900 ml-1 block" htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-full text-zinc-900 text-xs focus:ring-2 focus:ring-[#4F39F6] focus:border-[#4F39F6] outline-none transition-all duration-200 placeholder:text-zinc-400 shadow-sm"
                    placeholder="mail@website.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-900 ml-1 block" htmlFor="password">Password*</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full px-4 py-2 pr-10 bg-white border border-zinc-200 rounded-full text-zinc-900 text-xs focus:ring-2 focus:ring-[#4F39F6] focus:border-[#4F39F6] outline-none transition-all duration-200 placeholder:text-zinc-400 shadow-sm"
                      placeholder="Min. 8 character"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-purple-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="h-0.5"></div>

                <button type="submit" className="w-full bg-[#4F39F6] hover:bg-purple-700 rounded-full py-2.5 font-bold text-xs text-white shadow-lg shadow-[#4F39F6]/20 transition-all duration-200" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>

          <div className="mt-4 text-left">
            <p className="text-[11px] font-bold text-zinc-900">
              Already have an account? <Link to="/login" className="text-[#4F39F6] hover:text-purple-700">Sign In</Link>
            </p>
          </div>

          <div className="mt-6">
            <p className="text-[9px] text-zinc-400 font-medium">©2026 Flazly All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: GRAPHIC */}
      <div className="hidden lg:flex w-[55%] h-full bg-[#4F39F6] relative overflow-hidden items-center justify-center flex-col shadow-2xl">
        {/* Geometric Background Elements */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#3B29C6] translate-x-[-30%] translate-y-[-30%] rotate-45" />
        <div className="absolute top-10 right-10 w-32 h-32 opacity-20 bg-[radial-gradient(circle_at_center,_white_2px,_transparent_2px)] bg-[size:16px_16px]" />
        <div className="absolute top-20 right-1/4 w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-black/10 rotate-[15deg]"></div>
        
        {/* Staircase/Steps */}
        <div className="absolute bottom-0 right-0 w-1/2 h-[45%] flex flex-col items-end justify-end">
           <div className="w-full h-1/4 bg-[#402FCD]" />
           <div className="w-[80%] h-1/4 bg-[#3325A6]" />
           <div className="w-[60%] h-1/4 bg-[#261B7F]" />
           <div className="w-[40%] h-1/4 bg-[#191059]" />
        </div>

        <div className="absolute bottom-10 right-[60%] w-64 h-64 bg-black/5 rounded-full blur-3xl"></div>

        {/* Floating Icons */}
        <div className="absolute top-[20%] left-[25%] w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl z-20 overflow-hidden">
          <img src="/Dark theme.png" alt="Flazly Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="absolute top-[15%] right-[30%] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl z-20">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="IG" className="w-5 h-5 object-cover" />
        </div>
        <div className="absolute top-[50%] right-[15%] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl z-20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#0084FF"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.898 1.48 5.485 3.79 7.202v3.136c0 .356.388.563.684.368l3.413-2.26c.677.18 1.385.275 2.113.275 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.144 12.35l-2.91-3.11-5.63 3.11 6.195-6.578 2.91 3.11 5.63-3.11-6.195 6.578z"/></svg>
        </div>

        {/* Dashboard Widgets */}
        <div className="relative z-10 flex items-center justify-center gap-5 transform -translate-y-12">
          
          {/* Revenue Chart Widget */}
          <div className="bg-white rounded-xl p-5 shadow-2xl w-[280px] border border-white/50 bg-clip-padding backdrop-filter relative">
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">14,208</h2>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Leads This Month</p>
            <div className="relative h-20 w-full flex items-end justify-between border-b border-zinc-100 pb-2">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                <path d="M0 45 Q 15 45, 25 30 T 50 15 T 75 25 T 100 35" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                <path d="M0 40 Q 15 40, 25 25 T 50 5 T 75 15 T 100 30" fill="none" stroke="#4F39F6" strokeWidth="2.5" />
              </svg>
              <div className="absolute top-0 left-[45%] bg-white border border-zinc-100 shadow-xl rounded px-1.5 py-0.5 z-10 text-[9px] font-bold text-zinc-800 flex flex-col items-center">
                $23,827<br/><span className="text-zinc-400 font-medium">August</span>
              </div>
            </div>
            <div className="flex justify-between text-[7px] font-bold text-zinc-400 uppercase mt-2 px-1">
              <span>APR</span><span>MAY</span><span>JUN</span><span className="text-[#4F39F6]">JUL</span><span>AUG</span>
            </div>
          </div>

          {/* Rewards Widget */}
          <div className="bg-white rounded-xl p-5 shadow-2xl w-[180px] -translate-y-10">
            <h3 className="text-[13px] font-bold text-zinc-900 mb-3">AI Agent</h3>
            <div className="flex flex-col items-center justify-center pb-1">
              <div className="w-14 h-14 rounded-full border-[3px] border-[#4F39F6]/20 p-1 mb-2.5 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-zinc-100 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
                </div>
              </div>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Responses sent</p>
              <p className="text-lg font-extrabold text-zinc-900 tracking-tight">284,912</p>
            </div>
          </div>
        </div>

        {/* Marketing Copy */}
        <div className="absolute bottom-12 text-center z-20">
          <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Turn conversations<br/>into revenue.</h2>
          <p className="text-white/80 text-[11px] font-medium max-w-[250px] mx-auto leading-relaxed">Automate Instagram DMs, capture qualified leads,<br/>and sync customer data instantly.</p>
          <div className="flex justify-center gap-1.5 mt-6">
            <div className="w-4 h-1 rounded-full bg-white"></div>
            <div className="w-1 h-1 rounded-full bg-white/40"></div>
            <div className="w-1 h-1 rounded-full bg-white/40"></div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Signup;
