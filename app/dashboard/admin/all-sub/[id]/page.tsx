"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSubscriptionById } from "@/lib/api/services/subcription/subcription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://gym.coderivals.ltd/api";

interface SubscriptionDetail {
  id?: string;
  _id?: string;

  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;

  user?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  planName?: string;
  plan?: {
    name?: string;
    title?: string;
  };

  status?: string;
  startDate?: string;
  currentPeriodStart?: string;
  endDate?: string;
  currentPeriodEnd?: string;
}

export default function Page() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return "";

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("adminToken") ||
      ""
    );
  };

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();

      if (!token) {
        setError("Admin token not found. Please login again.");
        return;
      }

      const res: any = await getSubscriptionById(id, token);

      const data = res?.data?.data || res?.data || res?.subscription || res;

      if (data) {
        setSubscription(data);
        setSelectedStatus(data?.status || "active");
      } else {
        setError("Subscription not found");
      }
    } catch (err: any) {
      console.error("Subscription detail error:", err);
      setError(err?.message || "Failed to fetch subscription");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubscription();
    }
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      setActionLoading(true);

      const token = getToken();

      if (!token) {
        alert("Admin token not found. Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      });

      const json = await res.json();

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || "Failed to update subscription");
      }

      alert("Subscription updated successfully");
      await fetchSubscription();
    } catch (err: any) {
      console.error("Update subscription error:", err);
      alert(err?.message || "Failed to update subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubscription = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subscription?"
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(true);

      const token = getToken();

      if (!token) {
        alert("Admin token not found. Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || "Failed to delete subscription");
      }

      alert("Subscription deleted successfully");
      router.push("/dashboard/admin/all-sub");
      router.refresh();
    } catch (err: any) {
      console.error("Delete subscription error:", err);
      alert(err?.message || "Failed to delete subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const userFullName = useMemo(() => {
    if (!subscription) return "N/A";

    const directName =
      subscription.fullName ||
      subscription.name ||
      `${subscription.firstName || ""} ${subscription.lastName || ""}`.trim();

    const nestedUserName =
      subscription.user?.fullName ||
      subscription.user?.name ||
      `${subscription.user?.firstName || ""} ${
        subscription.user?.lastName || ""
      }`.trim();

    return directName || nestedUserName || "N/A";
  }, [subscription]);

  const email = subscription?.email || subscription?.user?.email || "—";
  const phone = subscription?.phone || subscription?.user?.phone || "—";

  const planName =
    subscription?.planName ||
    subscription?.plan?.name ||
    subscription?.plan?.title ||
    "Membership Plan";

  const startDate = subscription?.startDate || subscription?.currentPeriodStart;
  const endDate = subscription?.endDate || subscription?.currentPeriodEnd;

  const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading subscription details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-red-500">
        <p>{error}</p>

        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex h-screen items-center justify-center">
        No subscription data available
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="relative w-full max-w-2xl p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <Button
          variant="outline"
          size="sm"
          className="absolute left-6 top-6"
          onClick={() => router.back()}
        >
          Exit
        </Button>

        <CardHeader>
          <CardTitle className="mt-12 text-2xl font-bold">
            Subscription Details
          </CardTitle>
        </CardHeader>

        <CardContent className="mt-2 space-y-5 text-base">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailRow
              label="Subscription ID"
              value={subscription.id || subscription._id || "—"}
            />
            <DetailRow label="Name" value={userFullName} />
            <DetailRow label="Email" value={email} />
            <DetailRow label="Phone" value={phone} />
            <DetailRow label="Plan" value={planName} />
            <DetailRow label="Start Date" value={formatDate(startDate)} />
            <DetailRow label="End Date" value={formatDate(endDate)} />

            <div>
              <p className="mb-2 text-sm font-semibold">Current Status</p>
              <Badge variant="success" className="text-base capitalize">
                {subscription.status || "active"}
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="mb-3 text-lg font-semibold">
              Manage Subscription
            </h3>

            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm outline-none"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
                <option value="unpaid">Unpaid</option>
              </select>

              <Button
                type="button"
                disabled={actionLoading}
                onClick={handleUpdateStatus}
              >
                {actionLoading ? "Updating..." : "Update"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={actionLoading}
                onClick={handleDeleteSubscription}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-sm text-muted-foreground break-words">{value}</p>
    </div>
  );
}