import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { MeUser, UserRole } from '../types';
import { deriveRole } from '../types';
import { authService } from '../services/api';

interface AuthContextValue {
  currentUser: MeUser | null;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<MeUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MeUser | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Clear session even if logout fails so the user is not stranded in a signed-in state.
      setCurrentUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    userRole: currentUser ? deriveRole(currentUser) : null,
    login,
    logout,
  }), [currentUser, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
