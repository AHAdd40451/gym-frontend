"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5003/api"
    : "https://gym.coderivals.ltd/api");

type RenewSubscriptionButtonProps = {
  subscriptionId: string;
  planName?: string;
  defaultAmount?: number;
};

export function RenewSubscriptionButton({
  subscriptionId,
  planName,
  defaultAmount,
}: RenewSubscriptionButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(
    defaultAmount ? String(defaultAmount) : ""
  );
  const [months, setMonths] = useState("1");
  const [loading, setLoading] = useState(false);

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

  const handleRenew = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!months || Number(months) <= 0) {
      toast.error("Please enter valid membership months");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/subscriptions/${subscriptionId}/renew`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            amount: Number(amount),
            currency: "PKR",
            months: Number(months),
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || "Failed to renew subscription");
      }

      toast.success("Subscription renewed and activated 🎉");

      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to renew subscription";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <RefreshCw className="size-3.5" />
        Renew
      </Button>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Renew Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Renewing <span className="font-medium text-foreground">{planName || "this plan"}</span> will
            reactivate the member's subscription starting today.
          </p>

          <div className="space-y-2">
            <Label htmlFor="renew-amount">Amount (PKR)</Label>
            <Input
              id="renew-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="renew-months">Membership Months</Label>
            <Input
              id="renew-months"
              type="number"
              min={1}
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleRenew} disabled={loading} className="flex-1">
              {loading ? "Renewing..." : "Renew & Activate"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
