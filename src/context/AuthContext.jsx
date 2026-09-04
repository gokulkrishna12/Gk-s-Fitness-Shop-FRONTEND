import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Instantly check for user on the very first millisecond
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // 2. Instantly set authentication if a token exists
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('token');
    });

    // 3. Instantly check if they are an admin using the cheat code
    const [isAdmin, setIsAdmin] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            return parsedUser.email === 'gokuldinesh32@gmail.com' || parsedUser.isAdmin === true || parsedUser.role === 'admin';
        }
        return false;
    });

    // We no longer need to wait, so loading is always false!
    const [loading, setLoading] = useState(false);

    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
        setIsAuthenticated(true);

        if (userData.email === 'gokuldinesh32@gmail.com' || userData.isAdmin === true || userData.role === 'admin') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        // 🔥 THE FIX: Deep clean the ghost cart and wishlist memory instantly!
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        localStorage.removeItem('cartItems');

        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);