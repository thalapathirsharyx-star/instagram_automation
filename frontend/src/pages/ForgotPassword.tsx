import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import api from '../lib/axios';

/**
 * Step one of the password reset the backend already supported but nothing in
 * the app reached: `POST /Auth/ForgotPassword` mails a six-digit code and a
 * link to the reset page.
 */
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'sending') return;

    setStatus('sending');
    setError('');
    try {
      const response = await api.post('/Auth/ForgotPassword', { email: email.trim() });
      if (response.data?.Type === 'S') {
        setStatus('sent');
      } else {
        setStatus('idle');
        setError(response.data?.Message || 'We could not send the email. Check the address and try again.');
      }
    } catch (err) {
      setStatus('idle');
      const message = (err as { response?: { data?: { Message?: string } } })?.response?.data?.Message;
      setError(message || 'We could not send the email. Check the address and try again.');
    }
  };

  return (
    <div className="auth-surface min-h-screen w-full flex items-center justify-center bg-porcelain p-6">
      <div className="surface w-full max-w-md p-8">
        <Link to="/" className="mx-auto mb-6 flex w-fit items-center justify-center">
          <img src="/Light Theme.png" alt="Flazly" className="h-10 w-10 object-contain" />
        </Link>

        {status === 'sent' ? (
          <div className="text-center">
            <Mail className="mx-auto mb-5 h-7 w-7 text-signal-go" />
            <h1 className="font-display text-[26px] font-semibold text-ink">Check your email</h1>
            <p className="mx-auto mt-1.5 max-w-[36ch] text-[15px] leading-relaxed text-ink-soft">
              If an account uses <span className="text-ink">{email.trim()}</span>, we have sent it a
              six-digit code and a link to choose a new password.
            </p>
            <p className="mt-4 text-[13px] text-ink-faint">
              The email can take a minute. Check your spam folder before trying again.
            </p>
            <button onClick={() => { setStatus('idle'); setEmail(''); }} className="btn mt-6 w-full">
              Use a different address
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="font-display text-[26px] font-semibold text-ink">Reset your password</h1>
              <p className="mx-auto mt-1.5 max-w-[36ch] text-[15px] leading-relaxed text-ink-soft">
                Enter the email you signed up with and we will send you a code.
              </p>
            </div>

            {error && (
              <div className="notice notice-stop mb-5">
                <p className="notice-body">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label" htmlFor="reset-email">Email address</label>
                <input
                  id="reset-email"
                  type="email"
                  className="field"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" disabled={status === 'sending'} className="btn btn-primary w-full">
                {status === 'sending' && <Loader2 size={15} className="animate-spin" />}
                Send reset code
              </button>
            </form>
          </>
        )}

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
