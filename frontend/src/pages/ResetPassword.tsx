import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';

/**
 * Step two of the reset. The email links here as `/ResetPassword/<id>`, where
 * the id is the encrypted user id the backend expects back; the person types
 * the six-digit code from the same email and a new password.
 */
const ResetPassword: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'saving') return;

    // Check what the backend would reject, so the message names the actual
    // problem rather than arriving as a generic failure.
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('The code is the six digits in the email.');
      return;
    }
    if (password.length < 6) {
      setError('Use at least 6 characters for the new password.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setStatus('saving');
    setError('');
    try {
      const response = await api.post('/Auth/ResetPassword', {
        user_id: userId,
        reset_otp: Number(otp.trim()),
        password,
      });
      if (response.data?.Type === 'S') {
        setStatus('done');
      } else {
        setStatus('idle');
        setError(response.data?.Message || 'That code did not work. Request a new one and try again.');
      }
    } catch (err) {
      setStatus('idle');
      const message = (err as { response?: { data?: { Message?: string } } })?.response?.data?.Message;
      setError(message || 'That code did not work. Request a new one and try again.');
    }
  };

  return (
    <div className="auth-surface min-h-screen w-full flex items-center justify-center bg-porcelain p-6">
      <div className="surface w-full max-w-md p-8">
        <Link to="/" className="mx-auto mb-6 flex w-fit items-center justify-center">
          <img src="/Light Theme.png" alt="Flazly" className="h-10 w-10 object-contain" />
        </Link>

        {!userId ? (
          <div className="text-center">
            <h1 className="font-display text-[26px] font-semibold text-ink">This link is incomplete</h1>
            <p className="mx-auto mt-1.5 max-w-[36ch] text-[15px] leading-relaxed text-ink-soft">
              Open the link straight from the reset email, or request a new one.
            </p>
            <Link to="/forgot-password" className="btn btn-primary mt-6 w-full">Request a new code</Link>
          </div>
        ) : status === 'done' ? (
          <div className="text-center">
            <ShieldCheck className="mx-auto mb-5 h-7 w-7 text-signal-go" />
            <h1 className="font-display text-[26px] font-semibold text-ink">Password changed</h1>
            <p className="mx-auto mt-1.5 max-w-[36ch] text-[15px] leading-relaxed text-ink-soft">
              Sign in with your new password.
            </p>
            <button onClick={() => navigate('/login')} className="btn btn-primary mt-6 w-full">
              Sign in
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="font-display text-[26px] font-semibold text-ink">Choose a new password</h1>
              <p className="mx-auto mt-1.5 max-w-[36ch] text-[15px] leading-relaxed text-ink-soft">
                Enter the six-digit code from the email, then your new password.
              </p>
            </div>

            {error && (
              <div className="notice notice-stop mb-5">
                <p className="notice-body">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label" htmlFor="reset-otp">Code</label>
                <input
                  id="reset-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="field tabular tracking-[0.3em]"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="field-label" htmlFor="reset-password">New password</label>
                <input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  className="field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="field-hint">At least 6 characters.</p>
              </div>
              <div>
                <label className="field-label" htmlFor="reset-confirm">Confirm new password</label>
                <input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  className="field"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={status === 'saving'} className="btn btn-primary w-full">
                {status === 'saving' && <Loader2 size={15} className="animate-spin" />}
                Change password
              </button>
            </form>

            <p className="mt-4 text-center text-[13px] text-ink-soft">
              No code?{' '}
              <Link to="/forgot-password" className="text-ink underline underline-offset-2">Send a new one</Link>
            </p>
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

export default ResetPassword;
