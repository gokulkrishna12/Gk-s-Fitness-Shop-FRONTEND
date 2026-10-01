import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { loginApi } from '../../api/authApi';
import './Auth.scss';

// 🔥 IMPORT THE BACKGROUND DIRECTLY
import bgImage from '../../assets/bg.jpg';

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

  return (
    <div
      className="auth-page"
      // 🔥 APPLY BACKGROUND VIA INLINE STYLES FOR VITE CLOUDFRONT COMPATIBILITY
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
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

        {/* 🔥 GOOGLE OAUTH BUTTON INTEGRATED PROPERLY */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
            <span style={{ padding: '0 10px', color: '#888', fontSize: '14px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
          </div>

          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
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
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google"
              style={{ width: '20px', height: '20px' }}
            />
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