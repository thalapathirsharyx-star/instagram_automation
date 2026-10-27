import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';
import AuthLayout, { AuthHeading } from '../components/AuthLayout';
import { authErrorMessage } from '../lib/authErrors';

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
  const [showPassword, setShowPassword] = useState(false);

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
      setError(authErrorMessage(err, 'That code did not work. Request a new one and try again.'));
    }
  };

  return (
    <AuthLayout
      title="A new password, and you're back in."
      description="Use the six-digit code from the reset email. Your conversations, leads and automations stay exactly as you left them."
    >
      {!userId ? (
        <div>
          <AuthHeading title="This link is incomplete" subtitle="Open the link straight from the reset email, or request a new one." />
          <Link to="/forgot-password" className="btn btn-primary btn-lg btn-block">Request a new code</Link>
        </div>
      ) : status === 'done' ? (
        <div role="status">
          <span className="icon-tile tone-mint mb-6 h-12 w-12 rounded-full"><ShieldCheck size={22} /></span>
          <AuthHeading title="Password changed" subtitle="Your password has been updated. Sign in with your new password." />
          <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg btn-block group">
            <span>Sign in</span>
            <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      ) : (
        <>
          <AuthHeading title="Choose a new password" subtitle="Enter the six-digit code from the email, then your new password." />

          {error && (
            <div role="alert" className="notice notice-stop mb-5 block">
              <p className="notice-title flex items-start gap-2 text-[14px]"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="field-label" htmlFor="reset-otp">Reset code</label>
              <div className="field-icon">
                <KeyRound size={16} />
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
            </div>
            <div>
              <label className="field-label" htmlFor="reset-password">New password</label>
              <div className="field-icon">
                <Lock size={16} />
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="field pr-11"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon btn-sm absolute right-1.5 top-1/2 z-10 -translate-y-1/2"
                  aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="reset-confirm">Confirm new password</label>
              <div className="field-icon">
                <Lock size={16} />
                <input
                  id="reset-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="field"
                  placeholder="Type it again"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={status === 'saving'} aria-busy={status === 'saving' || undefined} className="btn btn-primary btn-lg btn-block !mt-6">
              {status === 'saving' ? <><Loader2 size={18} className="animate-spin" /><span>Saving…</span></> : 'Change password'}
            </button>
          </form>

          <p className="mt-5 text-center text-[14px] text-ink-soft">
            No code?{' '}
            <Link to="/forgot-password" className="auth-link">Send a new one</Link>
          </p>
        </>
      )}

      <Link to="/login" className="auth-back mx-auto mt-8 flex w-fit">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to sign in
      </Link>
    </AuthLayout>
  );
};

export default ResetPassword;
