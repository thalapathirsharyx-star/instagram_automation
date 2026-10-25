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

    const timer = setTimeout(verifyToken, 400);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="auth-surface min-h-screen w-full flex items-center justify-center bg-porcelain p-6">
      <div className="surface w-full max-w-md p-8 text-center">
        <span className="font-display text-[20px] font-semibold tracking-tight text-ink">Flazly</span>

        {status === 'loading' && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="mb-5 h-6 w-6 animate-spin text-ink-soft" />
            <h1 className="font-display text-[20px] font-semibold text-ink">Checking your link</h1>
            <p className="mt-1 text-[15px] text-ink-soft">This takes a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-6">
            <ShieldCheck className="mb-5 h-7 w-7 text-signal-go" />
            <h1 className="font-display text-[26px] font-semibold text-ink">Email confirmed</h1>
            <p className="mx-auto mt-1.5 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft">
              Your account is active. Sign in to connect Instagram and start replying.
            </p>
            <button onClick={() => navigate('/login')} className="btn btn-primary mt-6 w-full">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-6">
            <ShieldAlert className="mb-5 h-7 w-7 text-signal-stop" />
            <h1 className="font-display text-[26px] font-semibold text-ink">This link did not work</h1>
            <p className="mx-auto mt-1.5 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft">
              {errorMessage} Sign up again and we will send a new link.
            </p>
            <button onClick={() => navigate('/signup')} className="btn mt-6 w-full">
              Back to sign up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
