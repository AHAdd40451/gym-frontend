"use client";
import * as React from "react";
import Link from "next/link";
import { BadgeCheckIcon, BriefcaseBusinessIcon, ClockIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getMySubscriptions, type Subscription } from "@/lib/api/services/subcription/subcription";

interface LatestActivityProps {
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
}

export function LatestActivity({ user }: LatestActivityProps) {
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
  async function fetchSubscriptions() {
    try {
      const subscriptionsData = await getMySubscriptions();
      console.log("🔥 subscriptionsData:", subscriptionsData); // 👈 Add this
      setSubscriptions(subscriptionsData);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  fetchSubscriptions();
}, []);


  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading your subscriptions...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{error}</p>
          <Button variant="outline" className="mt-3" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Hey <span className="font-semibold text-primary">{user?.firstName || "there"}</span>, you don't have any subscriptions yet.
          </p>
          <Button asChild className="mt-3">
            <Link href="/plans">View Available Plans</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
        <CardAction>
          <Link href="/subscriptions" className="text-muted-foreground hover:text-primary text-sm hover:underline">
            View All
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="ps-8">
        <ol className="relative border-s">
          {subscriptions.map((subscription, index) => {
            const planName = typeof subscription.plan === "object" && subscription.plan?.name ? subscription.plan.name : "Unknown Plan";
            const planPrice = typeof subscription.plan === "object" && subscription.plan?.priceCents ? `$${(subscription.plan.priceCents / 100).toFixed(2)}` : "";
            const startDate = new Date(subscription.currentPeriodStart).toLocaleDateString();
            const endDate = new Date(subscription.currentPeriodEnd).toLocaleDateString();
            const isLatest = index === 0;
            const isActive = subscription.status === "active";

            return (
              <li key={subscription._id} className="ms-6 mb-10 space-y-2 last:mb-0">
                <span className="bg-muted absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border">
                  {isActive ? <BadgeCheckIcon className="text-primary size-3" /> : <BriefcaseBusinessIcon className="text-primary size-3" />}
                </span>

                <h3 className="flex items-center font-semibold">
                  {planName} {planPrice && `- ${planPrice}`}
                  {isLatest && <Badge variant="outline" className="ms-2">Latest</Badge>}
                </h3>

                <time className="text-muted-foreground flex items-center gap-1.5 text-sm leading-none">
                  <ClockIcon className="size-3" /> {startDate} → {endDate}
                </time>

                <div className="flex items-center gap-2">
                  <Badge variant={isActive ? "default" : "secondary"} className="capitalize">
                    {subscription.status}
                  </Badge>
                  {subscription.cancelAtPeriodEnd && <Badge variant="destructive">Canceling at period end</Badge>}
                </div>

                {typeof subscription.plan === "object" && subscription.plan?.description && (
                  <p className="text-muted-foreground text-sm">{subscription.plan.description}</p>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
