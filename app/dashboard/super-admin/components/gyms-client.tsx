"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

const statusOptions = [
  "",
  "active",
  "trial",
  "trial_ending_soon",
  "payment_pending",
  "expired",
  "suspended",
];

export default function GymsClient() {
  const [gyms, setGyms] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const loadGyms = async () => {
    const data = await superAdminApi.listGyms({
      ...(status ? { status } : {}),
      ...(query ? { q: query } : {}),
    });
    setGyms(data);
  };

  useEffect(() => {
    loadGyms();
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Gyms</h1>
          <p className="text-muted-foreground text-sm">Track every gym using your product.</p>
        </div>
        <Link href="/dashboard/super-admin/onboarding">
          <Button>Add New Gym</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by gym, city, or plan"
            className="max-w-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option || "all"} value={option}>
                {option ? option.replaceAll("_", " ") : "all"}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={loadGyms}>Apply</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3">Gym</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Trial End</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {gyms.map((gym) => (
                  <tr key={gym._id} className="border-t">
                    <td className="px-4 py-3">
                      <p className="font-medium">{gym.name}</p>
                      <p className="text-muted-foreground text-xs">{gym.city || "No city"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{gym.owner?.firstName} {gym.owner?.lastName}</p>
                      <p className="text-muted-foreground text-xs">{gym.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3">{gym.currentPlanName || gym.latestSubscription?.metadata?.planName || "—"}</td>
                    <td className="px-4 py-3 capitalize">{gym.subscriptionStatus || gym.status}</td>
                    <td className="px-4 py-3">
                      {gym.trialEndDate ? new Date(gym.trialEndDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">{gym.memberCount ?? 0}</td>
                    <td className="px-4 py-3">{gym.staffCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/super-admin/gyms/${gym._id}`} className="text-primary underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {gyms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-muted-foreground px-4 py-8 text-center">
                      No gyms found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
