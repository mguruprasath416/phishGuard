import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'https://phishguard-fgxe.onrender.com';
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is already authenticated on load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/user');
                if (res.data.user) {
                    setUser(res.data.user);
                }
            } catch (err) {
                console.log("No existing session.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const register = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/register', { email, password });
            if (res.data.success) return true;
            throw new Error(res.data.error || 'Registration failed');
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/login', { email, password });
            if (res.data.success && res.data.user) {
                setUser(res.data.user);
                return true;
            }
            throw new Error(res.data.error || 'Login failed');
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (err) {
            console.error('Logout error:', err.message);
        } finally {
            setUser(null);
            setError(null);
        }
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
                clearError: () => setError(null),
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
