
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { useSubscribedUsers } from "@/lib/api/services/subcription/subcription";

const MembersPage = () => {
  const [token, setToken] = useState<string>("");
  const router = useRouter();
  const { data, loading, error, refetch } = useSubscribedUsers(token);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token") || "");
    }
  }, []);

  

  if (loading) return <p className="text-center mt-10">Loading members...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-5">
 
      {data.length === 0 ? (
        <p className="text-center mt-10 text-muted-foreground">
          No subscribed users found.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((sub) => {
            const email = sub.user?.email || "-";
            // fallback: username or email prefix
            const userName =
              (sub.user as any)?.username ||
              (email.includes("@") ? email.split("@")[0] : "Unknown User");

            const planName = sub.plan?.name || "Unnamed Plan";
            const startDate = sub.startDate
              ? new Date(sub.startDate).toLocaleDateString()
              : "-";
            const endDate = sub.currentPeriodEnd
              ? new Date(sub.currentPeriodEnd).toLocaleDateString()
              : "-";

            return (
              <Card
                key={sub._id}
               
                className="cursor-pointer hover:shadow-lg transition"
              >
                <CardContent className="pt-6 pb-8 flex flex-col items-center space-y-4">
                  <Avatar className="size-20">
                    <AvatarFallback>{userName[0]}</AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
                      {userName} <Badge>{sub.status}</Badge>
                    </h5>

                    <div className="flex items-center justify-center gap-2 text-sm mt-2 text-muted-foreground">
                      <Mail className="size-4" /> {email}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      <strong>Plan:</strong> {planName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Start:</strong> {startDate} <br />
                      <strong>End:</strong> {endDate}
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
