import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { loginApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import './Auth.scss';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await loginApi(formData);
            login(data.user, data.token);
            toast.success(`Welcome back, ${data.user.name}!`);
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>GK'S <span>FITNESS</span></h2>
                    <p>Sign in to continue your fitness journey</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
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

                    <div className="form-group">
                        <label>Password</label>
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
                        {loading ? 'Logging in...' : 'Sign In'} <LogIn size={18} />
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Register with OTP</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;