import React, { useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { AuthContext } from '@/hooks/useAuth';
import { mockUsers, mockCampaigns } from '@/data/mockData';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAuthState({
        user,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call
    const user = mockUsers.find(u => u.username === username);
    if (user && password === 'password123') { // Simple password check for demo
      const userData = { ...user };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setAuthState({
        user: userData,
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return false;
    }

    // Create new user with 100 credits bonus
    const newUser: User = {
      id: mockUsers.length + 1,
      username,
      email,
      creditBalance: 100,
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setAuthState({
      user: newUser,
      isAuthenticated: true,
    });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
  };

  const updateCredits = (newBalance: number) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, creditBalance: newBalance };
      
      // Update in mockData
      const userIndex = mockUsers.findIndex(u => u.id === authState.user!.id);
      if (userIndex !== -1) {
        mockUsers[userIndex].creditBalance = newBalance;
      }
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout, updateCredits }}>
      {children}
    </AuthContext.Provider>
  );
};