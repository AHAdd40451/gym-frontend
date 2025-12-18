"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateKey } from "@/lib/utils/date";

interface MiniMonthCalendarProps {
  currentMonth: Date;
  selectedWeekStart?: string;
  onDateClick?: (date: Date) => void;
}

export function MiniMonthCalendar({ currentMonth, selectedWeekStart, onDateClick }: MiniMonthCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getMonthDays = (month: Date) => {
    const days: Date[] = [];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    let current = new Date(firstDay);
    while (current <= lastDay) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const days = getMonthDays(currentMonth);

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Month View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => (
            <div key={`${d}-${idx}`}>{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm">
          {days.map((date) => {
            const iso = formatDateKey(date);
            const isToday = date.getTime() === today.getTime();
            const isSelected = selectedWeekStart === iso;
            return (
              <button
                key={iso}
                onClick={() => onDateClick?.(date)}
                className={`rounded-lg p-2 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isToday
                      ? "bg-muted text-foreground"
                      : "hover:bg-muted/60"
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

