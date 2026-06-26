'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  isAdmin: boolean;
  login: (identifier: string, password: string, type?: 'email' | 'phone') => Promise<void>;
  googleLogin: (credential: string) => Promise<{ exists: boolean; googleProfile?: { email: string; name: string; picture: string } }>;
  linkGoogleAccount: (credential: string, phone: string) => Promise<void>;
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

    // Add response interceptor for 401 errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
          router.push('/auth');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [router]);

  const login = async (identifier: string, password: string, type: 'email' | 'phone' = 'email') => {
    try {
      const payload = type === 'email' ? { email: identifier, password } : { phone: identifier, password };
      const response = await axios.post('/api/auth/login', payload);
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('auth_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const googleLogin = async (credential: string): Promise<{ exists: boolean; googleProfile?: { email: string; name: string; picture: string } }> => {
    try {
      const response = await axios.post('/api/auth/google', { credential });
      const { exists, token: newToken, user: userData, googleProfile } = response.data;

      if (exists && newToken) {
        localStorage.setItem('auth_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(userData);
        return { exists: true };
      }

      return { exists: false, googleProfile };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { exists: false, googleProfile: error.response.data.googleProfile };
      }
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  };

  const linkGoogleAccount = async (credential: string, phone: string) => {
    try {
      const response = await axios.post('/api/auth/link-google-account', { credential, phone });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('auth_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to link account');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    router.push('/auth');
  };

  const register = async (name: string, email: string, password: string, countryCode: string, phone: string) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password, countryCode, phone });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('auth_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const isAdmin = useMemo(
    () => !!user?.roles?.some((r: any) => r.permission?.some((p: any) => p.key === 'admin')),
    [user]
  );

  const value = useMemo(
    () => ({ user, token, loading, isAdmin, login, googleLogin, linkGoogleAccount, logout, register }),
    [user, token, loading, isAdmin, login, googleLogin, linkGoogleAccount, logout, register]
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
