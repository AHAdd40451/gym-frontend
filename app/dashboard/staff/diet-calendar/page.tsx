"use client";

import React, { useState, useMemo } from "react";
import { CalendarHeader } from "./components/calendar-header";
import { WeekSlider } from "./components/week-slider";
import { MiniMonthCalendar } from "./components/mini-month-calendar";
import { StatsOverview } from "./components/stats-overview";

export default function DietCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all weeks for the current month
  const getWeeksForMonth = (month: Date) => {
    const weeks: Array<{
      weekNumber: number;
      dateRange: string;
      weekStart: string;
      weekDates: Date[];
      isCurrentWeek: boolean;
    }> = [];

    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    // Get first day of month
    const firstDay = new Date(year, monthIndex, 1);
    // Get last day of month
    const lastDay = new Date(year, monthIndex + 1, 0);

    // Find the Monday of the week containing the first day
    const firstDayOfWeek = firstDay.getDay();
    const daysToMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    let weekStart = new Date(firstDay);
    weekStart.setDate(firstDay.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let weekNumber = 1;
    let currentWeekStart = weekStart;

    // Generate weeks until we've covered the entire month
    while (currentWeekStart <= lastDay || currentWeekStart.getMonth() === monthIndex) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);

      // Check if this week overlaps with the current month
      if (weekEnd >= firstDay || currentWeekStart <= lastDay) {
        const weekDates: Date[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(currentWeekStart);
          date.setDate(currentWeekStart.getDate() + i);
          weekDates.push(date);
        }

        const startDate = currentWeekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        });
        const endDate = weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        });

        // Check if current week contains today
        const isCurrentWeek =
          today >= currentWeekStart && today <= weekEnd && today.getMonth() === monthIndex;

        weeks.push({
          weekNumber,
          dateRange: `${startDate} – ${endDate}`,
          weekStart: currentWeekStart.toISOString().split("T")[0],
          weekDates,
          isCurrentWeek
        });

        weekNumber++;
      }

      // Move to next week
      currentWeekStart = new Date(currentWeekStart);
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);

      // Stop if we've gone past the month
      if (currentWeekStart.getMonth() > monthIndex && currentWeekStart > lastDay) {
        break;
      }
    }

    return weeks;
  };

  const weeks = useMemo(() => getWeeksForMonth(currentMonth), [currentMonth]);

  const currentWeek = weeks.find((w) => w.isCurrentWeek);
  const selectedWeekStart = currentWeek?.weekStart;

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  const handleDateClick = (date: Date) => {
    // Find the week that contains this date
    const clickedWeek = weeks.find((week) => {
      return week.weekDates.some(
        (weekDate) =>
          weekDate.getDate() === date.getDate() &&
          weekDate.getMonth() === date.getMonth() &&
          weekDate.getFullYear() === date.getFullYear()
      );
    });

    if (clickedWeek) {
      // Scroll to the clicked week (UI only)
      const weekElement = document.querySelector(`[data-week="${clickedWeek.weekStart}"]`);
      if (weekElement) {
        weekElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Enhanced Header */}
      <CalendarHeader
        currentMonth={monthName}
        currentYear={year}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Week Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Weekly Plans</h2>
          <p className="text-muted-foreground text-sm">
            {weeks.length} {weeks.length === 1 ? "week" : "weeks"} in {monthName}
          </p>
        </div>
        <WeekSlider weeks={weeks} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Mini Calendar */}
        <div className="lg:col-span-1">
          <MiniMonthCalendar
            currentMonth={currentMonth}
            selectedWeekStart={selectedWeekStart}
            onDateClick={handleDateClick}
          />
        </div>

        {/* Stats Overview */}
        <div className="lg:col-span-2">
          <StatsOverview />
        </div>
      </div>
    </div>
  );
}
