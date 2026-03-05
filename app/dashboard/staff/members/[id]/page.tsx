"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Dumbbell,
  Flame,
  Mail,
  MapPin,
  PhoneCall,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { usersApi } from "@/lib/api/services/users/users";
import { getUserWithSubscriptionsDetails } from "@/lib/api/services/subcription/subcription";
import { fetchUserWorkoutHistory } from "@/lib/api/services/workouts/workouts";

type UserShape = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  profileImage?: string;
  location?: { country?: string; city?: string };
};

type DetailSubscription = {
  id?: string;
  plan?: {
    name?: string;
    priceCents?: number;
    currency?: string;
  };
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  transactions?: Array<{
    id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    createdAt?: string;
    paymentMethod?: string;
  }>;
};

type WorkoutLog = {
  _id?: string;
  workoutId?: { title?: string; type?: string; difficulty?: string };
  totalDurationInMinutes?: number;
  caloriesBurned?: number;
  performedAt?: string;
  createdAt?: string;
  exercises?: Array<{ exerciseId?: { name?: string } }>;
};

const safeDate = (value?: string) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return "-";
  }
};

const safeDateTime = (value?: string) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "MMM d, yyyy - h:mm a");
  } catch {
    return "-";
  }
};

const toStatusClass = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (["active", "trialing", "paid", "succeeded"].includes(s)) {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }
  if (["pending", "past_due"].includes(s)) {
    return "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
  return "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-400";
};

