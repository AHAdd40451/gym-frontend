// import { Mail, MapPin, PhoneCall, Link2Icon } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { getServerAuth } from "@/lib/api/services/auth/server";

// export async function ProfileCard() {
//   // 👇 Fetch user from server-side cookies
//   const { user } = await getServerAuth();

//   if (!user) {
//     return (
//       <Card className="p-6 text-center">
//         <p className="text-muted-foreground">Please log in to view your profile.</p>
//       </Card>
//     );
//   }

//   return (
//     <Card className="relative">
//       <CardContent>
//         <div className="space-y-12">
//           {/* Avatar + Name */}
//           <div className="flex flex-col items-center space-y-4">
//             <Avatar className="size-20">
//               <AvatarImage
//                 src={user.profileImage || `/images/avatars/10.png`}
//                 alt={`${user.firstName} ${user.lastName}`}
//               />
//               <AvatarFallback>
//                 {user.firstName?.[0]?.toUpperCase() || "U"}
//               </AvatarFallback>
//             </Avatar>
//             <div className="text-center">
//               <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
//                 {user.firstName} {user.lastName}
//                 <Badge variant="info">{user.role}</Badge>
//               </h5>
//               <div className="text-muted-foreground text-sm">{user.email}</div>
//             </div>
//           </div>

//            <div className="bg-muted grid grid-cols-3 divide-x rounded-md border text-center *:py-3">
//             <div>
//               <h5 className="text-lg font-semibold">
//                 {user.id?.slice(0, 4) || "----"}
//               </h5>
//               <div className="text-muted-foreground text-sm"> User id</div>
//             </div>
//             <div>
//               <h5 className="text-lg font-semibold">{user.role}</h5>
//               <div className="text-muted-foreground text-sm">Role</div>
//             </div>
//             <div>
//               <h5 className="text-lg font-semibold">True</h5>
//               <div className="text-muted-foreground text-sm">Authenticated</div>
//             </div>
//           </div>

//           {/* Contact Info (Static Examples) */}
//           <div className="flex flex-col gap-y-4">
//             <div className="flex items-center gap-3 text-sm">
//               <Mail className="text-muted-foreground size-4" /> {user.email}
//             </div>
//             <div className="flex items-center gap-3 text-sm">
//               <PhoneCall className="text-muted-foreground size-4" /> (+1) 555-1234
//             </div>
//             <div className="flex items-center gap-3 text-sm">
//               <MapPin className="text-muted-foreground size-4" /> USA
//             </div>
//             <div className="flex items-center gap-3 text-sm">
//               <Link2Icon className="text-muted-foreground size-4" />
//               <a
//                 href="https://example.com"
//                 className="hover:text-primary hover:underline"
//                 target="_blank"
//               >
//                 example.com
//               </a>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
'use client';

import { Mail, MapPin, PhoneCall, Link2Icon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/api/services/auth/context"; // 👈 import from your AuthContext

export function ProfileCard() {
  const { user, isAuthenticated } = useAuth(); // 👈 get from context

  if (!user || !isAuthenticated) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardContent>
        <div className="space-y-12">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="size-20">
              <AvatarImage
                src={user.profileImage || `/images/avatars/10.png`}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback>
                {user.firstName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
                {user.firstName} {user.lastName}
                <Badge variant="info">{user.role}</Badge>
              </h5>
              <div className="text-muted-foreground text-sm">{user.email}</div>
            </div>
          </div>

          <div className="bg-muted grid grid-cols-3 divide-x rounded-md border text-center *:py-3">
            <div>
              <h5 className="text-lg font-semibold">
                {user.id?.slice(0, 4) || "----"}
              </h5>
              <div className="text-muted-foreground text-sm">User ID</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">{user.role}</h5>
              <div className="text-muted-foreground text-sm">Role</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">True</h5>
              <div className="text-muted-foreground text-sm">Authenticated</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-muted-foreground size-4" /> {user.email}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <PhoneCall className="text-muted-foreground size-4" /> (+1) 555-1234
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="text-muted-foreground size-4" /> USA
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link2Icon className="text-muted-foreground size-4" />
              <a
                href="https://example.com"
                className="hover:text-primary hover:underline"
                target="_blank"
              >
                example.com
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
