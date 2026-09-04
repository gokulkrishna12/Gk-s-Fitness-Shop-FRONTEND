import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// --- Context Providers ---
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// --- Components ---
import Navbar from './components/Navbar/Navbar';
import AiCoachModal from './components/AiCoachModal/AiCoachModal';
import ProtectedRoute from './components/ProtectedRoute';

// --- Pages ---
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home/Home';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminProducts from './pages/Admin/AdminProducts';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />

              {/* Protected Routes (Needs Login) */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

              {/* Admin Secure Routes */}
              <Route
                path="/admin/orders"
                element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>}
              />
              <Route
                path="/admin/products"
                element={<ProtectedRoute adminOnly={true}><AdminProducts /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<Navigate to="/admin/orders" replace />}
              />

              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Floating AI Coach and Toast Notifications */}
          <AiCoachModal />
          <Toaster position="bottom-right" richColors />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;