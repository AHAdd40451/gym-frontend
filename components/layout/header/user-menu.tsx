// import {
//   BadgeCheck,
//   Bell,
//   ChevronRightIcon,
//   CreditCard,
//   LogOut,
//   Sparkles,
//   Users,
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import Link from "next/link";
// import * as React from "react";
// import { Progress } from "@/components/ui/progress";
// import { logoutAction } from "@/lib/api/services/auth/actions";
// import { useAuth } from "@/lib/api/services/auth/context";

// export default function UserMenu() {
//   const { user, setUser } = useAuth(); 
//   const [accounts, setAccounts] = React.useState<any[]>([]);

//   React.useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
//     setAccounts(saved);
//   }, []);

//   const handleSwitch = (acc: any) => {
//     localStorage.setItem("currentUser", JSON.stringify(acc));
//     setUser(acc); 
//     window.location.reload(); 
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Avatar>
//           <AvatarImage src={user?.profileImage} alt="user" />
//           <AvatarFallback className="rounded-lg">
//             {user?.firstName?.[0]}
//             {user?.lastName?.[0]}
//           </AvatarFallback>
//         </Avatar>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
//         align="end"
//       >
//         <DropdownMenuLabel className="p-0">
//           <Link
//             href={`/dashboard/user/profile/${(user as any)?._id || ""}`}
//             className="hover:bg-muted flex items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm transition"
//           >
//             <Avatar>
//               <AvatarImage
//                 src={user?.profileImage || "/images/avatars/01.png"}
//                 alt="user"
//               />
//               <AvatarFallback className="rounded-lg">
//                 {user?.firstName?.[0]}
//                 {user?.lastName?.[0]}
//               </AvatarFallback>
//             </Avatar>
//             <div className="grid flex-1 text-left text-sm leading-tight">
//               <span className="truncate font-semibold">
//                 {user?.firstName} {user?.lastName}
//               </span>
//               <span className="text-muted-foreground truncate text-xs">
//                 {user?.email}
//               </span>
//             </div>
//           </Link>
//         </DropdownMenuLabel>

//         <DropdownMenuSeparator />

//         {accounts.length > 1 && (
//           <>
//             <DropdownMenuLabel className="text-xs text-muted-foreground">
//               Switch Account
//             </DropdownMenuLabel>
//             <DropdownMenuGroup>
//               {accounts.map(
//                 (acc) =>
//                   acc.email !== user?.email && (
//                     <DropdownMenuItem
//                       key={acc.email}
//                       onClick={() => handleSwitch(acc)}
//                       className="cursor-pointer"
//                     >
//                       <Avatar className="mr-2 size-6">
//                         <AvatarImage src={acc.profileImage} />
//                         <AvatarFallback>
//                           {acc.firstName?.[0]}
//                           {acc.lastName?.[0]}
//                         </AvatarFallback>
//                       </Avatar>
//                       <span className="text-sm">
//                         {acc.firstName} {acc.lastName}
//                       </span>
//                     </DropdownMenuItem>
//                   )
//               )}
//             </DropdownMenuGroup>
//             <DropdownMenuSeparator />
//           </>
//         )}

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

//         {/* Logout */}
//         <DropdownMenuItem onClick={async () => await logoutAction()}>
//           <LogOut />
//           Log out
//         </DropdownMenuItem>

//         {/* Credits */}
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
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { logoutAction } from "@/lib/api/services/auth/actions";
import { useAuth } from "@/lib/api/services/auth/context";

export default function UserMenu() {
  const { user, setUser } = useAuth(); 
  const [accounts, setAccounts] = React.useState<any[]>([]);

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("accounts") || "[]");
    setAccounts(saved);
  }, []);

  const handleSwitch = (acc: any) => {
    // ⭐ Step 1: localStorage update karein
    localStorage.setItem("currentUser", JSON.stringify(acc));
    
    // ⭐ Step 2: State directly update (instant UI update)
    setUser(acc);
    
    // ⭐ Step 3: Event dispatch (context ko notify karein)
    window.dispatchEvent(new Event('auth-changed'));
    
    // ⭐ RELOAD KI ZARURAT NAHI! Context automatically sync ho jayega
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user?.profileImage} alt="user" />
          <AvatarFallback className="rounded-lg">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
        align="end"
      >
        <DropdownMenuLabel className="p-0">
          <Link
            href={`/dashboard/user/profile/${(user as any)?._id || ""}`}
            className="hover:bg-muted flex items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm transition"
          >
            <Avatar>
              <AvatarImage
                src={user?.profileImage || "/images/avatars/01.png"}
                alt="user"
              />
              <AvatarFallback className="rounded-lg">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {user?.email}
              </span>
            </div>
          </Link>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {accounts.length > 1 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Account
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {accounts.map(
                (acc) =>
                  acc.email !== user?.email && (
                    <DropdownMenuItem
                      key={acc.email}
                      onClick={() => handleSwitch(acc)}
                      className="cursor-pointer"
                    >
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
                  )
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

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
                <ChevronRight className="ml-1 h-4 w-4" />
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