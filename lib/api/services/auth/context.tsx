// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import type { AuthUser } from './server';

// interface AuthContextType {
//   user: AuthUser | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (credentials: { email: string; password: string }) => Promise<void>;
//   logout: () => Promise<void>;
//   hasRole: (role: 'user' | 'staff' | 'admin') => boolean;
//   hasAnyRole: (roles: ('user' | 'staff' | 'admin')[]) => boolean;
//   isAdmin: boolean;
//   isStaff: boolean;
//   isUser: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser: AuthUser | null }) {
//   const [user, setUser] = useState<AuthUser | null>(initialUser);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const isAuthenticated = !!user;

//   const login = async (credentials: { email: string; password: string }) => {
//     setIsLoading(true);
//     try {
//       // This will be handled by server actions
//       const formData = new FormData();
//       formData.append('email', credentials.email);
//       formData.append('password', credentials.password);
      
//       // The server action will handle the redirect
//       // This is just for loading state
//     } catch (error) {
//       console.error('Login failed:', error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = async () => {
//     setIsLoading(true);
//     try {
//       // Call server action
//       await fetch('/api/auth/logout', { method: 'POST' });
//       setUser(null);
//       router.push('/login');
//     } catch (error) {
//       console.error('Logout failed:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const hasRole = (role: 'user' | 'staff' | 'admin'): boolean => {
//     return user?.role === role;
//   };

//   const hasAnyRole = (roles: ('user' | 'staff' | 'admin')[]): boolean => {
//     return user ? roles.includes(user.role) : false;
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       isAuthenticated,
//       isLoading,
//       login,
//       logout,
//       hasRole,
//       hasAnyRole,
//       isAdmin: user?.role === 'admin',
//       isStaff: user?.role === 'staff',
//       isUser: user?.role === 'user',
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import type { AuthUser } from './server';

// interface AuthContextType {
//   user: AuthUser | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (credentials: { email: string; password: string }) => Promise<void>;
//   logout: () => Promise<void>;
//   hasRole: (role: 'user' | 'staff' | 'admin') => boolean;
//   hasAnyRole: (roles: ('user' | 'staff' | 'admin')[]) => boolean;
//   isAdmin: boolean;
//   isStaff: boolean;
//   isUser: boolean;

//   // ✅ added this line
//   setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({
//   children,
//   initialUser,
// }: {
//   children: React.ReactNode;
//   initialUser: AuthUser | null;
// }) {
//   const [user, setUser] = useState<AuthUser | null>(initialUser);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const isAuthenticated = !!user;

//   const login = async (credentials: { email: string; password: string }) => {
//     setIsLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('email', credentials.email);
//       formData.append('password', credentials.password);
//     } catch (error) {
//       console.error('Login failed:', error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = async () => {
//     setIsLoading(true);
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' });
//       setUser(null);
//       router.push('/login');
//     } catch (error) {
//       console.error('Logout failed:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const hasRole = (role: 'user' | 'staff' | 'admin'): boolean => {
//     return user?.role === role;
//   };

//   const hasAnyRole = (roles: ('user' | 'staff' | 'admin')[]): boolean => {
//     return user ? roles.includes(user.role) : false;
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated,
//         isLoading,
//         login,
//         logout,
//         hasRole,
//         hasAnyRole,
//         isAdmin: user?.role === 'admin',
//         isStaff: user?.role === 'staff',
//         isUser: user?.role === 'user',
//         setUser, // ✅ added here
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


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
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user;

  // ✅ 1️⃣ Restore user from localStorage on first load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) setUser(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to restore user from localStorage', err);
    }
  }, []);

  // ✅ 2️⃣ Sync user to localStorage whenever it changes (without loop)
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // ✅ 3️⃣ Listen for user switch / auth changes (no infinite loop)
  useEffect(() => {
    const handleChange = () => {
      const stored = localStorage.getItem('currentUser');
      if (stored) setUser(JSON.parse(stored));
      else setUser(null);
    };

    // Listen to both cross-tab and same-tab custom events
    window.addEventListener('auth-changed', handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener('auth-changed', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  // ✅ Login
  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();

      setUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-changed')); // trigger sync
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new Event('auth-changed'));
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: 'user' | 'staff' | 'admin'): boolean =>
    user?.role === role;

  const hasAnyRole = (roles: ('user' | 'staff' | 'admin')[]): boolean =>
    user ? roles.includes(user.role) : false;

  return (
    <AuthContext.Provider
      value={{
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
        setUser,
      }}
    >
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
