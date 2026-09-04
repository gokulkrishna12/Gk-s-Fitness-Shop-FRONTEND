import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import './Navbar.scss';

const Navbar = () => {
    const { isAuthenticated, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <Dumbbell size={28} className="logo-icon" />
                    <span>GK'S <strong>FITNESS</strong></span>
                </Link>

                <div className="nav-links">
                    {isAuthenticated ? (
                        <>
                            {isAdmin && <Link to="/admin" className="nav-link admin-badge">Admin</Link>}
                            <Link to="/wishlist" className="nav-icon"><Heart size={22} /></Link>
                            <Link to="/cart" className="nav-icon"><ShoppingCart size={22} /></Link>
                            <button onClick={handleLogout} className="btn-logout">
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn-login">
                            <User size={18} /> Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;