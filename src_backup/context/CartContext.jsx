import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getCartApi, addToCartApi, removeFromCartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState({ cartItems: [], totalPrice: 0 });
    const [loading, setLoading] = useState(true);

    // Only fetch the cart if the user is logged in
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart({ cartItems: [], totalPrice: 0 });
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            const data = await getCartApi();
            if (data) setCart(data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, qty = 1) => {
        if (!isAuthenticated) return toast.error('Please log in to add items to cart');

        // Construct the payload based on your backend schema
        const cartItem = {
            product: product._id,
            name: product.name,
            price: product.price,
            qty: Number(qty),
            image: product.images?.[0] || '',
        };

        try {
            const updatedCart = await addToCartApi(cartItem);
            setCart(updatedCart);
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            toast.error('Failed to add item to cart');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const updatedCart = await removeFromCartApi(productId);
            setCart(updatedCart);
            toast.success('Item removed from cart');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    // Calculate total items for the Navbar badge
    const totalItems = cart.cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);