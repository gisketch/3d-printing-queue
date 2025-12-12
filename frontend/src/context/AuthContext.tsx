import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import pb from '../lib/pocketbase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFinance: boolean;
  mustChangePassword: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (pb.authStore.isValid && pb.authStore.model) {
      try {
        const userData = await pb.collection('users').getOne<User>(pb.authStore.model.id);
        setUser(userData);
      } catch {
        pb.authStore.clear();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        try {
          // Refresh the user data
          const userData = await pb.collection('users').getOne<User>(pb.authStore.model.id);
          setUser(userData);
        } catch {
          pb.authStore.clear();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const unsubscribe = pb.authStore.onChange(() => {
      if (pb.authStore.model) {
        setUser(pb.authStore.model as User);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string) => {
    const authData = await pb.collection('users').authWithPassword<User>(username, password);
    setUser(authData.record);
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('No user logged in');

    // Update password
    await pb.collection('users').update(user.id, {
      password: newPassword,
      passwordConfirm: newPassword,
      oldPassword: currentPassword,
      must_change_password: false,
    });

    // Re-authenticate with new password
    await pb.collection('users').authWithPassword<User>(user.username, newPassword);
    await refreshUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFinance: user?.role === 'admin' && user?.is_finance === true,
    mustChangePassword: user?.must_change_password ?? false,
    login,
    logout,
    changePassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
