import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { LogOut, Sparkles, BadgeCheck, CreditCard, Bell, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { logoutAction } from "@/lib/api/services/auth/actions";

export default function UserMenu() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Current logged-in user
    const storedUser = localStorage.getItem("auth-user");
    if (storedUser) setAuthUser(JSON.parse(storedUser));

    // All saved accounts
    const savedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    setAccounts(savedAccounts);
  }, []);

  const handleSwitch = (acc: any) => {
    localStorage.setItem("auth-user", JSON.stringify(acc));
    setAuthUser(acc);
    window.location.reload(); // ya state update se bhi ho sakta
  };

  if (!authUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={authUser.profileImage || "/images/avatars/01.png"} alt="user" />
          <AvatarFallback className="rounded-lg">
            {authUser.firstName?.[0]}
            {authUser.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        {/* Profile */}
        <DropdownMenuLabel className="p-0">
          <Link
            href={`/dashboard/user/profile`}
            className="hover:bg-muted flex items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm transition">
            <Avatar>
              <AvatarImage src={authUser.profileImage || "/images/avatars/01.png"} alt="user" />
              <AvatarFallback className="rounded-lg">
                {authUser.firstName?.[0]}
                {authUser.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {authUser.firstName} {authUser.lastName}
              </span>
              <span className="text-muted-foreground truncate text-xs">{authUser.email}</span>
            </div>
          </Link>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Switch Account */}
        {accounts.length > 1 && (
          <>
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Switch Account
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {accounts
                .filter((acc) => acc.email !== authUser.email) // current user exclude
                .map((acc) => (
                  <DropdownMenuItem
                    key={acc.email}
                    onClick={() => handleSwitch(acc)}
                    className="cursor-pointer">
                    <Avatar className="mr-2 size-6">
                      <AvatarImage src={acc.profileImage} />
                      <AvatarFallback>
                        {acc.firstName?.[0]}
                        {acc.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {acc.firstName} {acc.lastName}
                    </span>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Links */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="https://shadcnuikit.com/pricing" target="_blank">
              <Sparkles /> Upgrade to Pro
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck /> Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard /> Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell /> Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        {/* <DropdownMenuItem onClick={async () => await logoutAction()}>
          <LogOut /> Log out
        </DropdownMenuItem> */}

        {/* Logout */}
        <DropdownMenuItem
          onClick={async () => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("auth-user");
            // localStorage.removeItem("accounts"); // optional

            await logoutAction();
          }}
          className="cursor-pointer">
          <LogOut /> Log out
        </DropdownMenuItem>

        {/* Credits */}
        <div className="bg-muted mt-1.5 rounded-md border">
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Credits</h4>
              <div className="text-muted-foreground flex cursor-pointer items-center text-sm">
                <span>5 left</span>
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </div>
            </div>
            <Progress value={40} indicatorColor="bg-primary" />
            <div className="text-muted-foreground flex items-center text-sm">
              Daily credits used first
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
