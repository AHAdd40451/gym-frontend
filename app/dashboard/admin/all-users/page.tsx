// import React from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { ArrowRight, Mail } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { getServerAuth } from "@/lib/api/services/auth/server";
// import { getAllUsers } from "@/lib/api/services/users/users";
// import Link from "next/link";

// const UsersPage = async () => {
//   // 🔐 Get secure token on server
//   const { token } = await getServerAuth();

//   const res = await getAllUsers({}, token || "");

//   const users = res?.data?.data?.users || [];

//   return (
//     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
//       {users.length > 0 ? (
//         users.map((u: any) => (
//           <Card key={u._id} className="hover:shadow-lg transition">
//             <CardContent className="pt-6 pb-6 flex flex-col items-center space-y-4">
//               {/* Avatar */}
//               <Avatar className="size-20">
//                 <AvatarFallback>{u.firstName?.[0] || "?"}</AvatarFallback>
//               </Avatar>

//               <div className="text-center">
//                 <h5 className="text-xl font-semibold">
//                   {u.firstName} {u.lastName}
//                 </h5>

//                 {/* Email */}
//                 <div className="flex items-center justify-center gap-2 text-sm mt-2 text-muted-foreground">
//                   <Mail className="size-4" /> {u.email}
//                 </div>

//                 {/* View Details Button */}
//                 <Button variant="outline" size="sm" className="mt-3" asChild>
//                   <Link href={`/dashboard/admin/all-users/${u._id}`}>
//                     View Details <ArrowRight className="size-4" />
//                   </Link>
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))
//       ) : (
//         <p className="text-center mt-10 text-muted-foreground">
//           No users found.
//         </p>
//       )}
//     </div>
//   );
// };

// export default UsersPage;

import React from "react";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { getAllUsers } from "@/lib/api/services/users/users";
import UsersListClient from "./users-list-client";

const UsersPage = async () => {
  // 🔐 Get secure token on server
  const { token } = await getServerAuth();

  const res = await getAllUsers({}, token || "");

  const allUsers = res?.data?.data?.users || [];
  const users = allUsers.filter((u: any) => u.role === "user");

  return <UsersListClient users={users} />;
};

export default UsersPage;