import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { createRazorpayOrder, verifyPaymentAndSaveOrder } from '../../api/paymentApi';
import { CreditCard, MapPin, Truck } from 'lucide-react';
import './Checkout.scss';

// Utility function to load the Razorpay SDK dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const { cart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
        phone: ''
    });

    // If cart is empty, kick them back to the cart page
    useEffect(() => {
        if (!cart.cartItems || cart.cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    const handleInputChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        // 1. Validate Form
        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phone) {
            return toast.error('Please fill in all shipping details');
        }

        setLoading(true);

        try {
            // 2. Load Razorpay Script
            const res = await loadRazorpayScript();
            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            // 3. Create Order on your backend
            const orderData = await createRazorpayOrder(cart.totalPrice);

            // 4. Initialize Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add this to your React .env file!
                amount: orderData.amount,
                currency: orderData.currency,
                name: "GK's Fitness Shop",
                description: "Premium Gear & Supplements",
                image: "https://via.placeholder.com/150?text=GK+Fitness", // Your logo here
                order_id: orderData.id,

                // 5. This handler runs when the payment is SUCCESSFUL
                handler: async function (response) {
                    try {
                        toast.success("Payment authorized! Verifying...");

                        // Send everything to backend to verify signature and save to MongoDB
                        await verifyPaymentAndSaveOrder({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderItems: cart.cartItems,
                            shippingAddress,
                            totalPrice: cart.totalPrice
                        });

                        toast.success('Order placed successfully! 🚀');
                        // Navigate to home or user orders page
                        navigate('/');

                        // Note: You might want to trigger a fetchCart() here to clear the frontend cart 
                        // if your backend automatically clears the cart upon order creation.
                        window.location.reload();

                    } catch (error) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.name || "Athlete",
                    email: user?.email || "",
                    contact: shippingAddress.phone
                },
                theme: {
                    color: "#e50914" // Your brand red
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong during checkout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <h1>Secure Checkout</h1>

            <div className="checkout-container">
                {/* LEFT: Shipping Form */}
                <div className="shipping-section">
                    <div className="section-header">
                        <Truck size={24} />
                        <h2>Shipping Details</h2>
                    </div>

                    <form className="shipping-form" id="checkout-form" onSubmit={handlePayment}>
                        <div className="form-group">
                            <label>Street Address</label>
                            <input type="text" name="address" value={shippingAddress.address} onChange={handleInputChange} placeholder="123 Fitness Ave, Apt 4" required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" name="city" value={shippingAddress.city} onChange={handleInputChange} placeholder="Chennai" required />
                            </div>
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleInputChange} placeholder="600001" required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleInputChange} placeholder="+91 9876543210" required />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input type="text" name="country" value={shippingAddress.country} disabled />
                            </div>
                        </div>
                    </form>
                </div>

                {/* RIGHT: Order Summary */}
                <div className="summary-section">
                    <div className="section-header">
                        <MapPin size={24} />
                        <h2>Order Summary</h2>
                    </div>

                    <div className="summary-items">
                        {cart.cartItems?.map(item => (
                            <div key={item.product} className="summary-item">
                                <span>{item.qty}x {item.name}</span>
                                <span>₹{item.price * item.qty}</span>
                            </div>
                        ))}
                    </div>

                    <hr />

                    <div className="summary-totals">
                        <div className="row">
                            <span>Subtotal</span>
                            <span>₹{cart.totalPrice}</span>
                        </div>
                        <div className="row">
                            <span>Shipping</span>
                            <span className="free">FREE</span>
                        </div>
                        <div className="row grand-total">
                            <span>Total to Pay</span>
                            <span>₹{cart.totalPrice}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        form="checkout-form"
                        className="btn-pay"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : `Pay ₹${cart.totalPrice} Securely`}
                        <CreditCard size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;