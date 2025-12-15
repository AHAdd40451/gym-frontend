"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayDietCard } from "@/app/dashboard/staff/diet-calendar/components/day-diet-card";
import { useDietCopy, WeekDietData } from "@/app/dashboard/staff/diet-calendar/context/diet-copy-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { weeklyPlanSnapshot } from "../mock-data";

interface WeekDetailsPageProps {
  params: Promise<{
    week: string;
  }>;
}

export default function UserWeekDetailsPage({ params }: WeekDetailsPageProps) {
  const resolvedParams = React.use(params);
  const weekStartDate = new Date(resolvedParams.week);
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

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [weekData, setWeekData] = React.useState<WeekDietData>({});
  const [isPasted, setIsPasted] = React.useState(false);
  const { copyWeek, copiedWeekData } = useDietCopy();

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
      <Link href="/dashboard/user/diet-calendar">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Calendar
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h1 className="text-foreground text-3xl font-bold">Week Overview</h1>
          <p className="text-muted-foreground text-lg">{dateRange}</p>
        </div>
        {/* Copy/Paste hidden on user view intentionally */}
      </div>

      <div
        className={`grid grid-cols-1 gap-6 transition-all duration-500 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 ${isPasted ? "ring-primary/50 rounded-lg p-2 ring-2" : ""}`}>
        {daysOfWeek.map((day) => (
          <DayDietCard key={day} dayName={day} weekStart={resolvedParams.week} />
        ))}
      </div>

      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">This Week&apos;s Diet Plan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {weeklyPlanSnapshot.map((item) => (
            <div
              key={item.day}
              className="border-border/60 bg-muted/30 hover:bg-muted/60 rounded-lg border p-4 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-foreground font-semibold">{item.day}</p>
                <span className="text-xs font-medium text-primary">{item.focus}</span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{item.calories}</p>
              <p className="text-muted-foreground text-xs">Hydration: {item.hydration}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

