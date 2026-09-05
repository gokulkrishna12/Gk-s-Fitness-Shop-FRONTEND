import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  UserPlus,
  CheckCircle2,
  Circle,
  KeyRound,
  Clock,
  Send,
  Eye,       // 🔥 Imported Eye
  EyeOff     // 🔥 Imported EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { otpApi } from '../../api/otpApi';
import axiosClient from '../../api/axiosClient';
import './Auth.scss';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // 🔥 State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Flow steps: 1 = Enter Details, 2 = Verify OTP, 3 = Set Password
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  const [timerActive, setTimerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 5-Minute Countdown Clock Logic
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      toast.error('OTP expired. Please request a new one.');
      setTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Password Security Checklist
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
  }, [password]);

  const allValid = Object.values(validations).every(Boolean);

  // STEP 1: Send OTP to Backend
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter your full name and email address');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Sending verification code...');
      await otpApi.sendOtp(email);
      toast.dismiss();
      toast.success(`6-digit OTP sent to ${email}`);

      setTimeLeft(300);
      setTimerActive(true);
      setStep(2);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to send OTP. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP with Backend
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    try {
      setIsLoading(true);
      await otpApi.verifyOtp(email, otp);
      setTimerActive(false);
      setStep(3);
      toast.success('Email verified successfully! Now set up your password.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Final Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!allValid) {
      toast.error('Please ensure your password meets all security rules');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Forging your athlete profile...');

      const response = await axiosClient.post('/auth/register', {
        name,
        email,
        password,
        role: 'customer'
      });

      toast.dismiss();
      const { user, token } = response.data;
      login(user, token);
      toast.success('Welcome Athlete! Your account is created.');
      navigate('/');
    } catch (error) {
      toast.dismiss();
      console.error("BACKEND REGISTRATION ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to create account in database');
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }) => (
    <div className={`validation-item ${isValid ? 'valid' : ''}`}>
      {isValid ? <CheckCircle2 size={13} /> : <Circle size={13} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="brand-logo-title">GK's Fitness</p>
          <h2>Welcome Athlete</h2>
          <p className="motivational-quote">
            "Your body can stand almost anything. It’s your mind that you have to convince."
          </p>
        </div>

        {/* STEP 1: Name & Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Gokul Krishna"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <button type="submit" className="btn-auth" disabled={isLoading}>
              <Send size={18} />
              {isLoading ? 'Sending...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & Countdown */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="input-group">
              <div className="label-row">
                <label>Enter 6-Digit OTP</label>
                <span className="timer-badge">
                  <Clock size={12} /> {formatTime(timeLeft)}
                </span>
              </div>
              <div className="input-wrapper">
                <KeyRound className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Enter OTP code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-verify-otp" disabled={isLoading}>
              <CheckCircle2 size={18} />
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              className="btn-auth"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'none' }}
              onClick={handleSendOtp}
              disabled={timeLeft > 240 || isLoading}
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* STEP 3: Password Setup */}
        {step === 3 && (
          <form onSubmit={handleRegister}>
            <div className="verified-badge">
              <CheckCircle2 size={16} /> Email Verified ({email})
            </div>

            <div className="input-group">
              <label>Set Secure Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />

                {/* 🔥 The input toggles between 'text' and 'password' */}
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />

                {/* 🔥 The clickable Eye button */}
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* This is your existing checklist that handles the green text! */}
            <div className="password-checklist">
              <ValidationItem isValid={validations.length} text="8+ characters" />
              <ValidationItem isValid={validations.upper} text="Uppercase letter" />
              <ValidationItem isValid={validations.lower} text="Lowercase letter" />
              <ValidationItem isValid={validations.number} text="Number" />
              <ValidationItem isValid={validations.special} text="Special symbol" />
            </div>

            <button type="submit" className="btn-auth" disabled={!allValid}>
              <UserPlus size={18} />
              Complete Registration
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;