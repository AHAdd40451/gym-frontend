"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WeekCard } from "./components/week-card";

export default function DietCalendarPage() {
  // Get current month and year
  const now = new Date();
  const currentMonth = now.toLocaleString("default", { month: "long", year: "numeric" });

  // Calculate 4 weeks from current date
  const getWeeks = () => {
    const weeks = [];
    const today = new Date();
    
    // Get the start of the current week (Monday)
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - diff);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() + i * 7);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekNumber = i + 1;
      const startDate = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endDate = weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      weeks.push({
        weekNumber,
        dateRange: `${startDate} – ${endDate}`,
        weekStart: weekStart.toISOString().split("T")[0],
      });
    }
    
    return weeks;
  };

  const weeks = getWeeks();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Diet Calendar</h1>
        <p className="text-muted-foreground text-lg">{currentMonth}</p>
      </div>

      {/* Week Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {weeks.map((week) => (
          <WeekCard
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            dateRange={week.dateRange}
            weekStart={week.weekStart}
          />
        ))}
      </div>
    </div>
  );
}

