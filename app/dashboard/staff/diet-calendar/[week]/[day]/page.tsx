"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealCard } from "../components/meal-card";
import { WaterIntakeCard } from "../components/water-intake-card";
import { SupplementSection } from "../components/supplement-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CopyPasteToolbar } from "../../components/copy-paste-toolbar";
import { useDietCopy, DayDietData } from "../../context/diet-copy-context";
import { toast } from "sonner";
import { createMealPlan, getAllMeals, MealPlanPayload } from "@/lib/api/services/meals/meals";

interface DayDetailPageProps {
  params: Promise<{
    week: string;
    day: string;
  }>;
}

interface DietPlanPayload {
  user: string;
  date: string;
  day: string;
  meals: Array<{
    type: string;
    description: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    note: string;
  }>;
  supplements: string[];
  dietaryInstructions: string;
  waterIntake: number;
  status: string;
}

export default function DayDetailPage({ params }: DayDetailPageProps) {
  // Unwrap params Promise in Next.js 16
  const resolvedParams = React.use(params);
  const searchParams = useSearchParams();

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

  // State for diet data
  const [dietData, setDietData] = useState<DayDietData>({
    meals: {},
    waterIntake: "2.5",
    supplements: {
      multivitamin: false,
      omega3: false,
      protein: false,
      custom: []
    },
    specialInstructions: "",
    status: "planned"
  });

  const [isPasted, setIsPasted] = useState(false);
  const { copyDay, copiedDayData } = useDietCopy();
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState("");
  const [tokenReady, setTokenReady] = useState(false);

  // Handle paste highlight animation
  useEffect(() => {
    if (isPasted) {
      const timer = setTimeout(() => setIsPasted(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPasted]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken =
        localStorage.getItem("token") || localStorage.getItem("authToken") || "";
      setToken(storedToken);
      setTokenReady(true);
    }
  }, []);

  useEffect(() => {
    const qpUser = searchParams.get("user");
    if (qpUser) {
      setUserId(qpUser);
    }
  }, [searchParams]);

  const handleCopy = () => {
    // Collect all current data before copying
    const dataToCopy: DayDietData = {
      meals: { ...dietData.meals },
      waterIntake: dietData.waterIntake,
      supplements: { ...dietData.supplements },
      specialInstructions: dietData.specialInstructions,
      status: dietData.status
    };
    copyDay(dataToCopy);
  };

  const handlePaste = () => {
    if (copiedDayData) {
      setDietData(copiedDayData);
      setIsPasted(true);
    }
  };

  const mealTypeMap: Record<string, string> = useMemo(
    () => ({
      breakfast: "breakfast",
      "mid-morning": "mid_morning_snack",
      lunch: "lunch",
      evening: "evening_snack",
      dinner: "dinner"
    }),
    []
  );

  const buildPayload = (): DietPlanPayload => {
    const mealsArray = Object.entries(dietData.meals).map(([mealId, meal]) => ({
      type: mealTypeMap[mealId] || mealId,
      description: meal?.description || "",
      calories: Number(meal?.calories || 0),
      carbs: Number(meal?.carbs || 0),
      protein: Number(meal?.protein || 0),
      fat: Number(meal?.fats || 0),
      note: meal?.notes || ""
    }));

    const supplements: string[] = [];
    if (dietData.supplements.multivitamin) supplements.push("Multivitamin");
    if (dietData.supplements.omega3) supplements.push("Omega 3");
    if (dietData.supplements.protein) supplements.push("Protein");
    supplements.push(...(dietData.supplements.custom || []));

    const waterMl = Math.round((parseFloat(dietData.waterIntake) || 0) * 1000);

    return {
      user: userId.trim(),
      date: resolvedParams.day,
      day: dayName,
      meals: mealsArray,
      supplements,
      dietaryInstructions: dietData.specialInstructions,
      waterIntake: waterMl,
      status: dietData.status
    };
  };

  const getDayIsoRange = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { startIso: start.toISOString(), endIso: end.toISOString() };
  };

  const handleSave = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a member ID (user).");
      return;
    }
    if (!tokenReady || !token) {
      toast.error("Missing auth token. Please login again.");
      return;
    }

    setSaving(true);
    try {
      const { startIso, endIso } = getDayIsoRange(dayDate);
      const existing = await getAllMeals({ user: userId.trim(), startDate: startIso, endDate: endIso }, token);
      const payloadData = (existing as any)?.data ?? existing;
      const existingList = payloadData?.meals ?? payloadData?.data ?? (Array.isArray(payloadData) ? payloadData : []);
      if (Array.isArray(existingList) && existingList.length > 0) {
        toast.warning("A diet plan already exists for this day.");
        setSaving(false);
        return;
      }

      const payload = buildPayload();
      await createMealPlan(payload, token);
      toast.success("Diet plan saved");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save diet plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <Link href={`/dashboard/staff/diet-calendar/${resolvedParams.week}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Week View
        </Button>
      </Link>

      {/* Header with Copy/Paste Toolbar */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h1 className="text-foreground text-3xl font-bold">Diet Plan – {dayName}</h1>
          <p className="text-muted-foreground text-lg">{dateStr}</p>
        </div>
        <CopyPasteToolbar onCopy={handleCopy} onPaste={handlePaste} type="day" />
      </div>

      {/* Main Content Grid */}
      <div
        className={`grid grid-cols-1 gap-6 transition-all duration-500 lg:grid-cols-3 ${isPasted ? "ring-primary/50 rounded-lg p-2 ring-2" : ""}`}>
        {/* Left Column - Meal Schedule */}
        <div className="space-y-6 lg:col-span-2">
          {/* Meal Schedule Section */}
          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Meal Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  mealName={meal.name}
                  mealId={meal.id}
                  value={dietData.meals[meal.id]}
                  onChange={(mealData) => {
                    setDietData((prev) => ({
                      ...prev,
                      meals: { ...prev.meals, [meal.id]: mealData }
                    }));
                  }}
                />
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
                  value={dietData.specialInstructions}
                  onChange={(e) =>
                    setDietData((prev) => ({ ...prev, specialInstructions: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-6">
          {/* Member selection */}
          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="member-id" className="text-sm font-medium">
                  Member/User ID
                </Label>
                <Input
                  id="member-id"
                  placeholder="Enter member user id"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Water Intake */}
          <WaterIntakeCard
            value={dietData.waterIntake}
            onChange={(value) => setDietData((prev) => ({ ...prev, waterIntake: value }))}
          />

          {/* Supplements */}
          <SupplementSection
            value={dietData.supplements}
            onChange={(supplements) => setDietData((prev) => ({ ...prev, supplements }))}
          />

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
                <Select
                  value={dietData.status}
                  onValueChange={(value) => setDietData((prev) => ({ ...prev, status: value }))}>
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
              <Button className="w-full" variant="default" size="lg" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Diet Plan"}
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
