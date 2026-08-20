"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  createMealPlan,
  updateMealPlan,
  getAllMeals,
  type MealPlanPayload,
  type MealPlanDocument
} from "@/lib/api/services/meals/meals";
import { getAllSubscriptions } from "@/lib/api/services/subcription/subcription";

const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "mid_morning_snack", label: "Mid-Morning Snack" },
  { id: "lunch", label: "Lunch" },
  { id: "evening_snack", label: "Evening Snack" },
  { id: "dinner", label: "Dinner" }
];

type MealFormState = Record<string, { description: string; calories: string }>;

const emptyMeals = (): MealFormState =>
  MEAL_TYPES.reduce(
    (acc, m) => ({ ...acc, [m.id]: { description: "", calories: "" } }),
    {} as MealFormState
  );

const getToken = () => {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("adminToken") ||
    ""
  );
};

const todayDateInputValue = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

type MemberOption = { id: string; name: string; email: string };

export default function StaffDietCalendarPage() {
  const [token, setToken] = useState("");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [memberOpen, setMemberOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState(todayDateInputValue());

  const [meals, setMeals] = useState<MealFormState>(emptyMeals());
  const [waterIntake, setWaterIntake] = useState("");
  const [supplements, setSupplements] = useState("");
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState("planned");

  const [existingPlanId, setExistingPlanId] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setToken(getToken());
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!token) return;

      setMembersLoading(true);

      try {
        const res = await getAllSubscriptions({ page: 1, limit: 200 }, token);
        const list =
          (res as any)?.data?.data || (res as any)?.data || (res as any)?.subscriptions || [];

        const options: MemberOption[] = (Array.isArray(list) ? list : [])
          .map((sub: any) => {
            const userObj = typeof sub.user === "object" ? sub.user : undefined;
            const id =
              sub?.userId ||
              userObj?._id ||
              (typeof sub.user === "string" ? sub.user : "") ||
              sub?.id ||
              "";
            const email = userObj?.email || "-";
            const name =
              userObj?.name ||
              sub?.firstName ||
              (email.includes("@") ? email.split("@")[0] : "") ||
              "Unknown User";
            return { id, name, email };
          })
          .filter((m: MemberOption) => m.id);

        setMembers(options);
      } catch {
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    load();
  }, [token]);

  const selectedMember = useMemo(
    () => members.find((m) => m.id === userId),
    [members, userId]
  );

  const resetForm = () => {
    setMeals(emptyMeals());
    setWaterIntake("");
    setSupplements("");
    setInstructions("");
    setStatus("planned");
    setExistingPlanId(null);
  };

  // Whenever both a member and a date are picked, load whatever plan
  // already exists for that combination (if any) so staff edit it instead
  // of accidentally trying to create a duplicate.
  useEffect(() => {
    const load = async () => {
      if (!userId || !date || !token) return;

      setLoadingPlan(true);
      resetForm();

      try {
        const res = await getAllMeals({ user: userId, startDate: date, endDate: date }, token);
        const payload = (res as any)?.data ?? res;
        const list: MealPlanDocument[] =
          payload?.meals ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
        const plan = Array.isArray(list) ? list[0] : null;

        if (plan) {
          setExistingPlanId(plan._id);

          const nextMeals = emptyMeals();
          (plan.meals || []).forEach((m) => {
            if (nextMeals[m.type]) {
              nextMeals[m.type] = {
                description: m.description || "",
                calories: m.calories ? String(m.calories) : ""
              };
            }
          });

          setMeals(nextMeals);
          setWaterIntake(plan.waterIntake ? String(plan.waterIntake) : "");
          setSupplements((plan.supplements || []).join(", "));
          setInstructions(plan.dietaryInstructions || "");
          setStatus(plan.status || "planned");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlan(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, date, token]);

  const handleSave = async () => {
    if (!userId) {
      toast.error("Please select a member first.");
      return;
    }

    if (!token) {
      toast.error("Missing auth token. Please login again.");
      return;
    }

    const mealsArray = MEAL_TYPES.map((m) => ({
      type: m.id,
      description: meals[m.id]?.description || "",
      calories: Number(meals[m.id]?.calories || 0),
      carbs: 0,
      protein: 0,
      fat: 0,
      note: ""
    })).filter((m) => m.description.trim());

    if (mealsArray.length === 0) {
      toast.error("Add at least one meal.");
      return;
    }

    const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

    const payload: MealPlanPayload = {
      user: userId,
      date,
      day: dayName,
      meals: mealsArray,
      supplements: supplements
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      dietaryInstructions: instructions,
      waterIntake: Number(waterIntake || 0),
      status
    };

    setSaving(true);

    try {
      const res = existingPlanId
        ? await updateMealPlan(existingPlanId, payload, token)
        : await createMealPlan(payload, token);

      if ((res as any)?.error) {
        throw new Error((res as any).error);
      }

      toast.success(existingPlanId ? "Diet plan updated" : "Diet plan saved");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save diet plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Toaster position="top-center" />

      <div>
        <h1 className="text-2xl font-bold">Diet Plan</h1>
        <p className="text-muted-foreground text-sm">
          Pick a member and a date, then write their meal plan.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Member</Label>
            <Popover open={memberOpen} onOpenChange={setMemberOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={membersLoading}>
                  {membersLoading
                    ? "Loading members..."
                    : selectedMember
                      ? `${selectedMember.name} (${selectedMember.email})`
                      : "Select member"}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search members..." />
                  <CommandList>
                    <CommandEmpty>{membersLoading ? "Loading..." : "No members found."}</CommandEmpty>
                    <CommandGroup>
                      {members.map((m) => (
                        <CommandItem
                          key={m.id}
                          value={`${m.name} ${m.email}`}
                          onSelect={() => {
                            setUserId(m.id);
                            setMemberOpen(false);
                          }}>
                          <Check className={`mr-2 size-4 ${userId === m.id ? "opacity-100" : "opacity-0"}`} />
                          <div className="flex flex-col">
                            <span className="font-medium">{m.name}</span>
                            <span className="text-xs text-muted-foreground">{m.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diet-date">Date</Label>
            <Input
              id="diet-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {!userId ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Select a member to create or edit their diet plan.
          </CardContent>
        </Card>
      ) : loadingPlan ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      ) : (
        <>
          {existingPlanId && (
            <p className="text-xs text-muted-foreground">
              A plan already exists for this member on this date — editing it below.
            </p>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MEAL_TYPES.map((m) => (
                <div key={m.id} className="grid gap-2 sm:grid-cols-[140px_1fr_100px] sm:items-start">
                  <Label className="pt-2 text-sm font-medium">{m.label}</Label>
                  <Textarea
                    rows={2}
                    placeholder="e.g. 2 eggs, 1 toast, orange juice"
                    value={meals[m.id]?.description || ""}
                    onChange={(e) =>
                      setMeals((prev) => ({
                        ...prev,
                        [m.id]: { ...prev[m.id], description: e.target.value }
                      }))
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="kcal"
                    value={meals[m.id]?.calories || ""}
                    onChange={(e) =>
                      setMeals((prev) => ({
                        ...prev,
                        [m.id]: { ...prev[m.id], calories: e.target.value }
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="water">Water Intake (liters)</Label>
                <Input
                  id="water"
                  type="number"
                  min={0}
                  step={0.1}
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(e.target.value)}
                  placeholder="e.g. 3"
                />
              </div>

              <div className="space-y-2">
                <Label>Plan Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="supplements">Supplements (comma separated)</Label>
                <Input
                  id="supplements"
                  value={supplements}
                  onChange={(e) => setSupplements(e.target.value)}
                  placeholder="e.g. Multivitamin, Protein"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Allergies, restrictions, notes..."
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : existingPlanId ? "Update Diet Plan" : "Save Diet Plan"}
          </Button>
        </>
      )}
    </div>
  );
}
