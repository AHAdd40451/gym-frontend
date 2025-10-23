import { NextRequest, NextResponse } from 'next/server';

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/',
    '/about',
    '/contact',
  ];

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/workouts',
    '/exercises',
    '/users',
    '/settings',
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If it's a public route and user has token, redirect to dashboard
  if (isPublicRoute && token && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Helper function to check if user is authenticated
export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('authToken')?.value;
  return !!token;
}

// Helper function to get user token
export function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get('authToken')?.value || null;
}

// Helper function to get user from token (you might want to verify the token here)
export async function getUserFromToken(token: string) {
  try {
    // Here you would typically verify the JWT token with your backend
    // For now, we'll just return a basic user object
    // In a real app, you'd decode the JWT and fetch user data from your API
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user from token:', error);
    return null;
  }
}
