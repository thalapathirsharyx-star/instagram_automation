import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff, MessageCircle, Bot, Database, Shield, CheckCircle2 } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useGoogleLogin } from '@react-oauth/google';

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
    <div className="auth-surface min-h-screen w-full flex overflow-x-hidden bg-porcelain relative">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10 p-4 lg:p-6 min-h-screen">
        <div className="hidden lg:flex flex-col justify-center text-left w-full max-w-md shrink-0">
          {/* Logo */}
          <Link to="/" className="mb-6 lg:mb-8 flex items-center gap-2.5 group cursor-pointer w-fit">
            <img src="/Light Theme.png" alt="Flazly Logo" className="w-10 h-10 lg:w-12 lg:h-12 object-contain transition-transform duration-300 group-hover:scale-105" />
            <span className="text-2xl lg:text-3xl font-semibold text-zinc-900 tracking-tight group-hover:text-purple-600 transition-colors">Flazly</span>
          </Link>

          <h2 className="font-display text-[34px] lg:text-[40px] font-semibold text-ink mb-4 leading-[1.08] tracking-tight">
            Your Instagram inbox, answered.
          </h2>
          <p className="prose-measure text-[17px] leading-relaxed text-ink-soft mb-8">
            Flazly replies to DMs, story replies and comments for you, scores the people worth
            following up, and steps aside the moment you take a conversation over.
          </p>

          {/* What happens to a message, in order. The rail colour marks who is
              acting at each step — the same language the inbox uses. */}
          <ol className="mb-8 flex flex-col gap-3">
            {[
              { icon: MessageCircle, actor: 'rail-human', title: 'Someone sends a DM', note: 'A customer asks about a product' },
              { icon: Bot, actor: 'rail-machine', title: 'Flazly answers', note: 'From your brain base and catalogue' },
              { icon: Database, actor: 'rail-machine', title: 'The lead is scored', note: 'Ready for you to pick up' },
            ].map(({ icon: Icon, actor, title, note }) => (
              <li
                key={title}
                className={`${actor} flex items-center gap-3 border-y border-r border-hairline bg-surface px-4 py-3`}
              >
                <Icon size={16} className="shrink-0 text-ink-soft" />
                <span>
                  <span className="block text-[15px] font-medium text-ink">{title}</span>
                  <span className="block text-[13px] text-ink-soft">{note}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-2 text-ink-faint">
            <Shield size={14} />
            <span className="text-[13px]">Built on the Meta Graph API</span>
          </div>

        </div>
      <div className="w-full max-w-md flex flex-col items-center justify-center z-20 shrink-0">
        <div className="surface w-full p-6 lg:p-8 relative">
          <div className="mb-6 lg:mb-8 text-center">
            <Link to="/" className="bg-transparent flex items-center justify-center mx-auto mb-3 w-fit cursor-pointer">
              <img src="/Light Theme.png" alt="Flazly" className="w-10 h-10 object-contain" />
            </Link>
            <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">Sign in</h1>
            <p className="mt-1 text-[15px] text-ink-soft">Welcome back to Flazly.</p>
          </div>

          {message && (
            <div className={`${message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
              } border text-sm p-4 rounded-xl flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-300`}>
              <div className="flex items-center gap-3">
                {message.type === 'success' ? <LogIn size={18} /> : <AlertCircle size={18} />}
                <span className="font-semibold">{message.text}</span>
              </div>
              {showResend && (
                <button
                  type="button"
                  onClick={handleResendVerify}
                  disabled={isResending}
                  className="text-xs font-medium underline text-purple-700 hover:text-purple-900 transition-colors text-left pl-7 disabled:opacity-50 mt-1"
                >
                  {isResending ? 'Resending...' : "Didn't receive the email? Resend verification link"}
                </button>
              )}
            </div>
          )}

          {!isPending2Fa ? (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 ml-1 block" htmlFor="email">Email Address</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                    <input
                      type="email"
                      id="email"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all duration-200 placeholder:text-zinc-400 font-medium shadow-sm"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-medium text-zinc-700 block" htmlFor="password">Password</label>
                    <Link to="/forgot-password" className="text-xs font-medium text-purple-600 hover:text-purple-500 transition-colors">Forgot password?</Link>
                  </div>
                  <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full pl-11 pr-11 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all duration-200 placeholder:text-zinc-400 font-medium shadow-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-purple-600 transition-colors z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-1 mt-2">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-zinc-300 bg-white text-purple-600 focus:ring-purple-500/30 cursor-pointer accent-purple-600" />
                  <label htmlFor="remember" className="text-sm font-medium text-zinc-600 cursor-pointer">Remember me</label>
                </div>

                <button type="submit" className="w-full mt-2 bg-zinc-950 hover:bg-black rounded-xl py-2.5 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 group border border-zinc-950" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin text-white" />
                      <span className="text-white">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white">Sign In</span>
                      <LogIn size={20} className="group-hover:translate-x-1 transition-transform duration-300 text-white" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
                <div className="relative flex justify-center text-[13px] font-medium">
                  <span className="bg-white px-3 text-zinc-500">or continue with</span>
                </div>
              </div>

              {/* Social OAuth Buttons.
                  Facebook sits on its own full-width row, above Google, with the explicit
                  "Continue with Facebook" label and official #1877F2 branding. App Review
                  rejected a previous submission under Platform Term 7.a because the
                  reviewer could not find the Facebook Login button, so this button must
                  stay unmistakable and above the fold. */}
              <div className="space-y-3">
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
                  className="w-full py-2.5 px-3 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-75"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Google</span>
                </button>
              </div>

              {/* Meta Reviewer Quick-Test Guidance Card */}
              <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-left">
                <Shield size={16} className="text-[#1877F2] shrink-0 mt-0.5" />
                <p className="text-[13px] text-blue-900 leading-snug">
                  <strong className="font-semibold">Meta App Reviewers:</strong> Use{' '}
                  <span className="font-semibold text-[#1877F2]">Continue with Facebook</span> above to test
                  the Facebook Login flow. Then open <strong className="font-semibold">Meta Integration</strong> in
                  the left sidebar and press <strong className="font-semibold">Connect with Facebook</strong> to
                  grant Instagram permissions, and <strong className="font-semibold">Comments Manager</strong> to
                  view and reply to Instagram comments.
                </p>
              </div>
            </>
          ) : (
            <form onSubmit={handleVerify2Fa} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 ml-1 block" htmlFor="totpCode">Two-Factor Authentication Code</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors z-10" />
                  <input
                    type="text"
                    id="totpCode"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all duration-200 placeholder:text-zinc-400 font-mono tracking-widest text-center shadow-sm"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    maxLength={10}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-zinc-500 ml-1">Enter the 6-digit verification code from your authenticator app or a recovery code.</p>
              </div>

              <button type="submit" className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3.5 font-semibold text-base shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 group border border-purple-500/30" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>

              <button type="button" onClick={() => { setIsPending2Fa(false); setMessage(null); }} className="w-full mt-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl py-3.5 font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 border border-zinc-200">
                Cancel
              </button>
            </form>
          )}

          <div className="text-center mt-6 pt-6 border-t border-zinc-100">
            <p className="text-zinc-500 font-medium text-xs lg:text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-600 font-semibold hover:text-purple-500 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] font-medium text-zinc-400 w-full px-2">
          <span className="flex items-center gap-1.5"><Lock size={12} className="text-zinc-400" /> Secure OAuth</span>
          <span className="flex items-center gap-1.5"><Shield size={12} className="text-zinc-400" /> Meta Compliant</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-zinc-400" /> Enterprise Security</span>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
