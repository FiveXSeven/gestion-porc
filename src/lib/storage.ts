import { User } from '@/types';

const STORAGE_KEYS = {
  USER: 'porcherie_user',
  IS_AUTHENTICATED: 'porcherie_authenticated',
};

// User management
export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
};

export const setAuthenticated = (value: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, String(value));
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
};
