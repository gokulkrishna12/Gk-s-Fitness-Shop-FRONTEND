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
    EyeOff,
    ShieldCheck
} from 'lucide-react';
import { forgotPasswordApi, verifyOtpApi, resetPasswordApi } from '../../api/authApi';
import { toast } from 'sonner';
import './ForgotPassword.scss';

const ForgotPassword = () => {
    // Step 1: Email | Step 2: OTP Verify | Step 3: New Password
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const [validations, setValidations] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

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
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

    // Step 1 -> Send OTP
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

    // Step 2 -> Verify OTP (unlocks step 3)
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) return toast.error("Enter the 6-digit OTP");

        setLoading(true);
        try {
            await verifyOtpApi({ email, otp });
            toast.success("OTP Verified! Set your new password.");
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or expired OTP");
        } finally {
            setLoading(false);
        }
    };

    // Step 3 -> Update Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) return toast.error("Please fill all fields");
        if (!allValid) return toast.error("Password doesn't meet security rules");
        if (!passwordsMatch) return toast.error("Passwords do not match");

        setLoading(true);
        try {
            await resetPasswordApi({ email, otp, newPassword });
            toast.success("Password Reset Successful! Please login.");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    const ValidationItem = ({ isValid, text }) => (
        <div className={`validation-item ${isValid ? 'valid' : ''}`}>
            {isValid ? <CheckCircle2 size={13} /> : <Circle size={13} />}
            <span>{text}</span>
        </div>
    );

    const stepTitles = {
        1: 'Reset Password',
        2: 'Verify OTP',
        3: 'Set New Password'
    };

    const stepSubtitles = {
        1: "Enter your email and we'll send you a 6-digit code.",
        2: `We sent a code to ${email}`,
        3: "Your OTP is verified. Choose a new password."
    };

    return (
        <div className="forgot-password-page">
            <div className="auth-box">
                <h2>{stepTitles[step]}</h2>
                <p className="auth-subtitle">{stepSubtitles[step]}</p>

                {/* STEP 1: EMAIL */}
                {step === 1 && (
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
                )}

                {/* STEP 2: VERIFY OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="auth-form">
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

                        <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
                            {loading ? 'Verifying...' : 'Verify OTP'} <ShieldCheck size={20} />
                        </button>
                    </form>
                )}

                {/* STEP 3: NEW PASSWORD + CONFIRM PASSWORD */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="form-group">
                            <label>New Password</label>
                            <div className="input-with-icon">
                                <Lock size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new secure password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <div className="input-with-icon">
                                <Lock size={20} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && (
                                <span className={`match-hint ${passwordsMatch ? 'valid' : 'invalid'}`}>
                                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                </span>
                            )}
                        </div>

                        <div className="password-checklist">
                            <ValidationItem isValid={validations.length} text="8+ characters" />
                            <ValidationItem isValid={validations.upper} text="Uppercase letter" />
                            <ValidationItem isValid={validations.lower} text="Lowercase letter" />
                            <ValidationItem isValid={validations.number} text="Number" />
                            <ValidationItem isValid={validations.special} text="Special symbol" />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || !allValid || !passwordsMatch}
                        >
                            {loading ? 'Updating...' : 'Update Password'} <CheckCircle size={20} />
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