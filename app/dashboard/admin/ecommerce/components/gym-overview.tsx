"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Plus,
  Users,
  X
} from "lucide-react";
import Link from "next/link";

type OverviewData = {
  activeMembers: number;
  todayCheckIns: number;
  walkInSubscriptionsThisMonth: number;
  renewalsDueThisWeek: number;
  monthlyRevenue: number;
  subscriptionRevenue: {
    label: string;
    amount: number;
  }[];
  attendanceTrend: {
    label: string;
    count: number;
  }[];
  planDistribution: {
    planName: string;
    count: number;
    percentage: number;
  }[];
  recentWalkInSubscriptions: {
    id: string;
    memberName: string;
    planName: string;
    startDate: string;
    status: string;
  }[];
  expiringMemberships: {
    id: string;
    memberName: string;
    planName: string;
    expiresOn: string;
    daysLeft: number;
  }[];
};

type RenewalMember = {
  id: string;
  memberName: string;
  planName: string;
  expiresOn: string;
  daysLeft: number;
};

type PlanOption = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  planName?: string;
  price?: number;
  amount?: number;
  monthlyPrice?: number;
  priceCents?: number;
  durationInMonths?: number;
  durationMonths?: number;
  months?: number;
  validityMonths?: number;
  currency?: string;
};

const emptyData: OverviewData = {
  activeMembers: 0,
  todayCheckIns: 0,
  walkInSubscriptionsThisMonth: 0,
  renewalsDueThisWeek: 0,
  monthlyRevenue: 0,
  subscriptionRevenue: [],
  attendanceTrend: [],
  planDistribution: [],
  recentWalkInSubscriptions: [],
  expiringMemberships: []
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5003/api"
    : "https://gym.coderivals.ltd/api");

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getPlanId(plan: PlanOption) {
  return plan._id || plan.id || "";
}

function getPlanName(plan: PlanOption) {
  return plan.name || plan.title || plan.planName || "Membership Plan";
}

function getPlanAmount(plan: PlanOption) {
  if (plan.priceCents !== undefined && plan.priceCents !== null) {
    return Number(plan.priceCents) / 100;
  }

  return Number(plan.price || plan.amount || plan.monthlyPrice || 0);
}

