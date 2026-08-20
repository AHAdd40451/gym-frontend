"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

export default function SubscriptionsClient() {
  const [gyms, setGyms] = useState<any[]>([]);

  useEffect(() => {
    superAdminApi.listGyms().then(setGyms).catch(() => {});
  }, []);

  const grouped = useMemo(
    () => ({
      active: gyms.filter((gym) => gym.subscriptionStatus === "active"),
      trial: gyms.filter((gym) => ["trial", "trialing"].includes(gym.subscriptionStatus)),
      pending: gyms.filter((gym) => ["payment_pending", "pending", "past_due"].includes(gym.subscriptionStatus)),
      expired: gyms.filter((gym) => ["expired", "cancelled", "canceled"].includes(gym.subscriptionStatus)),
      suspended: gyms.filter((gym) => gym.subscriptionStatus === "suspended"),
    }),
    [gyms]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <p className="text-muted-foreground text-sm">Monitor gym lifecycle across all billing states.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Object.entries(grouped).map(([key, list]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="capitalize">{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{(list as any[]).length}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Latest Gym Subscription States</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {gyms.map((gym) => (
            <div key={gym._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{gym.name}</p>
                <p className="text-muted-foreground">{gym.owner?.email}</p>
              </div>
              <div className="text-right">
                <p className="capitalize">{gym.subscriptionStatus}</p>
                <p className="text-muted-foreground">
                  {gym.nextBillingDate ? new Date(gym.nextBillingDate).toLocaleDateString() : "No billing date"}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
