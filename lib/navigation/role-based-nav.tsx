"use client";

import { useAuth } from '../api/services/auth/context';
import { AdminNavMain } from './admin-nav';
import { SuperAdminNavMain } from './super-admin-nav';
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
      if ((user as any)?.isSuperAdmin) {
        return <SuperAdminNavMain />;
      }
      return <AdminNavMain user={user}/>;
    case 'staff':
      if ((user as any)?.staffType === 'operator') {
        return <AdminNavMain user={user} />;
      }
      return <StaffNavMain user={user}/>;
    case 'user':
      return <UserNavMain user={user}/>;
    default:
      return <UserNavMain user={user}/>; // Default to user navigation
  }
}
