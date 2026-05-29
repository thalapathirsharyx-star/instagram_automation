import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/Auth/Login', { email, password });

      if (response.data.Type === 'S') {
        const { api_token, user } = response.data.result;
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
    } finally {
      setIsLoading(false);
    }
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
              AI Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Instagram Growth</span>
            </h2>
            <p className="text-lg text-zinc-600 leading-relaxed font-semibold">
              Join the elite league of creators using ReplyZens to automate their DMs and scale revenue.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 z-20">
        <div className="w-full max-w-lg bg-white rounded-[2rem] p-10 md:p-12 shadow-2xl border border-zinc-100 relative">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-transparent flex items-center justify-center mx-auto mb-8">
              <img src="/favicon.svg" alt="ReplyZens Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">Welcome Back</h1>
            <p className="text-zinc-500 font-semibold">Sign in to your AI workspace</p>
          </div>

          {message && (
            <div className={`${message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
              } border text-sm p-4 rounded-xl flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-2 duration-300`}>
              {message.type === 'success' ? <LogIn size={18} /> : <AlertCircle size={18} />}
              <span className="font-semibold">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                <input
                  type="email"
                  id="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 placeholder:text-zinc-400 shadow-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-zinc-700" htmlFor="password">Password</label>
                <a href="#" className="text-xs font-bold text-purple-600 hover:text-purple-500 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 placeholder:text-zinc-400 shadow-sm"
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

            <button type="submit" className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3.5 font-bold text-base shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 group border border-purple-500/30" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-10 pt-8 border-t border-zinc-100">
            <p className="text-zinc-500 font-semibold">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-600 font-extrabold hover:text-purple-500 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
