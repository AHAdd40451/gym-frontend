// import { Link2Icon, Mail, MapPin, PhoneCall } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// interface ProfileCardProps {
//   user: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     role: string;
//     status: string;
//   };
// }

// export function ProfileCard({ user }: ProfileCardProps) {
//   return (
//     <Card className="relative">
//       <CardContent>
//         <div className="space-y-12">
//           {/* Avatar + Name */}
//           <div className="flex flex-col items-center space-y-4">
//             <Avatar className="size-20">
//               <AvatarImage src={`/images/avatars/10.png`} alt={user.firstName} />
//               <AvatarFallback>
//                 {user.firstName?.[0]}
//                 {user.lastName?.[0]}
//               </AvatarFallback>
//             </Avatar>

//             <div className="text-center">
//               <h5 className="flex items-center gap-2 text-xl font-semibold capitalize">
//                 {user.firstName} {user.lastName}
//                 {user.status === "active" && <Badge variant="info">Active</Badge>}
//               </h5>

//               <div className="text-muted-foreground text-sm capitalize">
//                 {user.role}
//               </div>
//             </div>
//           </div>

//           {/* Static stats (abhi dummy) */}
//           <div className="bg-muted grid grid-cols-3 divide-x rounded-md border text-center *:py-3">
//             <div>
//               <h5 className="text-lg font-semibold">184</h5>
//               <div className="text-muted-foreground text-sm">Post</div>
//             </div>
//             <div>
//               <h5 className="text-lg font-semibold">32</h5>
//               <div className="text-muted-foreground text-sm">Projects</div>
//             </div>
//             <div>
//               <h5 className="text-lg font-semibold">4.5K</h5>
//               <div className="text-muted-foreground text-sm">Members</div>
//             </div>
//           </div>

//           {/* Contact info */}
//           <div className="flex flex-col gap-y-4">
//             <div className="flex items-center gap-3 text-sm">
//               <Mail className="text-muted-foreground size-4" />
//               {user.email}
//             </div>

//             <div className="flex items-center gap-3 text-sm">
//               <PhoneCall className="text-muted-foreground size-4" />
// (123) 456 789            </div>

//             <div className="flex items-center gap-3 text-sm">
//               <MapPin className="text-muted-foreground size-4" />
//              USA
//             </div>

//             <div className="flex items-center gap-3 text-sm">
//               <Link2Icon className="text-muted-foreground size-4" />
//               <span className="text-muted-foreground">https://shadcnuikit.com</span>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import {
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileCardProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    status?: string;
    phone?: string;
    profileImage?: string;
    isSuperAdmin?: boolean;
    gymId?: string;
    location?: {
      country?: string;
      city?: string;
    };
    createdAt?: string;
    lastLogin?: string;
  };
}

const getFullName = (user: ProfileCardProps["user"]) => {
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User";
};

const getInitials = (user: ProfileCardProps["user"]) => {
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";

  return `${first}${last}`.toUpperCase() || "?";
};

const getRoleLabel = (user: ProfileCardProps["user"]) => {
  if (user.isSuperAdmin) return "Super Admin";
  if (user.role === "admin") return "Admin";
  if (user.role === "staff") return "Staff";
  return "Member";
};

const getRoleBadgeClass = (user: ProfileCardProps["user"]) => {
  if (user.isSuperAdmin) {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }

  if (user.role === "admin") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (user.role === "staff") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

const getRoleIcon = (user: ProfileCardProps["user"]) => {
  if (user.isSuperAdmin) return <ShieldCheck className="size-3.5" />;
  if (user.role === "admin") return <UserCog className="size-3.5" />;

  return <Users className="size-3.5" />;
};

const formatDate = (date?: string) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export function ProfileCard({ user }: ProfileCardProps) {
  const location =
    user.location?.city || user.location?.country
      ? `${user.location?.city || ""}${
          user.location?.city && user.location?.country ? ", " : ""
        }${user.location?.country || ""}`
      : "No location added";

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="size-20">
              {user.profileImage ? (
                <AvatarImage src={user.profileImage} alt={getFullName(user)} />
              ) : null}

              <AvatarFallback>{getInitials(user)}</AvatarFallback>
            </Avatar>

            <div className="text-center">
              <h5 className="text-xl font-semibold capitalize">
                {getFullName(user)}
              </h5>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1.5 capitalize ${getRoleBadgeClass(
                    user
                  )}`}
                >
                  {getRoleIcon(user)}
                  {getRoleLabel(user)}
                </Badge>

                <Badge
                  variant={user.status === "active" ? "info" : "secondary"}
                  className="capitalize"
                >
                  {user.status || "unknown"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-muted/40 p-4 text-center">
            <h5 className="text-sm font-semibold">Account Type</h5>

            <p className="mt-1 text-sm text-muted-foreground">
              {user.isSuperAdmin
                ? "This user is the gym owner and can create admins and staff."
                : user.role === "admin"
                  ? "This user is an admin and can manage gym operations."
                  : user.role === "staff"
                    ? "This user is a staff member under this gym."
                    : "This user is a gym member/customer."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-4 text-center">
            <div>
              <h5 className="text-sm font-semibold">Joined</h5>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(user.createdAt)}
              </p>
            </div>

            <div>
              <h5 className="text-sm font-semibold">Last Login</h5>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(user.lastLogin)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-muted-foreground size-4" />
              <span className="break-all">{user.email || "No email"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <PhoneCall className="text-muted-foreground size-4" />
              {user.phone || "No phone number"}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="text-muted-foreground size-4" />
              {location}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}