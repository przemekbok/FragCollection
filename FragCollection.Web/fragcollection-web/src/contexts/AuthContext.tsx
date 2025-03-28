// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, authApi } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // If we have a token, validate it by fetching the current user
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // On error, clear token and user
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authApi.login(usernameOrEmail, password, rememberMe);
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authApi.register(username, email, password);
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authApi.logout();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed.');
    } finally {
      // Always clear user state on logout
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};