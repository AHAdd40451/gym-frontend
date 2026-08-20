"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    superAdminApi.listNotifications().then(setNotifications).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-muted-foreground text-sm">Alerts relevant to platform ownership and gym lifecycle.</p>
      </div>
      <Card>
        <CardContent className="space-y-3 pt-6">
          {notifications.map((item) => (
            <div key={item._id} className="rounded-lg border p-4">
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground text-sm">{item.message}</p>
              <p className="text-muted-foreground mt-1 text-xs">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
