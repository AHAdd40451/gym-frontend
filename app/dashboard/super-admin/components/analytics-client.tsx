"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

export default function AnalyticsClient() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    superAdminApi.getOverview().then(setOverview).catch(() => {});
  }, []);

  const metrics = overview?.metrics || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Top-line business metrics for your SaaS product.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(metrics).map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm capitalize">{label.replace(/[A-Z]/g, (m) => ` ${m.toLowerCase()}`)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{String(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
