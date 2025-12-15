"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayDietCard } from "../components/day-diet-card";
import { CopyPasteToolbar } from "../components/copy-paste-toolbar";
import { useDietCopy, WeekDietData, DayDietData } from "../context/diet-copy-context";
import { toast } from "sonner";

interface WeekDetailsPageProps {
  params: Promise<{
    week: string;
  }>;
}

export default function WeekDetailsPage({ params }: WeekDetailsPageProps) {
  // Unwrap params Promise in Next.js 16
  const resolvedParams = React.use(params);

  // Parse the week start date from params
  const weekStartDate = new Date(resolvedParams.week);

  // Calculate the date range for the week
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  const startDateStr = weekStartDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const endDateStr = weekEndDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const dateRange = `${startDateStr} – ${endDateStr}`;

  // Days of the week
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // State for week diet data
  const [weekData, setWeekData] = useState<WeekDietData>({});
  const [isPasted, setIsPasted] = useState(false);
  const { copyWeek, copiedWeekData } = useDietCopy();

  // Handle paste highlight animation
  React.useEffect(() => {
    if (isPasted) {
      const timer = setTimeout(() => setIsPasted(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPasted]);

  const handleCopy = () => {
    copyWeek(weekData);
  };

  const handlePaste = () => {
    if (copiedWeekData) {
      setWeekData(copiedWeekData);
      setIsPasted(true);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <Link href="/dashboard/user/diet-calendar">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Calendar
        </Button>
      </Link>

      {/* Header with Copy/Paste Toolbar */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h1 className="text-foreground text-3xl font-bold">Week Overview</h1>
          <p className="text-muted-foreground text-lg">{dateRange}</p>
        </div>
        <CopyPasteToolbar onCopy={handleCopy} onPaste={handlePaste} type="week" />
      </div>

      {/* Day Cards Grid */}
      <div
        className={`grid grid-cols-1 gap-6 transition-all duration-500 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 ${
          isPasted ? "ring-primary/50 rounded-lg p-2 ring-2" : ""
        }`}>
        {daysOfWeek.map((day) => (
          <DayDietCard key={day} dayName={day} weekStart={resolvedParams.week} />
        ))}
      </div>
    </div>
  );
}
