import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

// Context
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';

// Global Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ChatAssistant from './components/ChatAssistant/ChatAssistant';

// Pages
import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Register from './pages/Auth/Register';

// MISSING PAGES IMPORTED HERE!
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Checkout from './pages/Checkout/Checkout';

import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-wrapper">
      {!isAuthPage && <Navbar />}
      <main className="app-main">{children}</main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <ChatAssistant />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />

              {/* 🔥 THE FIX: Moved Orders here so the custom "Please Login" UI can actually load! */}
              <Route path="/orders" element={<Orders />} />

              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="bottom-right" richColors />
          </Layout>
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;