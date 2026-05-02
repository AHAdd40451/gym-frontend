"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface MonthlyRevenue {
  month: string;
  year: number;
  totalRevenue: number;
  ordersRevenue: number;
  subscriptionsRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
  totalSubscriptions: number;
}

export function EcommerceTotalRevenueCard() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const res = await fetch("http://localhost:5003/api/dashboard/monthly-revenue");
        const data = await res.json();
        setMonthlyRevenue(data);
      } catch (error) {
        console.error("Error fetching monthly revenue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyRevenue();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
          <CardDescription>Loading monthly data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>Click on a month for detailed breakdown</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {monthlyRevenue.slice(0, 6).map((month) => (
            <Link
              key={`${month.year}-${month.month}`}
              href={`/dashboard/admin/ecommerce/revenue-details/${month.year}-${month.month}`}
              className="block"
            >
              <div className="p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {new Date(month.year, month.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Orders: {month.totalOrders} | Delivered: {month.deliveredOrders}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      $ {month.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Subs: {month.totalSubscriptions}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}