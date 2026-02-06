"use client";

import React, { useEffect, useState } from "react";
import { CalendarCheck, LogIn } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import Graph from "./Graph";

type StoredUser = {
  id?: string;
  _id?: string;
};

const Page = () => {
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");

    if (userStr) {
      try {
        const user: StoredUser = JSON.parse(userStr);

        // ✅ handle both id and _id
        const userId = user._id || user.id;

        if (userId) {
          setCurrentUser({ id: userId });
        }
      } catch (error) {
        console.error("Invalid user in localStorage");
      }
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md overflow-hidden">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-96" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="border border-border/70 shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-2 w-2 rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Loading attendance data…</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser?.id) {
    return (
      <div className="space-y-6 pb-10">
        <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/15">
                <CalendarCheck className="size-7 text-[var(--primary)]" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-semibold tracking-tight">Attendance</CardTitle>
                <CardDescription>
                  View your attendance history across the year.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="border border-destructive/50 bg-destructive/5 shadow-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <LogIn className="size-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-foreground">User not logged in</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Please sign in to view your attendance. Sign out and sign in again if the issue persists.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md overflow-hidden">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/15 shadow-sm">
              <CalendarCheck className="size-7 text-[var(--primary)]" />
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-semibold tracking-tight">Attendance</CardTitle>
              <CardDescription className="max-w-2xl">
                View your attendance history across the year. Green cells indicate days you were present at the gym.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border border-border/70 shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">Activity overview</CardTitle>
            <CardDescription>
              Contribution-style graph showing your gym attendance by day. Hover over a cell to see details.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Graph currentUser={currentUser} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
