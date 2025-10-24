'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/stores/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'staff' | 'admin';
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  requiredRole, 
  fallback = <DefaultFallback />
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state on mount
  useEffect(() => {
    console.log('AuthGuard: Initializing auth state');
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    console.log('AuthGuard: Auth state changed', {
      isAuthenticated,
      isLoading,
      user: user?.email,
      role: user?.role,
      requiredRole
    });

    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('AuthGuard: Not authenticated, redirecting to login');
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // If role is required and user doesn't have it
    if (requiredRole && user?.role !== requiredRole) {
      console.log(`AuthGuard: User role ${user?.role} doesn't match required role ${requiredRole}`);
      // Redirect to appropriate dashboard based on user role
      const dashboardUrl = getDashboardUrl(user?.role);
      router.push(dashboardUrl);
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, pathname]);


  // If role is required and user doesn't have it
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const dashboardUrl = getDashboardUrl(user?.role);
    router.push(dashboardUrl);
    return;
  }
  // Show loading while checking authentication
  if (isLoading) {
    return fallback;
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  // If role is required and user doesn't have it, don't render children
  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

function DefaultFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function getDashboardUrl(role?: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'staff':
      return '/dashboard/staff';
    case 'user':
      return '/dashboard/user';
    default:
      return '/login';
  }
}

// Higher-order component for role-based protection
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'user' | 'staff' | 'admin'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard requiredRole={requiredRole}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
