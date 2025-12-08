import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getUser, saveUser, isAuthenticated as checkAuth, setAuthenticated, logout as doLogout, initializeDemoData } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pin: string) => boolean;
  register: (email: string, pin: string, name: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticatedState] = useState(false);

  useEffect(() => {
    const storedUser = getUser();
    const authStatus = checkAuth();
    if (storedUser && authStatus) {
      setUser(storedUser);
      setAuthenticatedState(true);
      initializeDemoData();
    }
  }, []);

  const login = (email: string, pin: string): boolean => {
    const storedUser = getUser();
    if (storedUser && storedUser.email === email && storedUser.pin === pin) {
      setUser(storedUser);
      setAuthenticatedState(true);
      setAuthenticated(true);
      initializeDemoData();
      return true;
    }
    return false;
  };

  const register = (email: string, pin: string, name: string): boolean => {
    const newUser: User = { email, pin, name };
    saveUser(newUser);
    setUser(newUser);
    setAuthenticatedState(true);
    setAuthenticated(true);
    initializeDemoData();
    return true;
  };

  const logout = () => {
    setUser(null);
    setAuthenticatedState(false);
    doLogout();
  };

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
