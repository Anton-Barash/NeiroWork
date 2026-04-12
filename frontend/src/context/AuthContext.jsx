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
    const [company, setCompanyState] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Custom setCompany that saves to localStorage
    const setCompany = (newCompany) => {
        setCompanyState(newCompany);
        if (newCompany) {
            localStorage.setItem('lastCompanyId', newCompany.id);
        } else {
            localStorage.removeItem('lastCompanyId');
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            console.log('Starting auth check');
            
            // Check what's in localStorage
            const savedCompanyId = localStorage.getItem('lastCompanyId');
            console.log('Saved company ID in localStorage:', savedCompanyId);
            
            const response = await axios.get('/api/auth/check');
            console.log('Auth check response:', response.data);
            
            if (response.data.authenticated) {
                console.log('Auth check successful, setting isAuthenticated to true');
                setUser(response.data.user);
                
                let companyToSet = response.data.company;
                console.log('Initial company from API:', companyToSet);
                
                // If we have a saved company ID, try to find it in the companies list
                if (savedCompanyId) {
                    console.log('Found saved company ID:', savedCompanyId);
                    
                    if (response.data.companies) {
                        console.log('Companies list available:', response.data.companies);
                        const savedCompany = response.data.companies.find(c => c.id == savedCompanyId);
                        if (savedCompany) {
                            companyToSet = savedCompany;
                            console.log('Loaded saved company from localStorage:', savedCompany.name);
                        } else {
                            console.log('Saved company not found in companies list');
                        }
                    } else {
                        console.log('Companies list not available in API response');
                        // If companies list is not available, we'll create a company object with just the ID
                        if (companyToSet && companyToSet.id != savedCompanyId) {
                            console.log('Creating company object with saved ID:', savedCompanyId);
                            companyToSet = { id: savedCompanyId, name: 'Loading...' };
                        }
                    }
                } else {
                    console.log('No saved company ID found in localStorage');
                }
                
                console.log('Final company to set:', companyToSet);
                setCompanyState(companyToSet);
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
                setCompanyState(response.data.company);
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
            // Remove token and saved state from localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('lastCompanyId');

            // Clear all company-specific chat IDs
            for (let key in localStorage) {
                if (key.startsWith('lastChatId_')) {
                    localStorage.removeItem(key);
                }
            }

            setUser(null);
            setCompanyState(null);
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