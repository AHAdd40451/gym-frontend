"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { Subscription, getAllSubscriptions } from "@/lib/api/services/subcription/subcription";

const MembersPage = () => {
  const [token, setToken] = useState<string>("");
  const [tokenReady, setTokenReady] = useState<boolean>(false);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token") || localStorage.getItem("authToken") || "";
      setToken(storedToken);
      setTokenReady(true);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!tokenReady || !token) return;
      setLoading(true);
      try {
        const res = await getAllSubscriptions({ page: 1, limit: 200 }, token);
        const list =
          (res as any)?.data?.data || (res as any)?.data || (res as any)?.subscriptions || [];
        setSubs(Array.isArray(list) ? list : []);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [tokenReady, token]);

  if (!tokenReady) return <p className="mt-10 text-center">Loading members...</p>;
  if (!token)
    return <p className="mt-10 text-center text-red-500">Missing auth token. Please log in.</p>;

  if (loading) return <p className="mt-10 text-center">Loading members...</p>;
  if (error) return <p className="mt-10 text-center text-red-500">{error}</p>;

  return (
    <div className="p-5">
      {subs.length === 0 ? (
        <p className="text-muted-foreground mt-10 text-center">No members found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subs.map((sub) => {
            const userObj = typeof sub.user === "object" ? sub.user : undefined;
            const userId =
              userObj?._id ||
              (typeof sub.user === "string" ? sub.user : "") ||
              (sub as any)?.id ||
              "";
            const email = userObj?.email || "-";
            const userName =
              userObj?.name ||
              (sub as any)?.firstName ||
              (email && email.includes("@") ? email.split("@")[0] : "") ||
              "Unknown User";
            const planObj = typeof sub.plan === "object" ? sub.plan : undefined;
            const planName = planObj?.name || (sub as any)?.planName || String(sub.plan || "Plan");
            const periodStart = (sub as any)?.currentPeriodStart || (sub as any)?.startDate;
            const periodEnd = (sub as any)?.currentPeriodEnd || (sub as any)?.endDate;
            const periodLabel =
              periodStart && periodEnd
                ? `${new Date(periodStart).toLocaleDateString()} → ${new Date(periodEnd).toLocaleDateString()}`
                : "Period unknown";

            return (
              // <Card
              //   key={sub._id}
              //   onClick={() => userId && router.push(`/dashboard/staff/members/${userId}`)}
              //   className="cursor-pointer hover:shadow-lg transition"
              // >
              <Card key={sub._id || userId || (sub as any)?.id || `sub-${subs.indexOf(sub)}`} className="cursor-pointer transition hover:shadow-lg">
                <CardContent className="flex flex-col items-center space-y-4 pt-6 pb-8">
                  <Avatar className="size-20">
                    <AvatarFallback>{userName[0]}</AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
                      {userName || "Member"} <Badge>{sub.status || "active"}</Badge>
                    </h5>

                    <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
                      <Mail className="size-4" /> {email}
                    </div>

                    <p className="text-muted-foreground mt-2 text-sm">
                      <strong>Plan:</strong> {planName}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">{periodLabel}</p>
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
