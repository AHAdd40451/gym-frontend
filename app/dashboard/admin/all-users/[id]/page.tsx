"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";  // <-- Add this import
import { getAllUsers } from "@/lib/api/services/users/users";

interface UserType {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role?: string;
  createdAt?: string;
}

const UserDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await getAllUsers({}, token);

        const list = res?.data?.data?.users || [];
        const found = list.find((x: any) => x._id === id);
        setUser(found || null);
      } catch (err) {
        console.error("User fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) return <p className="mt-10 text-center">Loading...</p>;
  if (!user) return <p className="mt-10 text-center text-red-500">User not found</p>;

  return (
    <div className="mt-10 flex justify-center px-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 pt-4 pb-8">

          {/* Back Button (Same as Contact Page) */}
          <div className="mb-2 self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </div>

          {/* Avatar */}
          <Avatar className="size-24">
            <AvatarFallback>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <h5 className="text-xl font-semibold">
            {user.firstName} {user.lastName}
          </h5>

          {/* Email */}
          <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
            <Mail className="size-4" /> {user.email}
          </div>

          {/* Role */}
          <p className="text-sm mt-2">
            Role: <strong>{user.role}</strong>
          </p>

          {/* Created Date */}
          {user.createdAt && (
            <p className="text-sm text-muted-foreground">
              Joined: {user.createdAt.slice(0, 10)}
            </p>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailPage;
