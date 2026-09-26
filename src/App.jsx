import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { Toaster } from 'sonner';

import Home from './pages/Home/Home';

// 🔥 THE 95+ FIX: Make the heavy AI Assistant lazy so it doesn't block the screen load
const ChatAssistant = lazy(() => import('./components/ChatAssistant/ChatAssistant'));

// Other lazy imports...
const Catalog = lazy(() => import('./pages/Catalog/Catalog'));
const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', color: '#e63946' }}>
    <h2>Loading...</h2>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <div className="app-wrapper">
            <Navbar />
            <Toaster position="top-center" richColors />

            {/* 🔥 Wrap the assistant in a Suspense with NO fallback. It will just silently appear when ready! */}
            <Suspense fallback={null}>
              <ChatAssistant />
            </Suspense>

            <main className="app-main">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalog/:id" element={<ProductDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/admin" element={<AdminDashboard />} />
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