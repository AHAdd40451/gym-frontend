"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarHeader } from "@/app/dashboard/user/diet-calendar/components/calendar-header";
import { WeekSlider } from "@/app/dashboard/user/diet-calendar/components/week-slider";
import { MiniMonthCalendar } from "@/app/dashboard/user/diet-calendar/components/mini-month-calendar";
import { StatsOverview } from "@/app/dashboard/user/diet-calendar/components/stats-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DietPlanPreset, mockUserDietPlan } from "./mock-data";
import { getAllMeals, MealPlanDocument } from "@/lib/api/services/meals/meals";
import { getCurrentUserId, getLocalDayRangeIso, transformMealPlanToPreset } from "./utils";
import { formatDateKey } from "@/lib/utils/date";

export default function UserDietCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [todayPreset, setTodayPreset] = useState<DietPlanPreset | null>(null);
  const [todayError, setTodayError] = useState<string | null>(null);
  const [todayLoading, setTodayLoading] = useState(false);

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
          weekStart: formatDateKey(currentWeekStart),
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
  const todayDate = new Date();
  const todayKey = formatDateKey(todayDate);

  useEffect(() => {
    const fetchTodayPlan = async () => {
      setTodayLoading(true);
      try {
        const token =
          (typeof window !== "undefined" &&
            (localStorage.getItem("authToken") || localStorage.getItem("token"))) ||
          "";
        const userId = getCurrentUserId();

        if (!userId || !token) {
          setTodayPreset(mockUserDietPlan[todayKey] ?? mockUserDietPlan.default);
          setTodayError("Missing user or token, showing sample plan.");
          return;
        }

        const { startIso, endIso } = getLocalDayRangeIso(todayDate);
        const res = await getAllMeals({ user: userId, startDate: startIso, endDate: endIso }, token);
        const payload = (res as any)?.data ?? res;
        const list: MealPlanDocument[] =
          payload?.meals ?? payload?.data ?? (Array.isArray(payload) ? payload : []);

        if (Array.isArray(list) && list.length > 0) {
          setTodayPreset(transformMealPlanToPreset(list[0]));
          setTodayError((res as any)?.error || null);
        } else {
          setTodayPreset(mockUserDietPlan[todayKey] ?? mockUserDietPlan.default);
          setTodayError("No plan found for today; showing sample plan.");
        }
      } catch (err: any) {
        console.error("Failed to load today diet plan", err);
        setTodayPreset(mockUserDietPlan[todayKey] ?? mockUserDietPlan.default);
        setTodayError("Unable to load plan; showing sample plan.");
      } finally {
        setTodayLoading(false);
      }
    };

    fetchTodayPlan();
  }, [todayKey]);

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
  const todaysPreset = todayPreset ?? mockUserDietPlan[todayKey] ?? mockUserDietPlan.default;
  const todaysMeals = Object.entries(todaysPreset.dietData.meals).slice(0, 3);

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
            {todayLoading && (
              <p className="text-muted-foreground text-xs">Loading today&apos;s plan...</p>
            )}
            {todayError && <p className="text-amber-600 text-xs">{todayError}</p>}
          <p className="text-muted-foreground text-sm">
            Target {todaysPreset.summary.targetCalories} kcal · P {todaysPreset.summary.protein}g · C{" "}
            {todaysPreset.summary.carbs}g · F {todaysPreset.summary.fats}g · Water {todaysPreset.summary.water}
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

