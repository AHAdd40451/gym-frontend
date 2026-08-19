import { getUserWithSubscriptions } from "@/lib/api/services/users/users";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { ProfileCard } from "./profile-card";
import { BiometricIdField } from "./biometric-id-field";
import { RenewSubscriptionButton } from "./renew-subscription-button";
import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ================= TYPES ================= */

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

/* ================= HELPERS ================= */

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount?: number, currency = "PKR") => {
  if (amount === undefined || amount === null) return "N/A";

  return `${amount} ${currency}`;
};

const getStatusClass = (status?: string) => {
  switch (status) {
    case "active":
    case "succeeded":
    case "paid":
      return "bg-green-100 text-green-700 border-green-200";

    case "pending":
    case "trialing":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";

    case "cancelled":
    case "canceled":
    case "failed":
    case "expired":
      return "bg-red-100 text-red-700 border-red-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getRoleLabel = (user: any) => {
  if (user?.isSuperAdmin) return "Super Admin";
  if (user?.role === "admin") return "Admin";
  if (user?.role === "staff") return "Staff";
  return "Member";
};

/* ================= PAGE ================= */

const UserDetailPage = async ({ params }: PageProps) => {
  const { user: authUser, token } = await getServerAuth();

  const { id } = await params;

  if (!authUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-lg font-semibold">
          Please log in to view user details.
        </h2>
      </div>
    );
  }

  const res = await getUserWithSubscriptions(id, token || "");

  console.log("USER DETAIL RESPONSE:", res);

  const getUser =
    res?.data?.user || res?.data?.data?.user || res?.user || null;

  const subscriptions =
    res?.data?.subscriptions ||
    res?.data?.data?.subscriptions ||
    res?.subscriptions ||
    [];

  // =========================
  // Transactions Fix
  // =========================
  // Pehle top-level transactions check karenge.
  // Agar top-level transactions empty hain,
  // to subscription ke andar wali transactions read karenge.
  const topLevelTransactions =
    res?.data?.transactions ||
    res?.data?.data?.transactions ||
    res?.transactions ||
    [];

  const subscriptionTransactions = subscriptions.flatMap((sub: any) => {
    const subTransactions = Array.isArray(sub.transactions)
      ? sub.transactions
      : [];

    return subTransactions.map((trx: any, index: number) => ({
      ...trx,
      _id: trx._id || `${sub._id}-trx-${index}`,
      planName: sub.plan?.name || "Subscription Plan",
      subscriptionId: sub._id,
      subscriptionStatus: sub.status,
      createdAt: trx.createdAt || trx.date || sub.createdAt,
      date: trx.date || trx.createdAt || sub.createdAt,
      currency: trx.currency || sub.plan?.currency || "PKR",
      paymentMethod: trx.paymentMethod || "Manual",
    }));
  });

  const transactions =
    Array.isArray(topLevelTransactions) && topLevelTransactions.length > 0
      ? topLevelTransactions
      : subscriptionTransactions;

  if (!getUser) {
    return (
      <div className="mt-10 text-center text-red-500">User not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/all-users">
                <ArrowLeft className="mr-2 size-4" />
                Back to Users
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl font-semibold text-foreground">
            User Details
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View profile, role, subscriptions, and payment history.
          </p>
        </div>

        <Badge
          variant="outline"
          className={`w-fit capitalize ${getStatusClass(getUser.status)}`}
        >
          {getUser.status || "unknown"}
        </Badge>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ================= LEFT SIDE ================= */}

        <div className="space-y-6 xl:col-span-1">
          <ProfileCard user={getUser} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <UserRound className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">{getRoleLabel(getUser)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">
                    {getUser.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {getUser.phone || "No phone number"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatDate(getUser.createdAt)}</p>
                </div>
              </div>

              <BiometricIdField userId={id} initialValue={getUser.biometricId} />
            </CardContent>
          </Card>
        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="space-y-6 xl:col-span-2">
          {/* ================= SUBSCRIPTIONS ================= */}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscriptions</CardTitle>
            </CardHeader>

            <CardContent>
              {subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((sub: any, index: number) => {
                    const plan = sub.plan || {};
                    const latestTransaction = sub.transactions?.[0];

                    const subscriptionKey =
                      sub._id ||
                      sub.id ||
                      sub.subscriptionId ||
                      sub.stripeSubscriptionId ||
                      `${plan._id || plan.id || "subscription"}-${index}`;

                    return (
                      <div
                        key={subscriptionKey}
                        className="rounded-xl border p-4 transition hover:bg-muted/40"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {plan.name || "Subscription Plan"}
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {plan.description || "No plan description"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`w-fit capitalize ${getStatusClass(sub.status)}`}
                            >
                              {sub.status || "unknown"}
                            </Badge>

                            <RenewSubscriptionButton
                              subscriptionId={subscriptionKey}
                              planName={plan.name}
                              defaultAmount={
                                latestTransaction?.amount ??
                                (plan.priceCents ? Number(plan.priceCents) / 100 : undefined)
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">
                              {formatDate(sub.currentPeriodStart || sub.startDate)}
                            </p>
                          </div>

                          <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">
                              {formatDate(sub.currentPeriodEnd || sub.endDate)}
                            </p>
                          </div>

                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-medium">
                              {latestTransaction
                                ? formatAmount(
                                  latestTransaction.amount,
                                  latestTransaction.currency || plan.currency || "PKR"
                                )
                                : plan.priceCents
                                  ? formatAmount(
                                    Number(plan.priceCents) / 100,
                                    plan.currency || "PKR"
                                  )
                                  : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No subscriptions found for this user.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ================= TRANSACTIONS ================= */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="size-5" />
                Transactions
              </CardTitle>
            </CardHeader>

            <CardContent>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-3 pr-4 font-medium">Date</th>
                        <th className="py-3 pr-4 font-medium">Plan</th>
                        <th className="py-3 pr-4 font-medium">Amount</th>
                        <th className="py-3 pr-4 font-medium">Method</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map((trx: any, index: number) => (
                        <tr
                          key={trx._id || index}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 pr-4">
                            {formatDate(trx.createdAt || trx.date)}
                          </td>

                          <td className="py-3 pr-4">
                            {trx.planName || "N/A"}
                          </td>

                          <td className="py-3 pr-4 font-medium">
                            {formatAmount(trx.amount, trx.currency || "PKR")}
                          </td>

                          <td className="py-3 pr-4">
                            {trx.paymentMethod || "Manual"}
                          </td>

                          <td className="py-3 pr-4">
                            <Badge
                              variant="outline"
                              className={`capitalize ${getStatusClass(
                                trx.status
                              )}`}
                            >
                              {trx.status || "unknown"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No transactions found for this user.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;