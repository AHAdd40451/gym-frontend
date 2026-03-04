"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Crown,
  Mail,
} from "lucide-react";
import { Subscription, getAllSubscriptions } from "@/lib/api/services/subcription/subcription";

const statusStyle = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "trialing") {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }
  if (s === "pending" || s === "past_due") {
    return "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
  return "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-400";
};

const formatRange = (start?: string, end?: string) => {
  if (!start || !end) return "-";
  const s = new Date(start).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const e = new Date(end).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${s} - ${e}`;
};

const initials = (name: string) => {
  const text = name?.trim();
  if (!text) return "?";
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const normalizeText = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();

const wordMatch = (value: string, query: string) => {
  if (!query) return true;
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) return false;
  const words = normalizedValue.split(" ").filter(Boolean);
  return words.some((word) => word === query);
};

const containsMatch = (value: string, query: string) => {
  if (!query) return true;
  return normalizeText(value).includes(query);
};

const getMemberIdentity = (sub: Subscription) => {
  const userObj = typeof sub.user === "object" && sub.user ? (sub.user as any) : {};
  const fallbackEmail = (sub as any)?.email || "";
  const email = userObj?.email || fallbackEmail || "";
  const fullName = [userObj?.firstName, userObj?.lastName].filter(Boolean).join(" ").trim();
  const name =
    userObj?.name ||
    fullName ||
    (sub as any)?.firstName ||
    (email.includes("@") ? email.split("@")[0] : "Unknown");

  const userId =
    userObj?._id ||
    (typeof sub.user === "string" ? sub.user : "") ||
    (sub as any)?.userId ||
    (sub as any)?.id ||
    "";

  return { email, name, userId };
};

const MembersPage = () => {
  const [token, setToken] = useState<string>("");
  const [tokenReady, setTokenReady] = useState<boolean>(false);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [memberFilter, setMemberFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
        const list = (res as any)?.data?.data || (res as any)?.data || (res as any)?.subscriptions || [];
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

  const activeCount = useMemo(
    () => subs.filter((s) => ["active", "trialing"].includes((s?.status || "").toLowerCase())).length,
    [subs],
  );

  const inactiveCount = useMemo(
    () => subs.filter((s) => !["active", "trialing"].includes((s?.status || "").toLowerCase())).length,
    [subs],
  );

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    subs.forEach((sub) => {
      const value = (sub.status || "").toLowerCase().trim();
      if (value) set.add(value);
    });
    return Array.from(set).sort();
  }, [subs]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        memberFilter.trim() ||
          emailFilter.trim() ||
          planFilter.trim() ||
          periodFilter.trim() ||
          statusFilter !== "all",
      ),
    [memberFilter, emailFilter, planFilter, periodFilter, statusFilter],
  );

  const filteredSubs = useMemo(() => {
    const memberQuery = normalizeText(memberFilter);
    const emailQuery = normalizeText(emailFilter);
    const planQuery = normalizeText(planFilter);
    const periodQuery = normalizeText(periodFilter);
    const statusQuery = normalizeText(statusFilter);

    return subs.filter((sub) => {
      const { email, name } = getMemberIdentity(sub);
      const planName = (typeof sub.plan === "object" ? (sub.plan as any)?.name : sub.plan) || "";

      const periodStart = (sub as any)?.currentPeriodStart || (sub as any)?.startDate;
      const periodEnd = (sub as any)?.currentPeriodEnd || (sub as any)?.endDate;
      const periodLabel = formatRange(periodStart, periodEnd).toLowerCase();
      const statusLabel = (sub.status || "").toLowerCase();

      const memberMatch = wordMatch(name, memberQuery);
      const emailMatch = containsMatch(email, emailQuery);
      const planMatch = containsMatch(String(planName), planQuery);
      const periodMatch = containsMatch(periodLabel, periodQuery);
      const statusMatch = statusQuery === "all" || statusLabel === statusQuery;

      return memberMatch && emailMatch && planMatch && periodMatch && statusMatch;
    });
  }, [subs, memberFilter, emailFilter, planFilter, periodFilter, statusFilter]);

  if (!tokenReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-destructive">Missing auth token. Please log in.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 p-6 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage all gym members and their subscriptions.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="overflow-hidden border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Members</p>
              <p className="text-2xl font-semibold tabular-nums">{subs.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
              <UserCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{activeCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <UserX className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive / Other</p>
              <p className="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">{inactiveCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border border-border/80 shadow-sm">
        <div className="border-b border-border/80 bg-muted/30 px-4 py-3 sm:px-6">
          <div className="space-y-4">
            <h2 className="text-base font-medium">Member directory</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Input placeholder="Filter by member" value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} />
              <Input placeholder="Filter by email" value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} />
              <Input placeholder="Filter by plan" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} />
              <Input placeholder="Filter by period" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="all">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border border-border/60 p-4">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="p-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users className="size-6" />
                </EmptyMedia>
                <EmptyTitle>{hasActiveFilters ? "No members match your filters" : "No members yet"}</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? "Try different filter values to find matching members."
                    : "Members will appear here once they subscribe."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/80">
                <TableHead className="font-medium text-muted-foreground">Member</TableHead>
                <TableHead className="font-medium text-muted-foreground hidden md:table-cell">Email</TableHead>
                <TableHead className="font-medium text-muted-foreground">Plan</TableHead>
                <TableHead className="font-medium text-muted-foreground hidden lg:table-cell">Period</TableHead>
                <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="w-[100px] font-medium text-muted-foreground text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map((sub, index) => {
                const { userId, email: resolvedEmail, name: userName } = getMemberIdentity(sub);
                const email = resolvedEmail || "-";

                const planObj = typeof sub.plan === "object" ? sub.plan : undefined;
                const planName = planObj?.name || (sub as any)?.planName || String(sub.plan || "-");

                const periodStart = (sub as any)?.currentPeriodStart || (sub as any)?.startDate;
                const periodEnd = (sub as any)?.currentPeriodEnd || (sub as any)?.endDate;
                const periodLabel = formatRange(periodStart, periodEnd);

                return (
                  <TableRow
                    key={sub._id || userId || `sub-${index}`}
                    className="cursor-pointer border-border/60 transition-colors hover:bg-muted/50"
                    onClick={() => userId && router.push(`/dashboard/staff/members/${userId}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-border/80">
                          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                            {initials(userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{userName}</p>
                          <p className="text-xs text-muted-foreground md:hidden truncate">{email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="size-3.5 shrink-0 opacity-70" />
                        <span className="truncate max-w-[200px] inline-block" title={email}>
                          {email}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <Crown className="size-3.5 text-amber-500" />
                        <span className="font-medium">{planName}</span>
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {periodLabel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyle(sub.status)}>
                        {(sub.status || "active").replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          userId && router.push(`/dashboard/staff/members/${userId}`);
                        }}
                      >
                        View
                        <ChevronRight className="size-4 ml-0.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default MembersPage;
