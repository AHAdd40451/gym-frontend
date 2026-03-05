"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserWithSubscriptionsDetails } from "@/lib/api/services/subcription/subcription";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  History,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

interface Transaction {
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
}

interface Plan {
  name?: string;
  description?: string;
  price?: number;
  priceCents?: number;
  currency?: string;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: string;
}

interface Subscription {
  plan?: Plan;
  status?: string;
  startDate?: string;
  endDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  transactions?: Transaction[];
}

interface Membership {
  user?: UserProfile;
  subscriptions?: Subscription[];
}

const activeStatuses = ["active", "trialing", "pending", "past_due"];

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const formatPrice = (sub?: Subscription) => {
  if (!sub) return "$0";
  const fromPlanPrice = typeof sub.plan?.price === "number" ? sub.plan.price : undefined;
  const fromPlanCents =
    typeof sub.plan?.priceCents === "number" ? sub.plan.priceCents / 100 : undefined;
  const fromTxn =
    Array.isArray(sub.transactions) && sub.transactions.length > 0
      ? sub.transactions[sub.transactions.length - 1]?.amount
      : undefined;

  const amount = fromPlanPrice ?? fromPlanCents ?? fromTxn ?? 0;
  const currency =
    sub.plan?.currency ||
    (sub.transactions && sub.transactions.length > 0
      ? sub.transactions[sub.transactions.length - 1]?.currency
      : undefined) ||
    "USD";

  const symbol = currency.toUpperCase() === "PKR" ? "Rs" : "$";
  return `${symbol}${Number(amount).toLocaleString()}`;
};

const statusClasses = (status?: string) => {
  const value = (status || "").toLowerCase();
  if (value === "active") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/40";
  if (value === "trialing") return "bg-blue-500/15 text-blue-700 border-blue-500/40";
  if (value === "pending") return "bg-amber-500/15 text-amber-700 border-amber-500/40";
  if (value === "past_due") return "bg-orange-500/15 text-orange-700 border-orange-500/40";
  if (value === "canceled") return "bg-rose-500/15 text-rose-700 border-rose-500/40";
  return "bg-muted text-muted-foreground border-border";
};

export default function MembershipPage() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembership = async () => {
      setLoading(true);
      setError("");

      try {
        const rawUser = localStorage.getItem("currentUser");
        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";

        if (!rawUser) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        let parsedUser: Record<string, unknown> | null = null;
        let userId: string | null = null;
        try {
          parsedUser = JSON.parse(rawUser);
          userId = (parsedUser?._id as string) || (parsedUser?.id as string) || null;
        } catch {
          setError("Invalid user session");
          setLoading(false);
          return;
        }

        if (!userId) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        try {
          const res = await getUserWithSubscriptionsDetails(userId, token);
          setMembership(res);
        } catch {
          // If details endpoint fails, keep user card visible with empty subscriptions.
          setMembership({
            user: {
              firstName: (parsedUser?.firstName as string) || "",
              lastName: (parsedUser?.lastName as string) || "",
              email: (parsedUser?.email as string) || "",
              role: (parsedUser?.role as string) || "user",
              status: "active",
            },
            subscriptions: [],
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not fetch membership info");
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, []);

  const subscriptions = membership?.subscriptions || [];
  const activeSub = useMemo(
    () => subscriptions.find((sub) => activeStatuses.includes((sub.status || "").toLowerCase())),
    [subscriptions]
  );
  const latestTxn =
    activeSub?.transactions && activeSub.transactions.length > 0
      ? activeSub.transactions[activeSub.transactions.length - 1]
      : undefined;
  const allPlanHistory = useMemo(
    () =>
      [...subscriptions].sort(
        (a, b) =>
          new Date(b.startDate || b.currentPeriodStart || 0).getTime() -
          new Date(a.startDate || a.currentPeriodStart || 0).getTime()
      ),
    [subscriptions]
  );
  const allTransactions = useMemo(
    () =>
      subscriptions
        .flatMap((sub) => sub.transactions || [])
        .sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ),
    [subscriptions]
  );

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        Loading membership...
      </div>
    );
  }

  if (error && !membership) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Card className="w-full max-w-lg border-destructive/30">
          <CardContent className="flex items-center gap-3 p-6 text-destructive">
            <AlertCircle className="size-5" />
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">My Membership</h1>
        <p className="text-sm text-muted-foreground">
          Your current plan, billing status, and subscription timeline.
        </p>
      </div>

      <Card className="overflow-hidden border-border/80">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            <div className="space-y-5 p-6 lg:w-2/3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    {activeSub?.plan?.name || "No Active Membership"}
                  </h2>
                  <Badge variant="outline" className={statusClasses(activeSub?.status)}>
                    {(activeSub?.status || "inactive").toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activeSub?.plan?.description ||
                    "Start a membership plan to unlock workouts, booking, and progress tracking."}
                </p>
              </div>

              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>
                    Plan period: {formatDate(activeSub?.startDate || activeSub?.currentPeriodStart)} to{" "}
                    {formatDate(activeSub?.endDate || activeSub?.currentPeriodEnd)}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>
                    Transactions recorded: {activeSub?.transactions?.length ?? 0}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>
                    Last payment date: {formatDate(latestTxn?.createdAt)}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>
                    Last payment status: {(latestTxn?.status || "-").toUpperCase()}
                  </span>
                </li>
              </ul>

              <p className="text-xs text-muted-foreground">
                Subscription details refresh automatically from your account record.
              </p>
            </div>

            <div className="border-t bg-muted/20 p-6 lg:w-1/3 lg:border-l lg:border-t-0">
              <div className="space-y-5">
                <div className="text-center lg:text-left">
                  <p className="text-sm text-muted-foreground">Current billing</p>
                  <p className="mt-1 text-4xl font-semibold">{formatPrice(activeSub)}</p>
                  <p className="text-xs text-muted-foreground">per billing cycle</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    Next renewal: {formatDate(activeSub?.endDate || activeSub?.currentPeriodEnd)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="size-4" />
                    Currency: {(latestTxn?.currency || activeSub?.plan?.currency || "USD").toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    Status: {(activeSub?.status || "inactive").toUpperCase()}
                  </div>
                </div>

                <Button className="w-full gap-2" disabled={!activeSub}>
                  <Sparkles className="size-4" />
                  {activeSub ? "Manage Membership" : "No Active Plan"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="size-4 text-primary" />
              Plan History
            </CardTitle>
            <CardDescription>Your previous and current membership plans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {allPlanHistory.length > 0 ? (
              allPlanHistory.map((sub, idx) => (
                <div key={`${sub.plan?.name || "plan"}-${idx}`} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{sub.plan?.name || "Unnamed Plan"}</p>
                    <Badge variant="outline" className={statusClasses(sub.status)}>
                      {(sub.status || "unknown").toUpperCase()}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(sub.startDate || sub.currentPeriodStart)} to{" "}
                    {formatDate(sub.endDate || sub.currentPeriodEnd)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{sub.plan?.description || "-"}</p>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No plan history found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="size-4 text-primary" />
              Transaction History
            </CardTitle>
            <CardDescription>All payments linked with your membership records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {allTransactions.length > 0 ? (
              allTransactions.map((txn, idx) => {
                const currency = (txn.currency || "USD").toUpperCase();
                const symbol = currency === "PKR" ? "Rs" : "$";
                return (
                  <div key={`${txn.createdAt || "txn"}-${idx}`} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <p className="font-medium">
                          {symbol}
                          {Number(txn.amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{(txn.status || "unknown").toUpperCase()}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(txn.createdAt)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Currency: {currency}</p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No transaction history found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
