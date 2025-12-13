"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

interface WeekCardProps {
  weekNumber: number;
  dateRange: string;
  weekStart: string;
  weekDates?: Date[];
  isCurrentWeek?: boolean;
}

export function WeekCard({
  weekNumber,
  dateRange,
  weekStart,
  weekDates = [],
  isCurrentWeek = false
}: WeekCardProps) {
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Link href={`/dashboard/user/diet-calendar/${weekStart}`} className="block w-[300px]">
      <Card
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${
          isCurrentWeek
            ? "border-primary bg-primary/5 shadow-lg"
            : "border-border bg-card hover:border-primary/50"
        }`}>
        {/* Gradient overlay */}
        <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Week {weekNumber}</CardTitle>
            <CalendarIcon className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          <p className="text-muted-foreground text-sm font-medium">{dateRange}</p>

          {/* Mini weekday row */}
          <div className="flex items-center justify-between gap-1">
            {dayLabels.map((label, index) => {
              const dayDate = weekDates[index];
              const isToday =
                dayDate &&
                dayDate.getDate() === today.getDate() &&
                dayDate.getMonth() === today.getMonth() &&
                dayDate.getFullYear() === today.getFullYear();

              return (
                <div
                  key={index}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
                    isToday
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                  }`}>
                  {label}
                </div>
              );
            })}
          </div>
        </CardContent>

        {/* Current week indicator */}
        {isCurrentWeek && (
          <div className="absolute top-2 right-2">
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
          </div>
        )}
      </Card>
    </Link>
  );
}
