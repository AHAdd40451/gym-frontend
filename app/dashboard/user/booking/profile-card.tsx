// import React from 'react';
// import { Mail } from "lucide-react";

// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// const Page = () => {
//   // Hardcoded essential user data
//   const user = {
//     firstName: "Staff",
//     lastName: "Office",
//     email: "stafff@gmail.com",
//     role: "user",
//     status: "active",
//   };

//   return (
//     <Card className="relative">
//       <CardContent>
//         <div className="flex flex-col items-center space-y-4">
//           <Avatar className="size-20">
//             <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
//             <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
//           </Avatar>
//           <div className="text-center">
//             <h5 className="flex items-center gap-2 text-xl font-semibold">
//               {user.firstName} {user.lastName} <Badge variant="info">{user.role}</Badge>
//             </h5>
//             <div className="flex items-center gap-3 text-sm mt-2">
//               <Mail className="text-muted-foreground size-4" /> {user.email}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default Page;
"use client";
import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsersByRole } from "@/lib/api/services/getstaff/staff";

const ProfileCard = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getUsersByRole("Staff", { page: 1, limit: 5 });
        console.log("API Response:", response);

        // ✅ FIXED: correct data path based on API response
        const users = response?.data?.data?.users || [];
        setStaff(users);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch staff");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-10 text-muted-foreground">
        Loading staff...
      </div>
    );

  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  if (staff.length === 0)
    return (
      <div className="text-center mt-10 text-muted-foreground">
        No staff users found.
      </div>
    );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {staff.map((user) => (
        <Card key={user._id} className="relative">
          <CardContent className="pt-6 pb-8 flex flex-col items-center space-y-4">
            <Avatar className="size-20">
              <AvatarImage
                src={user.profileImage || undefined}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
                {user.firstName} {user.lastName}
                <Badge variant="info">{user.role}</Badge>
              </h5>
              <div className="flex items-center justify-center gap-3 text-sm mt-2 text-muted-foreground">
                <Mail className="size-4" /> {user.email}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProfileCard;
