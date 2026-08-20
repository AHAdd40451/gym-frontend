"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

export default function AuditLogsClient() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    superAdminApi.listAuditLogs().then(setLogs).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-muted-foreground text-sm">Trace subscription, payment, and status changes across gyms.</p>
      </div>
      <Card>
        <CardContent className="space-y-3 pt-6">
          {logs.map((log) => (
            <div key={log._id} className="rounded-lg border p-4">
              <p className="font-medium">{log.action}</p>
              <p className="text-muted-foreground text-sm">{log.description || log.entityType}</p>
              <p className="text-muted-foreground text-xs">
                {log.gymId?.name || "Platform"} • {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
