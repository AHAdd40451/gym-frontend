"use client";

import { useMemo, useState, type ReactNode } from "react";
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

const exerciseLibrary: Exercise[] = [
  {
    _id: "ex-1",
    name: "Barbell Back Squat",
    description: "Lower-body strength staple with braced core and full-depth drive.",
    muscleGroup: ["Quads", "Glutes", "Core"],
    equipment: "Barbell",
    difficulty: "Advanced",
    videoUrl: "https://youtu.be/YaXPRqUwItQ",
    imageUrl: "/images/exercises/squat.jpg",
    isActive: true,
    createdBy: "coach-lena",
    createdAt: "2026-01-10T14:00:00Z",
    updatedAt: "2026-01-28T14:00:00Z"
  },
  {
    _id: "ex-2",
    name: "Incline Dumbbell Press",
    description: "Chest emphasis with controlled 2-1-2 tempo on a 30 degree bench.",
    muscleGroup: ["Chest", "Shoulders", "Triceps"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    videoUrl: "https://youtu.be/8iPEnn-ltC8",
    imageUrl: "/images/exercises/incline-press.jpg",
    isActive: true,
    createdBy: "coach-lena",
    createdAt: "2026-01-12T09:00:00Z",
    updatedAt: "2026-01-20T09:00:00Z"
  },
  {
    _id: "ex-3",
    name: "Seated Cable Row",
    description: "Neutral-grip pull for mid-back thickness and scapular control.",
    muscleGroup: ["Back", "Rear Delts"],
    equipment: "Machine",
    difficulty: "Intermediate",
    videoUrl: "https://youtu.be/GZbfZ033f74",
    imageUrl: "/images/exercises/cable-row.jpg",
    isActive: true,
    createdBy: "coach-ravi",
    createdAt: "2026-01-14T07:00:00Z",
    updatedAt: "2026-01-22T07:00:00Z"
  },
  {
    _id: "ex-4",
    name: "Assault Bike Intervals",
    description: "30s on / 30s off power intervals to drive heart rate.",
    muscleGroup: ["Full Body"],
    equipment: "Machine",
    difficulty: "Beginner",
    videoUrl: "https://youtu.be/TjsB-rF7pJk",
    imageUrl: "/images/exercises/assault-bike.jpg",
    isActive: true,
    createdBy: "coach-ravi",
    createdAt: "2026-01-18T08:00:00Z",
    updatedAt: "2026-01-29T08:00:00Z"
  },
  {
    _id: "ex-5",
    name: "Front Plank Reach",
    description: "Anti-rotation core drill with shoulder stability.",
    muscleGroup: ["Core", "Shoulders"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    videoUrl: "https://youtu.be/B296mZDhrP4",
    imageUrl: "/images/exercises/plank-reach.jpg",
    isActive: true,
    createdBy: "coach-lena",
    createdAt: "2026-01-19T10:30:00Z",
    updatedAt: "2026-01-27T10:30:00Z"
  }
];

const seededWorkouts: WorkoutPlan[] = [
  {
    _id: "wo-1",
    title: "Push Power 45",
    description: "Upper-body press day with power focus and tight rest windows.",
    difficulty: "Intermediate",
    type: "Strength",
    createdBy: "coach-lena",
    isActive: true,
    isPublic: true,
    exercises: [
      { exerciseId: "ex-2", sets: 4, reps: 10, restInSeconds: 90, order: 1 },
      { exerciseId: "ex-3", sets: 4, reps: 12, restInSeconds: 75, order: 2 },
      { exerciseId: "ex-5", sets: 3, reps: 12, restInSeconds: 60, order: 3 }
    ],
    createdAt: "2026-01-30T14:00:00Z",
    updatedAt: "2026-02-01T09:00:00Z"
  },
  {
    _id: "wo-2",
    title: "Metabolic Burn",
    description: "Low-skill, high-output circuit tuned for weight loss members.",
    difficulty: "Beginner",
    type: "Weight Loss",
    createdBy: "coach-ravi",
    isActive: true,
    isPublic: true,
    exercises: [
      { exerciseId: "ex-4", sets: 6, reps: 30, restInSeconds: 30, order: 1 },
      { exerciseId: "ex-5", sets: 3, reps: 20, restInSeconds: 30, order: 2 }
    ],
    createdAt: "2026-01-28T12:00:00Z",
    updatedAt: "2026-02-01T08:30:00Z"
  },
  {
    _id: "wo-3",
    title: "Strength Foundations",
    description: "Entry-level full body patterning with controlled tempo.",
    difficulty: "Beginner",
    type: "Strength",
    createdBy: "coach-amelia",
    isActive: false,
    isPublic: false,
    exercises: [
      { exerciseId: "ex-1", sets: 3, reps: 8, restInSeconds: 120, order: 1 },
      { exerciseId: "ex-3", sets: 3, reps: 10, restInSeconds: 90, order: 2 },
      { exerciseId: "ex-5", sets: 2, reps: 30, restInSeconds: 45, order: 3 }
    ],
    createdAt: "2026-01-15T17:00:00Z",
    updatedAt: "2026-01-25T17:00:00Z"
  }
];

const seededLogs: ExerciseLog[] = [
  {
    _id: "log-1",
    userId: "member-104",
    workoutId: "wo-1",
    exercises: [
      {
        exerciseId: "ex-2",
        sets: [
          { reps: 10, weight: 22, completed: true },
          { reps: 10, weight: 22, completed: true },
          { reps: 8, weight: 22, completed: true },
          { reps: 8, weight: 20, completed: true }
        ],
        notes: "Dropped last set to 8 reps."
      },
      {
        exerciseId: "ex-3",
        sets: [
          { reps: 12, weight: 45, completed: true },
          { reps: 12, weight: 45, completed: true },
          { reps: 10, weight: 45, completed: true },
          { reps: 10, weight: 41, completed: true }
        ]
      }
    ],
    totalDurationInMinutes: 48,
    caloriesBurned: 420,
    notes: "Strong energy, next time try 90s rest.",
    performedAt: "2026-02-01T15:30:00Z",
    createdAt: "2026-02-01T15:35:00Z",
    updatedAt: "2026-02-01T15:35:00Z"
  },
  {
    _id: "log-2",
    userId: "member-088",
    workoutId: "wo-2",
    exercises: [
      {
        exerciseId: "ex-4",
        sets: [
          { reps: 30, weight: 0, completed: true },
          { reps: 30, weight: 0, completed: true },
          { reps: 30, weight: 0, completed: true },
          { reps: 30, weight: 0, completed: true }
        ],
        notes: "Held >60 RPM on all rounds."
      },
      {
        exerciseId: "ex-5",
        sets: [
          { reps: 20, weight: 0, completed: true },
          { reps: 18, weight: 0, completed: true },
          { reps: 18, weight: 0, completed: true }
        ]
      }
    ],
    totalDurationInMinutes: 32,
    caloriesBurned: 350,
    notes: "Kept HR above 155 average.",
    performedAt: "2026-01-31T12:00:00Z",
    createdAt: "2026-01-31T12:05:00Z",
    updatedAt: "2026-01-31T12:05:00Z"
  },
  {
    _id: "log-3",
    userId: "member-099",
    workoutId: "wo-3",
    exercises: [
      {
        exerciseId: "ex-1",
        sets: [
          { reps: 8, weight: 40, completed: true },
          { reps: 8, weight: 42, completed: true },
          { reps: 6, weight: 45, completed: true }
        ]
      },
      {
        exerciseId: "ex-3",
        sets: [
          { reps: 10, weight: 36, completed: true },
          { reps: 10, weight: 36, completed: true },
          { reps: 10, weight: 36, completed: true }
        ]
      }
    ],
    totalDurationInMinutes: 54,
    caloriesBurned: 480,
    notes: "Form check approved for next phase.",
    performedAt: "2026-01-26T17:30:00Z",
    createdAt: "2026-01-26T17:35:00Z",
    updatedAt: "2026-01-26T17:35:00Z"
  }
];

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
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>(seededWorkouts);
  const [builder, setBuilder] = useState<BuilderForm>(initialBuilderState);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(exerciseLibrary[0]?._id ?? "");
  const [exerciseInputs, setExerciseInputs] = useState({ sets: 3, reps: 10, restInSeconds: 60 });
  const [previewPlan, setPreviewPlan] = useState<WorkoutPlan | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const exerciseLookup = useMemo(
    () =>
      exerciseLibrary.reduce((acc, exercise) => {
        acc[exercise._id] = exercise;
        return acc;
      }, {} as Record<string, Exercise>),
    []
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
      logSessions: seededLogs.length,
      avgDuration:
        seededLogs.length === 0
          ? 0
          : Math.round(
              seededLogs.reduce((acc, log) => acc + log.totalDurationInMinutes, 0) / seededLogs.length
            )
    }),
    [workouts, activeWorkouts, publicWorkouts]
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

  const handleSavePlan = () => {
    if (!builder.title.trim()) {
      toast.error("Add a workout title before saving.");
      return;
    }

    if (builder.exercises.length === 0) {
      toast.error("Add at least one exercise to the plan.");
      return;
    }

    const now = new Date().toISOString();
    const newPlan: WorkoutPlan = {
      ...builder,
      _id: `local-${Date.now()}`,
      createdBy: "staff-local",
      createdAt: now,
      updatedAt: now
    };

    setWorkouts((prev) => [newPlan, ...prev]);
    setBuilder(initialBuilderState);
    setExerciseInputs({ sets: 3, reps: 10, restInSeconds: 60 });
    setSelectedExerciseId(exerciseLibrary[0]?._id ?? "");

    toast.success("Workout drafted", {
      description: "Saved locally. Wire to your API to persist."
    });
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
    toast("Send to member app", {
      description: `${plan.title} -> ready to push via API endpoint /workouts/${plan._id}/assign`
    });
  };

  const workoutsByTab: Record<string, WorkoutPlan[]> = {
    active: activeWorkouts,
    public: publicWorkouts,
    all: workouts
  };

  return (
    <div className="space-y-6 pb-10">
      <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit gap-2 bg-[var(--primary)]/15 text-[var(--primary)]">
              <Sparkles className="size-4" />
              Workout Operating System
            </Badge>
            <CardTitle className="text-3xl font-semibold">
              Workout plans that follow the new 3-collection schema
            </CardTitle>
            <CardDescription className="max-w-2xl">
              Staff build plans, members view instantly, users log workouts, and analytics stay clean
              because exercises stay embedded and logs stay event-based.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="border-dashed"
              onClick={() => {
                setBuilder(initialBuilderState);
                setExerciseInputs({ sets: 3, reps: 10, restInSeconds: 60 });
                toast("Builder reset");
              }}>
              Reset builder
            </Button>
            <Button
              onClick={() => {
                const el = document.getElementById("workout-builder");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}>
              Start a plan
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Workouts live"
          value={`${stats.activeWorkouts}/${stats.totalWorkouts}`}
          helper="Active now"
          icon={<Activity className="size-5" />}
        />
        <StatCard
          title="Public plans"
          value={stats.publicWorkouts}
          helper="Visible to all members"
          icon={<Users className="size-5" />}
          accent="bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100"
        />
        <StatCard
          title="Exercise library"
          value={stats.totalExercises}
          helper="Reusable blocks"
          icon={<Dumbbell className="size-5" />}
          accent="bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100"
        />
        <StatCard
          title="Logged sessions"
          value={`${stats.logSessions} | ${stats.avgDuration} min avg`}
          helper="Exercise Log Activity collection"
          icon={<BarChart3 className="size-5" />}
          accent="bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100"
        />
      </div>

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
                <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Active</p>
                    <p className="text-xs text-muted-foreground">Controls availability in apps.</p>
                  </div>
                  <Switch
                    checked={builder.isActive}
                    onCheckedChange={(checked) => setBuilder((prev) => ({ ...prev, isActive: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Public</p>
                    <p className="text-xs text-muted-foreground">Visible to all members.</p>
                  </div>
                  <Switch
                    checked={builder.isPublic}
                    onCheckedChange={(checked) => setBuilder((prev) => ({ ...prev, isPublic: checked }))}
                  />
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
                <Button type="submit">Save workout</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBuilder(initialBuilderState);
                    setExerciseInputs({ sets: 3, reps: 10, restInSeconds: 60 });
                  }}>
                  Clear form
                </Button>
              </div>
            </form>
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
                          {exercise.muscleGroup.map((muscle) => (
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
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="public">Public</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              {["active", "public", "all"].map((tab) => (
                <TabsContent key={tab} value={tab} className="pt-4">
                  {renderWorkoutGrid(
                    workoutsByTab[tab],
                    exerciseLookup,
                    difficultyTone,
                    typeTone,
                    openPreview,
                    loadAsTemplate,
                    sharePlan
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
                {seededLogs.map((log) => {
                  const workout = workoutLookup[log.workoutId];
                  const totalSets = log.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
                  return (
                    <div key={log._id} className="rounded-lg border border-border/70 bg-muted/30 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold leading-tight">
                            {workout?.title || "Workout"} | {log.userId}
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
                })}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <LineChart className="size-4 text-[var(--primary)]" />
                <span>
                  Index-ready: userId + performedAt, workoutId keep analytics fast even at scale.
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="size-4 text-[var(--primary)]" />
                <span>Plan vs Activity separation keeps schema clean for future dashboards.</span>
              </div>
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
                Created {format(new Date(previewPlan.createdAt), "MMM d, yyyy")} by {previewPlan.createdBy}
              </div>
            </>
          ) : null}
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
  sharePlan: (plan: WorkoutPlan) => void
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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

