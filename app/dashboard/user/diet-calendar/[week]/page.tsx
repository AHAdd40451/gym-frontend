"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayDietCard } from "../components/day-diet-card";

interface WeekDetailsPageProps {
  params: {
    week: string;
  };
}

export default function WeekDetailsPage({ params }: WeekDetailsPageProps) {
  // Parse the week start date from params
  const weekStartDate = new Date(params.week);

  // Calculate the date range for the week
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  const startDateStr = weekStartDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const endDateStr = weekEndDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const dateRange = `${startDateStr} – ${endDateStr}`;

  // Days of the week
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <Link href="/dashboard/user/diet-calendar">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Calendar
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-foreground text-3xl font-bold">Week Overview</h1>
        <p className="text-muted-foreground text-lg">{dateRange}</p>
      </div>

      {/* Day Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {daysOfWeek.map((day) => (
          <DayDietCard key={day} dayName={day} />
        ))}
      </div>
    </div>
  );
}
