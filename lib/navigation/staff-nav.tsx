"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ActivityIcon,
  BellIcon,
  CalendarIcon,
  ChevronRight,
  ClipboardCheckIcon,
  DumbbellIcon,
  MessageSquareIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type NavGroup = {
  title: string;
  items: NavItem;
};

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: NavItem;
}[];

const trainerNavItems: NavGroup[] = [
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/dashboard/staff/messages",
        icon: MessageSquareIcon
      },
      {
        title: "Notifications",
        href: "/dashboard/staff/notifications",
        icon: BellIcon
      }
    ]
  },
  {
    title: "Trainer Tools",
    items: [
      {
        title: "My Members",
        href: "/dashboard/staff/members",
        icon: UsersIcon
      },
      {
        title: "Diet Calendar",
        href: "/dashboard/staff/diet-calendar",
        icon: CalendarIcon
      },
      {
        title: "Workout Plans",
        href: "/dashboard/staff/workouts",
        icon: ActivityIcon
      },
      {
        title: "Exercise Library",
        href: "/dashboard/staff/exercises",
        icon: DumbbellIcon
      }
    ]
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/dashboard/staff/profile",
        icon: UserIcon
      }
    ]
  }
];

const operatorNavItems: NavGroup[] = [
  {
    title: "Operations",
    items: [
      {
        title: "All Members",
        href: "/dashboard/staff/members",
        icon: UsersIcon
      },
      {
        title: "Check-ins",
        href: "/dashboard/staff/checkins",
        icon: ClipboardCheckIcon
      }
    ]
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/dashboard/staff/messages",
        icon: MessageSquareIcon
      },
      {
        title: "Notifications",
        href: "/dashboard/staff/notifications",
        icon: BellIcon
      }
    ]
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/dashboard/staff/profile",
        icon: UserIcon
      }
    ]
  }
];

export function StaffNavMain({ user }: any) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const staffId = (user as { _id?: string } | null)?._id ?? user?.id;
  const profileHref = staffId ? `/dashboard/staff/profile/${staffId}` : "/dashboard/staff/profile";
  const isProfileRoute = pathname?.startsWith("/dashboard/staff/profile");
  const isTrainer = user?.staffType !== "operator";
  const navItems = isTrainer ? trainerNavItems : operatorNavItems;

  return (
    <>
      {navItems.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => {
                const resolvedHref = item.title === "Profile" ? profileHref : item.href;
                const isActive = item.title === "Profile" ? !!isProfileRoute : pathname === item.href;

                return (
                  <SidebarMenuItem key={item.title}>
                    {Array.isArray(item.items) && item.items.length > 0 ? (
                      <>
                        <div className="hidden group-data-[collapsible=icon]:block">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuButton tooltip={item.title}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side={isMobile ? "bottom" : "right"}
                              align={isMobile ? "end" : "start"}
                              className="min-w-48 rounded-lg"
                            >
                              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                              {item.items?.map((subItem) => (
                                <DropdownMenuItem
                                  className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                  asChild
                                  key={subItem.title}
                                >
                                  <a href={subItem.href}>{subItem.title}</a>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Collapsible className="group/collapsible block group-data-[collapsible=icon]:hidden">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                              tooltip={item.title}
                            >
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item?.items?.map((subItem, key) => (
                                <SidebarMenuSubItem key={key}>
                                  <SidebarMenuSubButton
                                    className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                    isActive={pathname === subItem.href}
                                    asChild
                                  >
                                    <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    ) : (
                      <SidebarMenuButton
                        className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                        isActive={isActive}
                        tooltip={item.title}
                        asChild
                      >
                        <Link href={resolvedHref} target={item.newTab ? "_blank" : ""}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                    {!!item.isComing && (
                      <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                        Coming
                      </SidebarMenuBadge>
                    )}
                    {!!item.isNew && (
                      <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                        New
                      </SidebarMenuBadge>
                    )}
                    {!!item.isDataBadge && (
                      <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                        {item.isDataBadge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
