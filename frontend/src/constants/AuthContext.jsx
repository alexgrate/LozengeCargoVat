import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const register = async (data) => {
        const res = await api.post('/auth/register/', data);
        return res.data;
    };

    const setup = async (data) => {
        const res = await api.post('/auth/setup/', data)
        return res.data;
    }

    const login = async (email, password) => {
        const res = await api.post('/auth/login/', { email, password });
        const { user, tokens } = res.data;
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            await api.post('/auth/logout/', { refresh });
        } catch {}
        localStorage.clear();
        setUser(null);
    };

    const isAdmin = user?.role === 'ADMIN';
    const isOwner = user?.is_owner === true;

    return (
        <AuthContext.Provider value={{ user, loading, login, register, setup, logout, isAdmin, isOwner }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);