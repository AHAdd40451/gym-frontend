
// "use client";

// import React from "react";
// import { Mail } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";

// /* ================= TYPES ================= */

// interface Plan {
//   name: string;
//   description?: string;
//   priceCents?: number;
//   currency?: string;
//   billingInterval?: string;
// }

// interface Subscription {
//   status?: "active" | "pending" | "cancelled";
//   plan: Plan;
//   startDate?: string;
//   endDate?: string;
// }

// interface User {
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: string;
//   status: string;
// }

// /* ✅ PROPS DEFINED */
// interface Props {
//   user: User;
//   subscriptions?: Subscription[];
// }

// /* ================= COMPONENT ================= */

// export function UserDetailCard({ user, subscriptions = [] }: Props) {
//   const displayName = `${user.firstName} ${user.lastName}`;
//   const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;

//   return (
//     <Card className="w-full">
//       <CardContent className="grid grid-cols-2 gap-8 pt-6 pb-8">
        
//         {/* ================= LEFT SECTION: USER DETAILS ================= */}
//         <div className="flex flex-col items-center space-y-4">
//           <Avatar className="size-24">
//             <AvatarFallback>{initials}</AvatarFallback>
//           </Avatar>
          
//           <div className="text-center">
//             <h5 className="text-xl font-semibold">{displayName}</h5>
//             <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
//               <Mail className="size-4" />
//               {user.email}
//             </div>
//           </div>

//           <div className="w-full space-y-2">
//             <Badge variant="info" className="w-full justify-center py-1">
//               {user.role}
//             </Badge>
//             <Badge variant="success" className="w-full justify-center py-1">
//               {user.status}
//             </Badge>
//           </div>

         
//         </div>

//         {/* ================= RIGHT SECTION: SUBSCRIPTIONS ================= */}
//         <div className="flex flex-col">
//           <h6 className="mb-4 text-sm font-semibold">Subscriptions</h6>

//           {subscriptions.length > 0 ? (
//             <div className="space-y-3 overflow-y-auto max-h-96">
//               {subscriptions.map((sub: Subscription, index: number) => (
//                 <div key={index} className="rounded-md border p-3 text-sm">
//                   <p className="font-medium">{sub.plan.name}</p>

//                   {sub.plan.description && (
//                     <p className="text-muted-foreground text-xs mt-1">
//                       {sub.plan.description}
//                     </p>
//                   )}

//                   {sub.plan.priceCents && sub.plan.currency && sub.plan.billingInterval && (
//                     <p className="mt-1 text-xs">
//                       💲 {(sub.plan.priceCents / 100).toFixed(2)} {sub.plan.currency} / {sub.plan.billingInterval}
//                     </p>
//                   )}

//                   {sub.startDate && (
//                     <p className="text-muted-foreground mt-1 text-xs">
//                       🗓 Start: {new Date(sub.startDate).toLocaleDateString()}
//                     </p>
//                   )}

//                   {sub.endDate && (
//                     <p className="text-muted-foreground text-xs">
//                       🗓 End: {new Date(sub.endDate).toLocaleDateString()}
//                     </p>
//                   )}

//                   <Badge
//                     variant={
//                       sub.status === "active"
//                         ? "success"
//                         : sub.status === "pending"
//                           ? "warning"
//                           : "destructive"
//                     }
//                     className="mt-2">
//                     {sub.status}
//                   </Badge>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-muted-foreground text-center text-sm">No subscriptions</p>
//           )}
//         </div>

//       </CardContent>
//     </Card>
//   );
// }

"use client";

import React from "react";
// Lucide icons
import { Mail, Phone, MapPin, Link as LinkIcon, Clock } from "lucide-react"; 
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Connections } from "@/app/dashboard/(auth)/pages/profile/connections";
import { CompleteYourProfileCard } from "@/app/dashboard/(auth)/pages/profile/complete-your-profile";
import { AboutMe } from "@/components/dashboard/Profile/about-me";

/* ================= TYPES (UNCHANGED) ================= */

interface Plan {
  name: string;
  description?: string;
  priceCents?: number;
  currency?: string;
  billingInterval?: string;
}

