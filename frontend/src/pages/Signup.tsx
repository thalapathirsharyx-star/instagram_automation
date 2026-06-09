import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, UserPlus, AlertCircle, Loader2, Eye, EyeOff, MessageCircle, MoreHorizontal, Info, CheckCircle2, DollarSign, Database, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useGoogleLogin } from '@react-oauth/google';

const TypingIndicator = () => (
  <div className="flex gap-1 px-1 py-0.5">
    <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
    <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
    <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
  </div>
);

const LaptopMockup = () => {
  const [step, setStep] = useState(0);

  // Story loop
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev >= 11 ? 0 : prev + 1));
    }, 1200); // Progress every 1.2s
    return () => clearInterval(timer);
  }, []);

  const showCustomerMsg = step >= 1;
  const isTyping = step === 2;
  const showBotMsg = step >= 3;

  const notifications = [
    { step: 4, text: "Lead Captured", icon: <CheckCircle2 size={14} className="text-emerald-400" /> },
    { step: 5, text: "Contact Saved", icon: <MessageCircle size={14} className="text-blue-400" /> },
    { step: 6, text: "CRM Updated", icon: <Database size={14} className="text-purple-400" /> },
    { step: 7, text: "Meeting Booked", icon: <Calendar size={14} className="text-amber-400" /> },
    { step: 8, text: "Revenue Generated +$1,250", icon: <DollarSign size={14} className="text-emerald-400" />, glow: true },
  ];

  return (
    <div className="relative w-full max-w-[800px] px-8 md:px-16 flex flex-col items-center justify-center transform scale-95 xl:scale-100 transition-transform duration-500">
      
      {/* Background ambient glow behind laptop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Laptop Screen & Bezel */}
      <div className="relative z-20 w-full aspect-[16/10] bg-[#0c0c0c] rounded-t-[16px] md:rounded-t-[24px] border-[6px] md:border-[12px] border-[#18181b] border-b-[2px] md:border-b-[4px] shadow-2xl overflow-hidden flex flex-col">
        {/* Webcam */}
        <div className="absolute top-1.5 md:top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#050505] rounded-full z-30 ring-1 ring-white/10" />

        {/* Screen Content - Instagram DM Interface Mock */}
        <div className="flex-1 bg-black flex relative">
          
          {/* Sidebar */}
          <div className="hidden md:flex w-40 lg:w-56 border-r border-white/5 flex-col bg-[#050505]">
            <div className="h-16 border-b border-white/5 flex items-center px-4 font-bold text-primary-foreground text-lg">
              Messages
            </div>
            <div className="flex-1 p-2 space-y-1">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-0.5">
                  <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">AL</span>
                  </div>
                </div>
                <div>
                  <p className="text-primary-foreground font-semibold text-sm">Alex Customer</p>
                  <p className="text-muted-foreground text-xs truncate w-32">I'd be happy to help.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer opacity-50">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shrink-0">
                  <span className="text-muted-foreground font-bold">SJ</span>
                </div>
                <div>
                  <p className="text-primary-foreground font-semibold text-sm">Sarah Johnson</p>
                  <p className="text-muted-foreground text-xs truncate w-32">Thanks for the info!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col relative bg-black">
            {/* Chat Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">AL</span>
                </div>
                <span className="text-primary-foreground font-semibold text-sm">Alex Customer</span>
              </div>
              <div className="flex items-center gap-4 text-primary-foreground/50">
                <Info size={20} />
                <MoreHorizontal size={20} />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden relative">
              <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-4">Today 9:41 AM</p>

              <AnimatePresence>
                {showCustomerMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[70%] bg-[#262626] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-primary-foreground shadow-sm border border-white/5">
                      "Hi, is this available?"
                    </div>
                  </motion.div>
                )}

                {(isTyping || showBotMsg) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end mt-2"
                  >
                    <div className="max-w-[70%] bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-primary-foreground shadow-md">
                      {isTyping ? <TypingIndicator /> : "Hey 👋 Thanks for reaching out. I'd be happy to help."}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Input Bar Mock */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="w-full h-10 rounded-full border border-white/10 bg-[#262626] flex items-center px-4">
                  <span className="text-muted-foreground text-sm">Message...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Success Notifications overlaid nicely */}
        <div className="absolute top-16 left-40 lg:left-56 right-0 bottom-0 pointer-events-none p-6 flex flex-col items-end justify-end pb-20 gap-3 z-40 overflow-hidden">
           <AnimatePresence>
              {notifications.map((notif, index) => {
                if (step >= notif.step) {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 50, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`px-4 py-2.5 bg-[#18181b]/90 backdrop-blur-xl border ${notif.glow ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-white/10'} rounded-xl flex items-center gap-3`}
                    >
                      {notif.icon}
                      <span className={`text-xs font-bold ${notif.glow ? 'text-emerald-400' : 'text-primary-foreground'}`}>{notif.text}</span>
                    </motion.div>
                  )
                }
                return null;
              })}
           </AnimatePresence>
        </div>
      </div>

      {/* Laptop Base (Keyboard area front edge) */}
      <div className="relative z-30 w-[108%] md:w-[106%] h-4 md:h-6 bg-gradient-to-b from-[#262626] to-[#050505] rounded-b-xl md:rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex items-start justify-center border-t border-[#404040]">
        {/* Trackpad notch */}
        <div className="w-20 md:w-28 h-1.5 md:h-2 bg-[#050505] rounded-b-md" />
      </div>
      
      {/* Floor shadow */}
      <div className="w-full h-8 bg-black/60 blur-2xl rounded-[100%] -mt-4 absolute -bottom-8 pointer-events-none" />

    </div>
  );
};


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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSelect = async (email: string, name: string) => {
    setIsGoogleLoading(true);
    setMessage(null);
    try {
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
      try {
        const registerRes = await api.post('/Auth/Register', {
          first_name: name,
          company_name: `${name}'s Company`,
          email: email,
          password: 'GoogleUser123!!' 
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
        setMessage({ text: 'Authentication failed. Please try again.', type: 'error' });
      }
    } finally {
      setIsGoogleLoading(false);
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
        setMessage({ text: 'Failed to retrieve profile information from Google.', type: 'error' });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
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
    <div className="min-h-screen h-screen w-full flex bg-[#050505] text-primary-foreground font-inter overflow-hidden">
      <div className="w-full h-full flex flex-col md:flex-row relative">
        
        {/* Left Side - Auth Form */}
        <div className="w-full md:w-[45%] lg:w-[40%] p-8 md:p-12 flex flex-col items-center justify-center relative bg-[#080808] z-20 border-r border-white/5 shadow-2xl">
          <div className="w-full max-w-[340px] mx-auto flex flex-col items-center">
            
            {/* Logo */}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/10 shadow-lg">
              <img src="/Light Theme.png" alt="Flazly Logo" className="w-6 h-6 object-contain" />
            </div>
            
            <h1 className="text-2xl font-semibold text-primary-foreground mb-2 text-center tracking-tight">Create Account</h1>
            <p className="text-sm font-medium text-muted-foreground mb-8 text-center">Join us today and start growing</p>

            {message && (
              <div className={`${message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                } border text-sm p-3 rounded-xl w-full flex flex-col gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? <UserPlus size={16} /> : <AlertCircle size={16} />}
                  <span className="font-medium text-xs">{message.text}</span>
                </div>
              </div>
            )}

            <div className="w-full space-y-5">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="flex gap-3">
                  <div className="space-y-1.5 w-1/2">
                    <label className="text-xs font-semibold text-zinc-300 ml-1 block" htmlFor="firstName">Full Name</label>
                    <div className="relative group">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-foreground transition-colors z-10" />
                      <input
                        type="text"
                        id="firstName"
                        className="w-full pl-11 pr-4 py-2.5 bg-primary/50 border border-primary rounded-xl text-primary-foreground text-sm focus:ring-1 focus:ring-white/20 focus:border-zinc-700 outline-none transition-all duration-200 placeholder:text-muted-foreground font-medium"
                        placeholder="John Doe"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 w-1/2">
                    <label className="text-xs font-semibold text-zinc-300 ml-1 block" htmlFor="companyName">Company</label>
                    <div className="relative group">
                      <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-foreground transition-colors z-10" />
                      <input
                        type="text"
                        id="companyName"
                        className="w-full pl-11 pr-4 py-2.5 bg-primary/50 border border-primary rounded-xl text-primary-foreground text-sm focus:ring-1 focus:ring-white/20 focus:border-zinc-700 outline-none transition-all duration-200 placeholder:text-muted-foreground font-medium"
                        placeholder="Acme Inc."
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 ml-1 block" htmlFor="email">Email</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-foreground transition-colors z-10" />
                    <input
                      type="email"
                      id="email"
                      className="w-full pl-11 pr-4 py-2.5 bg-primary/50 border border-primary rounded-xl text-primary-foreground text-sm focus:ring-1 focus:ring-white/20 focus:border-zinc-700 outline-none transition-all duration-200 placeholder:text-muted-foreground font-medium"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 ml-1 block" htmlFor="password">Password</label>
                  <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-foreground transition-colors z-10" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full pl-11 pr-11 py-2.5 bg-primary/50 border border-primary rounded-xl text-primary-foreground text-sm focus:ring-1 focus:ring-white/20 focus:border-zinc-700 outline-none transition-all duration-200 placeholder:text-muted-foreground font-medium"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary-foreground transition-colors z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="w-full mt-6 bg-white hover:bg-zinc-200 text-black rounded-xl py-2.5 font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 group" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin text-black" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <UserPlus size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="bg-[#080808] px-3 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                className="w-full py-2.5 bg-primary/50 border border-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>
            </div>

            <div className="mt-8 text-center w-full">
              <p className="text-muted-foreground font-medium text-[11px]">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-foreground font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </div>

        {/* Right Side - Visual "Live Laptop Demo" */}
        <div className="hidden md:flex w-full md:w-[55%] lg:w-[60%] flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0c]">
          
          <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0c0c12] to-[#050508]"></div>

          <div className="z-10 w-full flex flex-col items-center justify-center">
            <LaptopMockup />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Signup;
