"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Super Admin Settings</h1>
        <p className="text-muted-foreground text-sm">Configuration notes for product-owner level access.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Manual Setup Notes</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Add product-owner emails to backend env `SUPER_ADMIN_EMAILS=email1@example.com,email2@example.com`.</p>
          <p>Normal gym owners should remain `role=admin` with `isSuperAdmin=false`.</p>
          <p>Existing accounts that were auto-promoted earlier may need one-time cleanup in the database.</p>
        </CardContent>
      </Card>
    </div>
  );
}
