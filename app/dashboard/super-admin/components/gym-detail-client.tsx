"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

export default function GymDetailClient({ gymId }: { gymId: string }) {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await superAdminApi.getGymDetail(gymId);
    setData(res);
  };

  useEffect(() => {
    load();
  }, [gymId]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    await superAdminApi.sendConversationMessage({
      conversationId: data?.supportConversation?._id,
      gymId,
      text: message,
      subject: "Support",
    });
    setMessage("");
    await load();
  };

  const triggerTrialAction = async (action: string) => {
    await superAdminApi.manageTrial(gymId, { action, days: 30, reason: `Triggered from ${action}` });
    await load();
  };

  if (!data) return <p className="text-sm text-muted-foreground">Loading gym details...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{data.gym?.name}</h1>
          <p className="text-muted-foreground text-sm">
            Owner: {data.owner?.firstName} {data.owner?.lastName} • {data.owner?.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => triggerTrialAction("extend")}>Extend Trial</Button>
          <Button variant="outline" onClick={() => triggerTrialAction("convert_to_paid")}>Convert to Paid</Button>
          <Button variant="outline" onClick={() => triggerTrialAction("suspend")}>Suspend</Button>
          <Button variant="outline" onClick={() => triggerTrialAction("reactivate")}>Reactivate</Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Gym Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Status: {data.gym?.subscriptionStatus || data.gym?.status}</p>
            <p>Plan: {data.gym?.currentPlanName || data.latestSubscription?.metadata?.planName || "—"}</p>
            <p>Trial start: {data.gym?.trialStartDate ? new Date(data.gym.trialStartDate).toLocaleDateString() : "—"}</p>
            <p>Trial end: {data.gym?.trialEndDate ? new Date(data.gym.trialEndDate).toLocaleDateString() : "—"}</p>
            <p>Next billing: {data.gym?.nextBillingDate ? new Date(data.gym.nextBillingDate).toLocaleDateString() : "—"}</p>
            <p>Members: {data.memberCount}</p>
            <p>Staff: {data.staffCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Onboarding Progress</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Completion: {data.onboardingCompletion}%</p>
            {Object.entries(data.onboarding || {}).map(([key, value]) => (
              <p key={key} className="capitalize">
                {key.replace(/[A-Z]/g, (m) => ` ${m.toLowerCase()}`)}: {value ? "Done" : "Pending"}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(data.payments || []).slice(0, 6).map((payment: any) => (
              <div key={payment._id} className="rounded-md border p-2">
                <p>{payment.method} • {payment.status}</p>
                <p className="text-muted-foreground">
                  {payment.amount} {payment.currency}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Support Chat</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border p-4">
            {(data.supportMessages || []).map((item: any) => (
              <div key={item._id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">
                  {item.senderId?.firstName} {item.senderId?.lastName}
                </p>
                <p className="text-sm">{item.text}</p>
              </div>
            ))}
            {!data.supportMessages?.length ? (
              <p className="text-muted-foreground text-sm">No messages yet.</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a support reply" />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
