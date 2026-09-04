import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { forgotPasswordApi, resetPasswordApi } from '../../api/authApi';
import { toast } from 'sonner';
import './ForgotPassword.scss';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

        setLoading(true);
        try {
            await resetPasswordApi({ email, otp, newPassword });
            toast.success("Password Reset Successful! Please login.");
            navigate('/login'); // Send them back to login
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP or failed to reset");
        } finally {
            setLoading(false);
        }
    };

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
                                <input
                                    type="password"
                                    placeholder="Enter new secure password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
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