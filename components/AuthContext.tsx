'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, countryCode: string, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await axios.get('/api/user/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('auth_token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('auth_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const register = async (name: string, email: string, password: string, countryCode: string, phone: string) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password, countryCode, phone });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('auth_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, register }),
    [user, token, loading, login, logout, register]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
