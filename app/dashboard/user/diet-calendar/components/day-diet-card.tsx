"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { formatDateKey } from "@/lib/utils/date";

interface DayDietCardProps {
  dayName: string;
  weekStart: string;
}

export function DayDietCard({ dayName, weekStart }: DayDietCardProps) {
  const getDayDate = () => {
    if (!weekStart) return "";
    const weekStartDate = new Date(weekStart);
    if (isNaN(weekStartDate.getTime())) return "";

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayIndex = daysOfWeek.indexOf(dayName);
    if (dayIndex === -1) return "";

    const dayDate = new Date(weekStartDate);
    dayDate.setDate(weekStartDate.getDate() + dayIndex);
    if (isNaN(dayDate.getTime())) return "";
    return formatDateKey(dayDate);
  };

  const dayDate = getDayDate();
  if (!dayDate || !weekStart) {
    return (
      <Card className="rounded-lg border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">{dayName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Invalid date</p>
        </CardContent>
      </Card>
    );
  }

  const dayRoute = `${weekStart}/${dayDate}`;

  return (
    <Link href={`/dashboard/user/diet-calendar/${dayRoute}`}>
      <Card className="group cursor-pointer rounded-lg border shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{dayName}</CardTitle>
            <ChevronRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Click to view diet plan details</p>
        </CardContent>
      </Card>
    </Link>
  );
}

