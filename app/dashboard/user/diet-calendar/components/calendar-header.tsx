"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentMonth: string;
  currentYear: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({
  currentMonth,
  currentYear,
  onPreviousMonth,
  onNextMonth
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">Diet Calendar</h1>
        <p className="text-muted-foreground text-sm">
          {currentMonth} {currentYear}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}



