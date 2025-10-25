import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'staff' | 'admin';
  profileImage?: string;
  isAuthenticated: boolean;
}

export interface AuthToken {
  userId: string;
  email: string;
  role: 'user' | 'staff' | 'admin';
  iat: number;
  exp: number;
}

// Server-side auth utilities
export async function getServerAuth(): Promise<{ user: AuthUser | null; token: string | null; isAuthenticated: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userCookie = cookieStore.get('auth-user')?.value;
    
    if (!token || !userCookie) {
      return { user: null, token: null, isAuthenticated: false };
    }

    // Parse user data from cookie (no JWT decoding needed!)
    const userData = JSON.parse(userCookie);
    
    const user: AuthUser = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      profileImage: userData.profileImage,
      isAuthenticated: true,
    };
    
    return { user, token, isAuthenticated: true };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return { user: null, token: null, isAuthenticated: false };
  }
}

// Fetch user data from your backend API
async function fetchUserFromAPI(token: string): Promise<AuthUser | null> {
  try {
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiBaseUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || data;
  } catch (error) {
    console.error('Failed to fetch user from API:', error);
    return null;
  }
}

// Create JWT token
export function createAuthToken(user: AuthUser): string {
  const payload: AuthToken = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  };

  return jwt.sign(payload, JWT_SECRET);
}

// Set auth data (user + token) in cookies
export async function setAuthData(user: any, token: string) {
  const cookieStore = await cookies();
  
  // Store user data
  cookieStore.set('auth-user', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  
  // Store token
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// Clear auth cookies
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  cookieStore.delete('auth-user');
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const { user } = await getServerAuth();
  return !!user;
}

// Get user role
export async function getUserRole(): Promise<'user' | 'staff' | 'admin' | null> {
  const { user } = await getServerAuth();
  return user?.role || null;
}

// Check if user has specific role
export async function hasRole(role: 'user' | 'staff' | 'admin'): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

// Check if user has any of the specified roles
export async function hasAnyRole(roles: ('user' | 'staff' | 'admin')[]): Promise<boolean> {
  const userRole = await getUserRole();
  return roles.includes(userRole as any);
}
