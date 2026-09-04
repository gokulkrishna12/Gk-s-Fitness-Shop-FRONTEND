import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, CreditCard, AlertTriangle, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import './Cart.scss';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useShop();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State for Custom Delete Modal
  const [itemToRemove, setItemToRemove] = useState(null);

  const handleCheckout = () => {
    // 🔥 Ensures uniform alert message across the whole app
    if (!isAuthenticated) {
      toast.error('Please login to access this feature!');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      toast.success('Item removed from cart');
      setItemToRemove(null);
    }
  };

  // 🔥 SAFETY NET: Filter out any deleted ghost products before rendering
  const safeCart = cart.filter(item => item && item.product != null);

  if (safeCart.length === 0) {
    return (
      <div className="cart">
        <div className="container">
          <div className="cart-empty">
            <ShoppingBag size={64} className="empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/catalog" className="btn-primary">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">

      {/* CUSTOM DELETE MODAL */}
      {itemToRemove && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <button className="modal-close" onClick={() => setItemToRemove(null)}>
              <X size={24} />
            </button>
            <div className="modal-icon">
              <AlertTriangle size={40} color="#e63946" />
            </div>
            <h3>Remove Item?</h3>
            <p>Are you sure you want to remove this item from your cart?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setItemToRemove(null)}>Keep Item</button>
              <button className="btn-confirm-delete" onClick={confirmRemove}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <h1>Shopping Cart</h1>

        <div className="cart-container">
          <div className="cart-items">
            {/* 🔥 Map using safeCart instead of the raw cart */}
            {safeCart.map((item) => (
              <div key={item.product._id || item.product.id} className="cart-item">
                <img
                  src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                  alt={item.product.name}
                />
                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <span className="price">{'\u20B9'}{item.product.price}</span>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-qty">
                    <button
                      onClick={() => updateQuantity(item.product._id || item.product.id, item.qty - 1)}
                      disabled={item.qty <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id || item.product.id, item.qty + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Triggers the Custom Modal */}
                  <button
                    className="cart-remove"
                    onClick={() => setItemToRemove(item.product._id || item.product.id)}
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-row">
              <span>Subtotal</span>
              <span>{'\u20B9'}{getCartTotal().toLocaleString()}</span>
            </div>
            <div className="cart-row">
              <span>Shipping</span>
              <span className="free-shipping">Free</span>
            </div>
            <div className="cart-row total">
              <span>Total</span>
              <span>{'\u20B9'}{getCartTotal().toLocaleString()}</span>
            </div>

            <button onClick={handleCheckout} className="btn-primary cart-btn">
              Proceed to Checkout
              <CreditCard size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;