import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and other non-page routes
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // For client-side authentication, we'll let the AuthGuard handle it
  // since middleware runs on the server and can't access localStorage
  return NextResponse.next();
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