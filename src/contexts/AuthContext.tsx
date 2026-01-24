import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import * as api from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pin: string) => Promise<boolean>;
  register: (email: string, pin: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticatedState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('authToken');
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      
      if (storedEmail && token && isAuth) {
        try {
          const userData = await api.getMe(storedEmail);
          setUser(userData);
          setAuthenticatedState(true);
        } catch (error) {
          console.error('Session restore failed:', error);
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, pin: string): Promise<boolean> => {
    try {
      const { user: userData, token } = await api.login(email, pin);
      setUser(userData);
      setAuthenticatedState(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authToken', token);
      return true;
    } catch (error) {
      toast.error('Email ou code PIN incorrect');
      return false;
    }
  };

  const register = async (email: string, pin: string, name: string): Promise<boolean> => {
    try {
      const { user: userData, token } = await api.register(email, pin, name);
      setUser(userData);
      setAuthenticatedState(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authToken', token);
      return true;
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthenticatedState(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
  };

  if (loading) {
    return null; // Ou un spinner
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: authenticated, login, register, logout }}>
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
