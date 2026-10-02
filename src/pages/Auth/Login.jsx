import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { loginApi } from '../../api/authApi';
import './Auth.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Authenticating...');
      const response = await loginApi({ email, password });
      toast.dismiss();
      const { user, token } = response;
      login(user, token);
      toast.success('Welcome back Athlete!');
      navigate('/');
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = 'http://ec2-100-48-98-100.compute-1.amazonaws.com:5000/api/auth/google';
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="brand-logo-title">GK's Fitness</p>
          <h2>Welcome Back</h2>
          <p className="motivational-quote">
            "Pain is weakness leaving the body. Log in and get to work."
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>Password</label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth" disabled={isLoading}>
            <LogIn size={18} />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
            <span style={{ padding: '0 10px', color: '#888', fontSize: '14px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '12px',
              backgroundColor: '#fff',
              color: '#3c4043',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              gap: '12px',
            }}
          >
            {/* 🔥 FIX: Inline SVG Logo will NEVER break or fail to load */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.37 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.05.01 12s.45 3.8 1.26 5.42l4.01-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="auth-footer">
          New to the gym? <Link to="/register">Create Athlete Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;