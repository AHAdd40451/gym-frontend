"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllMeals, type MealPlanDocument } from "@/lib/api/services/meals/meals";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  mid_morning_snack: "Mid-Morning Snack",
  lunch: "Lunch",
  evening_snack: "Evening Snack",
  dinner: "Dinner"
};

const todayDateInputValue = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getUserAndToken = () => {
  if (typeof window === "undefined") return { userId: "", token: "" };

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    "";

  let userId = "";

  try {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      userId = parsed?._id || parsed?.id || "";
    }
  } catch {
    userId = "";
  }

  return { userId, token };
};

export default function UserDietCalendarPage() {
  const [date, setDate] = useState(todayDateInputValue());
  const [plan, setPlan] = useState<MealPlanDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { userId, token } = getUserAndToken();

      if (!userId) {
        setError("Please sign in to view your diet plan.");
        setLoading(false);
        return;
      }

      try {
        const res = await getAllMeals({ user: userId, startDate: date, endDate: date }, token);
        const payload = (res as any)?.data ?? res;
        const list: MealPlanDocument[] =
          payload?.meals ?? payload?.data ?? (Array.isArray(payload) ? payload : []);

        setPlan(Array.isArray(list) && list.length > 0 ? list[0] : null);
      } catch (err) {
        console.error(err);
        setError("Unable to load your diet plan.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [date]);

  const hasMeals = plan?.meals?.some((m) => m.description);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Diet Plan</h1>
          <p className="text-muted-foreground text-sm">
            Pick a date to see the plan your trainer set for you.
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="diet-date">Date</Label>
          <Input
            id="diet-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : !plan ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No diet plan for this date yet.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Meals</CardTitle>
              <Badge variant="outline" className="capitalize">
                {plan.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasMeals ? (
                plan.meals
                  .filter((m) => m.description)
                  .map((m) => (
                    <div key={m.type} className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{MEAL_LABELS[m.type] || m.type}</p>
                        {m.calories ? <Badge variant="outline">{m.calories} kcal</Badge> : null}
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">{m.description}</p>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">No meals added yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs uppercase">Water Intake</p>
                <p className="text-lg font-semibold">{plan.waterIntake || 0} L</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">Supplements</p>
                <p className="text-sm">
                  {plan.supplements?.length ? plan.supplements.join(", ") : "None"}
                </p>
              </div>
              {plan.dietaryInstructions && (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-xs uppercase">Instructions</p>
                  <p className="text-sm">{plan.dietaryInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
