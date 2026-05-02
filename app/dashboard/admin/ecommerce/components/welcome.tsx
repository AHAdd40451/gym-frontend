"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EcommerceWelcomeCard() {
  const [income, setIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setIsLoading(true);

        const res = await fetch("http://localhost:5003/api/dashboard/revenue");
        const data = await res.json();

        // ✅ total revenue set
        setIncome(data.totalRevenue || 0);

      } catch (error) {
        console.error("Error fetching revenue:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  return (
    <Card className="bg-muted relative overflow-hidden md:col-span-12 lg:col-span-4">
      <CardHeader>
        {/* ✅ title change */}
        <CardTitle className="text-2xl">Monthly Income 💰</CardTitle>
        <CardDescription>All time earnings</CardDescription>
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