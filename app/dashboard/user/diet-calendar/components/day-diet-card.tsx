"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DayDietCardProps {
  dayName: string;
}

export function DayDietCard({ dayName }: DayDietCardProps) {
  return (
    <Card className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{dayName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`diet-plan-${dayName}`} className="text-sm font-medium">
            Diet Plan
          </Label>
          <Textarea
            id={`diet-plan-${dayName}`}
            placeholder="Enter your diet plan for this day..."
            className="min-h-[120px] resize-none"
            rows={5}
          />
        </div>
        <Button className="w-full" variant="default">
          Save
        </Button>
      </CardContent>
    </Card>
  );
}

