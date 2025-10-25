"use client";

import { useAuth } from '../auth/context';
import { AdminNavMain } from './admin-nav';
import { StaffNavMain } from './staff-nav';
import { UserNavMain } from './user-nav';
import { Loader2 } from 'lucide-react';

export function RoleBasedNavMain() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  switch (user?.role) {
    case 'admin':
      return <AdminNavMain />;
    case 'staff':
      return <StaffNavMain />;
    case 'user':
      return <UserNavMain />;
    default:
      return <UserNavMain />; // Default to user navigation
  }
}
