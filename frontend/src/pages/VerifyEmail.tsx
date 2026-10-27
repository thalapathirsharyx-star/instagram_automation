import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import AuthLayout, { AuthHeading } from '../components/AuthLayout';
import { authErrorMessage } from '../lib/authErrors';

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
        setErrorMessage(authErrorMessage(err, 'Verification link has expired or is invalid.'));
      }
    };

    const timer = setTimeout(verifyToken, 400);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <AuthLayout
      title="One click, and your workspace is ready."
      description="Confirming your email keeps your account secure and lets us send you usage alerts and password resets."
    >
      <div aria-live="polite">
        {status === 'loading' && (
          <div>
            <span className="icon-tile mb-6 h-12 w-12 rounded-full"><Loader2 size={22} className="animate-spin" /></span>
            <AuthHeading title="Checking your link" subtitle="This takes a moment." />
          </div>
        )}

        {status === 'success' && (
          <div>
            <span className="icon-tile tone-mint mb-6 h-12 w-12 rounded-full"><ShieldCheck size={22} /></span>
            <AuthHeading title="Email confirmed" subtitle="Your account is active. Sign in to connect Instagram and start replying." />
            <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg btn-block group">
              <span>Sign in</span>
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <span className="icon-tile tone-rose mb-6 h-12 w-12 rounded-full"><ShieldAlert size={22} /></span>
            <AuthHeading title="This link did not work" subtitle={<>{errorMessage} Sign up again and we will send a new link.</>} />
            <button onClick={() => navigate('/signup')} className="btn btn-lg btn-block">
              Back to sign up
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
