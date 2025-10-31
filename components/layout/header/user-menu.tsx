// import { BadgeCheck, Bell, ChevronRightIcon, CreditCard, LogOut, Sparkles } from "lucide-react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger
// } from "@/components/ui/dropdown-menu";
// import Link from "next/link";
// import * as React from "react";
// import { Progress } from "@/components/ui/progress";
// import { logoutAction } from "@/lib/api/services/auth/actions";
// import { useAuth } from "@/lib/api/services/auth/context";

// export default function UserMenu() {
//   const { user } = useAuth();
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Avatar>
//           <AvatarImage src={user?.profileImage} alt="shadcn ui kit" />
//           <AvatarFallback className="rounded-lg">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
//         </Avatar>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
//         <DropdownMenuLabel className="p-0">
//           <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//             <Avatar>
//               <AvatarImage src={`/images/avatars/01.png`} alt="shadcn ui kit" />
//               <AvatarFallback className="rounded-lg">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
//             </Avatar>
//             <div className="grid flex-1 text-left text-sm leading-tight">
//               <span className="truncate font-semibold">{user?.firstName} {user?.lastName}</span>
//               <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
//             </div>
//           </div>
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuGroup>
//           <DropdownMenuItem asChild>
//             <Link href="https://shadcnuikit.com/pricing" target="_blank">
//               <Sparkles /> Upgrade to Pro
//             </Link>
//           </DropdownMenuItem>
//         </DropdownMenuGroup>
//         <DropdownMenuGroup>
//           <DropdownMenuItem>
//             <BadgeCheck />
//             Account
//           </DropdownMenuItem>
//           <DropdownMenuItem>
//             <CreditCard />
//             Billing
//           </DropdownMenuItem>
//           <DropdownMenuItem>
//             <Bell />
//             Notifications
//           </DropdownMenuItem>
//         </DropdownMenuGroup>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem onClick={async () => await logoutAction()}>
//           <LogOut />
//           Log out
//         </DropdownMenuItem>
//         <div className="bg-muted mt-1.5 rounded-md border">
//           <div className="space-y-3 p-3">
//             <div className="flex items-center justify-between">
//               <h4 className="text-sm font-medium">Credits</h4>
//               <div className="text-muted-foreground flex cursor-pointer items-center text-sm">
//                 <span>5 left</span>
//                 <ChevronRightIcon className="ml-1 h-4 w-4" />
//               </div>
//             </div>
//             <Progress value={40} indicatorColor="bg-primary" />
//             <div className="text-muted-foreground flex items-center text-sm">
//               Daily credits used first
//             </div>
//           </div>
//         </div>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
import { BadgeCheck, Bell, ChevronRightIcon, CreditCard, LogOut, Sparkles } from "lucide-react";
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
import Link from "next/link";
import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { logoutAction } from "@/lib/api/services/auth/actions";
import { useAuth } from "@/lib/api/services/auth/context";

export default function UserMenu() {
  const { user } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={user?.profileImage} alt="user" />
          <AvatarFallback className="rounded-lg">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        {/* Profile section */}
        <DropdownMenuLabel className="p-0">
          <Link
            href={`/dashboard/user/profile/${(user as any)?._id || ""}`}
            className="hover:bg-muted flex items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm transition">
            <Avatar>
              <AvatarImage src={user?.profileImage || "/images/avatars/01.png"} alt="user" />
              <AvatarFallback className="rounded-lg">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
            </div>
          </Link>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Other Menu Items */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="https://shadcnuikit.com/pricing" target="_blank">
              <Sparkles /> Upgrade to Pro
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem onClick={async () => await logoutAction()}>
          <LogOut />
          Log out
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
