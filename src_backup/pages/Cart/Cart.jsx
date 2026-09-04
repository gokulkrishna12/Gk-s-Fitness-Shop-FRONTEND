import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingCart as CartIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Cart.scss';

const Cart = () => {
    const { cart, removeFromCart, loading } = useCart();
    const navigate = useNavigate();

    if (loading) return <div className="loader">Loading Cart...</div>;

    const isEmpty = !cart.cartItems || cart.cartItems.length === 0;

    return (
        <div className="cart-page">
            <h1>Your Shopping Cart</h1>

            {isEmpty ? (
                <div className="empty-cart">
                    <CartIcon size={64} className="empty-icon" />
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any gear yet.</p>
                    <Link to="/" className="btn-shop">Start Shopping</Link>
                </div>
            ) : (
                <div className="cart-container">
                    {/* LEFT: Cart Items List */}
                    <div className="cart-items">
                        {cart.cartItems.map((item) => (
                            <div key={item.product} className="cart-item">
                                <div className="item-img">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} />
                                    ) : (
                                        <div className="img-placeholder"><CartIcon size={24} /></div>
                                    )}
                                </div>

                                <div className="item-details">
                                    <Link to={`/product/${item.product}`} className="item-name">
                                        {item.name}
                                    </Link>
                                    <p className="item-price">₹{item.price}</p>
                                </div>

                                <div className="item-qty">
                                    <span>Qty: {item.qty}</span>
                                </div>

                                <button
                                    className="btn-remove"
                                    onClick={() => removeFromCart(item.product)}
                                    aria-label="Remove item"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="cart-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{cart.totalPrice}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <hr />
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{cart.totalPrice}</span>
                        </div>

                        <button
                            className="btn-checkout"
                            onClick={() => navigate('/checkout')}
                        >
                            Proceed to Checkout <ArrowRight size={18} />
                        </button>
                        <Link to="/" className="btn-continue">Continue Shopping</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;