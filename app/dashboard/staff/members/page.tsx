
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { getAllUsers, User } from "@/lib/api/services/getstaff/staff";

const MembersPage = () => {
  const [token, setToken] = useState<string>("");
  const [tokenReady, setTokenReady] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken =
        localStorage.getItem("token") || localStorage.getItem("authToken") || "";
      setToken(storedToken);
      setTokenReady(true);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!tokenReady || !token) return;
      setLoading(true);
      try {
        const res = await getAllUsers({ page: 1, limit: 200, role: "user" }, token);
        const list = (res as any)?.users || (res as any)?.data || [];
        setUsers(Array.isArray(list) ? list : []);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to load members");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [tokenReady, token]);

  if (!tokenReady) return <p className="text-center mt-10">Loading members...</p>;
  if (!token)
    return (
      <p className="text-center mt-10 text-red-500">
        Missing auth token. Please log in.
      </p>
    );

  if (loading) return <p className="text-center mt-10">Loading members...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-5">
 
      {users.length === 0 ? (
        <p className="text-center mt-10 text-muted-foreground">
          No members found.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => {
            const email = u.email || "-";
            const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
            const userName = fullName || (email.includes("@") ? email.split("@")[0] : "Unknown User");

            return (
              <Card
                key={u._id}
                onClick={() => router.push(`/dashboard/staff/members/${u._id}`)}
                className="cursor-pointer hover:shadow-lg transition"
              >
                <CardContent className="pt-6 pb-8 flex flex-col items-center space-y-4">
                  <Avatar className="size-20">
                    <AvatarFallback>{userName[0]}</AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
                      {userName || "Member"} <Badge>{u.status || "Active"}</Badge>
                    </h5>

                    <div className="flex items-center justify-center gap-2 text-sm mt-2 text-muted-foreground">
                      <Mail className="size-4" /> {email}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      <strong>Role:</strong> {u.role || "Member"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MembersPage;
