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
  CalendarIcon,
  ChevronRight,
  ClipboardCheckIcon,
  ComponentIcon,
  GaugeIcon,
  GraduationCapIcon,
  MailIcon,
  MessageSquareIcon,
  SquareCheckIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
  ClockIcon,
  DumbbellIcon,
  FileTextIcon,
  BellIcon,
  BarChart3Icon,
  SettingsIcon,
  History
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

export const staffNavItems: NavGroup[] = [
  // {
  //   title: "Staff Dashboard",
  //   items: [
  //     // {
  //     //   title: "Overview",
  //     //   href: "/dashboard/staff",
  //     //   icon: GaugeIcon
  //     // },
  //     // {
  //     //   title: "My Schedule",
  //     //   href: "/dashboard/staff/schedule",
  //     //   icon: CalendarIcon
  //     // },
  //     // {
  //     //   title: "Performance",
  //     //   href: "/dashboard/staff/performance",
  //     //   icon: BarChart3Icon
  //     // }
  //   ]
  // },
  {
    title: "Member Management",
    items: [
      {
        title: "All Members",
        href: "/dashboard/staff/members",
        icon: UsersIcon
      },
      // {
      //   title: "New Members",
      //   href: "/dashboard/staff/members/new-memebers",
      //   icon: UserIcon
      // },
      // {
      //   title: "Member Check-ins",
      //   href: "/dashboard/staff/checkins",
      //   icon: ClockIcon
      // },
      {
        title: "Diet Calendar",
        href: "/dashboard/staff/diet-calendar",
        icon: CalendarIcon
      },
    ]
  },
  {
    title: "Workout Management",
    items: [
      {
        title: "Workout Plans",
        href: "/dashboard/staff/workouts",
        icon: ActivityIcon
      },
      {
        title: "Exercise Library",
        href: "/dashboard/staff/exercises",
        icon: DumbbellIcon
      },
      {
        title: "User Workout History",
        href: "/dashboard/staff/user-workout-history",
        icon: History
      },
      {
        title: "Settings",
        href: "/dashboard/user/settings",
        icon: SettingsIcon
      }
      // {
      //   title: "Personal Training",
      //   href: "/dashboard/staff/training",
      //   icon: GraduationCapIcon
      // }
      // {
      //   title: "Group Classes",
      //   href: "/dashboard/staff/classes",
      //   icon: ComponentIcon
      // }
    ]
  },
  // {
  //   title: "Scheduling",
  //   items: [
  //     {
  //       title: "My Schedule",
  //       href: "/dashboard/staff/schedule",
  //       icon: CalendarIcon
  //     },
  //     //  {
  //     //   title: "Attendence",
  //     //   href: "/dashboard/staff/attendence",
  //     //   icon: CalendarIcon
  //     // },
  //     {
  //       title: "Book Sessions",
  //       href: "/dashboard/staff/booking",
  //       icon: ClockIcon
  //     },
  //     {
  //       title: "Availability",
  //       href: "/dashboard/staff/availability",
  //       icon: CalendarIcon
  //     }
  //   ]
  // },
  // {
  //   title: "Communication",
  //   items: [
  //     {
  //       title: "Messages",
  //       href: "/dashboard/staff/messages",
  //       icon: MessageSquareIcon
  //     },
  //     {
  //       title: "Notifications",
  //       href: "/dashboard/staff/notifications",
  //       icon: BellIcon
  //     },
  //     {
  //       title: "Announcements",
  //       href: "/dashboard/staff/announcements",
  //       icon: FileTextIcon
  //     }
  //   ]
  // }
];

export function StaffNavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <>
      {staffNavItems.map((nav) => (
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
