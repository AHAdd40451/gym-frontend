"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BellIcon,
  Building2Icon,
  ChartColumnBigIcon,
  ClipboardListIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldCheckIcon,
  WalletCardsIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const superAdminNavItems = [
  {
    title: "Super Admin",
    items: [
      { title: "Overview", href: "/dashboard/super-admin", icon: LayoutDashboardIcon },
      { title: "Gyms", href: "/dashboard/super-admin/gyms", icon: Building2Icon },
      { title: "Onboarding", href: "/dashboard/super-admin/onboarding", icon: ClipboardListIcon },
      { title: "Subscriptions", href: "/dashboard/super-admin/subscriptions", icon: WalletCardsIcon },
      { title: "Payments", href: "/dashboard/super-admin/payments", icon: CreditCardIcon },
      { title: "Plans", href: "/dashboard/super-admin/plans", icon: ShieldCheckIcon },
      { title: "Messages", href: "/dashboard/super-admin/messages", icon: MessageSquareIcon },
      { title: "Notifications", href: "/dashboard/super-admin/notifications", icon: BellIcon },
      { title: "Analytics", href: "/dashboard/super-admin/analytics", icon: ChartColumnBigIcon },
      { title: "Audit Logs", href: "/dashboard/super-admin/audit-logs", icon: ClipboardListIcon },
      { title: "Settings", href: "/dashboard/super-admin/settings", icon: SettingsIcon },
    ],
  },
];

export function SuperAdminNavMain() {
  const pathname = usePathname();

  return (
    <>
      {superAdminNavItems.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
