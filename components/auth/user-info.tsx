'use client';

import { useAuthClient } from '@/lib/auth/use-auth-client';
import { LogoutButton } from './logout-button';
import { User, Mail, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';

export function UserInfo() {
  const { user, isAuthenticated, isAdmin, isStaff, isUser } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleBadge = () => {
    if (isAdmin) return <Badge variant="destructive">Admin</Badge>;
    if (isStaff) return <Badge variant="secondary">Staff</Badge>;
    if (isUser) return <Badge variant="outline">Member</Badge>;
    return null;
  };

  const getRoleIcon = () => {
    if (isAdmin) return <Shield className="h-4 w-4" />;
    if (isStaff) return <Shield className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <Avatar>
        <AvatarImage src={user.profileImage} />
        <AvatarFallback>
          {user.firstName?.[0]}{user.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">
            {user.firstName} {user.lastName}
          </p>
          {getRoleBadge()}
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="truncate">{user.email}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {getRoleIcon()}
        <LogoutButton />
      </div>
    </div>
  );
}
