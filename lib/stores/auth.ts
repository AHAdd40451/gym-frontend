"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterData } from '../types/models';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: 'user' | 'staff' | 'admin' | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string, refreshToken?: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (userData: Partial<User>) => void;
  hasRole: (role: 'user' | 'staff' | 'admin') => boolean;
  hasAnyRole: (roles: ('user' | 'staff' | 'admin')[]) => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isUser: () => boolean;
  initializeAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      role: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          // This will be handled by the auth service/hooks
          // The actual API call will be made in the component using TanStack Query
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Login failed' 
          });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          // This will be handled by the auth service/hooks
          // The actual API call will be made in the component using TanStack Query
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Registration failed' 
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      },

      setUser: (user: User) => {
        console.log('setUser called with:', user);
        set({ 
          user, 
          isAuthenticated: true,
          role: user.role as 'user' | 'staff' | 'admin',
          error: null 
        });
        
        // Store user in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-user', JSON.stringify(user));
          console.log('User stored in localStorage');
        }
      },

      setToken: (token: string, refreshToken?: string) => {
        console.log('setToken called with:', token);
        set({ 
          token, 
          refreshToken: refreshToken || null,
          isAuthenticated: true 
        });
        
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          console.log('Token stored in localStorage');
        }
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          role: null,
          error: null,
        });
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('auth-user');
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      updateProfile: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ 
            user: updatedUser,
            role: updatedUser.role as 'user' | 'staff' | 'admin',
            error: null 
          });
        }
      },

      // Role-based helper functions
      hasRole: (role: 'user' | 'staff' | 'admin') => {
        const currentRole = get().role;
        return currentRole === role;
      },

      hasAnyRole: (roles: ('user' | 'staff' | 'admin')[]) => {
        const currentRole = get().role;
        return roles.includes(currentRole as 'user' | 'staff' | 'admin');
      },

      isAdmin: () => {
        return get().role === 'admin';
      },

      isStaff: () => {
        return get().role === 'staff';
      },

      isUser: () => {
        return get().role === 'user';
      },

      // Initialize auth state from localStorage
      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          const userStr = localStorage.getItem('auth-user');
          
          console.log('Initializing auth from localStorage:', { token: !!token, userStr: !!userStr });
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              console.log('Parsed user from localStorage:', user);
              set({
                token,
                user,
                isAuthenticated: true,
                role: user.role,
              });
            } catch (error) {
              console.error('Error parsing user from localStorage:', error);
              // Clear invalid data
              localStorage.removeItem('authToken');
              localStorage.removeItem('auth-user');
            }
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Zustand rehydrating state:', state);
      },
    }
  )
);

// Selectors for easier access
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const role = useAuthStore((state) => state.role);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    role,
    initializeAuth,
  };
};

export const useAuthActions = () => {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const hasRole = useAuthStore((state) => state.hasRole);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isStaff = useAuthStore((state) => state.isStaff);
  const isUser = useAuthStore((state) => state.isUser);
  
  return {
    login,
    register,
    logout,
    setUser,
    setToken,
    clearAuth,
    setLoading,
    setError,
    updateProfile,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    isUser,
  };
};

// Helper functions
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
};
