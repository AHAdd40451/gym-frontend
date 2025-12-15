"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MiniMonthCalendarProps {
  currentMonth: Date;
  selectedWeekStart?: string;
  onDateClick?: (date: Date) => void;
}

export function MiniMonthCalendar({
  currentMonth,
  selectedWeekStart,
  onDateClick
}: MiniMonthCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and how many days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Adjust to Monday as first day (0 = Monday, 6 = Sunday)
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  // Get selected week dates if provided
  const selectedWeekDates: Date[] = [];
  if (selectedWeekStart) {
    const weekStart = new Date(selectedWeekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      selectedWeekDates.push(date);
    }
  }

  const isDateInSelectedWeek = (date: Date) => {
    return selectedWeekDates.some(
      (weekDate) =>
        weekDate.getDate() === date.getDate() &&
        weekDate.getMonth() === date.getMonth() &&
        weekDate.getFullYear() === date.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < adjustedStartingDay; i++) {
    days.push(null);
  }
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Day labels */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {dayLabels.map((label, index) => (
            <div key={index} className="text-muted-foreground text-center text-xs font-medium">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-8" />;
            }

            const isSelected = isDateInSelectedWeek(date);
            const isTodayDate = isToday(date);

            return (
              <button
                key={index}
                onClick={() => onDateClick?.(date)}
                className={`h-8 rounded-md text-sm font-medium transition-all hover:scale-110 ${
                  isTodayDate
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isSelected
                      ? "bg-primary/20 text-primary ring-primary/50 ring-2"
                      : "text-muted-foreground hover:bg-muted"
                }`}>
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
