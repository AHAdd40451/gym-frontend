import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const protectedRoutes = ['/dashboard'];


export function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  const userCookie = request.cookies.get('auth-user')?.value;

  // Skip middleware for API routes, static files, and other non-page routes
  if (pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')) {
    return NextResponse.next();
  }


  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Protected routes that require authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Check if user is authenticated (just check if cookies exist)
  const isAuthenticated = !!(token && userCookie);
  let userRole: string | null = null;

  if (isAuthenticated && userCookie) {
    try {
      const userData = JSON.parse(userCookie);

      console.log(userData, "userDatauserDatauserData");
      userRole = userData.role;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      // Clear invalid cookies
      const response = NextResponse.next();
      response.cookies.delete('auth-token');
      response.cookies.delete('auth-user');
      return response;
    }
  }

  // If accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing public route while authenticated, redirect to appropriate dashboard
  if (isPublicRoute && isAuthenticated && pathname !== '/') {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Role-based redirects for dashboard
  if (pathname === '/dashboard' && isAuthenticated) {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Role-based access control for specific dashboard routes
  if (isProtectedRoute && isAuthenticated) {
    const roleBasedRoutes = {
      '/dashboard/admin': 'admin',
      '/dashboard/staff': 'staff',
      '/dashboard/user': 'user'
    };

    const requiredRole = roleBasedRoutes[pathname as keyof typeof roleBasedRoutes];
    if (requiredRole && userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      const dashboardUrl = getDashboardUrl(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }

  return NextResponse.next();
}

function getDashboardUrl(role: string | null): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'staff':
      return '/dashboard/staff';
    case 'user':
      return '/dashboard/user';
    default:
      return '/dashboard/user';
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};