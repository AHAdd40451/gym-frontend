"use client";

import React from "react";
import { WeekCard } from "./week-card";
import { useDietCopy } from "../../../staff/diet-calendar/context/diet-copy-context";

interface WeekSliderProps {
  weeks: Array<{
    weekNumber: number;
    dateRange: string;
    weekStart: string;
    weekDates: Date[];
    isCurrentWeek: boolean;
  }>;
}

export function WeekSlider({ weeks }: WeekSliderProps) {
  const { copyWeek, copiedWeekData, copyDay } = useDietCopy();

  const handleCopy = (weekStart: string) => {
    const data = copiedWeekData || {};
    copyWeek(data);
  };

  const handlePaste = (weekStart: string) => {
    // No-op placeholder; in user view we may not paste, but keep for parity
    if (copiedWeekData) {
      copyWeek(copiedWeekData);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {weeks.map((week) => (
        <WeekCard
          key={week.weekStart}
          weekNumber={week.weekNumber}
          dateRange={week.dateRange}
          weekStart={week.weekStart}
          weekDates={week.weekDates}
          isCurrentWeek={week.isCurrentWeek}
          onCopy={() => handleCopy(week.weekStart)}
          onPaste={() => handlePaste(week.weekStart)}
        />
      ))}
    </div>
  );
}

