"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Activity,
  Dumbbell,
  Sparkles,
  Flame,
  Clock,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Users,
  ShieldCheck,
  LineChart,
  ListChecks
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import apiClient from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/constants/constants";
import {
  assignWorkout,
  createWorkout,
  deleteWorkout,
  fetchWorkouts
} from "@/lib/api/services/workouts/workouts";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type WorkoutType = "Strength" | "Cardio" | "Weight Loss";
type Equipment = "Barbell" | "Dumbbell" | "Machine" | "Bodyweight";

type Exercise = {
  _id: string;
  name: string;
  description: string;
  muscleGroup: string[];
  equipment: Equipment;
  difficulty: Difficulty;
  videoUrl: string;
  imageUrl: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type WorkoutExercise = {
  exerciseId: string;
  sets: number;
  reps: number;
  restInSeconds: number;
  order: number;
};

type WorkoutPlan = {
  _id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  type: WorkoutType;
  createdBy: string;
  isActive: boolean;
  isPublic: boolean;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
};

type ExerciseLog = {
  _id: string;
  userId: string;
  workoutId: string;
  exercises: {
    exerciseId: string;
    sets: {
      reps: number;
      weight: number;
      completed: boolean;
    }[];
    notes?: string;
  }[];
  totalDurationInMinutes: number;
  caloriesBurned: number;
  notes?: string;
  performedAt: string;
  createdAt: string;
  updatedAt: string;
};

type BuilderForm = {
  title: string;
  description: string;
  difficulty: Difficulty;
  type: WorkoutType;
  isActive: boolean;
  isPublic: boolean;
  exercises: WorkoutExercise[];
};

type Member = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

const initialBuilderState: BuilderForm = {
  title: "",
  description: "",
  difficulty: "Intermediate",
  type: "Strength",
  isActive: true,
  isPublic: true,
  exercises: []
};

const difficultyTone: Record<Difficulty, string> = {
  Beginner: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100",
  Intermediate: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100",
  Advanced: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100"
};

const typeTone: Record<WorkoutType, string> = {
  Strength: "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-50",
  Cardio: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-50",
  "Weight Loss": "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-50"
};

export default function WorkoutsPage() {
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<ExerciseLog[]>([]);
  const [builder, setBuilder] = useState<BuilderForm>(initialBuilderState);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [exerciseInputs, setExerciseInputs] = useState({ sets: 3, reps: 10, restInSeconds: 60 });
  const [previewPlan, setPreviewPlan] = useState<WorkoutPlan | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const normalizeWorkout = (plan: any): WorkoutPlan => {
    const creator =
      typeof plan.createdBy === "object"
        ? [plan.createdBy?.firstName, plan.createdBy?.lastName].filter(Boolean).join(" ").trim() ||
          plan.createdBy?._id ||
          "staff"
        : plan.createdBy || "staff";

    const exercises = (plan.exercises || []).map((ex: any, idx: number) => ({
      exerciseId: typeof ex.exerciseId === "string" ? ex.exerciseId : ex.exerciseId?._id || "",
      sets: ex.sets ?? 1,
      reps: ex.reps ?? 1,
      restInSeconds: ex.restInSeconds ?? 60,
      order: ex.order ?? idx + 1
    }));

    return {
      _id: plan._id,
      title: plan.title,
      description: plan.description || "",
      difficulty: plan.difficulty,
      type: plan.type,
      isActive: plan.isActive ?? true,
      isPublic: plan.isPublic ?? false,
      exercises,
      createdBy: creator,
      createdAt: plan.createdAt || new Date().toISOString(),
      updatedAt: plan.updatedAt || plan.createdAt || new Date().toISOString()
    };
  };

  const load = async () => {
    try {
      setLoading(true);

      const [exRes, woRes, logsRes, usersRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.EXERCISES.BASE, { params: { isActive: true, limit: 100 } }),
        fetchWorkouts({}),
        apiClient.get(API_ENDPOINTS.WORKOUT_LOGS.BASE).catch(() => ({ data: { data: [] } })),
        // try main users list; fallback to role endpoint if API supports it
        apiClient
          .get(API_ENDPOINTS.USERS.BASE, { params: { role: "user", limit: 100 } })
          .catch(() => ({ data: { users: [] } }))
      ]);

      const exercises = exRes.data?.data ?? [];
      setExerciseLibrary(exercises);
      if (!selectedExerciseId && exercises.length > 0) {
        setSelectedExerciseId(exercises[0]._id);
      }

      const workoutsFromApi = Array.isArray(woRes?.data) ? woRes.data.map(normalizeWorkout) : [];
      setWorkouts(workoutsFromApi);
      if (!selectedWorkoutId && workoutsFromApi.length > 0) {
        setSelectedWorkoutId(workoutsFromApi[0]._id);
      }

      const logs = logsRes?.data?.data ?? [];
      setWorkoutLogs(logs);

      const usersPayload = usersRes?.data;
      const users =
        (Array.isArray(usersPayload?.users) && usersPayload.users) ||
        (Array.isArray(usersPayload?.data?.users) && usersPayload.data.users) ||
        (Array.isArray(usersPayload?.data) && usersPayload.data) ||
        [];

      // if still empty, try role-specific endpoint
      if (users.length === 0) {
        try {
          const alt = await apiClient.get(`${API_ENDPOINTS.USERS.BY_ROLE}/user`, {
            params: { limit: 100 }
          });
          const altData =
            (Array.isArray(alt?.data?.users) && alt.data.users) ||
            (Array.isArray(alt?.data?.data) && alt.data.data) ||
            [];
          if (altData.length) {
            setMembers(altData);
          } else {
            setMembers([]);
          }
        } catch {
          setMembers([]);
        }
      } else {
        setMembers(users);
      }
      setMembers(users);
    } catch (error: any) {
      console.error("Failed to load workouts", error);
      toast.error("Could not load workouts", {
        description: error?.message || "Check API and token."
      });
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedExerciseId && exerciseLibrary.length > 0) {
      setSelectedExerciseId(exerciseLibrary[0]._id);
    }
  }, [exerciseLibrary, selectedExerciseId]);

  useEffect(() => {
    if (!selectedWorkoutId && workouts.length > 0) {
      setSelectedWorkoutId(workouts[0]._id);
    }
  }, [workouts, selectedWorkoutId]);

  const exerciseLookup = useMemo(
    () =>
      exerciseLibrary.reduce((acc, exercise) => {
        acc[exercise._id] = exercise;
        return acc;
      }, {} as Record<string, Exercise>),
    [exerciseLibrary]
  );

  const workoutLookup = useMemo(
    () =>
      workouts.reduce((acc, workout) => {
        acc[workout._id] = workout;
        return acc;
      }, {} as Record<string, WorkoutPlan>),
    [workouts]
  );

  const activeWorkouts = useMemo(() => workouts.filter((w) => w.isActive), [workouts]);
  const publicWorkouts = useMemo(() => workouts.filter((w) => w.isPublic), [workouts]);

  const stats = useMemo(
    () => ({
      totalWorkouts: workouts.length,
      activeWorkouts: activeWorkouts.length,
      publicWorkouts: publicWorkouts.length,
      totalExercises: exerciseLibrary.length,
      logSessions: workoutLogs.length,
      avgDuration:
        workoutLogs.length === 0
          ? 0
          : Math.round(
              workoutLogs.reduce((acc, log) => acc + log.totalDurationInMinutes, 0) /
              workoutLogs.length
            )
    }),
    [workouts, activeWorkouts, publicWorkouts, exerciseLibrary, workoutLogs]
  );

  const addExerciseToPlan = () => {
    if (!selectedExerciseId) {
      toast.error("Choose an exercise to add.");
      return;
    }

    const picked = exerciseLookup[selectedExerciseId];
    if (!picked) {
      toast.error("Exercise not found.");
      return;
    }

    setBuilder((prev) => {
      const existingIndex = prev.exercises.findIndex((ex) => ex.exerciseId === selectedExerciseId);
      const nextExercises = [...prev.exercises];
      const payload: WorkoutExercise = {
        exerciseId: selectedExerciseId,
        sets: Math.max(1, exerciseInputs.sets),
        reps: Math.max(1, exerciseInputs.reps),
        restInSeconds: Math.max(15, exerciseInputs.restInSeconds),
        order: existingIndex === -1 ? nextExercises.length + 1 : nextExercises[existingIndex].order
      };

      if (existingIndex === -1) {
        nextExercises.push(payload);
      } else {
        nextExercises[existingIndex] = payload;
      }

      const normalized = nextExercises
        .sort((a, b) => a.order - b.order)
        .map((item, idx) => ({ ...item, order: idx + 1 }));

      return { ...prev, exercises: normalized };
    });

    toast.success("Exercise added", {
      description: `${picked.name} slotted into the plan.`
    });
  };

  const removeExerciseFromPlan = (exerciseId: string) => {
    setBuilder((prev) => {
      const normalized = prev.exercises
        .filter((ex) => ex.exerciseId !== exerciseId)
        .map((ex, idx) => ({ ...ex, order: idx + 1 }));
      return { ...prev, exercises: normalized };
    });
  };

  const moveExercise = (exerciseId: string, direction: "up" | "down") => {
    setBuilder((prev) => {
      const sorted = [...prev.exercises].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((ex) => ex.exerciseId === exerciseId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) {
        return prev;
      }

      const [moved] = sorted.splice(index, 1);
      sorted.splice(targetIndex, 0, moved);

      return {
        ...prev,
        exercises: sorted.map((ex, idx) => ({ ...ex, order: idx + 1 }))
      };
    });
  };

  const handleSavePlan = async () => {
    if (!builder.title.trim()) {
      toast.error("Add a workout title before saving.");
      return;
    }

    if (builder.exercises.length === 0) {
      toast.error("Add at least one exercise to the plan.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: builder.title.trim(),
        description: builder.description,
        difficulty: builder.difficulty,
        type: builder.type,
        isPublic: builder.isPublic,
        exercises: builder.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          restInSeconds: ex.restInSeconds,
          order: ex.order
        }))
      };

      const res = await createWorkout(payload);
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Failed to create workout");
      }

      const newPlan = normalizeWorkout(res.data);
      setWorkouts((prev) => [newPlan, ...prev]);
      setBuilder(initialBuilderState);
      setExerciseInputs({ sets: 3, reps: 10, restInSeconds: 60 });
      setSelectedExerciseId(exerciseLibrary[0]?._id ?? "");

      toast.success("Workout created", {
        description: res.message || "Workout is live."
      });
    } catch (error: any) {
      console.error(error);
      toast.error("Could not save workout", {
        description: error?.message || "Check your API / token."
      });
    } finally {
      setSaving(false);
    }
  };

  const loadAsTemplate = (plan: WorkoutPlan) => {
    setBuilder({
      title: `${plan.title} (copy)`,
      description: plan.description,
      difficulty: plan.difficulty,
      type: plan.type,
      isActive: plan.isActive,
      isPublic: plan.isPublic,
      exercises: plan.exercises.map((ex) => ({ ...ex }))
    });

    toast("Loaded into builder", {
      description: "Tweak the sets/reps and save."
    });
  };

  const openPreview = (plan: WorkoutPlan) => {
    setPreviewPlan(plan);
    setPreviewOpen(true);
  };

  const sharePlan = (plan: WorkoutPlan) => {
    setSelectedWorkoutId(plan._id);
    setSelectedMembers(new Set());
    setAssignModalOpen(true);
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!id) return;
    const ok = window.confirm("Delete this workout? This cannot be undone.");
    if (!ok) return;
    try {
      setDeletingId(id);
      const res = await deleteWorkout(id);
      if (res?.success) {
        setWorkouts((prev) => prev.filter((w) => w._id !== id));
        toast.success("Workout deleted");
      } else {
        toast.error("Delete failed", { description: res?.message || "Try again." });
      }
    } catch (error: any) {
      toast.error("Delete failed", { description: error?.message || "Check API/token." });
    } finally {
      setDeletingId(null);
    }
  };

  const workoutsByTab: Record<string, WorkoutPlan[]> = {
    active: activeWorkouts,
    public: publicWorkouts,
    all: workouts
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading workouts...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            
            <CardTitle className="text-3xl font-semibold">Workout plans</CardTitle>
            <CardDescription className="max-w-2xl">
              Build plans, assign to members, and keep logs clean. All calls go through the API proxy.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/staff/exercises">Add exercise</Link>
            </Button>
           
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card id="workout-builder" className="xl:col-span-2 border border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ListChecks className="size-5 text-[var(--primary)]" />
              Build a workout plan
            </CardTitle>
            <CardDescription>
              Add the plan metadata, embed exercises (order, sets, reps, rest), choose visibility, and
              keep everything aligned with the Workout collection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSavePlan();
              }}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Eg. Upper Power 45"
                    value={builder.title}
                    onChange={(e) => setBuilder((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={builder.type}
                    onValueChange={(value) =>
                      setBuilder((prev) => ({ ...prev, type: value as WorkoutType }))
                    }>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pick a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["Strength", "Cardio", "Weight Loss"] as WorkoutType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  rows={3}
                  placeholder="Why this plan exists and how members should pace it."
                  value={builder.description}
                  onChange={(e) => setBuilder((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={builder.difficulty}
                    onValueChange={(value) =>
                      setBuilder((prev) => ({ ...prev, difficulty: value as Difficulty }))
                    }>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pick a level" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["Beginner", "Intermediate", "Advanced"] as Difficulty[]).map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
               
             
              </div>

              <Separator />

              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-5">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-sm font-medium">Exercise</label>
                      <Select
                        value={selectedExerciseId}
                        onValueChange={(value) => setSelectedExerciseId(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pick exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {exerciseLibrary.map((ex) => (
                            <SelectItem key={ex._id} value={ex._id}>
                              {ex.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Sets</label>
                      <Input
                        type="number"
                        min={1}
                        value={exerciseInputs.sets}
                        onChange={(e) =>
                          setExerciseInputs((prev) => ({
                            ...prev,
                            sets: Number(e.target.value) || 1
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Reps</label>
                      <Input
                        type="number"
                        min={1}
                        value={exerciseInputs.reps}
                        onChange={(e) =>
                          setExerciseInputs((prev) => ({
                            ...prev,
                            reps: Number(e.target.value) || 1
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Rest (sec)</label>
                      <Input
                        type="number"
                        min={15}
                        value={exerciseInputs.restInSeconds}
                        onChange={(e) =>
                          setExerciseInputs((prev) => ({
                            ...prev,
                            restInSeconds: Number(e.target.value) || 30
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button type="button" className="md:w-auto" onClick={addExerciseToPlan}>
                    <Plus className="size-4" />
                    Add exercise
                  </Button>
                </div>

                <div className="mt-4 rounded-lg border bg-background p-3">
                  {builder.exercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Exercises will appear here with order, sets, reps, and rest once added.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {builder.exercises.map((item) => {
                        const exercise = exerciseLookup[item.exerciseId];
                        return (
                          <div
                            key={item.exerciseId}
                            className="flex flex-col gap-2 rounded-md border border-border/70 bg-muted/30 p-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={difficultyTone[exercise?.difficulty || "Beginner"]}>
                                  {exercise?.difficulty || "Exercise"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Order {item.order}
                                </Badge>
                                <p className="font-semibold">{exercise?.name || "Exercise"}</p>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {exercise?.description}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <ListChecks className="size-4" /> {item.sets} x {item.reps} reps
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="size-4" /> {item.restInSeconds}s rest
                                </span>
                                {exercise?.muscleGroup?.length ? (
                                  <span className="flex items-center gap-1">
                                    <Flame className="size-4" />
                                    {exercise.muscleGroup.join(", ")}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => moveExercise(item.exerciseId, "up")}>
                                <ArrowUp className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => moveExercise(item.exerciseId, "down")}>
                                <ArrowDown className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => removeExerciseFromPlan(item.exerciseId)}>
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="button" onClick={handleSavePlan} disabled={saving}>
                  {saving ? "Saving..." : "Save workout"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBuilder(initialBuilderState);
                    setExerciseInputs({ sets: 3, reps: 10, restInSeconds: 60 });
                    setSelectedExerciseId(exerciseLibrary[0]?._id ?? "");
                  }}>
                  Clear form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            
            <div className="flex items-center gap-2">
              <Select
                value={selectedWorkoutId}
                onValueChange={(val) => setSelectedWorkoutId(val)}
                disabled={!workouts.length}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select workout" />
                </SelectTrigger>
                <SelectContent>
                  {workouts.map((w) => (
                    <SelectItem key={w._id} value={w._id}>
                      {w.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!selectedWorkoutId || selectedMembers.size === 0 || assigning}
                onClick={async () => {
                  if (!selectedWorkoutId || selectedMembers.size === 0) return;
                  try {
                    setAssigning(true);
                    const res = await assignWorkout(selectedWorkoutId, Array.from(selectedMembers));
                    if (res?.success) {
                      toast.success("Workout assigned", {
                        description: res.message || `${selectedMembers.size} members updated`
                      });
                    } else {
                      toast.error("Assignment failed", { description: res?.message || "Try again." });
                    }
                  } catch (error: any) {
                    toast.error("Assignment failed", { description: error?.message || "Check API/token." });
                  } finally {
                    setAssigning(false);
                  }
                }}>
                {assigning ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.length === 0 ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>No members found. Click refresh after you create/seed users.</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => load()}>
                    Refresh
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/staff/exercises">Add exercises</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const el = document.getElementById("workout-builder");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}>
                    Create workout
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="max-h-[420px] pr-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {members.map((m) => {
                    const fullName = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || m._id;
                    const checked = selectedMembers.has(m._id);
                    return (
                      <label
                        key={m._id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm transition ${
                          checked ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-border/60 bg-muted/30"
                        }`}>
                        <div className="space-y-1">
                          <p className="font-semibold leading-tight">{fullName}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--primary)]"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedMembers((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) {
                                next.add(m._id);
                              } else {
                                next.delete(m._id);
                              }
                              return next;
                            });
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-[var(--primary)]" />
              Exercise library
            </CardTitle>
            <CardDescription>Re-usable building blocks from the Exercise collection.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[520px] pr-3">
              <div className="space-y-3">
                {exerciseLibrary.map((exercise) => (
                  <div
                    key={exercise._id}
                    className="rounded-lg border border-border/70 bg-muted/30 p-3 transition hover:border-[var(--primary)]/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={difficultyTone[exercise.difficulty]}>
                            {exercise.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {exercise.equipment}
                          </Badge>
                        </div>
                        <p className="font-semibold leading-tight">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {exercise.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {(exercise.muscleGroup || []).map((muscle) => (
                            <span
                              key={muscle}
                              className="rounded-full bg-background px-2 py-0.5 border border-border/70">
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={selectedExerciseId === exercise._id ? "default" : "outline"}
                        onClick={() => setSelectedExerciseId(exercise._id)}>
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 border border-border/70 shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-[var(--primary)]" />
                Workout library
              </CardTitle>
              <CardDescription>Plans saved in the Workout collection, ready to assign.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="active">
              

              {["active", "public", "all"].map((tab) => (
                <TabsContent key={tab} value={tab} className="pt-4">
                  {renderWorkoutGrid(
                    workoutsByTab[tab],
                    exerciseLookup,
                    difficultyTone,
                    typeTone,
                    openPreview,
                    loadAsTemplate,
                    sharePlan,
                    handleDeleteWorkout,
                    deletingId
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-[var(--primary)]" />
              Recent workout logs
            </CardTitle>
            <CardDescription>User Exercise Log Activity entries, newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[520px] pr-3">
              <div className="space-y-3">
                {workoutLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No workout logs yet. Users will appear here after they log sessions.
                  </p>
                ) : (
                  workoutLogs.map((log) => {
                    const workout = workoutLookup[log.workoutId];
                    const totalSets = log.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
                    const userIdDisplay = typeof log.userId === "object" && log.userId !== null
                      ? (() => {
                          const user = log.userId as any;
                          if (user.firstName || user.lastName) {
                            return [user.firstName, user.lastName].filter(Boolean).join(" ") || user._id || String(user);
                          }
                          return user._id || user.email || String(user);
                        })()
                      : log.userId || "Unknown";
                    return (
                      <div key={log._id} className="rounded-lg border border-border/70 bg-muted/30 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-semibold leading-tight">
                              {workout?.title || "Workout"} | {userIdDisplay}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Performed {formatDistanceToNow(new Date(log.performedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {log.totalDurationInMinutes} min
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ListChecks className="size-4" />
                            {totalSets} sets
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="size-4" />
                            {log.caloriesBurned} kcal
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-4" />
                            {format(new Date(log.performedAt), "MMM d, HH:mm")}
                          </span>
                        </div>
                        {log.notes ? (
                          <p className="mt-2 text-sm text-foreground italic">"{log.notes}"</p>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-2">
            
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          {previewPlan ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-[var(--primary)]" />
                  {previewPlan.title}
                </DialogTitle>
                <DialogDescription>{previewPlan.description}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-2">
                <Badge className={difficultyTone[previewPlan.difficulty]}>{previewPlan.difficulty}</Badge>
                <Badge className={typeTone[previewPlan.type]}>{previewPlan.type}</Badge>
                <Badge variant="outline">{previewPlan.isActive ? "Active" : "Paused"}</Badge>
                <Badge variant="outline">{previewPlan.isPublic ? "Public" : "Private"}</Badge>
              </div>
              <Separator />
              <div className="space-y-3">
                {previewPlan.exercises.map((item) => {
                  const exercise = exerciseLookup[item.exerciseId];
                  return (
                    <div
                      key={item.exerciseId}
                      className="rounded-lg border border-border/70 bg-muted/30 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{exercise?.name || "Exercise"}</p>
                          <p className="text-xs text-muted-foreground">
                            {exercise?.muscleGroup?.join(", ")}
                          </p>
                        </div>
                        <Badge variant="outline">Order {item.order}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{item.sets} sets</span>
                        <span>{item.reps} reps</span>
                        <span>{item.restInSeconds}s rest</span>
                        <span>{exercise?.equipment}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                Created {format(new Date(previewPlan.createdAt), "MMM d, yyyy")} by {typeof previewPlan.createdBy === "object" && previewPlan.createdBy !== null
                  ? (() => {
                      const creator = previewPlan.createdBy as any;
                      if (creator.firstName || creator.lastName) {
                        return [creator.firstName, creator.lastName].filter(Boolean).join(" ") || creator._id || String(creator);
                      }
                      return creator._id || creator.email || String(creator);
                    })()
                  : previewPlan.createdBy || "Unknown"}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5 text-[var(--primary)]" />
              Assign workout
            </DialogTitle>
        
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Workout</p>
              <Select
                value={selectedWorkoutId}
                onValueChange={(val) => setSelectedWorkoutId(val)}
                disabled={!workouts.length}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select workout" />
                </SelectTrigger>
                <SelectContent>
                  {workouts.map((w) => (
                    <SelectItem key={w._id} value={w._id}>
                      {w.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Members</p>
              {members.length === 0 ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>No members found. Click refresh after you create/seed users.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => load()}>
                      Refresh
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/dashboard/staff/exercises">Add exercises</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const el = document.getElementById("workout-builder");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        setAssignModalOpen(false);
                      }}>
                      Create workout
                    </Button>
                  </div>
                </div>
              ) : (
                <ScrollArea className="max-h-[320px] pr-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {members.map((m) => {
                      const fullName =
                        [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || m._id;
                      const checked = selectedMembers.has(m._id);
                      return (
                        <label
                          key={m._id}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm transition ${
                            checked
                              ? "border-[var(--primary)] bg-[var(--primary)]/5"
                              : "border-border/60 bg-muted/30"
                          }`}>
                          <div className="space-y-1">
                            <p className="font-semibold leading-tight">{fullName}</p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[var(--primary)]"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedMembers((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) {
                                  next.add(m._id);
                                } else {
                                  next.delete(m._id);
                                }
                                return next;
                              });
                            }}
                          />
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAssignModalOpen(false);
                  setSelectedMembers(new Set());
                }}>
                Cancel
              </Button>
              <Button
                disabled={!selectedWorkoutId || selectedMembers.size === 0 || assigning}
                onClick={async () => {
                  if (!selectedWorkoutId || selectedMembers.size === 0) return;
                  try {
                    setAssigning(true);
                    const res = await assignWorkout(selectedWorkoutId, Array.from(selectedMembers));
                    if (res?.success) {
                      toast.success("Workout assigned", {
                        description: res.message || `${selectedMembers.size} members updated`
                      });
                      setAssignModalOpen(false);
                      setSelectedMembers(new Set());
                    } else {
                      toast.error("Assignment failed", { description: res?.message || "Try again." });
                    }
                  } catch (error: any) {
                    toast.error("Assignment failed", { description: error?.message || "Check API/token." });
                  } finally {
                    setAssigning(false);
                  }
                }}>
                {assigning ? "Assigning..." : "Assign workout"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
  accent?: string;
};

function StatCard({ title, value, helper, icon, accent }: StatCardProps) {
  return (
    <Card className="border border-border/70 bg-card/80 shadow-xs">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
        <div
          className={`rounded-full p-2 ${
            accent || "bg-[var(--primary)]/12 text-[var(--primary)]"
          }`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function renderWorkoutGrid(
  plans: WorkoutPlan[],
  exerciseLookup: Record<string, Exercise>,
  difficultyTone: Record<Difficulty, string>,
  typeTone: Record<WorkoutType, string>,
  openPreview: (plan: WorkoutPlan) => void,
  loadAsTemplate: (plan: WorkoutPlan) => void,
  sharePlan: (plan: WorkoutPlan) => void,
  deletePlan: (id: string) => void,
  deletingId: string | null
) {
  if (!plans.length) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Nothing here yet. Save a plan from the builder to populate this tab.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan._id} className="flex h-full flex-col border border-border/70">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={difficultyTone[plan.difficulty]}>{plan.difficulty}</Badge>
              <Badge className={typeTone[plan.type]}>{plan.type}</Badge>
              <Badge variant="outline" className="text-xs">
                {plan.isActive ? "Active" : "Paused"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {plan.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">{plan.title}</CardTitle>
            <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <div className="space-y-2">
              {plan.exercises.slice(0, 4).map((item) => {
                const exercise = exerciseLookup[item.exerciseId];
                return (
                  <div
                    key={item.exerciseId}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold">{exercise?.name || "Exercise"}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.sets} x {item.reps} reps | {item.restInSeconds}s rest
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{item.order}
                    </Badge>
                  </div>
                );
              })}
              {plan.exercises.length > 4 ? (
                <p className="text-xs text-muted-foreground">
                  +{plan.exercises.length - 4} more exercises
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <p className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(new Date(plan.updatedAt), { addSuffix: true })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => loadAsTemplate(plan)}>
                  Use as template
                </Button>
                <Button variant="outline" size="sm" onClick={() => openPreview(plan)}>
                  Preview
                </Button>
                <Button size="sm" onClick={() => sharePlan(plan)}>
                  Send to members
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deletingId === plan._id}
                  onClick={() => deletePlan(plan._id)}>
                  {deletingId === plan._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

