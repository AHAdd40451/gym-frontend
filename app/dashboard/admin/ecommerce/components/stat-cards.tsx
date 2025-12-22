"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// 👇 apni API import karo
import { getAdminDashboard } from "@/lib/api/Admin/admin";

type StatItem = {
  name: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  href: string;
};

export default function StatCards() {
  const [cards, setCards] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("❌ Token not found");
          setLoading(false);
          return;
        }

        // ✅ API CALL
        const res = await getAdminDashboard(token);

        /**
         * Expected backend response shape:
         * {
         *  summary: { totalUsers }
         *  monthlyIncome: { current, growth }
         *  userGrowth: { growth }
         * }
         */

        const formattedData: StatItem[] = [
          {
            name: "Monthly recurring revenue",
            value: `$${res.monthlyIncome.current.toLocaleString()}`,
            change: `${res.monthlyIncome.growth}%`,
            changeType:
              res.monthlyIncome.growth >= 0 ? "positive" : "negative",
            href: "#",
          },
          {
            name: "Users",
            value: res.summary.totalUsers.toLocaleString(),
            change: "+",
            changeType: "positive",
            href: "#",
          },
          {
            name: "User growth",
            value: `${res.userGrowth.growth}%`,
            change: `${res.userGrowth.growth}%`,
            changeType:
              res.userGrowth.growth >= 0 ? "positive" : "negative",
            href: "#",
          },
        ];

        setCards(formattedData);
      } catch (error) {
        console.error("❌ Stats API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 🔄 Loading Skeleton
  if (loading) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="py-0">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start justify-between space-x-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/20"></div>
                  <div className="h-4 w-12 animate-pulse rounded bg-muted-foreground/20"></div>
                </div>
                <div className="h-9 w-24 animate-pulse rounded bg-muted-foreground/20"></div>
              </CardContent>
              <CardFooter className="border-border flex justify-end border-t p-0">
                <div className="h-10 w-28 animate-pulse rounded bg-muted-foreground/20 m-3"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <Card key={item.name} className="py-0">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between space-x-2">
                <span className="text-muted-foreground truncate text-sm">
                  {item.name}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    item.changeType === "positive"
                      ? "text-emerald-700 dark:text-emerald-500"
                      : "text-red-700 dark:text-red-500"
                  )}
                >
                  {item.change}
                </span>
              </div>

              <dd className="text-foreground mt-1 text-3xl font-semibold">
                {item.value}
              </dd>
            </CardContent>

            <CardFooter className="border-border flex justify-end border-t p-0">
              <Link
                href={item.href}
                className="text-primary hover:text-primary/90 flex items-center px-6 py-3 text-sm font-medium"
              >
                View more <ArrowRightIcon className="ms-2 size-4" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}