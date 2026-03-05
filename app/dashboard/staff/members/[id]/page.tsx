"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  Clock,
  CreditCard,
  Dumbbell,
  Flame,
  Mail,
  MapPin,
  Phone,
  UserRound,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  dateOfBirth?: string;
  language?: string;
  bio?: string;
  profileImage?: string;
  preferences?: {
    units?: { weight?: string; height?: string; distance?: string };
  };
  activeTrainer?: { trainer?: string; startDate?: string; endDate?: string };
  location?: { country?: string; city?: string };
};

type DetailSubscription = {
  id?: string;
  plan?: {
    name?: string;
    description?: string;
    priceCents?: number;
    currency?: string;
    durationMonths?: number;
  };
  status?: string;
  startDate?: string;
  currentPeriodStart?: string;
  endDate?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  transactions?: Array<{
    id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    createdAt?: string;
    paymentMethod?: string;
    description?: string;
  }>;
};

type WorkoutLog = {
  _id?: string;
  workoutId?: { title?: string; type?: string; difficulty?: string };
  totalDurationInMinutes?: number;
  caloriesBurned?: number;
  performedAt?: string;
  createdAt?: string;
  exercises?: Array<{
    exerciseId?: { name?: string };
    setsCount?: number;
    repsCount?: number;
  }>;
};

const safeDate = (value?: string) => {
  if (!value) return "—";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
};

const safeDateTime = (value?: string) => {
  if (!value) return "—";
  try {
    return format(parseISO(value), "MMM d, yyyy · h:mm a");
  } catch {
    return "—";
  }
};

