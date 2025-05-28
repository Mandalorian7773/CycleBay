import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Get user data from localStorage if available
                    const userData = localStorage.getItem('userData');
                    if (userData) {
                        setUser(JSON.parse(userData));
                    } else {
                        // If no user data in localStorage, we'll fetch it when needed
                        setUser({ token });
                    }
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkUserLoggedIn();
    }, []);

    const login = async (userData) => {
        try {
            // Store token in localStorage
            localStorage.setItem('token', userData.token);
            
            // Store user data in localStorage
            localStorage.setItem('userData', JSON.stringify({
                _id: userData._id,
                name: userData.name,
                token: userData.token
            }));
            
            setUser(userData);
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}; 