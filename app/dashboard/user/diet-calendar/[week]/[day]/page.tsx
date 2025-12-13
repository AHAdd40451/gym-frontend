"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealCard } from "../components/meal-card";
import { WaterIntakeCard } from "../components/water-intake-card";
import { SupplementSection } from "../components/supplement-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface DayDetailPageProps {
  params: Promise<{
    week: string;
    day: string;
  }>;
}

export default function DayDetailPage({ params }: DayDetailPageProps) {
  // Unwrap params Promise in Next.js 16
  const resolvedParams = React.use(params);

  // Parse dates
  const dayDate = new Date(resolvedParams.day);
  const weekStartDate = new Date(resolvedParams.week);

  // Get day name from the date
  const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" });

  // Format date for display
  const dateStr = dayDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // Meals configuration
  const meals = [
    { name: "Breakfast", id: "breakfast" },
    { name: "Mid-Morning Snack", id: "mid-morning" },
    { name: "Lunch", id: "lunch" },
    { name: "Evening Snack", id: "evening" },
    { name: "Dinner", id: "dinner" }
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <Link href={`/dashboard/user/diet-calendar/${resolvedParams.week}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Week View
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-foreground text-3xl font-bold">Diet Plan – {dayName}</h1>
        <p className="text-muted-foreground text-lg">{dateStr}</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Meal Schedule */}
        <div className="space-y-6 lg:col-span-2">
          {/* Meal Schedule Section */}
          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Meal Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {meals.map((meal) => (
                <MealCard key={meal.id} mealName={meal.name} mealId={meal.id} />
              ))}
            </CardContent>
          </Card>

          {/* Dietary Instructions Section */}
          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Dietary Instructions & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="special-instructions" className="text-sm font-medium">
                  Special Instructions
                </Label>
                <Textarea
                  id="special-instructions"
                  placeholder="Enter any special dietary instructions, allergies, food restrictions, or notes..."
                  className="min-h-[150px] resize-none"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-6">
          {/* Water Intake */}
          <WaterIntakeCard />

          {/* Supplements */}
          <SupplementSection />

          {/* Compliance Status */}
          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="compliance-status" className="text-sm font-medium">
                  Plan Status
                </Label>
                <Select defaultValue="planned">
                  <SelectTrigger id="compliance-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="space-y-3 pt-6">
              <Button className="w-full" variant="default" size="lg">
                Save Diet Plan
              </Button>
              <Button className="w-full" variant="outline" size="lg">
                Reset / Clear
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
