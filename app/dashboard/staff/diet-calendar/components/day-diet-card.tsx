"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface DayDietCardProps {
  dayName: string;
  weekStart: string;
}

export function DayDietCard({ dayName, weekStart }: DayDietCardProps) {
  // Calculate the day's date based on week start and day name
  const getDayDate = () => {
    if (!weekStart) return "";

    const weekStartDate = new Date(weekStart);

    // Check if date is valid
    if (isNaN(weekStartDate.getTime())) {
      return "";
    }

    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ];
    const dayIndex = daysOfWeek.indexOf(dayName);

    if (dayIndex === -1) {
      return "";
    }

    const dayDate = new Date(weekStartDate);
    dayDate.setDate(weekStartDate.getDate() + dayIndex);

    // Check if resulting date is valid
    if (isNaN(dayDate.getTime())) {
      return "";
    }

    return dayDate.toISOString().split("T")[0];
  };

  const dayDate = getDayDate();

  // Only render link if we have a valid date
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
    <Link href={`/dashboard/staff/diet-calendar/${dayRoute}`}>
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
