import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { Toaster } from 'sonner';

// 🔥 1. Corrected lazy imports based strictly on your folder structure
const Home = lazy(() => import('./pages/Home/Home'));
const Catalog = lazy(() => import('./pages/Catalog/Catalog'));
const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword')); // Fixed Path!
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard')); // Fixed Path!

// 🔥 2. Create a simple fallback loader
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
          <Navbar />
          <Toaster position="top-center" richColors />

          {/* 🔥 3. Wrap Routes in Suspense */}
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

          <Footer />
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;