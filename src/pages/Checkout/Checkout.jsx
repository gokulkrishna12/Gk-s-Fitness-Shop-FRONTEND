import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { CreditCard, MapPin, Truck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './Checkout.scss';

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
    const { cart, clearCart } = useShop();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    // THE FIX: Add a state to let useEffect know a payment just succeeded
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const [shippingAddress, setShippingAddress] = useState({
        address: '', city: '', postalCode: '', country: 'India', phone: ''
    });

    const directItem = location.state?.directItem;
    const checkoutItems = directItem ? [directItem] : cart;
    const totalAmount = checkoutItems.reduce((total, item) => total + (item.product.price * item.qty), 0);
    const displayTotal = totalAmount.toFixed(2);

    useEffect(() => {
        // THE FIX: Only redirect to cart if payment wasn't just successful
        if (!paymentSuccess && !directItem && (!cart || cart.length === 0)) {
            navigate('/cart');
        }
    }, [cart, directItem, navigate, paymentSuccess]);

    const handleInputChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
            return toast.error('Please fill in all shipping details');
        }
        setLoading(true);

        try {
            const res = await loadRazorpayScript();
            if (!res) {
                toast.error('Razorpay SDK failed to load.');
                setLoading(false);
                return;
            }

            const formattedOrderItems = checkoutItems.map(item => ({
                product: String(item.product._id || item.product.id),
                name: item.product.name,
                price: Number(item.product.price),
                qty: Number(item.qty),
                image: item.product.image || item.product.images?.[0] || 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=200&q=80',
            }));

            const { data: orderData } = await axiosClient.post('/payment/create-order', {
                orderItems: formattedOrderItems,
                shippingAddress,
                totalAmount: Number(totalAmount)
            });

            const MY_RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

            const options = {
                key: MY_RAZORPAY_KEY,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "GK's Fitness",
                description: "Order Payment",
                order_id: orderData.razorpayOrderId,
                handler: async function (response) {
                    try {
                        toast.loading("Verifying payment & saving order...");

                        const verifyRes = await axiosClient.post('/payment/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderItems: formattedOrderItems,
                            shippingAddress,
                            totalAmount: Number(totalAmount)
                        });

                        toast.dismiss();
                        if (verifyRes.status === 200) {

                            // THE FIX: Set success to true BEFORE clearing the cart!
                            // This stops the useEffect from jumping back to the empty cart page.
                            setPaymentSuccess(true);

                            toast.success('Order placed successfully!');

                            if (!directItem) {
                                clearCart();
                            }

                            // THE FIX: replace: true stops them from hitting "Back" into checkout
                            navigate('/orders', { replace: true });
                        }
                    } catch (err) {
                        toast.dismiss();
                        console.error("Verification Error:", err.response?.data || err);
                        toast.error('Payment verification failed! Check backend logs.');
                    }
                },
                prefill: {
                    name: user?.name || 'Athlete',
                    email: user?.email || '',
                    contact: shippingAddress.phone
                },
                theme: { color: '#e63946' }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment failed: ' + response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error("Checkout Create Error:", error);
            toast.error(error.response?.data?.message || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>Secure Checkout</h1>
                <div className="checkout-container">
                    <div className="shipping-section">
                        <div className="section-header">
                            <Truck size={24} /> <h2>Shipping Details</h2>
                        </div>
                        <form className="shipping-form" id="checkout-form" onSubmit={handlePayment}>
                            <div className="form-group">
                                <label>Street Address</label>
                                <input type="text" name="address" value={shippingAddress.address} onChange={handleInputChange} required placeholder="123 Fitness St" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" name="city" value={shippingAddress.city} onChange={handleInputChange} required placeholder="Chennai" />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleInputChange} required placeholder="600001" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleInputChange} required placeholder="+91 98765 43210" />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="summary-section">
                        <div className="section-header">
                            <MapPin size={24} /> <h2>Order Summary</h2>
                        </div>
                        <div className="summary-items">
                            {checkoutItems.map((item, index) => (
                                <div key={index} className="summary-item">
                                    <span>{item.qty}x {item.product.name}</span>
                                    <span>₹{(item.product.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-totals">
                            <div className="row grand-total">
                                <span>Total to Pay</span>
                                <span>₹{displayTotal}</span>
                            </div>
                        </div>
                        <button type="submit" form="checkout-form" className="btn-pay" disabled={loading}>
                            {loading ? 'Processing...' : `Pay ₹${displayTotal} Securely`}
                            <CreditCard size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;