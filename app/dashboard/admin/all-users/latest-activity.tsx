"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheckIcon, BriefcaseBusinessIcon, ClockIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Subscription {
  plan: {
    name: string;
  };
  status: string;
  startDate: string;
  endDate: string;
}

interface LatestActivityProps {
  user: Subscription[]; // yahan subscriptions aa rahi hain
}

export function LatestActivity({ user }: LatestActivityProps) {
  if (!user || user.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          No subscriptions found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
      </CardHeader>

      <CardContent className="ps-8">
        <ol className="relative border-s">
          {user.map((sub, index) => (
            <li key={index} className="ms-6 mb-10 space-y-2">
              <span className="bg-muted absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border">
                {sub.status === "active" ? (
                  <BadgeCheckIcon className="text-primary size-3" />
                ) : (
                  <BriefcaseBusinessIcon className="text-primary size-3" />
                )}
              </span>

              <h3 className="flex items-center font-semibold">
                {sub.plan.name}
                <Badge
                  variant={sub.status === "active" ? "default" : "outline"}
                  className="ms-2 capitalize">
                  {sub.status}
                </Badge>
              </h3>

              <time className="text-muted-foreground flex items-center gap-1.5 text-sm leading-none">
                <ClockIcon className="size-3" />
                {new Date(sub.startDate).toDateString()} —{" "}
                {new Date(sub.endDate).toDateString()}
              </time>

              
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
