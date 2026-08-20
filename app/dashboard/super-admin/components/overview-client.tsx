"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

export default function OverviewClient() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    superAdminApi.getOverview().then(setData).catch((err) => setError(err.message || "Failed to load"));
  }, []);

  const metrics = data?.metrics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Super Admin Overview</h1>
        <p className="text-muted-foreground text-sm">
          Global visibility across all gyms, subscriptions, payments, and support.
        </p>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["Total gyms", metrics?.totalGyms ?? 0],
          ["Active subscriptions", metrics?.activeSubscriptions ?? 0],
          ["Trial gyms", metrics?.trialGyms ?? 0],
          ["Trials ending soon", metrics?.trialsEndingSoon ?? 0],
          ["Pending payments", metrics?.pendingPayments ?? 0],
          ["Expired gyms", metrics?.expiredGyms ?? 0],
          ["Suspended gyms", metrics?.suspendedGyms ?? 0],
          ["Monthly revenue", currency(metrics?.monthlyRevenue ?? 0)],
          ["New gyms this month", metrics?.newGymsThisMonth ?? 0],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-2">
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-2xl">{String(value)}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recentPayments || []).slice(0, 6).map((payment: any) => (
              <div key={payment._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{payment.gymId?.name || "Gym"}</p>
                  <p className="text-muted-foreground text-xs">{payment.method} • {payment.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{currency(payment.amount)}</p>
                  <p className="text-muted-foreground text-xs">
                    {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "Unpaid"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Owner Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recentGymOwnerMessages || []).slice(0, 6).map((message: any) => (
              <div key={message._id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">
                  {message.senderId?.firstName} {message.senderId?.lastName}
                </p>
                <p className="text-muted-foreground text-sm line-clamp-2">{message.text}</p>
              </div>
            ))}
            <Link href="/dashboard/super-admin/messages" className="text-sm text-primary underline">
              Open messages
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
