"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

interface WeekCardProps {
  weekNumber: number;
  dateRange: string;
  weekStart: string;
}

export function WeekCard({ weekNumber, dateRange, weekStart }: WeekCardProps) {
  return (
    <Link href={`/dashboard/user/diet-calendar/${weekStart}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border rounded-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Week {weekNumber}</CardTitle>
            <CalendarIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

