/**
 * EcoLens — Auth Context (React)
 * Provides authentication state across the app
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import api from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check existing token on mount
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.getProfile()
        .then(profile => setUser(profile))
        .catch(() => { api.logout(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setError(null);
    try {
      const res = await api.signup({ username, email, password });
      setUser(res.user);
      return true;
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, isAuthenticated: !!user, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
