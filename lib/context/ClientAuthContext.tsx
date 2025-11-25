'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import clientAuthService from '../services/clientAuthService';

interface ClientUser {
  sub: string;
  email: string;
  fullName?: string;
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

interface ClientAuthContextType {
  user: ClientUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextType | null>(null);

export const ClientAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const bootstrap = async () => {
      try {
        if (clientAuthService.isAuthenticated()) {
          const existingUser = clientAuthService.getUser();
          if (existingUser) {
            setUser(existingUser);
            setIsAuthenticated(true);
            return;
          }

          const userInfo = await clientAuthService.getUserInfo();
          setUser(userInfo);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Client auth bootstrap failed:', error);
        clientAuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    await clientAuthService.login(credentials);
    const userInfo = await clientAuthService.getUserInfo();
    setUser(userInfo);
    setIsAuthenticated(true);
  };

  const register = async (data: RegisterData) => {
    await clientAuthService.register(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    clientAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <ClientAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within ClientAuthProvider');
  }
  return context;
};

