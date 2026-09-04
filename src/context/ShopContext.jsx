import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import axiosClient from '../api/axiosClient'; // 🔥 THE FIX: Needed to talk to our new backend routes!

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // A safety flag so we don't accidentally overwrite the database with an empty cart on page refresh!
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('shop_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // 🔥 STEP 1: Download from Database on Login (Or wipe if logged out)
  useEffect(() => {
    if (isAuthenticated) {
      const fetchDatabaseState = async () => {
        try {
          const res = await axiosClient.get('/auth/data');
          if (res.data) {
            setCart(res.data.cart || []);
            setWishlist(res.data.wishlist || []);
          }
        } catch (error) {
          console.error("Failed to download cart/wishlist from database", error);
        } finally {
          setIsInitialLoad(false); // Done loading!
        }
      };
      fetchDatabaseState();
    } else {
      // The Ghost Wiper!
      setCart([]);
      setWishlist([]);
      localStorage.removeItem('shop_cart');
      localStorage.removeItem('shop_wishlist');
      setIsInitialLoad(false);
    }
  }, [isAuthenticated]);

  // 🔥 STEP 2: Silently Sync to Database on every change!
  useEffect(() => {
    // Only run this IF they are logged in AND we have finished the initial download
    if (isAuthenticated && !isInitialLoad) {
      // 1. Save to local browser memory for instant UI speed
      localStorage.setItem('shop_cart', JSON.stringify(cart));
      localStorage.setItem('shop_wishlist', JSON.stringify(wishlist));

      // 2. Silently sync up to MongoDB in the background!
      axiosClient.post('/auth/sync', { cart, wishlist })
        .catch(err => console.error("Failed to sync to database", err));
    }
  }, [cart, wishlist, isAuthenticated, isInitialLoad]);

  // ── Cart ──────────────────────────────────────────
  const addToCart = (product) => {
    const id = product._id || product.id;
    if (!id) return toast.error("Product has no ID!");

    setCart((prev) => {
      const existing = prev.find(item => (item.product._id || item.product.id) === id);
      if (existing) {
        return prev.map(item =>
          (item.product._id || item.product.id) === id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter(item => (item.product._id || item.product.id) !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart((prev) =>
      prev.map(item =>
        (item.product._id || item.product.id) === id
          ? { ...item, qty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // ── Wishlist ──────────────────────────────────────
  const toggleWishlist = (product) => {
    const id = product._id || product.id;
    if (!id) return;

    setWishlist((prev) => {
      const exists = prev.find(item => (item._id || item.id) === id);
      if (exists) {
        toast.info(`${product.name} removed from wishlist`);
        return prev.filter(item => (item._id || item.id) !== id);
      }
      toast.success(`${product.name} added to wishlist!`);
      return [...prev, product];
    });
  };

  const isInWishlist = (id) => wishlist.some(item => (item._id || item.id) === id);

  const getCartTotal = () =>
    cart.reduce((total, item) => total + (item.product.price * item.qty), 0);

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.qty, 0);

  return (
    <ShopContext.Provider value={{
      cart, wishlist, addToCart, removeFromCart, updateQuantity, clearCart,
      toggleWishlist, isInWishlist, getCartTotal, getCartCount
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);