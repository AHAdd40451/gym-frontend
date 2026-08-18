"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { BellIcon, CreditCardIcon, LogOutIcon, UserCircle2Icon } from "lucide-react";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { logoutAction } from "@/lib/api/services/auth/actions";
import { useAuth } from "@/lib/api/services/auth/context";
import Link from "next/link";

type AuthUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  avatar?: string;
  name?: string;
  role?: string;
  _id?: string;
  id?: string;
};

const DEFAULT_AVATAR = "/images/avatars/01.png";

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("currentUser") || localStorage.getItem("auth-user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user: contextUser } = useAuth();
  const [localUser, setLocalUser] = useState<AuthUser | null>(() => getStoredUser());

  const authUser = contextUser ?? localUser;

  useEffect(() => {
    if (contextUser) setLocalUser(contextUser as AuthUser);
  }, [contextUser]);

  useEffect(() => {
    const onUserUpdated = () => setLocalUser(getStoredUser());
    window.addEventListener("userUpdated", onUserUpdated);
    window.addEventListener("auth-changed", onUserUpdated);
    return () => {
      window.removeEventListener("userUpdated", onUserUpdated);
      window.removeEventListener("auth-changed", onUserUpdated);
    };
  }, []);

  const displayName = useMemo(() => {
    if (!authUser) return "";
    const fullName = `${authUser.firstName ?? ""} ${authUser.lastName ?? ""}`.trim();
    return fullName || authUser.name || "User";
  }, [authUser]);

  const email = authUser?.email ?? "Not provided";
  const avatar = authUser?.profileImage || authUser?.avatar || DEFAULT_AVATAR;
  const initials = useMemo(() => {
    if (!authUser) return "NA";
    const first = authUser.firstName?.[0] || authUser.name?.[0] || "U";
    const last = authUser.lastName?.[0] || "";
    return `${first}${last}`;
  }, [authUser]);

  const getProfileUrl = () => {
    const role = authUser?.role;
    switch (role) {
      case "admin":
        return "/dashboard/admin/profile";
      case "staff": {
        const staffId = authUser?._id ?? authUser?.id;
        return staffId
          ? `/dashboard/staff/profile/${staffId}`
          : "/dashboard/staff/profile";
      }
      case "user":
      default:
        return "/dashboard/user/profile";
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("auth-user");
    localStorage.removeItem("currentUser");
    await logoutAction();
  };

  if (!authUser) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="rounded-full">
                <AvatarImage src={avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">{email}</span>
              </div>
              <DotsVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={getProfileUrl()} className="cursor-pointer">
                  <UserCircle2Icon />
                  Account
                </Link>
              </DropdownMenuItem>
        
             
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
