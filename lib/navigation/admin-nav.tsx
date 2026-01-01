"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ActivityIcon,
  BadgeDollarSignIcon,
  Building2Icon,
  CalendarIcon,
  ChartBarDecreasingIcon,
  ChartPieIcon,
  ChevronRight,
  ClipboardCheckIcon,
  ComponentIcon,
  CreditCardIcon,
  FingerprintIcon,
  FolderIcon,
  GaugeIcon,
  GraduationCapIcon,
  KeyIcon,
  MailIcon,
  MessageSquareIcon,
  ProportionsIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SquareCheckIcon,
  SquareKanbanIcon,
  StickyNoteIcon,
  UserIcon,
  UsersIcon,
  WalletMinimalIcon,
  type LucideIcon,
  GithubIcon,
  RedoDotIcon,
  BrushCleaningIcon,
  SpeechIcon,
  MessageSquareHeartIcon,
  BookAIcon,
  ShieldIcon,
  DatabaseIcon,
  BarChart3Icon,
  FileTextIcon,
  BellIcon,
  Plane,
  Podcast
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

export const adminNavItems: NavGroup[] = [
  {
    title: "Admin Dashboard",
    items: [
      // {
      //   title: "Overview",
      //   href: "/dashboard/admin",
      //   icon: ChartPieIcon
      // },
       {
        title: "Overview",
        href: "/dashboard/admin/ecommerce",
        icon: ChartPieIcon
      },
      // {
      //   title: "Analytics",
      //   href: "/dashboard/admin/analytics",
      //   icon: BarChart3Icon
      // },
      // {
      //   title: "Product",
      //   href: "/dashboard/admin/product",
      //   icon: BarChart3Icon
      // },
      {
        title: "Product-list",
        href: "/dashboard/admin/product-list",
        icon: BarChart3Icon
      },
      {
        title: "Orders",
        href: "/dashboard/admin/orders",
        icon: BarChart3Icon
      },
      {
        title: "category",
        href: "/dashboard/admin/category",
        icon: BarChart3Icon
      },
      {
        title: "sub-category",
        href: "/dashboard/admin/sub-category",
        icon: BarChart3Icon
      },
     
      // {
      //   title: "Contact",
      //   href: "/dashboard/admin/contact",
      //   icon: ActivityIcon
      // },
      {
        title: "All Subcriptions",
        href: "/dashboard/admin/all-sub",
        icon: Podcast
      }
    ]
  },
  {
    title: "User Management",
    items: [
      {
        title: "All Users",
        href: "/dashboard/admin/all-users",
        icon: UsersIcon
      },
      {
        title: "Staff Management",
        href: "/dashboard/admin/staff",
        icon: UserIcon
      },
      // {
      //   title: "User Roles",
      //   href: "/dashboard/admin/roles",
      //   icon: ShieldIcon
      // },
      {
        title: "Permissions",
        href: "/dashboard/admin/permissions",
        icon: KeyIcon
      }
    ]
  },
  // {
  //   title: "Gym Management",
  //   items: [
  //     {
  //       title: "Workouts",
  //       href: "/dashboard/admin/workouts",
  //       icon: ActivityIcon
  //     },
  //     {
  //       title: "Exercises",
  //       href: "/dashboard/admin/exercises",
  //       icon: SquareCheckIcon
  //     },
  //     {
  //       title: "Equipment",
  //       href: "/dashboard/admin/equipment",
  //       icon: ComponentIcon
  //     },
  //     {
  //       title: "Schedules",
  //       href: "/dashboard/admin/schedules",
  //       icon: CalendarIcon
  //     }
  //   ]
  // },
  // {
  //   title: "Content Management",
  //   items: [
  //     {
  //       title: "Blog Posts",
  //       href: "/dashboard/admin/blog",
  //       icon: FileTextIcon
  //     },
  //     {
  //       title: "Notifications",
  //       href: "/dashboard/admin/notifications",
  //       icon: BellIcon
  //     },
  //     {
  //       title: "Email Templates",
  //       href: "/dashboard/admin/email-templates",
  //       icon: MailIcon
  //     }
  //   ]
  // },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/dashboard/admin/settings",
        icon: SettingsIcon
      },
      // {
      //   title: "Database",
      //   href: "/dashboard/admin/database",
      //   icon: DatabaseIcon
      // },
      // {
      //   title: "Logs",
      //   href: "/dashboard/admin/logs",
      //   icon: FileTextIcon
      // }
      // {
      //   title: "Backup",
      //   href: "/dashboard/admin/backup",
      //   icon: DatabaseIcon
      // }
    ]
  }
];

export function AdminNavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <>
      {adminNavItems.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => (
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
                            className="min-w-48 rounded-lg">
                            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                            {item.items?.map((item) => (
                              <DropdownMenuItem
                                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                asChild
                                key={item.title}>
                                <a href={item.href}>{item.title}</a>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Collapsible className="group/collapsible block group-data-[collapsible=icon]:hidden">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                            tooltip={item.title}>
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
                                  asChild>
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
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      asChild>
                      <Link href={item.href} target={item.newTab ? "_blank" : ""}>
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
