"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="from-primary/10 via-primary/5 to-background relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 shadow-sm">
      <div className="relative z-10 space-y-4">
        <div className="space-y-2">
          <h1 className="text-foreground text-4xl font-bold">Diet Calendar</h1>
          <p className="text-muted-foreground text-lg">Plan weekly nutrition efficiently</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-foreground text-2xl font-semibold">
              {currentMonth} {currentYear}
            </p>
            <p className="text-muted-foreground text-sm">Current viewing period</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onPreviousMonth}
              className="hover:bg-primary/10 h-10 w-10 rounded-full border-2 transition-all hover:scale-110">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextMonth}
              className="hover:bg-primary/10 h-10 w-10 rounded-full border-2 transition-all hover:scale-110">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="bg-primary/5 absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl" />
      <div className="bg-primary/5 absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-2xl" />
    </div>
  );
}
