import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Interceptor для токена — оставляем
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
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

    // Кастомный setCompany — ОК
    const setCompany = (newCompany, saveToStorage = true) => {
        setCompanyState(newCompany);
        if (newCompany && saveToStorage) {
            localStorage.setItem('lastCompanyId', newCompany.id);
        } else if (!newCompany) {
            localStorage.removeItem('lastCompanyId');
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);
            const savedCompanyId = localStorage.getItem('lastCompanyId');

            // Чистка старых данных
            localStorage.removeItem('lastCompanyName');
            localStorage.removeItem('lastCompanyDescription');

            // Очистка битых ID
            if (savedCompanyId === 'undefined' || savedCompanyId === 'null') {
                localStorage.removeItem('lastCompanyId');
                localStorage.removeItem(`lastChatId_${savedCompanyId}`);
            }

            // Передаем lastCompanyId в заголовке
            const response = await axios.get('/api/auth/check', {
                headers: {
                    'X-Last-Company-Id': savedCompanyId || ''
                }
            });

            if (response.data.authenticated) {
                setUser(response.data.user);
                let companyToSet = response.data.company;

                // Поиск сохраненной компании
                if (savedCompanyId && response.data.companies) {
                    const savedCompany = response.data.companies.find(c => c.id === savedCompanyId);
                    if (savedCompany) companyToSet = savedCompany;
                }

                setCompany(companyToSet, false);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setCompany(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setCompany(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post('/api/auth/login', { username, password });

            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }

            if (response.data.user) {
                // ❗ Исправлено: используем setCompany вместо setCompanyState
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
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // ❗ Исправлено: чистка localStorage и состояния в любом случае
            localStorage.removeItem('authToken');
            localStorage.removeItem('lastCompanyId');

            // Очистка всех чатов
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('lastChatId_')) localStorage.removeItem(key);
            });

            setUser(null);
            setCompany(null);
            setIsAuthenticated(false);
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