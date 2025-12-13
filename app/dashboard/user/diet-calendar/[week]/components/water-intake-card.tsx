"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplet } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function WaterIntakeCard() {
  const [waterIntake, setWaterIntake] = React.useState("2.5");
  const targetLiters = 3.0;
  const currentLiters = parseFloat(waterIntake) || 0;
  const progress = Math.min((currentLiters / targetLiters) * 100, 100);

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-xl font-semibold">Water Intake</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="water-intake" className="text-sm font-medium">
            Daily Water Intake (Liters)
          </Label>
          <Input
            id="water-intake"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={waterIntake}
            onChange={(e) => setWaterIntake(e.target.value)}
            placeholder="2.5"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {currentLiters.toFixed(1)}L / {targetLiters}L
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Droplet className="h-4 w-4" />
          <span>Target: {targetLiters}L per day</span>
        </div>
      </CardContent>
    </Card>
  );
}
