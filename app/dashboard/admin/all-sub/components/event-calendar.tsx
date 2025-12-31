"use client";

import { useEffect, useMemo, useState } from "react";
import { RiCalendarCheckLine } from "@remixicon/react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks
} from "date-fns";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CalendarDndProvider,
  CalendarEvent,
  CalendarView,
  DayView,
  MonthView,
  WeekView,
  AgendaView,
  AgendaDaysToShow,
  EventGap,
  EventHeight,
  WeekCellsHeight
} from "./";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export interface EventCalendarProps {
  events?: CalendarEvent[];
  onEventSelect?: (event: CalendarEvent) => void;
  onEventCreate?: (startTime: Date) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  className?: string;
  initialView?: CalendarView;
}

export function EventCalendar({
  events = [],
  onEventSelect,
  onEventCreate,
  onEventUpdate,
  className,
  initialView = "month"
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(initialView);

  const handlePrevious = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, -1));
    else if (view === "agenda") setCurrentDate(addDays(currentDate, -AgendaDaysToShow));
  };

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, 1));
    else if (view === "agenda") setCurrentDate(addDays(currentDate, AgendaDaysToShow));
  };

  const handleToday = () => setCurrentDate(new Date());

  const viewTitle = useMemo(() => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return isSameMonth(start, end)
        ? format(start, "MMMM yyyy")
        : `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
    }
    if (view === "day") return format(currentDate, "EEEE, MMM d, yyyy");
    if (view === "agenda") {
      const start = currentDate;
      const end = addDays(currentDate, AgendaDaysToShow - 1);
      return isSameMonth(start, end)
        ? format(start, "MMMM yyyy")
        : `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
    }
    return format(currentDate, "MMMM yyyy");
  }, [currentDate, view]);

  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-var(--header-height)-3rem)] flex-col rounded-lg border",
        className
      )}
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`
        } as React.CSSProperties
      }>
      <CalendarDndProvider onEventUpdate={onEventUpdate || (() => {})}>
        <div className="flex items-center justify-between p-2 sm:p-4">
          <div className="flex items-center gap-1 sm:gap-4">
            <Button variant="outline" onClick={handleToday}>
              <RiCalendarCheckLine size={16} />
              <span className="sr-only">Today</span>
            </Button>
            <div className="flex items-center sm:gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <ChevronLeftIcon size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRightIcon size={16} />
              </Button>
            </div>
            <h2 className="text-sm font-semibold sm:text-lg md:text-xl">{viewTitle}</h2>
          </div>
          <div className="flex items-center gap-2"></div>
        </div>

        <div className="flex flex-1 flex-col">
          {view === "month" && (
            <MonthView currentDate={currentDate} events={events} onEventSelect={onEventSelect || (() => {})} onEventCreate={onEventCreate || (() => {})} />
          )}
          {view === "week" && (
            <WeekView currentDate={currentDate} events={events} onEventSelect={onEventSelect || (() => {})} onEventCreate={onEventCreate || (() => {})} />
          )}
          {view === "day" && (
            <DayView currentDate={currentDate} events={events} onEventSelect={onEventSelect || (() => {})} onEventCreate={onEventCreate || (() => {})} />
          )}
          {view === "agenda" && (
            <AgendaView currentDate={currentDate} events={events} onEventSelect={onEventSelect || (() => {})} />
          )}
        </div>
      </CalendarDndProvider>
    </div>
  );
}
