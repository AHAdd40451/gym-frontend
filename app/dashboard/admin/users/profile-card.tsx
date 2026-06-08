"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { usersApi } from "@/lib/api/services/users/users";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gym-api.moduleminds.ltd/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const getProfileImageUrl = (user: any) => {
  const image =
    user?.profileImage ||
    user?.avatar ||
    user?.image ||
    user?.photo;

  if (!image) return "";

  if (image.startsWith("http")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_ORIGIN}${image}`;
  }

  return `${API_ORIGIN}/${image}`;
};

const getAvatarFallback = (user: any) => {
  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  return initials || user?.email?.[0]?.toUpperCase() || "U";
};

const BookingUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await usersApi.getAll({
          limit: 100,
        });

        console.log("users", res);

        const list = res?.data?.data?.users || [];
        setUsers(list);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (id: string) => {
    router.push(`/dashboard/admin/users/detail/${id}`);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {users?.length > 0 ? (
        users.map((user) => {
          const profileImageUrl = getProfileImageUrl(user);
          const avatarFallback = getAvatarFallback(user);

          return (
            <Card
              key={user._id}
              onClick={() => handleUserClick(user._id)}
              className="cursor-pointer hover:shadow-lg transition"
            >
              <CardContent className="pt-6 pb-8 flex flex-col items-center space-y-4">
                <Avatar className="size-20">
                  <AvatarImage
                    key={profileImageUrl}
                    src={profileImageUrl || undefined}
                    alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                    className="object-cover"
                  />

                  <AvatarFallback>
                    {avatarFallback}
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
          );
        })
      ) : (
        <p className="text-center mt-10 text-muted-foreground">
          No users found.
        </p>
      )}
    </div>
  );
};

export default BookingUsers;