const statusTone = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "succeeded") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-400";
  if (s === "pending") return "bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-400";
  if (s === "canceled" || s === "failed") return "bg-rose-500/15 text-rose-700 border-rose-500/40 dark:text-rose-400";
  return "bg-muted text-muted-foreground border-border";
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
          const candidate =
            payload?.data?.user ||
            payload?.data ||
            payload?.user ||
            payload ||
            null;
          setUser(candidate);
        }

        if (detailRes.status === "fulfilled" && detailRes.value) {
          const details = detailRes.value as any;
          const detailsUser = details?.user || null;
          if (detailsUser) {
            setUser((prev) => ({ ...(prev || {}), ...detailsUser }));
          }
          const subData = Array.isArray(details?.subscriptions) ? details.subscriptions : [];
          setSubscriptions(subData);
        }

        if (workoutRes.status === "fulfilled") {
          const raw = workoutRes.value as any;
          const data =
            (Array.isArray(raw?.data) && raw.data) ||
            (Array.isArray(raw?.data?.data) && raw.data.data) ||
            (Array.isArray(raw?.workouts) && raw.workouts) ||
            [];
          setWorkoutLogs(data);
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

  const totalCalories = useMemo(
    () => workoutLogs.reduce((sum, item) => sum + Number(item?.caloriesBurned || 0), 0),
    [workoutLogs],
  );

  const totalMinutes = useMemo(
    () => workoutLogs.reduce((sum, item) => sum + Number(item?.totalDurationInMinutes || 0), 0),
    [workoutLogs],
  );

  const allTransactions = useMemo(
    () =>
      subscriptions.flatMap((sub) =>
        (sub.transactions || []).map((tx) => ({
          ...tx,
          planName: sub?.plan?.name || "Plan",
        })),
      ),
    [subscriptions],
  );

  const latestWorkout = useMemo(() => {
    if (!workoutLogs.length) return null;
    return [...workoutLogs]
      .sort((a, b) => {
        const da = new Date(a?.performedAt || a?.createdAt || 0).getTime();
        const db = new Date(b?.performedAt || b?.createdAt || 0).getTime();
        return db - da;
      })[0];
  }, [workoutLogs]);

  const activeSubscription = useMemo(
    () =>
      subscriptions.find((sub) =>
        ["active", "trialing", "pending"].includes((sub?.status || "").toLowerCase()),
      ) || subscriptions[0],
    [subscriptions],
  );

  if (loading) {
    return (
      <div className="min-h-screen space-y-8 p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-1" />
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/staff/members")}>
          <ArrowLeft className="size-4 mr-2" />
          Back to members
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 p-6 md:p-8">
      {/* Back + Profile header */}
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/dashboard/staff/members")}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to members
        </Button>

        <Card className="overflow-hidden border border-border/80 shadow-sm">
          <div className="bg-linear-to-br from-muted/50 via-muted/30 to-background p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-5">
                <Avatar className="size-20 border-4 border-background shadow-md sm:size-24">
                  <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                    {displayName[0]?.toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Member profile
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{displayName}</h1>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">{user?.email || "—"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="outline" className={statusTone(user?.status)}>
                      {(user?.status || "active").toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {(user?._id || user?.id || userId).slice(0, 8)}…
                    </Badge>
                    <Badge variant="outline">{(user?.role || "user").toUpperCase()}</Badge>
                  </div>
                </div>
              </div>
              {latestWorkout && (
                <Card className="w-full sm:w-auto border border-border/80 bg-background/90 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground">Latest workout</p>
                    <p className="mt-1 font-semibold">{latestWorkout?.workoutId?.title || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {safeDateTime(latestWorkout?.performedAt || latestWorkout?.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Stats strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-border/80 shadow-sm overflow-hidden">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total workouts</p>
              <p className="text-2xl font-semibold tabular-nums">{workoutLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/80 shadow-sm overflow-hidden">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/15">
              <Clock className="size-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Minutes trained</p>
              <p className="text-2xl font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                {totalMinutes}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/80 shadow-sm overflow-hidden">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
              <Flame className="size-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Calories burned</p>
              <p className="text-2xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                {totalCalories}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Member info card */}
        <Card className="border border-border/80 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact & info</CardTitle>
            <CardDescription>Member details and active plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="size-4 shrink-0 text-muted-foreground/80" />
                <span>{user?.email || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="size-4 shrink-0 text-muted-foreground/80" />
                <span>{user?.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <UserRound className="size-4 shrink-0 text-muted-foreground/80" />
                <span>{(user?.role || "user").toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <CalendarClock className="size-4 shrink-0 text-muted-foreground/80" />
                <span>Joined {safeDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-muted-foreground/80" />
                <span>
                  {[user?.location?.city, user?.location?.country].filter(Boolean).join(", ") || "—"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <CalendarClock className="size-4 shrink-0 text-muted-foreground/80" />
                <span>DOB {safeDate(user?.dateOfBirth)}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <UserRound className="size-4 shrink-0 text-muted-foreground/80" />
                <span>Language {user?.language || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="size-4 shrink-0 text-muted-foreground/80" />
                <span>Updated {safeDateTime(user?.updatedAt)}</span>
              </div>
            </div>
            {user?.bio ? (
              <div className="rounded-xl border border-border/80 bg-background/70 p-3 text-sm text-muted-foreground">
                {user.bio}
              </div>
            ) : null}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Active plan
              </p>
              <p className="mt-1 font-semibold">{activeSubscription?.plan?.name || "No active plan"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {safeDate(activeSubscription?.startDate)} – {safeDate(activeSubscription?.endDate)}
              </p>
              <Badge className={`mt-2 border ${statusTone(activeSubscription?.status)}`}>
                {activeSubscription?.status || "—"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions list */}
        <Card className="border border-border/80 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Subscriptions</CardTitle>
            <CardDescription>Plan history and status</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No subscription records.</p>
            ) : (
              <ul className="space-y-3">
                {subscriptions.map((sub, idx) => (
                  <li
                    key={`${sub?.plan?.name || "plan"}-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">{sub?.plan?.name || "Plan"}</p>
                      <p className="text-sm text-muted-foreground">
                        {safeDate(sub?.startDate)} – {safeDate(sub?.endDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">Updated {safeDateTime(sub?.updatedAt || sub?.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className={statusTone(sub?.status)}>
                      {sub?.status || "—"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Transactions */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="size-4" />
              Payments & transactions
            </CardTitle>
            <CardDescription>Payment history for this member</CardDescription>
          </CardHeader>
          <CardContent>
            {allTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No transactions.</p>
            ) : (
              <ul className="space-y-3">
                {allTransactions.map((tx: any, idx) => (
                  <li
                    key={`tx-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{tx.planName}</p>
                      <p className="text-sm text-muted-foreground">
                        {safeDateTime(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {tx.amount ?? 0} {tx.currency || "USD"}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.paymentMethod || "N/A"}</p>
                      <Badge variant="outline" className={`mt-1 border ${statusTone(tx.status)}`}>
                        {tx.status || "—"}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Workout history */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="size-4" />
              Workout history
            </CardTitle>
            <CardDescription>Recent sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {workoutLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No workout history.</p>
            ) : (
              <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {workoutLogs.map((log, idx) => (
                  <li
                    key={log?._id || `wk-${idx}`}
                    className="rounded-xl border border-border/80 bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{log?.workoutId?.title || "Workout"}</p>
                        <p className="text-xs text-muted-foreground">
                          {safeDateTime(log?.performedAt || log?.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {log?.workoutId?.type || "—"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {log?.workoutId?.difficulty || "—"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" /> {log?.totalDurationInMinutes ?? 0} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="size-3.5" /> {log?.caloriesBurned ?? 0} cal
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="size-3.5" /> {log?.exercises?.length ?? 0} exercises
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff notes */}
      <Card className="border border-dashed border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            Staff notes
          </CardTitle>
          <CardDescription>Coaching, diet, and follow-up notes for this member.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Notes module can be enabled here to track staff observations per member.
        </CardContent>
      </Card>
    </div>
  );
}
