"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboard } from "@/lib/api/Admin/admin";

export function EcommerceWelcomeCard() {
  const [income, setIncome] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getAdminDashboard(token);
        setIncome(data.monthlyIncome.current);
        setGrowth(data.monthlyIncome.growth);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="bg-muted relative overflow-hidden md:col-span-12 lg:col-span-4">
      <CardHeader>
        <CardTitle className="text-2xl">Monthly Income 💰</CardTitle>
        <CardDescription>Current month earnings</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-3xl">
                ${income.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-xs">
                <span className={growth >= 0 ? "text-green-500" : "text-red-500"}>
                  {growth >= 0 ? "+" : ""}
                  {growth}%
                </span>{" "}
                from last month
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <Image
        width={800}
        height={300}
        src={`/star-shape.png`}
        className="pointer-events-none absolute inset-0"
        unoptimized
        alt="background"
      />
    </Card>
  );
}