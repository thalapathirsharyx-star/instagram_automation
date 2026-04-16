import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Users, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/Auth/Login', { email, password });

      if (response.data.Type === 'S') {
        const { api_token, user } = response.data.result;
        setMessage({ text: 'Login Successful! Redirecting...', type: 'success' });

        // Short delay to show the green success toast before navigating
        setTimeout(() => {
          login(api_token, user);
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setMessage({ text: response.data.Message || 'Login failed', type: 'error' });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const messageText = err.response?.data?.Message || err.message || 'An error occurred during login';
      setMessage({ text: messageText, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="background-decor">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-container glass-card">
        <div className="login-header">
          <div className="logo-section">
            <span className="logo-icon">RZ</span>
            <h1>ReplyZens</h1>
          </div>
          <p className="subtitle">Welcome back! Please enter your details.</p>
        </div>

        {message && (
          <div className={`${message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            : 'bg-destructive/10 border-destructive/20 text-destructive'
            } border text-sm p-3 rounded-lg flex items-center gap-2 mb-6 transition-all duration-300`}>
            {message.type === 'success' ? <LogIn size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Login to Dashboard</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>
        {/* 
        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-button">
            <Globe size={20} />
            <span>Google</span>
          </button>
          <button className="social-button">
            <Users size={20} />
            <span>GitHub</span>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
