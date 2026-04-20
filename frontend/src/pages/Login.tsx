import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Zap, Eye, EyeOff } from 'lucide-react';
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

        // Short delay to show the green success toast before navigating
        setTimeout(() => {
          login(api_token, user);
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setMessage({ text: response.data.Message || 'Login failed', type: 'error' });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const messageText = err.response?.data?.Message || err.message || 'An error occurred during login';
      setMessage({ text: messageText, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page dot-grid bg-white">
      <div className="background-decor pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-50/50 -z-10" />
        <div className="blob blob-1 bg-indigo-600/10 opacity-20"></div>
        <div className="blob blob-2 bg-violet-600/10 opacity-20"></div>
      </div>

      <div className="login-container bg-white border border-slate-200 shadow-2xl shadow-indigo-100 rounded-[2.5rem] p-12">
        <div className="login-header text-center mb-10">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">ReplyZens</h1>
          </div>
          <p className="subtitle text-slate-500">Welcome back! Please enter your details.</p>
        </div>

        {message && (
          <div className={`${message.type === 'success'
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-destructive/10 border-destructive/20 text-destructive'
            } border text-sm p-3 rounded-lg flex items-center gap-2 mb-6 transition-all duration-300`}>
            {message.type === 'success' ? <LogIn size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="login-button gradient-btn rounded-full mt-4 py-4" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Login to Dashboard</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
        {/* 
        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-button">
            <Globe size={20} />
            <span>Google</span>
          </button>
          <button className="social-button">
            <Users size={20} />
            <span>GitHub</span>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
