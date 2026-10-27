import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, UserPlus, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useGoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/AuthLayout';

// Tightens the card on short screens (a 720px laptop) so it stays above the fold.
const SHORT = '[@media(max-height:760px)]:';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    companyName: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const error = err as { response?: { data?: { Message?: string } }; message?: string };
      const messageText = error.response?.data?.Message || error.message || 'An error occurred during signup';
      setMessage({ text: messageText, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <AuthLayout
      title={<>Start answering<br /><span className="text-viridian">in minutes.</span></>}
      description="Connect your Instagram account, tell Flazly about your products, and it starts handling DMs, story replies and comments while you get on with the rest."
    >
      <div className={`surface w-full px-6 py-6 sm:px-8 sm:py-7 ${SHORT}sm:py-5`}>
        <div className={`mb-6 text-center ${SHORT}mb-4`}>
          <Link to="/" className="mx-auto mb-4 flex w-fit items-center gap-2 lg:hidden">
            <img src="/Light Theme.png" alt="" className="h-7 w-7 object-contain" />
            <span className="text-[19px] font-bold tracking-[-0.01em] text-ink">Flazly</span>
          </Link>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Create your account</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Join us today and start growing</p>
        </div>

        {message && (
          <div
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`notice ${message.type === 'success' ? 'notice-go' : 'notice-stop'} mb-5 block`}
          >
            <p className="notice-title flex items-center gap-2 text-[14px]">
              {message.type === 'success' ? <UserPlus size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSignup} className={`space-y-3.5 ${SHORT}space-y-2.5`}>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="firstName">Full name</label>
              <div className="field-icon">
                <User size={16} />
                <input
                  type="text"
                  id="firstName"
                  autoComplete="name"
                  className="field"
                  placeholder="John Doe"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="companyName">Company</label>
              <div className="field-icon">
                <Building2 size={16} />
                <input
                  type="text"
                  id="companyName"
                  autoComplete="organization"
                  className="field"
                  placeholder="Acme Corp"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

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
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <div className="field-icon">
              <Lock size={16} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                className="field pr-11"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
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

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={isLoading} aria-busy={isLoading || undefined}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating account…</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create account</span>
              </>
            )}
          </button>
        </form>

        <div className={`my-4 flex items-center gap-3 text-[13px] text-ink-soft ${SHORT}my-3`} role="separator">
          <span className="h-px flex-1 bg-hairline" />
          or continue with
          <span className="h-px flex-1 bg-hairline" />
        </div>

        {/* Social OAuth Buttons. Facebook is full-width and above Google — App Review
            rejected a submission under Platform Term 7.a for a hard-to-find Facebook
            Login button, so keep this prominent and explicitly labelled. */}
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

        <p className={`mt-5 text-center text-[14px] text-ink-soft ${SHORT}mt-3`}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-viridian hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
