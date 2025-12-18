"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExportButton } from "@/components/CardActionMenus";
import { getAdminDashboard } from "@/lib/api/Admin/admin";

type SalesData = {
  country: string;
  percentage: number;
  value: number;
  change: number;
};

export function EcommerceSalesByLocationCard() {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
       const token = localStorage.getItem("authToken");
        if (!token) return;

        const res = await getAdminDashboard(token);

        const total = res.salesByLocation.reduce(
          (sum: number, item: any) => sum + item.totalIncome,
          0
        );

        const formatted = res.salesByLocation.map((item: any) => ({
          country: item._id || "Unknown",
          value: item.totalIncome,
          percentage: total
            ? Math.round((item.totalIncome / total) * 100)
            : 0,
          change: Math.round(Math.random() * 8 - 3), // later real MoM
        }));

        setData(formatted);
      } catch (err) {
        console.error("❌ Sales by location error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Card className="h-[320px] animate-pulse" />;

  return (
    <Card className="lg:col-span-6 xl:col-span-4">
      <CardHeader>
        <CardTitle className="relative">
          Sales by Location
          <div className="absolute end-0 top-0">
            <ExportButton />
          </div>
        </CardTitle>
        <CardDescription>Income in the last 28 days</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          {data.map((item) => (
            <div key={item.country} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.country}</span>
                  <Badge
                    variant="outline"
                    className={item.change >= 0 ? "text-green-500" : "text-red-500"}
                  >
                    {item.change >= 0 ? "+" : ""}
                    {item.change}%
                  </Badge>
                </div>
                <div className="text-sm">{item.percentage}%</div>
              </div>
              <Progress value={item.percentage} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
