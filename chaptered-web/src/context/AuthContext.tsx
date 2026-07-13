/**
 * Authentication Context and Hook.
 * Manages user state, token persistence in localStorage, and session restoration.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; errors?: Record<string, string> }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string; errors?: Record<string, string> }>;
  logout: () => void;
  retryAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('chaptered-token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('chaptered-token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(storedToken);
        setAuthError(null);
      } else if (response.status === 401) {
        localStorage.removeItem('chaptered-token');
        setUser(null);
        setToken(null);
      } else {
        setAuthError(`Server error (${response.status}). Your session could not be verified.`);
        setUser(null);
        setToken(null);
      }
    } catch {
      setAuthError('Cannot connect to server. Your session could not be verified.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('chaptered-token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error,
          errors: data.errors,
        };
      }
    } catch (err) {
      console.error('Login request error:', err);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('chaptered-token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error,
          errors: data.errors,
        };
      }
    } catch (err) {
      console.error('Signup request error:', err);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('chaptered-token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user;

  const retryAuth = () => {
    initializeAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, authError, login, signup, logout, retryAuth }}>
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
