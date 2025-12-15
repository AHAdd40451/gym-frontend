"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, UtensilsCrossed, Droplet, Target } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
}

function StatCard({ icon, label, value, description }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-colors">
            {icon}
          </div>
          <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-2xl font-bold">{value}</p>
        {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
      </CardContent>
    </Card>
  );
}

export function StatsOverview() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Weeks Planned"
          value="12"
          description="This month"
        />
        <StatCard
          icon={<UtensilsCrossed className="h-5 w-5" />}
          label="Diet Days Created"
          value="84"
          description="Total active"
        />
        <StatCard
          icon={<Droplet className="h-5 w-5" />}
          label="Avg Water Target"
          value="3.0L"
          description="Daily average"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Completion Rate"
          value="87%"
          description="This month"
        />
      </div>
    </div>
  );
}
