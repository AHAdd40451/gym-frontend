"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Package, Truck, Users } from "lucide-react";

interface MonthlyRevenueDetail {
  month: string;
  year: number;
  totalRevenue: number;
  ordersRevenue: number;
  subscriptionsRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    orders: number;
    subscriptions: number;
  }>;
}

export default function RevenueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<MonthlyRevenueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const monthYear = params.month as string;
  const [year, month] = monthYear.split('-').map(Number);

  useEffect(() => {
    const fetchMonthlyDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/revenue-details/${year}/${month}`);
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching monthly details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (year && month) {
      fetchMonthlyDetails();
    }
  }, [year, month]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Loading...</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Revenue Details</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No data available for this month.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Revenue Details</h1>
          <p className="text-muted-foreground">{monthName}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              $ {data.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Delivered: {data.deliveredOrders} | Pending: {data.pendingOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Active: {data.activeSubscriptions} | Cancelled: {data.cancelledSubscriptions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalOrders > 0 ? Math.round((data.deliveredOrders / data.totalOrders) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.deliveredOrders} of {data.totalOrders} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Orders vs Subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Orders Revenue</span>
                <span className="font-medium">$ {data.ordersRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Subscriptions Revenue</span>
                <span className="font-medium">$ {data.subscriptionsRevenue.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>$ {data.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Delivery performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Orders</span>
                <span className="font-medium">{data.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivered</span>
                <span className="font-medium text-green-600">{data.deliveredOrders}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-medium text-orange-600">{data.pendingOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
          <CardDescription>Revenue and activity by day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.dailyBreakdown.map((day) => (
              <div key={day.date} className="flex justify-between items-center p-2 rounded border">
                <div>
                  <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {day.orders} orders, {day.subscriptions} subscriptions
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">$ {day.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}