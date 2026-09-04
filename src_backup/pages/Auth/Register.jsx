import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, KeyRound, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { sendOtpApi, registerApi } from '../../api/authApi';
import './Auth.scss';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Verify OTP & Fill Details
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        otp: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Step 1: Send OTP to Gmail
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!formData.email) return toast.error('Please enter your email');

        setLoading(true);
        try {
            await sendOtpApi(formData.email);
            toast.success('6-digit OTP sent to your Gmail!');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and Register
    const handleRegister = async (e) => {
        e.preventDefault();
        const { name, email, password, otp } = formData;
        if (!name || !password || !otp) return toast.error('Please fill in all fields');

        setLoading(true);
        try {
            const res = await registerApi({ name, email, password, otp });
            toast.success(res.message || 'Account created successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>GK'S <span>FITNESS</span></h2>
                    <p>{step === 1 ? 'Verify your email to get started' : 'Complete your profile'}</p>
                </div>

                {step === 1 ? (
                    <form className="auth-form" onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label>Gmail Address</label>
                            <div className="input-wrapper">
                                <Mail />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="athlete@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send Verification OTP'} <ArrowRight size={18} />
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleRegister}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <User />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Gokul"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>6-Digit OTP</label>
                            <div className="input-wrapper">
                                <KeyRound />
                                <input
                                    type="text"
                                    name="otp"
                                    maxLength="6"
                                    placeholder="123456"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Create Password</label>
                            <div className="input-wrapper">
                                <Lock />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Verifying...' : 'Create Account'} <CheckCircle size={18} />
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;