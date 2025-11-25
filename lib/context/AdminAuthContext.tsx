'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import adminAuthService from '../services/adminAuthService';

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

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<unknown>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
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
        if (adminAuthService.isAuthenticated()) {
          const userInfo = await adminAuthService.getUserInfo();
          setUser(userInfo as User);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        adminAuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await adminAuthService.login(credentials);

      const userInfo = await adminAuthService.getUserInfo();

      setUser(userInfo as User);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const logout = () => {
    adminAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
