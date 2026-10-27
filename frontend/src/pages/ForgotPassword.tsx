import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Mail, MailCheck } from 'lucide-react';
import api from '../lib/axios';
import AuthLayout, { AuthHeading } from '../components/AuthLayout';
import { authErrorMessage, emailError } from '../lib/authErrors';

/**
 * Step one of the password reset the backend already supported but nothing in
 * the app reached: `POST /Auth/ForgotPassword` mails a six-digit code and a
 * link to the reset page.
 */
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const invalid = emailError(email);
    setFieldError(invalid);
    if (invalid) {
      document.getElementById('reset-email')?.focus();
      return;
    }

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
      setError(authErrorMessage(err, 'We could not send the email. Check the address and try again.'));
    }
  };

  return (
    <AuthLayout
      title="Locked out? You'll be back in a minute."
      description="We'll email you a six-digit code and a link to choose a new password. Your conversations, leads and automations stay exactly as you left them."
    >
      {status === 'sent' ? (
        <div role="status">
          <span className="icon-tile tone-mint mb-6 h-12 w-12 rounded-full"><MailCheck size={22} /></span>
          <AuthHeading
            title="Check your email"
            subtitle={<>If an account uses <span className="font-semibold text-ink">{email.trim()}</span>, we have sent it a six-digit code and a link to choose a new password.</>}
          />
          <p className="text-[14px] text-ink-soft">The email can take a minute. Check your spam folder before trying again.</p>
          <button onClick={() => { setStatus('idle'); setEmail(''); }} className="btn btn-lg btn-block mt-6">
            Use a different address
          </button>
        </div>
      ) : (
        <>
          <AuthHeading title="Forgot your password?" subtitle="Enter the email you signed up with and we'll send you a reset code." />

          {error && (
            <div role="alert" className="notice notice-stop mb-5 block">
              <p className="notice-title flex items-start gap-2 text-[14px]"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="field-label" htmlFor="reset-email">Email address</label>
              <div className="field-icon">
                <Mail size={16} />
                <input
                  id="reset-email"
                  type="email"
                  className="field"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldError(undefined); }}
                  autoComplete="email"
                  required
                  autoFocus
                  aria-invalid={fieldError ? true : undefined}
                  aria-describedby={fieldError ? 'reset-email-error' : undefined}
                />
              </div>
              {fieldError && <p id="reset-email-error" className="field-error"><AlertCircle size={14} />{fieldError}</p>}
            </div>

            <button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending' || undefined} className="btn btn-primary btn-lg btn-block group">
              {status === 'sending' ? (
                <><Loader2 size={18} className="animate-spin" /><span>Sending code…</span></>
              ) : (
                <><span>Send reset code</span><ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" /></>
              )}
            </button>
          </form>
        </>
      )}

      <Link to="/login" className="auth-back mx-auto mt-8 flex w-fit">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to sign in
      </Link>
    </AuthLayout>
  );
};

export default ForgotPassword;
