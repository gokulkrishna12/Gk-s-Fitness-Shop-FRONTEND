import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // This runs the moment you open the app
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);

                // THE FRONTEND CHEAT CODE: 
                // If it is your email, instantly force the Admin button to show up.
                if (parsedUser.email === 'gokuldinesh32@gmail.com' || parsedUser.isAdmin === true || parsedUser.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error reading local storage");
            }
        }
    }, []);

    // This runs when you sign in
    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
        setIsAuthenticated(true);

        // Apply the cheat code here too
        if (userData.email === 'gokuldinesh32@gmail.com' || userData.isAdmin === true || userData.role === 'admin') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);