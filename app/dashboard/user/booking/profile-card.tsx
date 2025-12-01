"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { getUsersByRole } from "@/lib/api/services/getstaff/staff";

const BookingUsers = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await getUsersByRole("staff", { page: 1, limit: 5 }, token);

        // 👇 FIXED: access users safely from nested structure
        const users = res?.data?.data?.users || res?.data?.users || [];

        setStaff(users);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Failed to fetch staff");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleUserClick = (id: string) => {
    router.push(`/dashboard/user/booking/${id}`);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {staff?.length > 0 ? (
        staff.map((user) => (
          <Card
            key={user._id}
            onClick={() => handleUserClick(user._id)}
            className="cursor-pointer hover:shadow-lg transition"
          >
            <CardContent className="pt-6 pb-8 flex flex-col items-center space-y-4">
              <Avatar className="size-20">
                <AvatarImage src={user.profileImage || undefined} />
                <AvatarFallback>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
                  {user.firstName} {user.lastName}
                  <Badge>{user.role}</Badge>
                </h5>

                <div className="flex items-center justify-center gap-2 text-sm mt-2 text-muted-foreground">
                  <Mail className="size-4" /> {user.email}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center mt-10 text-muted-foreground">
          No staff users found.
        </p>
      )}
    </div>
  );
};

export default BookingUsers;
