import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    KeyRound,
    Lock,
    ArrowRight,
    CheckCircle,
    CheckCircle2,
    Circle,
    Eye,
    EyeOff
} from 'lucide-react';
import { forgotPasswordApi, resetPasswordApi } from '../../api/authApi';
import { toast } from 'sonner';
import './ForgotPassword.scss';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // 🔥 New States for Eyeball and Validation
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 🔥 Password Security Checklist State
    const [validations, setValidations] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    // 🔥 Live Regex checking for the New Password
    useEffect(() => {
        setValidations({
            length: newPassword.length >= 8,
            upper: /[A-Z]/.test(newPassword),
            lower: /[a-z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            special: /[^A-Za-z0-9]/.test(newPassword)
        });
    }, [newPassword]);

    const allValid = Object.values(validations).every(Boolean);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");

        setLoading(true);
        try {
            await forgotPasswordApi(email);
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword) return toast.error("Please fill all fields");
        if (!allValid) return toast.error("Please ensure your password meets all security rules");

        setLoading(true);
        try {
            await resetPasswordApi({ email, otp, newPassword });
            toast.success("Password Reset Successful! Please login.");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP or failed to reset");
        } finally {
            setLoading(false);
        }
    };

    // Helper component for the checklist
    const ValidationItem = ({ isValid, text }) => (
        <div className={`validation-item ${isValid ? 'valid' : ''}`}>
            {isValid ? <CheckCircle2 size={13} /> : <Circle size={13} />}
            <span>{text}</span>
        </div>
    );

    return (
        <div className="forgot-password-page">
            <div className="auth-box">
                <h2>{step === 1 ? 'Reset Password' : 'Enter OTP'}</h2>
                <p className="auth-subtitle">
                    {step === 1
                        ? "Enter your email and we'll send you a 6-digit code."
                        : `We sent a code to ${email}`}
                </p>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={20} />
                                <input
                                    type="email"
                                    placeholder="athlete@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Recovery Code'} <ArrowRight size={20} />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="form-group">
                            <label>6-Digit OTP</label>
                            <div className="input-with-icon">
                                <KeyRound size={20} />
                                <input
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <div className="input-with-icon">
                                <Lock size={20} />

                                {/* 🔥 Dynamic Input Type for Eyeball */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new secure password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />

                                {/* 🔥 Eyeball Toggle Button */}
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* 🔥 Password Security Checklist */}
                        <div className="password-checklist">
                            <ValidationItem isValid={validations.length} text="8+ characters" />
                            <ValidationItem isValid={validations.upper} text="Uppercase letter" />
                            <ValidationItem isValid={validations.lower} text="Lowercase letter" />
                            <ValidationItem isValid={validations.number} text="Number" />
                            <ValidationItem isValid={validations.special} text="Special symbol" />
                        </div>

                        {/* 🔥 Button disabled until all rules are met! */}
                        <button type="submit" className="btn-primary" disabled={loading || !allValid}>
                            {loading ? 'Verifying...' : 'Update Password'} <CheckCircle size={20} />
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <span onClick={() => navigate('/login')} className="link">Back to Login</span>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;