import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import api from '../lib/axios';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing or invalid.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.post('/Auth/VerifyEmail', { token });
        if (response.data.Type === 'S' || response.data.Type === 'Success') {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(response.data.Message || 'Failed to verify email.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.Message || 'Verification link has expired or is invalid.');
      }
    };

    // Delay slightly for premium animation feel
    const timer = setTimeout(verifyToken, 1500);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 font-inter relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Decorative Grid Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-md px-6 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          
          {/* Top Logo */}
          <div className="mb-8">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Flaz<span className="text-logo-gradient">ly</span>
            </span>
          </div>

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-16 h-16 bg-purple-500/10 rounded-full animate-ping" />
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin relative" />
              </div>
              <h2 className="text-xl font-bold text-zinc-100 mb-2">Verifying your email</h2>
              <p className="text-zinc-400 text-sm">Securing your Flazly dashboard...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-6 animate-bounce">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">Email Verified!</h2>
              <p className="text-zinc-400 text-sm mb-8 max-w-xs">
                Your account is now fully active. You can proceed to log in to your dashboard.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20"
              >
                Continue to Login
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-6">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">Verification Failed</h2>
              <p className="text-red-400 text-sm mb-8 max-w-xs">
                {errorMessage}
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold transition-all border border-white/5"
              >
                Back to Sign Up
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
