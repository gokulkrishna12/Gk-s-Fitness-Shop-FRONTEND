import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './Navbar.scss';

const Navbar = () => {
  const { getCartCount, wishlist } = useShop();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔥 THE FIX 1: Glides to the top of the page smoothly and closes mobile menu!
  const handleNavigationClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  // 🔥 THE FIX 2: Badges ONLY calculate if you are logged in. Logs out = Instantly 0!
  const cartCount = isAuthenticated && typeof getCartCount === 'function' ? getCartCount() : 0;
  const wishlistCount = isAuthenticated && Array.isArray(wishlist) ? wishlist.length : 0;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">

        {/* 1. Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={handleNavigationClick}>
          <Dumbbell size={28} className="logo-icon" />
          <span>GK'S <strong>FITNESS SHOP</strong></span>
        </Link>

        {/* 2. Desktop Navigation & Actions */}
        <div className="navbar-desktop">
          <div className="navbar-links">
            <NavLink
              to="/"
              end
              onClick={handleNavigationClick}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Home
            </NavLink>

            <NavLink
              to="/catalog"
              onClick={handleNavigationClick}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Products
            </NavLink>

            <NavLink
              to="/wishlist"
              onClick={handleNavigationClick}
              className={({ isActive }) => isActive ? 'nav-link nav-icon-link active' : 'nav-link nav-icon-link'}
              title="Wishlist"
            >
              <Heart size={19} />
              <span>Wishlist</span>
              {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
            </NavLink>

            <NavLink
              to="/cart"
              onClick={handleNavigationClick}
              className={({ isActive }) => isActive ? 'nav-link nav-icon-link active' : 'nav-link nav-icon-link'}
              title="Cart"
            >
              <ShoppingCart size={19} />
              <span>Cart</span>
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </NavLink>

            <NavLink
              to="/orders"
              onClick={handleNavigationClick}
              className={({ isActive }) => isActive ? 'nav-link nav-icon-link active' : 'nav-link nav-icon-link'}
              title="Orders"
            >
              <ClipboardList size={19} />
              <span>Orders</span>
            </NavLink>

            {/* Admin Route */}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={handleNavigationClick}
                className={({ isActive }) => isActive ? 'nav-link nav-icon-link admin-link active' : 'nav-link nav-icon-link admin-link'}
                title="Admin Dashboard"
              >
                <LayoutDashboard size={19} />
                <span>Admin</span>
              </NavLink>
            )}
          </div>

          <div className="navbar-divider" />

          {/* User Profile & Logout */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={handleNavigationClick} className="user-profile-btn" title="My Profile">
                  <User size={18} />
                  <span className="user-name">{user?.name || 'Profile'}</span>
                </Link>

                <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="auth-guest">
                <Link to="/login" onClick={handleNavigationClick} className="nav-link">Login</Link>
                <Link to="/register" onClick={handleNavigationClick} className="btn-signup">Sign Up</Link>
              </div>
            )}
          </div>
        </div>

        {/* 3. Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="navbar-hamburger"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile">
          <NavLink to="/" end onClick={handleNavigationClick}>Home</NavLink>
          <NavLink to="/catalog" onClick={handleNavigationClick}>Products</NavLink>
          <NavLink to="/wishlist" onClick={handleNavigationClick}>
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </NavLink>
          <NavLink to="/cart" onClick={handleNavigationClick}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </NavLink>
          <NavLink to="/orders" onClick={handleNavigationClick}>Orders</NavLink>

          {isAdmin && (
            <NavLink to="/admin" className="mobile-admin-link" onClick={handleNavigationClick}>
              <LayoutDashboard size={18} /> Admin Dashboard
            </NavLink>
          )}

          <div className="navbar-mobile-divider" />

          {isAuthenticated ? (
            <div className="mobile-auth-section">
              <NavLink to="/profile" onClick={handleNavigationClick} className="mobile-profile-link">
                <User size={18} /> {user?.name || 'Profile'}
              </NavLink>
              <button onClick={handleLogout} className="btn-logout mobile-logout">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="mobile-guest-links">
              <NavLink to="/login" onClick={handleNavigationClick}>Login</NavLink>
              <NavLink to="/register" onClick={handleNavigationClick} className="btn-signup mobile-signup">Sign Up</NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;