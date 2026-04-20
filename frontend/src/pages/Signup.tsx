import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, UserPlus, AlertCircle, Loader2, Zap, Eye, EyeOff } from 'lucide-react';
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
        const { api_token, user } = response.data.result;
        setMessage({ text: 'Account created! Fueling up your dashboard...', type: 'success' });

        setTimeout(() => {
          login(api_token, user);
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        setMessage({ text: response.data.Message || 'Signup failed', type: 'error' });
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      const messageText = err.response?.data?.Message || err.message || 'An error occurred during signup';
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
    <div className="login-page dot-grid bg-white">
      <div className="background-decor pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-50/50 -z-10" />
        <div className="blob blob-1 bg-indigo-600/10 opacity-20"></div>
        <div className="blob blob-2 bg-violet-600/10 opacity-20"></div>
      </div>

      <div className="login-container bg-white border border-slate-200 shadow-2xl shadow-indigo-100 rounded-[2.5rem] p-10 max-w-md w-full">
        <div className="login-header text-center mb-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Start Growing</h1>
          </div>
          <p className="subtitle text-slate-500">Launch your premium Instagram CRM in seconds.</p>
        </div>

        {message && (
          <div className={`${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border-rose-200 text-rose-700'
            } border text-sm p-3 rounded-lg flex items-center gap-2 mb-6 transition-all duration-300`}>
            {message.type === 'success' ? <UserPlus size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="login-form flex flex-col gap-4">
          <div className="input-group">
            <label htmlFor="firstName">Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="firstName"
                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="John Doe"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="companyName">Company Name</label>
            <div className="input-wrapper">
              <Building2 size={18} className="input-icon" />
              <input
                type="text"
                id="companyName"
                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Acme Inc."
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
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

          <button type="submit" className="login-button gradient-btn rounded-full mt-2 py-4" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Free Account</span>
                <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
