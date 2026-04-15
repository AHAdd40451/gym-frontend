// "use client";

// import { usePathname } from "next/navigation";
// import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";

// export function ConditionalSidebar() {
//   const pathname = usePathname();

//   if (pathname === "/dashboard/social-media") {
//     return null;
//   }

//   return <AppSidebar variant="inset" />;
// }
"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";

export function ConditionalSidebar() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/social-media")) {
    return null;
  }

  return <AppSidebar variant="inset" />;
}