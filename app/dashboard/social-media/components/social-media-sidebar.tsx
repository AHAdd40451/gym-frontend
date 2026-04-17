"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CreditCard,
  Globe,
  HelpCircle,
  Home,
  ListTodo,
  MenuIcon,
  Search,
  Settings,
  SettingsIcon,
  User,
  Users,
  X
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect } from "react";

import { CreatePostDialog } from "./create-post-dialog";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: <Home />, label: "Home" },
  { icon: <User />, label: "Profile" },
];

export function SocialMediaSidebar() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const SidebarContent = () => {
    return (
      <>

        <nav className="flex-1 space-y-1">

          {navItems.map((item) => (
            <Link
              key={item.label}
              href={
                item.label === "Profile"
                  ? "/dashboard/social-media/settings"
                  : "/dashboard/social-media"
              }
            >
              <Button
                variant="ghost"
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${item.active
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <Badge className="h-5 min-w-5 rounded-full px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
        </nav>
      </>
    );
  };

  if (isMobile)
    return (
      <Card className="bg-muted flex-1 py-4">
        <CardHeader className="flex items-center gap-3 px-4">

          <div className="text-sm">
            {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
          </div>
          <div className="text-muted-foreground text-xs">
            {user ? user.email : ""}
          </div>
          <div className="ms-auto flex">

            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent className="p-4">
                <div className="flex-1">
                  <SidebarContent />
                </div>
                <CreatePostDialog />
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
      </Card>
    );

  return (
    <aside className="flex flex-col gap-4">
      <Card className="bg-muted flex-1">
        <CardHeader className="flex items-center gap-3">

          <div>
            <div className="text-sm">
              {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
            </div>
            <div className="text-muted-foreground text-xs">
              {user ? user.email : ""}
            </div>
          </div>
          <Button size="icon" variant="ghost" className="ms-auto">
            <SettingsIcon />
          </Button>
        </CardHeader>

        <CardContent>
          <SidebarContent />
          <CreatePostDialog />
        </CardContent>
      </Card>

      {/* <ProBanner /> */}
    </aside>
  );
}

