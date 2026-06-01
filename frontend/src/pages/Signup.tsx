import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, UserPlus, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

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
      // First try to Register the user
      const registerRes = await api.post('/Auth/Register', {
        first_name: name,
        company_name: `${name}'s Company`,
        email: email,
        password: 'GoogleUser123!!' // consistent password for mock Google OAuth user
      });

      if (registerRes.data.Type === 'S') {
        const { api_token, user } = registerRes.data.result;
        setMessage({ text: 'Registered via Google! Welcome...', type: 'success' });
        setTimeout(() => {
          login(api_token, user);
          navigate('/dashboard', { replace: true });
        }, 1200);
      }
    } catch (err: any) {
      // If user already exists, login instead!
      try {
        const loginRes = await api.post('/Auth/Login', {
          email: email,
          password: 'GoogleUser123!!'
        });

        if (loginRes.data.Type === 'S') {
          const { api_token, user } = loginRes.data.result;
          setMessage({ text: 'Logged in via Google!', type: 'success' });
          setTimeout(() => {
            login(api_token, user);
            navigate('/dashboard', { replace: true });
          }, 1200);
        } else {
          setMessage({ text: 'Google authentication failed', type: 'error' });
        }
      } catch (loginErr: any) {
        console.error('Google login fallback error:', loginErr);
        setMessage({ text: 'Account already exists. Please login with your standard credentials.', type: 'error' });
      }
    } finally {
      setIsGoogleLoading(false);
      setShowGoogleModal(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!(window as any).google) {
      // Fallback to mock account selector modal
      setShowGoogleModal(true);
      return;
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            setMessage({ text: 'Google authentication failed.', type: 'error' });
            return;
          }

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
      });
      client.requestAccessToken();
    } catch (err) {
      console.error('Error initializing Google login:', err);
      setShowGoogleModal(true);
    }
  };


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
          setMessage({ text: result.message || 'Please check your email to verify your account.', type: 'success' });
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
    <div className="min-h-screen w-full flex overflow-hidden bg-zinc-50 font-inter relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.06)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative p-20 z-10 bg-zinc-100/50 border-r border-zinc-200/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative w-full max-w-2xl flex flex-col items-center">
          <div className="w-full transform hover:scale-[1.01] transition-transform duration-1000 ease-in-out">
            <DotLottieReact
              src="https://lottie.host/56e4fcc8-61f7-48de-ab64-9dc0e1c50e3a/aMDbskgDHA.lottie"
              loop
              autoplay
              className="w-full h-full drop-shadow-[0_4px_30px_rgba(168,85,247,0.1)]"
            />
          </div>
          
          <div className="mt-12 text-center max-w-lg">
            <h2 className="text-4xl font-extrabold text-zinc-900 mb-4 leading-tight">
              Scale Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Influence</span>
            </h2>
            <p className="text-lg text-zinc-600 leading-relaxed font-semibold">
              Join the elite league of creators using ReplyZens to manage their growth with precision and ease.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 z-20 overflow-y-auto premium-scroll">
        <div className="w-full max-w-lg bg-white rounded-[2rem] p-10 md:p-12 shadow-2xl border border-zinc-100 relative my-8">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-transparent flex items-center justify-center mx-auto mb-8">
              <img src="/favicon.svg" alt="ReplyZens Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">Create Account</h1>
            <p className="text-zinc-500 font-semibold">Join us today and start growing</p>
          </div>

          {message && (
            <div className={`${message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
              } border text-sm p-4 rounded-xl flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-2 duration-300`}>
              {message.type === 'success' ? <UserPlus size={18} /> : <AlertCircle size={18} />}
              <span className="font-semibold">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 ml-1" htmlFor="firstName">Full Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                <input
                  type="text"
                  id="firstName"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 placeholder:text-zinc-400 shadow-sm"
                  placeholder="John Doe"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 ml-1" htmlFor="companyName">Company Name</label>
              <div className="relative group">
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                <input
                  type="text"
                  id="companyName"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 placeholder:text-zinc-400 shadow-sm"
                  placeholder="Acme Corp"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                <input
                  type="email"
                  id="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 placeholder:text-zinc-400 shadow-sm"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-700 ml-1" htmlFor="password">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 placeholder:text-zinc-400 shadow-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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

            <button type="submit" className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3.5 font-bold text-base shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 group border border-purple-500/30" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase">
              <span className="bg-white px-4 text-zinc-400">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>

          <div className="text-center mt-10 pt-8 border-t border-zinc-100">
            <p className="text-zinc-500 font-semibold">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 font-extrabold hover:text-purple-500 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      {showGoogleModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isGoogleLoading && setShowGoogleModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-slate-800 dark:text-zinc-100 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              {/* Google Logo */}
              <svg className="w-10 h-10 mb-4" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <h2 className="text-xl font-bold mb-1">Choose an account</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 font-medium">to continue to <span className="font-bold text-purple-600">ReplyZens</span></p>
            </div>

            {isGoogleLoading ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <Loader2 size={36} className="animate-spin text-purple-650 animate-duration-1000" />
                <p className="text-sm font-bold text-slate-650 dark:text-zinc-350">Connecting with Google...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleGoogleSelect('mrlem@gmail.com', 'Mr. Lem')}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-2xl transition-all border border-slate-100 dark:border-zinc-800 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600 font-bold uppercase text-sm border border-purple-500/20">
                    ML
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-805 dark:text-zinc-150">Mr. Lem</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">mrlem@gmail.com</p>
                  </div>
                </button>

                <button
                  onClick={() => handleGoogleSelect('admin@user.com', 'Super Admin')}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-2xl transition-all border border-slate-100 dark:border-zinc-800 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600 font-bold uppercase text-sm border border-indigo-500/20">
                    SA
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-805 dark:text-zinc-150">Super Admin</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">admin@user.com</p>
                  </div>
                </button>

                <button
                  onClick={() => handleGoogleSelect('replyzens@gmail.com', 'ReplyZens')}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-2xl transition-all border border-slate-100 dark:border-zinc-800 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600 font-bold uppercase text-sm border border-purple-500/20">
                    RZ
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-805 dark:text-zinc-150">ReplyZens</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">replyzens@gmail.com</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