function getNewExpiryDate(expiresOn: string, months: number) {
  const baseDate = expiresOn ? new Date(expiresOn) : new Date();
  const today = new Date();

  const startDate = baseDate > today ? baseDate : today;
  const newDate = new Date(startDate);

  newDate.setMonth(newDate.getMonth() + months);

  return newDate.toISOString();
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon size={22} />
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-2xl font-bold">{value}</h3>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export default function GymOverview() {
  const [data, setData] = useState<OverviewData>(emptyData);
  const [plans, setPlans] = useState<PlanOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);

  const [error, setError] = useState("");
  const [plansError, setPlansError] = useState("");

  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalMember | null>(
    null
  );

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedMonths, setSelectedMonths] = useState("1");

  const [renewError, setRenewError] = useState("");
  const [renewSuccess, setRenewSuccess] = useState("");

  const maxRevenue = useMemo(() => {
    return Math.max(...data.subscriptionRevenue.map((item) => item.amount), 0);
  }, [data.subscriptionRevenue]);

  const maxAttendance = useMemo(() => {
    return Math.max(...data.attendanceTrend.map((item) => item.count), 0);
  }, [data.attendanceTrend]);

  const selectedPlan = useMemo(() => {
    return plans.find((plan) => getPlanId(plan) === selectedPlanId) || null;
  }, [plans, selectedPlanId]);

  const selectedMonthsNumber = Number(selectedMonths || 1);

  const previewExpiryDate =
    selectedRenewal && selectedMonthsNumber
      ? getNewExpiryDate(selectedRenewal.expiresOn, selectedMonthsNumber)
      : "";

  const fetchOverview = useCallback(async () => {
    try {
      setError("");

      const token = getAuthToken();

      const res = await fetch(`${API_BASE_URL}/dashboard/overview`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        cache: "no-store"
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Failed to load overview data");
      }

      setData(json?.data || emptyData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load overview data";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setPlansError("");
      setPlansLoading(true);

      const token = getAuthToken();

      const res = await fetch(`${API_BASE_URL}/plans`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        cache: "no-store"
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Failed to load plans");
      }

      const plansList = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.plans)
            ? json.plans
            : Array.isArray(json?.data?.plans)
              ? json.data.plans
              : [];

      setPlans(plansList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load plans";
      setPlansError(message);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchPlans();
  }, [fetchOverview, fetchPlans]);

  const openRenewalCard = (member: RenewalMember) => {
    setSelectedRenewal(member);
    setSelectedPlanId("");
    setSelectedMonths("1");
    setRenewError("");
    setRenewSuccess("");
  };

  const closeRenewalCard = () => {
    if (renewingId) return;

    setSelectedRenewal(null);
    setSelectedPlanId("");
    setSelectedMonths("1");
    setRenewError("");
    setRenewSuccess("");
  };

  const renewSubscription = async () => {
    if (!selectedRenewal) return;

    setRenewError("");
    setRenewSuccess("");

    if (!selectedPlan) {
      setRenewError("Please select a plan.");
      return;
    }

    if (!selectedMonthsNumber || selectedMonthsNumber <= 0) {
      setRenewError("Please select valid membership months.");
      return;
    }

    const planAmount = getPlanAmount(selectedPlan);

    if (!planAmount || planAmount <= 0) {
      setRenewError("Selected plan price is missing.");
      return;
    }

    try {
      setRenewingId(selectedRenewal.id);

      const token = getAuthToken();

      const res = await fetch(
        `${API_BASE_URL}/subscriptions/${selectedRenewal.id}/renew`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            planId: getPlanId(selectedPlan),
            amount: planAmount,
            currency: selectedPlan.currency || "PKR",
            months: selectedMonthsNumber
          })
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Failed to renew subscription");
      }

      setRenewSuccess("Subscription activated successfully.");

      await fetchOverview();

      setTimeout(() => {
        setSelectedRenewal(null);
        setSelectedPlanId("");
        setSelectedMonths("1");
        setRenewSuccess("");
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to renew subscription";

      setRenewError(message);
    } finally {
      setRenewingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Loading dashboard overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
            Gym Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live overview of members, walk-in subscriptions, attendance and
            renewals.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Active Members"
            value={data.activeMembers}
            subtitle="Currently active members"
            icon={Users}
          />

          <StatCard
            title="Today's Check-ins"
            value={data.todayCheckIns}
            subtitle="Members visited today"
            icon={CheckCircle2}
          />

          <StatCard
            title="Renewals Due"
            value={data.renewalsDueThisWeek}
            subtitle="Expiring this week"
            icon={CalendarClock}
          />

          <StatCard
            title="Monthly Revenue"
            value={formatMoney(data.monthlyRevenue)}
            subtitle="From active subscriptions"
            icon={DollarSign}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  Monthly Subscription Revenue
                </h2>
                <p className="text-sm text-muted-foreground">
                  Revenue from walk-in subscriptions
                </p>
              </div>
              <Activity size={18} className="text-muted-foreground" />
            </div>

            {data.subscriptionRevenue.length ? (
              <div className="space-y-4">
                {data.subscriptionRevenue.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-semibold">
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${
                            maxRevenue ? (item.amount / maxRevenue) * 100 : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBox text="No revenue data found" />
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Daily Attendance Trend</h2>
                <p className="text-sm text-muted-foreground">
                  Check-ins by day
                </p>
              </div>
              <CheckCircle2 size={18} className="text-muted-foreground" />
            </div>

            {data.attendanceTrend.length ? (
              <div className="flex h-[240px] items-end gap-3">
                {data.attendanceTrend.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div className="text-xs font-medium">{item.count}</div>
                    <div
                      className="w-full rounded-t-xl bg-primary"
                      style={{
                        height: `${
                          maxAttendance
                            ? (item.count / maxAttendance) * 180
                            : 0
                        }px`
                      }}
                    />
                    <div className="text-xs text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBox text="No attendance data found" />
            )}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="rounded-2xl border bg-card p-5 shadow-sm xl:col-span-4">
            <h2 className="font-semibold">Membership Plan Distribution</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Active members by plan
            </p>

            {data.planDistribution.length ? (
              <div className="space-y-4">
                {data.planDistribution.map((item) => (
                  <div key={item.planName}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{item.planName}</span>
                      <span className="font-semibold">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBox text="No plan data found" />
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm xl:col-span-4">
            <h2 className="font-semibold">Recent Walk-in Subscriptions</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Latest subscriptions created by admin
            </p>

            {data.recentWalkInSubscriptions.length ? (
              <div className="space-y-3">
                {data.recentWalkInSubscriptions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.memberName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.planName} · {formatDate(item.startDate)}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBox text="No recent walk-in subscriptions found" />
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm xl:col-span-4">
            <h2 className="font-semibold">Quick Actions</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Manage daily gym operations
            </p>

            <div className="space-y-3">
              <Link
                href="/dashboard/admin/all-sub"
                className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Plus size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Add Walk-in Subscription
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Create a new membership
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/admin/attendance"
                className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Mark Attendance</p>
                  <p className="text-xs text-muted-foreground">
                    Check-in a member
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/admin/notifications"
                className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarClock size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Send Notification</p>
                  <p className="text-xs text-muted-foreground">
                    Message members
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Expiring Memberships / Renewals Due</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Members whose subscriptions are ending soon
          </p>

          {data.expiringMemberships.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="py-3 font-medium">Member</th>
                    <th className="py-3 font-medium">Plan</th>
                    <th className="py-3 font-medium">Expires On</th>
                    <th className="py-3 font-medium">Days Left</th>
                    <th className="py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expiringMemberships.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{item.memberName}</td>
                      <td className="py-3">{item.planName}</td>
                      <td className="py-3">{formatDate(item.expiresOn)}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                          {item.daysLeft} days
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          disabled={renewingId === item.id}
                          onClick={() => openRenewalCard(item)}
                          className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {renewingId === item.id
                            ? "Renewing..."
                            : "Renew / Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyBox text="No renewals due soon" />
          )}
        </div>
      </div>

      {selectedRenewal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Renew / Activate Member</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a plan and membership months to activate this member.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRenewalCard}
                disabled={Boolean(renewingId)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Member</p>
              <h3 className="mt-1 text-lg font-semibold">
                {selectedRenewal.memberName}
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Current Plan</p>
                  <p className="text-sm font-medium">
                    {selectedRenewal.planName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Current Expiry</p>
                  <p className="text-sm font-medium">
                    {formatDate(selectedRenewal.expiresOn)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Days Left</p>
                  <p className="text-sm font-medium">
                    {selectedRenewal.daysLeft} days
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">New Expiry</p>
                  <p className="text-sm font-medium text-green-700">
                    {previewExpiryDate ? formatDate(previewExpiryDate) : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Select Plan</label>

                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  disabled={plansLoading || Boolean(renewingId)}
                  className="mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {plansLoading ? "Loading plans..." : "Choose membership plan"}
                  </option>

                  {plans.map((plan) => (
                    <option key={getPlanId(plan)} value={getPlanId(plan)}>
                      {getPlanName(plan)} - {formatMoney(getPlanAmount(plan))}
                    </option>
                  ))}
                </select>

                {plansError && (
                  <p className="mt-2 text-xs text-red-600">{plansError}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Membership Months</label>

                <select
                  value={selectedMonths}
                  onChange={(e) => setSelectedMonths(e.target.value)}
                  disabled={Boolean(renewingId)}
                  className="mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="1">1 Month</option>
                  <option value="2">2 Months</option>
                  <option value="3">3 Months</option>
                  <option value="4">4 Months</option>
                  <option value="5">5 Months</option>
                  <option value="6">6 Months</option>
                  <option value="9">9 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>
            </div>

            {selectedPlan && (
              <div className="mt-4 rounded-xl border bg-muted/30 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Selected Plan
                    </p>
                    <p className="text-sm font-medium">
                      {getPlanName(selectedPlan)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Plan Price</p>
                    <p className="text-sm font-medium">
                      {formatMoney(getPlanAmount(selectedPlan))}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Membership Months
                    </p>
                    <p className="text-sm font-medium">
                      {selectedMonthsNumber} month
                      {selectedMonthsNumber > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Activation Till
                    </p>
                    <p className="text-sm font-medium text-green-700">
                      {previewExpiryDate ? formatDate(previewExpiryDate) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {renewError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {renewError}
              </div>
            )}

            {renewSuccess && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {renewSuccess}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRenewalCard}
                disabled={Boolean(renewingId)}
                className="rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={renewSubscription}
                disabled={Boolean(renewingId) || plansLoading}
                className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {renewingId ? "Activating..." : "Activate Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
