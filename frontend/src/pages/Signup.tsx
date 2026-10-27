import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useGoogleLogin } from '@react-oauth/google';
import AuthLayout, { AuthHeading } from '../components/AuthLayout';
import { authErrorMessage, emailError } from '../lib/authErrors';

type SignupErrors = { firstName?: string; companyName?: string; email?: string; password?: string; confirmPassword?: string };

/**
 * A rough guide to password strength, shown as a four-segment meter. Advisory
 * only: the backend's rule (at least 6 characters) is the one enforced.
 */
const passwordStrength = (value: string): { score: number; label: string; color: string } => {
  if (!value) return { score: 0, label: '', color: '#eaecf0' };
  if (value.length < 6) return { score: 1, label: 'Too short', color: '#f04438' };
  // One point for meeting the minimum, one each for length, mixed case, digits and symbols.
  const points = [value.length >= 10, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)];
  const score = Math.min(1 + points.filter(Boolean).length, 4);
  return [
    { score: 1, label: 'Weak', color: '#f04438' },
    { score: 2, label: 'Fair', color: '#f79009' },
    { score: 3, label: 'Good', color: '#315bff' },
    { score: 4, label: 'Strong', color: '#12b76a' },
  ][score - 1];
};

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    companyName: '',
    email: '',
    password: '',
    // Checked here only; the backend receives the password once.
    confirmPassword: ''
  });
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const handleFacebookSignIn = () => {
    setIsFacebookLoading(true);
    setMessage(null);

    const fbAppId = import.meta.env.VITE_FB_APP_ID || '955338716906984';

    const triggerLogin = () => {
      try {
        (window as any).FB.login((response: any) => {
          if (response.authResponse?.accessToken) {
            api.post('/Auth/FacebookLogin', { accessToken: response.authResponse.accessToken })
              .then(res => {
                if (res.data.Type === 'S' || res.data.Type === 'Success') {
                  const { api_token, user } = res.data.result;
                  setMessage({ text: 'Account connected via Facebook!', type: 'success' });
                  setTimeout(() => {
                    login(api_token, user);
                    navigate('/dashboard', { replace: true });
                  }, 800);
                } else {
                  setMessage({ text: res.data.Message || 'Facebook authentication failed', type: 'error' });
                }
              })
              .catch(err => {
                setMessage({ text: authErrorMessage(err, 'Facebook sign-up did not work. Please try again.'), type: 'error' });
              })
              .finally(() => setIsFacebookLoading(false));
          } else {
            setIsFacebookLoading(false);
          }
        }, { scope: 'public_profile,email' });
      } catch (err) {
        console.error('FB login trigger error:', err);
        setIsFacebookLoading(false);
      }
    };

    if (!(window as any).FB) {
      (window as any).fbAsyncInit = function() {
        (window as any).FB.init({
          appId: fbAppId,
          cookie: true,
          xfbml: true,
          version: 'v21.0'
        });
        triggerLogin();
      };
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0] as any;
        if (d.getElementById(id)) return;
        js = d.createElement(s) as any; js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    } else {
      triggerLogin();
    }
  };

  const handleGoogleSelect = async (email: string, name: string, googleAccessToken: string) => {
    setIsGoogleLoading(true);
    setMessage(null);
    try {
      // Try to login via the dedicated GoogleLogin endpoint first
      const loginRes = await api.post('/Auth/GoogleLogin', { accessToken: googleAccessToken });
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
      // If user is not found, register them!
      try {
        const registerRes = await api.post('/Auth/Register', {
          first_name: name,
          company_name: `${name}'s Company`,
          email: email,
          // Placeholder used only to provision the account; the server rejects it
          // at the login form, so it cannot be used to sign in to this account.
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
        console.error('Google register fallback error:', regErr);
        setMessage({ text: 'Authentication failed. Please try again or use standard login.', type: 'error' });
      }
    } finally {
      setIsGoogleLoading(false);
      setShowGoogleModal(false);
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
        await handleGoogleSelect(email, name || 'Google User', tokenResponse.access_token);
      } catch (err) {
        console.error('Error fetching Google userinfo:', err);
        setMessage({ text: 'Failed to retrieve profile information from Google.', type: 'error' });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      setMessage({ text: 'Google authentication failed.', type: 'error' });
    }
  });


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // The same rules the backend applies, checked here so each message sits
    // under its own field.
    const errors: SignupErrors = {
      firstName: formData.firstName.trim() ? undefined : 'Enter your name.',
      companyName: formData.companyName.trim() ? undefined : 'Enter your company or brand name.',
      email: emailError(formData.email),
      password: formData.password.length >= 6 ? undefined : formData.password ? 'Use at least 6 characters.' : 'Choose a password.',
      confirmPassword: !formData.confirmPassword
        ? 'Re-enter your password.'
        : formData.confirmPassword !== formData.password ? 'The passwords do not match.' : undefined,
    };
    setFieldErrors(errors);
    const firstInvalid = (Object.keys(errors) as Array<keyof SignupErrors>).find((k) => errors[k]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

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
      console.error('Signup error:', err);
      setMessage({ text: authErrorMessage(err, 'We could not create your account. Please try again.'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    setFieldErrors((current) => ({ ...current, [e.target.id]: undefined }));
  };

  const strength = passwordStrength(formData.password);
  const passwordsMatch = formData.confirmPassword === formData.password;

  const fieldError = (id: keyof SignupErrors) =>
    fieldErrors[id] ? <p id={`${id}-error`} className="field-error"><AlertCircle size={14} />{fieldErrors[id]}</p> : null;

  const invalidProps = (id: keyof SignupErrors) => ({
    'aria-invalid': fieldErrors[id] ? true : undefined,
    'aria-describedby': fieldErrors[id] ? `${id}-error` : id === 'password' ? 'password-strength' : id === 'confirmPassword' ? 'confirm-status' : undefined,
  });

  return (
    <AuthLayout
      title="Your workspace starts here."
      description="Connect your Instagram account, tell Flazly about your products, and it starts answering DMs, comments and story replies while you get on with the rest."
    >
      <AuthHeading title="Create your account" subtitle="Start your 14-day free trial. No credit card required." />

      {message && (
        <div
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`notice ${message.type === 'success' ? 'notice-go' : 'notice-stop'} mb-5 block`}
        >
          <p className="notice-title flex items-start gap-2 text-[14px]">
            {message.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSignup} noValidate className="space-y-3.5">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="firstName">Full name</label>
            <div className="field-icon">
              <User size={16} />
              <input
                type="text"
                id="firstName"
                name="name"
                autoComplete="name"
                className="field"
                placeholder="Jane Cooper"
                value={formData.firstName}
                onChange={handleChange}
                required
                {...invalidProps('firstName')}
              />
            </div>
            {fieldError('firstName')}
          </div>
          <div>
            <label className="field-label" htmlFor="companyName">Company</label>
            <div className="field-icon">
              <Building2 size={16} />
              <input
                type="text"
                id="companyName"
                name="organization"
                autoComplete="organization"
                className="field"
                placeholder="Acme Studio"
                value={formData.companyName}
                onChange={handleChange}
                required
                {...invalidProps('companyName')}
              />
            </div>
            {fieldError('companyName')}
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="email">Email address</label>
          <div className="field-icon">
            <Mail size={16} />
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              className="field"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              {...invalidProps('email')}
            />
          </div>
          {fieldError('email')}
        </div>

        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <div className="field-icon">
            <Lock size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="new-password"
              autoComplete="new-password"
              className="field pr-11"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              {...invalidProps('password')}
            />
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm absolute right-1.5 top-1/2 z-10 -translate-y-1/2"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldError('password') ?? (
            <div id="password-strength" aria-live="polite">
              <div className="mt-2.5 flex h-4 items-center gap-3">
                <div className="auth-strength flex-1 !mt-0" aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} style={i < strength.score ? { background: strength.color } : undefined} />
                  ))}
                </div>
                {strength.label && (
                  <span className="shrink-0 text-[12px] font-semibold leading-4" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                )}
              </div>
              <p className="field-hint">8+ characters, with letters, numbers and symbols.</p>
            </div>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
          <div className="field-icon">
            <Lock size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirm-password"
              autoComplete="new-password"
              className="field"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              {...invalidProps('confirmPassword')}
            />
          </div>
          {fieldError('confirmPassword') ?? (
            // Live match feedback, the counterpart of the strength meter above.
            <p id="confirm-status" className="field-hint flex items-center gap-1.5" aria-live="polite">
              {!formData.confirmPassword ? (
                'Type the same password again.'
              ) : passwordsMatch ? (
                <span className="flex items-center gap-1.5 font-medium text-[#067647]">
                  <CheckCircle2 size={14} aria-hidden="true" /> Passwords match
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-medium text-[#B54708]">
                  <AlertCircle size={14} aria-hidden="true" /> Passwords don't match yet
                </span>
              )}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-block group !mt-6" disabled={isLoading} aria-busy={isLoading || undefined}>
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Creating account…</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <p className="text-center text-[13px] leading-relaxed text-ink-soft">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="auth-link font-medium">Terms</Link> and{' '}
          <Link to="/privacy" className="auth-link font-medium">Privacy Policy</Link>.
        </p>
      </form>

      <div className="auth-divider" role="separator">or sign up with</div>

      {/* Social OAuth Buttons. Facebook is full-width and above Google — App Review
          rejected a submission under Platform Term 7.a for a hard-to-find Facebook
          Login button, so keep this prominent and explicitly labelled. */}
      <div className="space-y-3">
        <button
          type="button"
          id="facebook-login-btn"
          aria-label="Continue with Facebook"
          onClick={handleFacebookSignIn}
          disabled={isFacebookLoading}
          aria-busy={isFacebookLoading || undefined}
          className="auth-facebook w-full px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
        >
          {isFacebookLoading ? (
            <Loader2 size={20} className="animate-spin text-white" />
          ) : (
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          <span>Continue with Facebook</span>
        </button>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => handleGoogleSignIn()}
          disabled={isGoogleLoading}
          aria-busy={isGoogleLoading || undefined}
          className="btn btn-lg btn-block"
        >
          {isGoogleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
      </div>

      <p className="mt-6 text-center text-[14px] text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;
