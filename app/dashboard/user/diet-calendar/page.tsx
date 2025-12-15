"use client";

import React, { useMemo, useState } from "react";
import { CalendarHeader } from "@/app/dashboard/staff/diet-calendar/components/calendar-header";
import { WeekSlider } from "@/app/dashboard/staff/diet-calendar/components/week-slider";
import { MiniMonthCalendar } from "@/app/dashboard/staff/diet-calendar/components/mini-month-calendar";
import { StatsOverview } from "@/app/dashboard/staff/diet-calendar/components/stats-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockUserDietPlan } from "./mock-data";

export default function UserDietCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    const firstDayOfWeek = firstDay.getDay();
    const daysToMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    let weekStart = new Date(firstDay);
    weekStart.setDate(firstDay.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let weekNumber = 1;
    let currentWeekStart = weekStart;

    while (currentWeekStart <= lastDay || currentWeekStart.getMonth() === monthIndex) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);

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

      currentWeekStart = new Date(currentWeekStart);
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);

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
    const clickedWeek = weeks.find((week) => {
      return week.weekDates.some(
        (weekDate) =>
          weekDate.getDate() === date.getDate() &&
          weekDate.getMonth() === date.getMonth() &&
          weekDate.getFullYear() === date.getFullYear()
      );
    });

    if (clickedWeek) {
      const weekElement = document.querySelector(`[data-week="${clickedWeek.weekStart}"]`);
      if (weekElement) {
        weekElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  // Today bottom highlight
  const todayKey = new Date().toISOString().split("T")[0];
  const todayPreset = mockUserDietPlan[todayKey] ?? mockUserDietPlan.default;
  const todaysMeals = Object.entries(todayPreset.dietData.meals).slice(0, 3);

  return (
    <div className="container mx-auto space-y-8 p-6">
      <CalendarHeader
        currentMonth={monthName}
        currentYear={year}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Today quick preview placed near top for immediate visibility */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Today&apos;s Diet Plan</CardTitle>
            <Badge variant="outline">Auto-selected</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Target {todayPreset.summary.targetCalories} kcal · P {todayPreset.summary.protein}g · C{" "}
            {todayPreset.summary.carbs}g · F {todayPreset.summary.fats}g · Water {todayPreset.summary.water}
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {todaysMeals.map(([id, meal]) => (
            <div key={id} className="bg-muted/40 rounded-lg p-4">
              <p className="text-foreground font-semibold capitalize">{id.replace("-", " ")}</p>
              <p className="text-muted-foreground text-sm line-clamp-2">{meal.description}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                {meal.calories} kcal · P {meal.protein}g · C {meal.carbs}g · F {meal.fats}g
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Weekly Diet Plans</h2>
          <p className="text-muted-foreground text-sm">
            {weeks.length} {weeks.length === 1 ? "week" : "weeks"} in {monthName}
          </p>
        </div>
        <WeekSlider weeks={weeks} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MiniMonthCalendar
            currentMonth={currentMonth}
            selectedWeekStart={selectedWeekStart}
            onDateClick={handleDateClick}
          />
        </div>
        <div className="lg:col-span-2">
          <StatsOverview />
        </div>
      </div>
    </div>
  );
}

