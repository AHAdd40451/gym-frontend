"use client";

import React, { useMemo, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Search,
} from "lucide-react";
import { useGetTrainerSubscribedUsers } from "@/lib/api/services/subcription/subcription";
import { useDebounce } from "@/hooks/useDebounce";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "pending", label: "Pending" },
  { value: "past_due", label: "Past due" },
  { value: "canceled", label: "Canceled" },
  { value: "unpaid", label: "Unpaid" },
];

type TrainerSubscriptionItem = {
  _id: string;
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    status?: string;
    profileImage?: string | null;
    createdAt?: string;
  };
  trainer: string;
  type: string;
  status: string;
  startDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  metadata?: { trainerPlanName?: string; durationInDays?: number };
  createdAt?: string;
};

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

const initials = (user: TrainerSubscriptionItem["user"]) => {
  const first = user?.firstName?.[0] || "";
  const last = user?.lastName?.[0] || "";
  if (first || last) return `${first}${last}`.toUpperCase();
  const email = user?.email || "";
  return email.includes("@") ? email.slice(0, 2).toUpperCase() : "?";
};

const fullName = (user: TrainerSubscriptionItem["user"]) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.email?.split("@")[0] || "Unknown";

const MembersPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [memberNameInput, setMemberNameInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedMemberName = useDebounce(memberNameInput, 400);

  const { data: apiResponse, isLoading, error } = useGetTrainerSubscribedUsers({
    page,
    limit: PAGE_SIZE,
    memberName: debouncedMemberName || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const subs: TrainerSubscriptionItem[] = useMemo(
    () => (apiResponse?.data && Array.isArray(apiResponse.data) ? apiResponse.data : []),
    [apiResponse?.data],
  );

  const total = apiResponse?.total ?? 0;
  const totalPages = apiResponse?.totalPages ?? 0;
  const activeCount = useMemo(
    () => subs.filter((s) => ["active", "trialing"].includes((s?.status || "").toLowerCase())).length,
    [subs],
  );
  const inactiveCount = useMemo(
    () => subs.filter((s) => !["active", "trialing"].includes((s?.status || "").toLowerCase())).length,
    [subs],
  );

  const hasActiveFilters = Boolean(debouncedMemberName.trim() || (statusFilter !== "all" && statusFilter));

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-destructive">
          {(error as Error)?.message || "Failed to load members. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 p-6 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage members subscribed to you as their trainer.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="overflow-hidden border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Members</p>
              <p className="text-2xl font-semibold tabular-nums">{total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
              <UserCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active (this page)</p>
              <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {activeCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/80 bg-card shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <UserX className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive (this page)</p>
              <p className="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {inactiveCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border border-border/80 shadow-sm">
        <div className="border-b border-border/80 bg-muted/30 px-4 py-3 sm:px-6">
          <div className="space-y-4">
            <h2 className="text-base font-medium">Member directory</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by member name or email"
                  value={memberNameInput}
                  onChange={(e) => {
                    setMemberNameInput(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
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
        ) : subs.length === 0 ? (
          <div className="p-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users className="size-6" />
                </EmptyMedia>
                <EmptyTitle>{hasActiveFilters ? "No members match your filters" : "No members yet"}</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? "Try a different search or status filter."
                    : "Members will appear here once they subscribe to you."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <>
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
                {subs.map((sub) => {
                  const userId = sub.user?._id ?? "";
                  const userName = fullName(sub.user);
                  const email = sub.user?.email || "-";
                  const planName = sub.metadata?.trainerPlanName || "-";
                  const periodLabel = formatRange(sub.currentPeriodStart, sub.currentPeriodEnd);

                  return (
                    <TableRow
                      key={sub._id}
                      className="cursor-pointer border-border/60 transition-colors hover:bg-muted/50"
                      onClick={() => userId && router.push(`/dashboard/staff/members/${userId}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10 border border-border/80">
                            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                              {initials(sub.user)}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/80 px-4 py-3 sm:px-6">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} · {total} member{total !== 1 ? "s" : ""} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default MembersPage;