const avatarFallback = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "M";
  if (parts.length === 1) return (parts[0][0] || "M").toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserShape | null>(null);
  const [subscriptions, setSubscriptions] = useState<DetailSubscription[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);

      const token =
        (typeof window !== "undefined" &&
          (localStorage.getItem("token") || localStorage.getItem("authToken"))) ||
        "";

      try {
        const [userRes, detailRes, workoutRes] = await Promise.allSettled([
          usersApi.getById(userId),
          token ? getUserWithSubscriptionsDetails(userId, token) : Promise.resolve(null),
          fetchUserWorkoutHistory(userId),
        ]);

        if (userRes.status === "fulfilled") {
          const payload = userRes.value as any;
          const candidate = payload?.data?.user || payload?.data || payload?.user || payload || null;
          setUser(candidate);
        }

        if (detailRes.status === "fulfilled" && detailRes.value) {
          const details = detailRes.value as any;
          if (details?.user) {
            setUser((prev) => ({ ...(prev || {}), ...details.user }));
          }
          setSubscriptions(Array.isArray(details?.subscriptions) ? details.subscriptions : []);
        }

        if (workoutRes.status === "fulfilled") {
          const raw = workoutRes.value as any;
          const logs =
            (Array.isArray(raw?.data) && raw.data) ||
            (Array.isArray(raw?.data?.data) && raw.data.data) ||
            (Array.isArray(raw?.workouts) && raw.workouts) ||
            [];
          setWorkoutLogs(logs);
        }

        if (userRes.status !== "fulfilled" && detailRes.status !== "fulfilled") {
          throw new Error("Unable to load member details");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load member details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const displayName = useMemo(() => {
    const f = user?.firstName || "";
    const l = user?.lastName || "";
    const full = `${f} ${l}`.trim();
    if (full) return full;
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "Member";
  }, [user]);

  const totalMinutes = useMemo(
    () => workoutLogs.reduce((sum, item) => sum + Number(item?.totalDurationInMinutes || 0), 0),
    [workoutLogs],
  );

  const totalCalories = useMemo(
    () => workoutLogs.reduce((sum, item) => sum + Number(item?.caloriesBurned || 0), 0),
    [workoutLogs],
  );

  const sortedSubscriptions = useMemo(
    () =>
      [...subscriptions].sort(
        (a, b) =>
          new Date(b?.endDate || b?.updatedAt || b?.createdAt || 0).getTime() -
          new Date(a?.endDate || a?.updatedAt || a?.createdAt || 0).getTime(),
      ),
    [subscriptions],
  );

  const allTransactions = useMemo(
    () =>
      subscriptions.flatMap((sub) =>
        (sub.transactions || []).map((tx) => ({
          id: tx.id,
          product: sub?.plan?.name || "Subscription",
          status: tx.status || "pending",
          date: safeDate(tx.createdAt),
          amount: `${tx.amount ?? 0} ${tx.currency || "USD"}`,
          paymentMethod: tx.paymentMethod || "N/A",
        })),
      ),
    [subscriptions],
  );

  const sortedWorkouts = useMemo(
    () =>
      [...workoutLogs].sort(
        (a, b) =>
          new Date(b?.performedAt || b?.createdAt || 0).getTime() -
          new Date(a?.performedAt || a?.createdAt || 0).getTime(),
      ),
    [workoutLogs],
  );

  if (loading) {
    return (
      <div className="space-y-4 p-6 md:p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-[360px] xl:col-span-1" />
          <Skeleton className="h-[360px] xl:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/staff/members")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to members
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Member Profile</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/staff/members")}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <Card>
            <CardContent className="space-y-8 pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <Avatar className="size-20">
                  <AvatarImage src={user?.profileImage || ""} alt={displayName} />
                  <AvatarFallback>{avatarFallback(displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{displayName}</h3>
                  <p className="text-muted-foreground text-sm">{(user?.role || "member").toUpperCase()}</p>
                </div>
                <Badge variant="outline" className={toStatusClass(user?.status)}>
                  {(user?.status || "active").toUpperCase()}
                </Badge>
              </div>

              <div className="bg-muted grid grid-cols-3 divide-x rounded-md border text-center *:py-3">
                <div>
                  <h5 className="text-lg font-semibold">{workoutLogs.length}</h5>
                  <div className="text-muted-foreground text-sm">Workouts</div>
                </div>
                <div>
                  <h5 className="text-lg font-semibold">{totalMinutes}</h5>
                  <div className="text-muted-foreground text-sm">Minutes</div>
                </div>
                <div>
                  <h5 className="text-lg font-semibold">{totalCalories}</h5>
                  <div className="text-muted-foreground text-sm">Calories</div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-3"><Mail className="text-muted-foreground size-4" /> {user?.email || "-"}</p>
                <p className="flex items-center gap-3"><PhoneCall className="text-muted-foreground size-4" /> {user?.phone || "-"}</p>
                <p className="flex items-center gap-3"><MapPin className="text-muted-foreground size-4" /> {[user?.location?.city, user?.location?.country].filter(Boolean).join(", ") || "-"}</p>
                <p className="flex items-center gap-3"><CalendarClock className="text-muted-foreground size-4" /> Joined {safeDate(user?.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedSubscriptions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No subscription records.</p>
              ) : (
                <div className="space-y-3">
                  {sortedSubscriptions.map((sub, idx) => (
                    <div
                      key={sub.id || `${sub?.plan?.name || "sub"}-${idx}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{sub?.plan?.name || "Plan"}</p>
                        <p className="text-muted-foreground text-sm">
                          {safeDate(sub?.startDate)} - {safeDate(sub?.endDate)}
                        </p>
                      </div>
                      <Badge variant="outline" className={toStatusClass(sub?.status)}>
                        {sub?.status || "-"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {allTransactions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No transactions found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.map((tx, idx) => (
                      <TableRow key={tx.id || `tx-${idx}`}>
                        <TableCell>{tx.product}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={toStatusClass(tx.status)}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>{tx.paymentMethod}</TableCell>
                        <TableCell className="text-right font-medium">{tx.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedWorkouts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No workout history.</p>
              ) : (
                <div className="space-y-3">
                  {sortedWorkouts.slice(0, 12).map((log, idx) => (
                    <div key={log._id || `wk-${idx}`} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{log?.workoutId?.title || "Workout"}</p>
                        <p className="text-muted-foreground text-xs">{safeDateTime(log?.performedAt || log?.createdAt)}</p>
                      </div>
                      <div className="text-muted-foreground mt-2 flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1"><Clock className="size-3.5" /> {log?.totalDurationInMinutes ?? 0} min</span>
                        <span className="flex items-center gap-1"><Flame className="size-3.5" /> {log?.caloriesBurned ?? 0} cal</span>
                        <span className="flex items-center gap-1"><Dumbbell className="size-3.5" /> {log?.exercises?.length ?? 0} exercises</span>
                        <span>{log?.workoutId?.type || "-"}</span>
                        <span>{log?.workoutId?.difficulty || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
