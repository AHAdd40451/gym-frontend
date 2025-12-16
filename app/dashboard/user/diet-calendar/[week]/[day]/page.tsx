"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockUserDietPlan, DietPlanPreset } from "../../mock-data";
import { getAllMeals, MealPlanDocument } from "@/lib/api/services/meals/meals";
import {
  getCurrentUserId,
  getLocalDayRangeIso,
  parseLocalDateKey,
  transformMealPlanToPreset
} from "../../utils";
import { formatDateKey } from "@/lib/utils/date";

interface DayDetailPageProps {
  params: Promise<{
    week: string;
    day: string;
  }>;
}

export default function UserDayDetailPage({ params }: DayDetailPageProps) {
  const resolvedParams = React.use(params);
  const dayDate = parseLocalDateKey(resolvedParams.day);
  const dayKey = formatDateKey(dayDate);
  const [preset, setPreset] = useState<DietPlanPreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPlan, setHasPlan] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const storedToken =
          (typeof window !== "undefined" && (localStorage.getItem("authToken") || localStorage.getItem("token"))) ||
          "";
        const userId = getCurrentUserId();

        if (!userId || !storedToken) {
          setPreset(mockUserDietPlan[dayKey] ?? mockUserDietPlan.default);
          setError("Missing user or token, showing sample plan.");
          return;
        }

        const { startIso, endIso } = getLocalDayRangeIso(dayDate);
        const res = await getAllMeals({ user: userId, startDate: startIso, endDate: endIso }, storedToken);
        const payload = (res as any)?.data ?? res;
        const list: MealPlanDocument[] =
          payload?.meals ?? payload?.data ?? (Array.isArray(payload) ? payload : []);

        if (Array.isArray(list) && list.length > 0) {
          const plan = list[0];
          setPreset(transformMealPlanToPreset(plan));
          setError((res as any)?.error || null);
          setHasPlan(true);
        } else {
          setPreset(null);
          setHasPlan(false);
          setError("No plan found for this day.");
        }
      } catch (err: any) {
        console.error("getUserMeals error", err);
        setPreset(null);
        setHasPlan(false);
        setError("Unable to load plan.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [dayKey, resolvedParams.day]);

  const dietData = preset?.dietData;
  const timeline = preset?.timeline;
  const summary = preset?.summary;

  const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = dayDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const totals = useMemo(() => {
    const totalsInit = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    if (dietData?.meals) {
      Object.values(dietData.meals).forEach((meal: any) => {
        totalsInit.calories += Number(meal.calories) || 0;
        totalsInit.protein += Number(meal.protein) || 0;
        totalsInit.carbs += Number(meal.carbs) || 0;
        totalsInit.fats += Number(meal.fats) || 0;
      });
    }
    return totalsInit;
  }, [dietData?.meals]);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <Link href={`/dashboard/user/diet-calendar/${resolvedParams.week}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Week View
        </Button>
      </Link>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading diet plan...
        </div>
      )}
      {error && (
        <p className="text-xs text-amber-600">
          {error}
        </p>
      )}

      {!loading && !hasPlan && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">No plan found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">No diet plan is available for this day.</p>
          </CardContent>
        </Card>
      )}

      {!hasPlan && (
        <div className="pointer-events-none opacity-40">
          {/* Prevent rendering empty data-driven sections when no plan */}
        </div>
      )}

      <div className={`${hasPlan ? "flex" : "hidden"} items-start justify-between gap-4`}>
        <div className="flex-1 space-y-2">
          <h1 className="text-foreground text-3xl font-bold">Diet Plan – {dayName}</h1>
          <p className="text-muted-foreground text-lg">{dateStr}</p>
        </div>
      </div>

      <div className={`${hasPlan ? "grid" : "hidden"} grid-cols-1 gap-6 lg:grid-cols-3`}>
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Meal Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dietData &&
                Object.entries(dietData.meals).map(([id, meal]) => (
                <div
                  key={id}
                  className="border-border/60 bg-muted/40 hover:bg-muted/60 rounded-lg border p-4 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-foreground font-semibold capitalize">{id.replace("-", " ")}</p>
                    <Badge variant="outline" className="text-xs">
                      {meal.calories} kcal
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">{meal.description}</p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    P {meal.protein}g · C {meal.carbs}g · F {meal.fats}g
                  </p>
                  {meal.notes && (
                    <p className="text-primary mt-1 text-xs font-medium">Note: {meal.notes}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Dietary Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground text-sm">{dietData?.specialInstructions}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Hydration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-foreground text-lg font-semibold">{dietData?.waterIntake} L</p>
              <p className="text-muted-foreground text-sm">Target: {summary?.water}</p>
            </CardContent>
          </Card>

          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Supplements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2 text-sm">
                {dietData?.supplements?.multivitamin && <Badge variant="outline">Multivitamin</Badge>}
                {dietData?.supplements?.omega3 && <Badge variant="outline">Omega-3</Badge>}
                {dietData?.supplements?.protein && <Badge variant="outline">Protein</Badge>}
                {dietData?.supplements?.custom?.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                {!dietData?.supplements?.multivitamin &&
                  !dietData?.supplements?.omega3 &&
                  !dietData?.supplements?.protein &&
                  (dietData?.supplements?.custom?.length || 0) === 0 && (
                    <p className="text-muted-foreground text-sm">No supplements planned.</p>
                  )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge>{dietData?.status}</Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className={`${hasPlan ? "" : "hidden"} rounded-xl border shadow-sm`}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Daily Targets & Coach Notes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-muted-foreground text-xs uppercase">Calories</p>
            <p className="text-foreground text-2xl font-semibold">{summary?.targetCalories} kcal</p>
            <p className="text-muted-foreground text-xs">Target</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-muted-foreground text-xs uppercase">Macros</p>
            <p className="text-foreground text-sm">
              P {summary?.protein}g · C {summary?.carbs}g · F {summary?.fats}g
            </p>
            <p className="text-muted-foreground text-xs">Goal split</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-muted-foreground text-xs uppercase">Hydration</p>
            <p className="text-foreground text-lg font-semibold">{summary?.water}</p>
            <p className="text-muted-foreground text-xs">Min. water target</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-muted-foreground text-xs uppercase">Today&apos;s Goal</p>
            <p className="text-foreground text-sm font-semibold">{summary?.goal}</p>
            <p className="text-muted-foreground text-xs">{summary?.recovery}</p>
          </div>
        </CardContent>
        <CardContent className="space-y-3 pt-0">
          <Separator />
          <p className="text-muted-foreground text-sm">{summary?.coachNote}</p>
          {dietData && (
            <div className="text-foreground text-sm font-medium">
              Current total from meals: {totals.calories} kcal · P {totals.protein}g · C {totals.carbs}g · F{" "}
              {totals.fats}g
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={`${hasPlan ? "" : "hidden"} rounded-xl border shadow-sm`}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Today&apos;s Diet Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {timeline?.map((item) => (
            <div
              key={`${item.time}-${item.title}`}
              className="border-border/60 bg-muted/40 hover:bg-muted/70 rounded-lg border p-4 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-primary text-sm font-semibold">{item.time}</div>
                  <div>
                    <p className="text-foreground font-semibold">{item.title}</p>
                    <p className="text-muted-foreground text-sm">{item.details}</p>
                  </div>
                </div>
                {item.badge && <Badge variant="outline">{item.badge}</Badge>}
              </div>
              <div className="text-muted-foreground mt-2 text-xs">
                {item.calories} kcal · P {item.protein}g · C {item.carbs}g · F {item.fats}g
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

