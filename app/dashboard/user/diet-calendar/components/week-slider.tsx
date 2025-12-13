"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekCard } from "./week-card";

interface Week {
  weekNumber: number;
  dateRange: string;
  weekStart: string;
  weekDates: Date[];
  isCurrentWeek: boolean;
}

interface WeekSliderProps {
  weeks: Week[];
}

export function WeekSlider({ weeks }: WeekSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll =
        direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative p-4">
      {/* Left scroll button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("left")}
        className="bg-background/80 hover:bg-background absolute top-1/2 left-0 z-10 h-10 w-10 -translate-y-1/2 rounded-full shadow-md backdrop-blur-sm">
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch"
        }}>
        {weeks.map((week) => (
          <div
            key={week.weekNumber}
            data-week={week.weekStart}
            className="flex-shrink-0"
            style={{ scrollSnapAlign: "start" }}>
            <WeekCard
              weekNumber={week.weekNumber}
              dateRange={week.dateRange}
              weekStart={week.weekStart}
              weekDates={week.weekDates}
              isCurrentWeek={week.isCurrentWeek}
            />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("right")}
        className="bg-background/80 hover:bg-background absolute top-1/2 right-0 z-10 h-10 w-10 -translate-y-1/2 rounded-full shadow-md backdrop-blur-sm">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
