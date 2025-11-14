'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import authService from '../services/authService';

interface User {
  email: string;
  fullName?: string;
  role?: string;
  [key: string]: unknown;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  fullName: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<unknown>;
  register: (userData: RegisterData) => Promise<unknown>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Prevent double auth check in React Strict Mode (development)
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    // Check if user is already logged in on mount
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userInfo = await authService.getUserInfo();
          setUser(userInfo as User);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      console.log('Login response:', response);

      const userInfo = await authService.getUserInfo();
      console.log('User info:', userInfo);

      setUser(userInfo as User);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
