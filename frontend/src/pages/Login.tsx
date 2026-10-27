import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff, Info, ArrowRight } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useGoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/AuthLayout';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isPending2Fa, setIsPending2Fa] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

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
                  setMessage({ text: 'Logged in via Facebook!', type: 'success' });
                  setTimeout(() => {
                    login(api_token, user);
                    navigate(from, { replace: true });
                  }, 800);
                } else {
                  setMessage({ text: res.data.Message || 'Facebook authentication failed', type: 'error' });
                }
              })
              .catch(err => {
                setMessage({ text: err.response?.data?.Message || 'Facebook login error occurred', type: 'error' });
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
          navigate(from, { replace: true });
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
            navigate(from, { replace: true });
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


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setShowResend(false);

    try {
      const response = await api.post('/Auth/Login', { email, password });

      if (response.data.Type === 'S') {
        const result = response.data.result;
        if (result.status === 'pending_2fa') {
          setIsPending2Fa(true);
          setTempToken(result.temp_token);
          setIsLoading(false);
          return;
        }

        const { api_token, user } = result;
        setMessage({ text: 'Login Successful! Redirecting...', type: 'success' });

        setTimeout(() => {
          login(api_token, user);
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setMessage({ text: response.data.Message || 'Login failed', type: 'error' });
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { Message?: string } }; message?: string };
      const messageText = error.response?.data?.Message || error.message || 'An error occurred during login';
      setMessage({ text: messageText, type: 'error' });
      if (messageText.toLowerCase().includes('verify your email')) {
        setShowResend(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerify = async () => {
    if (!email) {
      setMessage({ text: 'Please enter your email address to resend verification.', type: 'error' });
      return;
    }
    setIsResending(true);
    try {
      const response = await api.post('/Auth/ResendVerification', { email });
      if (response.data.Type === 'S' || response.data.Type === 'Success') {
        setMessage({ text: 'Verification email resent! Please check your inbox.', type: 'success' });
        setShowResend(false);
      } else {
        setMessage({ text: response.data.Message || 'Failed to resend verification email.', type: 'error' });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.Message || 'Failed to resend verification email.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/Auth/2fa/confirm', {
        temp_token: tempToken,
        totp_code: totpCode
      });

      if (response.data.Type === 'S') {
        const { api_token, user } = response.data.result;
        setMessage({ text: '2FA Verification Successful! Redirecting...', type: 'success' });

        setTimeout(() => {
          login(api_token, user);
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setMessage({ text: response.data.Message || 'Verification failed', type: 'error' });
      }
    } catch (err: unknown) {
      console.error('2FA verification error:', err);
      const error = err as { response?: { data?: { Message?: string } }; message?: string };
      const messageText = error.response?.data?.Message || error.message || 'An error occurred during verification';
      setMessage({ text: messageText, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={<>Your Instagram inbox,<br /><span className="text-viridian">answered.</span></>}
      description="Flazly replies to DMs, story replies and comments for you, scores the people worth following up, and steps aside the moment you take a conversation over."
    >
          <div className="surface w-full px-6 py-6 sm:px-8 sm:py-7 [@media(max-height:760px)]:sm:py-5">
            <div className="mb-6 text-center [@media(max-height:760px)]:mb-4">
              <Link to="/" className="mx-auto mb-4 flex w-fit items-center gap-2 lg:hidden">
                <img src="/Light Theme.png" alt="" className="h-7 w-7 object-contain" />
                <span className="text-[19px] font-bold tracking-[-0.01em] text-ink">Flazly</span>
              </Link>
              <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Sign in</h1>
              <p className="mt-1 text-[15px] text-ink-soft">Welcome back to Flazly.</p>
            </div>

            {message && (
              <div
                role={message.type === 'error' ? 'alert' : 'status'}
                className={`notice ${message.type === 'success' ? 'notice-go' : 'notice-stop'} mb-6 block`}
              >
                <p className="notice-title flex items-center gap-2 text-[14px]">
                  {message.type === 'success' ? <LogIn size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </p>
                {showResend && (
                  <button
                    type="button"
                    onClick={handleResendVerify}
                    disabled={isResending}
                    className="ml-6 mt-1.5 text-left text-[13px] font-medium text-viridian underline underline-offset-2 disabled:opacity-50"
                  >
                    {isResending ? 'Resending…' : "Didn't receive the email? Resend verification link"}
                  </button>
                )}
              </div>
            )}

            {!isPending2Fa ? (
              <>
                <form onSubmit={handleLogin} className="space-y-3.5 [@media(max-height:760px)]:space-y-2.5">
                  <div>
                    <label className="field-label" htmlFor="email">Email address</label>
                    <div className="field-icon">
                      <Mail size={16} />
                      <input
                        type="email"
                        id="email"
                        autoComplete="email"
                        className="field"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="field-label mb-0" htmlFor="password">Password</label>
                      <Link to="/forgot-password" className="text-[13px] font-medium text-viridian hover:underline">Forgot password?</Link>
                    </div>
                    <div className="field-icon">
                      <Lock size={16} />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        autoComplete="current-password"
                        className="field pr-11"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm absolute right-1.5 top-1/2 z-10 -translate-y-1/2"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <label htmlFor="remember" className="flex w-fit cursor-pointer items-center gap-2.5 pt-1 text-[14px] text-ink">
                    <input type="checkbox" id="remember" className="checkbox" />
                    Remember me
                  </label>

                  <button type="submit" className="btn btn-primary btn-lg btn-block group" disabled={isLoading} aria-busy={isLoading || undefined}>
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Signing in…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="my-4 flex items-center gap-3 text-[13px] text-ink-soft [@media(max-height:760px)]:my-3" role="separator">
                  <span className="h-px flex-1 bg-hairline" />
                  or continue with
                  <span className="h-px flex-1 bg-hairline" />
                </div>

                {/* Social OAuth Buttons.
                    Facebook sits on its own full-width row, above Google, with the explicit
                    "Continue with Facebook" label and official #1877F2 branding. App Review
                    rejected a previous submission under Platform Term 7.a because the
                    reviewer could not find the Facebook Login button, so this button must
                    stay unmistakable and above the fold. */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    id="facebook-login-btn"
                    aria-label="Continue with Facebook"
                    onClick={handleFacebookSignIn}
                    disabled={isFacebookLoading}
                    className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm cursor-pointer disabled:opacity-75"
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
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                {/* Meta reviewer quick-test guidance. Names match the sidebar labels. */}
                <div className="notice notice-info mt-4 block border-l px-3.5 py-2.5 [@media(max-height:760px)]:mt-3 [@media(max-height:760px)]:py-2">
                  <p className="flex items-start gap-2.5 text-[13px] leading-snug text-ink">
                    <Info size={16} className="mt-0.5 shrink-0 text-viridian" />
                    <span>
                      <strong className="font-semibold text-viridian">Meta App Reviewers:</strong> sign in with{' '}
                      <strong className="font-semibold">Continue with Facebook</strong>. Then open{' '}
                      <strong className="font-semibold">Instagram connection</strong> in the sidebar and press{' '}
                      <strong className="font-semibold">Connect with Facebook</strong> to grant Instagram permissions;{' '}
                      open <strong className="font-semibold">Comments</strong> to view and reply to comments.
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <form onSubmit={handleVerify2Fa} className="space-y-5">
                <div>
                  <label className="field-label" htmlFor="totpCode">Two-factor authentication code</label>
                  <div className="field-icon">
                    <Lock size={16} />
                    <input
                      type="text"
                      id="totpCode"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="field text-center font-mono tracking-widest"
                      placeholder="000000"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      maxLength={10}
                      required
                      autoFocus
                    />
                  </div>
                  <p className="field-hint">Enter the 6-digit code from your authenticator app, or a recovery code.</p>
                </div>

                <button type="submit" className="btn btn-primary btn-lg btn-block group" disabled={isLoading} aria-busy={isLoading || undefined}>
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying…</span>
                    </>
                  ) : (
                    <>
                      <span>Verify code</span>
                      <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <button type="button" onClick={() => { setIsPending2Fa(false); setMessage(null); }} className="btn btn-lg btn-block">
                  Cancel
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-[14px] text-ink-soft [@media(max-height:760px)]:mt-3">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-viridian hover:underline">
                Create account
              </Link>
            </p>
          </div>
    </AuthLayout>
  );
};

export default Login;
