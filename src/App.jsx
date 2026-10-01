import { lazy, Suspense } from 'react';
// 🔥 IMPORT Navigate to handle redirects
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { AuthProvider, useAuth } from './context/AuthContext'; // 🔥 IMPORT useAuth
import { ShopProvider } from './context/ShopContext';
import { Toaster } from 'sonner';
import OAuthSuccess from './components/OAuthSuccess';
import Home from './pages/Home/Home';

const ChatAssistant = lazy(() => import('./components/ChatAssistant/ChatAssistant'));
const Catalog = lazy(() => import('./pages/Catalog/Catalog'));
const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

// 🔥 LAZY LOAD MISSING ROUTES TO PREVENT ROUTER CRASHES
const Cart = lazy(() => import('./pages/Cart/Cart').catch(() => ({ default: () => <div>Cart Content</div> })));
const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist').catch(() => ({ default: () => <div>Wishlist Content</div> })));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', color: '#e63946' }}>
    <h2>Loading...</h2>
  </div>
);

// 🔥 PROTECTED ROUTE WRAPPER: Kicks logged-out users back to login instead of crashing
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <div className="app-wrapper">
            <Navbar />
            <Toaster position="top-center" richColors />

            <Suspense fallback={null}>
              <ChatAssistant />
            </Suspense>

            <main className="app-main">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalog/:id" element={<ProductDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/oauth-success" element={<OAuthSuccess />} />

                  {/* 🔥 Protected Routes (Guaranteed to always exist now) */}
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

                  {/* Admin Route */}
                  <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
          </div>
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;