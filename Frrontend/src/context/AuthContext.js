import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Corrected import

// Configure axios base URL. Authorization header will be set dynamically.
axios.defaults.baseURL = 'https://phishguard-fgxe.onrender.com'; 
// withCredentials might not be needed if you're not relying on cookies for auth from this origin
// but can be kept if other parts of your API use it.
axios.defaults.withCredentials = true; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Start with loading true to check for token
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Check if token is expired
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setUser({ 
                        id: decodedToken.id, 
                        email: decodedToken.email, 
                        role: decodedToken.role 
                    });
                }
            } catch (e) {
                console.error('Error decoding token on load:', e);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false); // Done checking token
    }, []);

    const register = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/register', { email, password });
            if (response.data.success) {
                return true; // Or potentially auto-login here
            }
            // If backend sends specific error message, use it
            throw new Error(response.data.error || 'Registration failed'); 
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Registration error';
            setError(errorMessage);
            console.error('Registration error details:', err.response || err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/login', { email, password });
            if (response.data.success && response.data.token) {
                const { token, user: userData } = response.data;
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(userData); // Backend already sends user object {id, email, role}
                return true;
            }
            throw new Error(response.data.error || 'Login failed');
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Login error';
            setError(errorMessage);
            console.error('Login error details:', err.response || err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        // Optional: Call backend logout endpoint if it performs crucial server-side session cleanup
        // For JWT, primary action is client-side token removal
        try {
            // Check if user exists and token is present before calling backend logout
            const token = localStorage.getItem('token');
            if (user && token) { 
                // Pass token in header for backend to identify user if needed for its logout logic
                await axios.post('/api/logout', {}, { 
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (err) {
            // Log error but don't let it block client-side logout
            console.error('Backend logout error (non-critical):', err.response?.data?.error || err.message);
        }
        
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setError(null); // Clear any previous errors on logout
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                register,
                login,
                logout,
                isAuthenticated: !!user,
                clearError: () => setError(null) // Utility to clear errors from components
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
