'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from './server';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: 'user' | 'staff' | 'admin') => boolean;
  hasAnyRole: (roles: ('user' | 'staff' | 'admin')[]) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser: AuthUser | null }) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user;

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      // This will be handled by server actions
      const formData = new FormData();
      formData.append('email', credentials.email);
      formData.append('password', credentials.password);
      
      // The server action will handle the redirect
      // This is just for loading state
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call server action
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: 'user' | 'staff' | 'admin'): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: ('user' | 'staff' | 'admin')[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      hasRole,
      hasAnyRole,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff',
      isUser: user?.role === 'user',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
