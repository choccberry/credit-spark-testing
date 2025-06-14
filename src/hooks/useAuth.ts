import { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState } from '@/types';

const AuthContext = createContext<{
  authState: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCredits: (newBalance: number) => void;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };