'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/api/services/auth/context';

export function LogoutButton() {
  const { logout, isLoading } = useAuth();

  return (
    <Button 
      variant="outline" 
      onClick={logout}
      disabled={isLoading}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