interface Subscription {
  status?: "active" | "pending" | "cancelled";
  plan: Plan;
  startDate?: string; // e.g., "2025-12-13T00:00:00.000Z"
  endDate?: string; // e.g., "2026-01-13T00:00:00.000Z"
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  userId: string; 
  authenticated: boolean; 
  phone: string;
  location: string;
  website: string;
}

/* ✅ PROPS DEFINED */
interface Props {
  user: User;
  subscriptions?: Subscription[]; // Ab yeh single item ko bhi handle karega
}

/* ================= COMPONENT (SUBSCRIPTION SECTION UPDATED) ================= */

export function UserDetailCard({ user, subscriptions = [] }: Props) {
  const displayName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;

  // Helper function to format date (dd/mm/yyyy)
  const formatDate = (dateString: string | undefined): string => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
      }).replace(/\//g, '/'); // 13/12/2025 format
  };

  return (
    <Card className="w-full">
      <CardContent className="grid grid-cols-2 gap-8 pt-6 pb-8">
        
        {/* ================= LEFT SECTION: USER DETAILS (UNCHANGED) ================= */}
        <div className="flex flex-col items-center space-y-4">
          {/* ... (Previous Left Section code remains here) ... */}

           {/* <Avatar className="size-24">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar> */}
          <img className="size-24" src="/images/avatars/10.png" alt="" />
          <div className="text-center">
            <h5 className="text-xl font-semibold">{displayName}</h5>
            <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
               <span className="text-sm text-blue-500 border border-blue-500 rounded px-1 py-0.5 ml-2">user</span> 
            </div>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          </div>
          
          <div className="flex w-full justify-around space-x-2 border-b pb-4">
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg w-1/3">
              <span className="text-xl font-bold">87665</span>
              <span className="text-xs text-muted-foreground">User ID</span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg w-1/3">
              <span className="text-xl font-bold uppercase">{user.role}</span>
              <span className="text-xs text-muted-foreground">Role</span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg w-1/3">
              <span className={`text-xl font-bold ${user.authenticated ? 'text-green-600' : 'text-red-600'}`}>
                {user.authenticated ? "True" : "False"}
              </span>
              <span className="text-xs text-muted-foreground">Authenticated</span>
            </div>
          </div>
          
          <div className="w-full space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Mail className="size-4 text-gray-500" />
              <span>{user.email}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Phone className="size-4 text-gray-500" />
              <span>0+ 873545324598</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <MapPin className="size-4 text-gray-500" />
              <span>Paris</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <LinkIcon className="size-4 text-gray-500" />
              <a href={`http://${user.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                example.com
              </a>
            </div>
            {/* <CompleteYourProfileCard/> */}
            <AboutMe/>
          </div>
        </div>

        {/* ================= RIGHT SECTION: SUBSCRIPTIONS (UPDATED) ================= */}
        <div className="flex flex-col">
          <h6 className="mb-4 text-lg font-semibold">Latest Activity</h6> {/* Title update */}

          {subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.map((sub: Subscription, index: number) => (
                <div key={index} className="rounded-md border p-4">
                    
                    {/* Plan Name */}
                    <div className="flex items-center gap-3">
                        <Clock className="size-5 text-gray-500" />
                        <p className="text-base font-medium">{sub.plan.name}</p>
                    </div>

                    {/* Date Range */}
                    {(sub.startDate || sub.endDate) && (
                        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm ml-8"> 
                            {formatDate(sub.startDate)} 
                            <span className="mx-1">→</span> 
                            {formatDate(sub.endDate)}
                        </div>
                    )}

                    {/* Status Badge (Black background, white text) */}
                    {sub.status && (
                        <Badge 
                            className="mt-3 ml-8 bg-black hover:bg-black text-white px-3 py-1 text-xs font-normal rounded-sm uppercase"
                        >
                            {sub.status}
                        </Badge>
                    )}
                </div>
                
              ))}
            <Connections/>
            </div>
          ) : (
            <p className="text-muted-foreground text-center text-sm p-4 border rounded-md">No recent activity or subscriptions</p>
          )}
        </div>

      </CardContent>
    </Card>
  );
}