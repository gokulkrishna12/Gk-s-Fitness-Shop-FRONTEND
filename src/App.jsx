import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { Toaster } from 'sonner';
import Home from './pages/Home/Home';

// Lazy loaded components
const ChatAssistant = lazy(() => import('./components/ChatAssistant/ChatAssistant'));
const OAuthSuccess = lazy(() => import('./components/OAuthSuccess'));
const Catalog = lazy(() => import('./pages/Catalog/Catalog'));
const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist'));
const Profile = lazy(() => import('./pages/Profile/Profile'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', color: '#e63946' }}>
    <h2>Loading...</h2>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Mount non-critical widgets only after the page has loaded and the browser is idle
function useDeferredMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const go = () => { if (!cancelled) setReady(true); };
    const run = () => {
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 3000 });
      else setTimeout(go, 1500);
    };

    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', run);
    };
  }, []);

  return ready;
}

function App() {
  const showChat = useDeferredMount();

  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <div className="app-wrapper">
            <Navbar />
            <Toaster position="top-center" richColors />

            {showChat && (
              <Suspense fallback={null}>
                <ChatAssistant />
              </Suspense>
            )}

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
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/orders" element={<Orders />} />

                  {/* Protected Routes */}
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
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