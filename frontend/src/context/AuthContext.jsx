import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set up axios interceptor to add auth token to requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const AuthContext = createContext(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            console.log('Starting auth check');
            const response = await axios.get('/api/auth/check');
            console.log('Auth check response:', response.data);
            if (response.data.authenticated) {
                console.log('Auth check successful, setting isAuthenticated to true');
                setUser(response.data.user);
                setCompany(response.data.company);
                setIsAuthenticated(true);
            } else {
                console.log('Auth check failed, setting isAuthenticated to false');
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsAuthenticated(false);
        } finally {
            console.log('Auth check completed, setting loading to false');
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            if (response.data.user) {
                // Store token in localStorage
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                }
                setUser(response.data.user);
                setCompany(response.data.company);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            // Remove token from localStorage
            localStorage.removeItem('authToken');
            setUser(null);
            setCompany(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        user,
        company,
        setCompany,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;