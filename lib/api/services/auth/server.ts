import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'staff' | 'admin';
  staffType?: 'trainer' | 'operator' | null;
  isSuperAdmin?: boolean;
  gymId?: string | null;
  hasSeenAdminWelcome?: boolean;
  profileImage?: string;
  isAuthenticated: boolean;
}

export interface AuthToken {
  userId: string;
  email: string;
  role: 'user' | 'staff' | 'admin';
  staffType?: 'trainer' | 'operator' | null;
  isSuperAdmin?: boolean;
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
      _id: userData._id || userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: userData.name,
      avatar: userData.avatar,
      role: userData.role,
      staffType: userData.staffType || null,
      isSuperAdmin: Boolean(userData.isSuperAdmin),
      gymId: userData.gymId || null,
      hasSeenAdminWelcome: Boolean(userData.hasSeenAdminWelcome),
      profileImage: userData.profileImage,
      isAuthenticated: true,
    };
    
    return { user, token, isAuthenticated: true };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return { user: null, token: null, isAuthenticated: false };
  }
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

export async function isSuperAdminUser(): Promise<boolean> {
  const { user } = await getServerAuth();
  return Boolean(user?.isSuperAdmin);
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
