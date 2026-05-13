import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, UserPlus, AlertCircle, Loader2, Zap, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen w-full flex overflow-hidden bg-zinc-950 font-inter relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative p-20 z-10">
        <div className="relative w-full max-w-2xl flex flex-col items-center">
          <div className="w-full transform hover:scale-[1.02] transition-transform duration-1000 ease-in-out">
            <DotLottieReact
              src="https://lottie.host/56e4fcc8-61f7-48de-ab64-9dc0e1c50e3a/aMDbskgDHA.lottie"
              loop
              autoplay
              className="w-full h-full drop-shadow-[0_0_80px_rgba(168,85,247,0.3)] filter brightness-150 contrast-125 saturate-150 hue-rotate-30"
            />
          </div>
          
          <div className="mt-12 text-center max-w-lg">
            <h2 className="text-4xl font-bold text-zinc-100 mb-4 leading-tight">
              Scale Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Influence</span>
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium">
              Join the elite league of creators using ReplyZens to manage their growth with precision and ease.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 z-20 overflow-y-auto premium-scroll">
        <div className="w-full max-w-lg bg-zinc-900/50 backdrop-blur-xl rounded-[2rem] p-10 md:p-12 shadow-2xl border border-white/5 relative my-8">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <div className="mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] mx-auto mb-8 border border-purple-500/20">
              <Zap className="w-8 h-8 text-purple-400" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
            <p className="text-zinc-400 font-medium">Join us today and start growing</p>
          </div>

          {message && (
            <div className={`${message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              } border text-sm p-4 rounded-xl flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-2 duration-300`}>
              {message.type === 'success' ? <UserPlus size={18} /> : <AlertCircle size={18} />}
              <span className="font-semibold">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 ml-1" htmlFor="firstName">Full Name</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors z-10" />
                <input
                  type="text"
                  id="firstName"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/50 border border-white/5 rounded-xl text-zinc-100 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all duration-300 placeholder:text-zinc-600 shadow-inner"
                  placeholder="John Doe"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 ml-1" htmlFor="companyName">Company Name</label>
              <div className="relative group">
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors z-10" />
                <input
                  type="text"
                  id="companyName"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/50 border border-white/5 rounded-xl text-zinc-100 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all duration-300 placeholder:text-zinc-600 shadow-inner"
                  placeholder="Acme Corp"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors z-10" />
                <input
                  type="email"
                  id="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/50 border border-white/5 rounded-xl text-zinc-100 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all duration-300 placeholder:text-zinc-600 shadow-inner"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 ml-1" htmlFor="password">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-950/50 border border-white/5 rounded-xl text-zinc-100 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all duration-300 placeholder:text-zinc-600 shadow-inner"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-purple-400 transition-colors z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3.5 font-bold text-base shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 group border border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]" disabled={isLoading}>
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

          <div className="text-center mt-10 pt-8 border-t border-white/10">
            <p className="text-zinc-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
