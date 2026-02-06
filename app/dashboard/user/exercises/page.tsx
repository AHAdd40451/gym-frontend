"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dumbbell, Play } from "lucide-react";
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
import { fetchWorkouts, fetchWorkoutsByDay } from "@/lib/api/services/workouts/workouts";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Exercise = {
  _id: string;
  name: string;
  muscleGroup?: string[];
  equipment?: string;
};

type WorkoutExercise = {
  exerciseId: string | Exercise;
  sets: number;
  reps: number;
  restInSeconds: number;
  order: number;
};

type Workout = {
  _id: string;
  title: string;
  description?: string;
  difficulty: string;
  type: string;
  day?: string;
  exercises: WorkoutExercise[];
  createdBy?: { firstName?: string; lastName?: string };
};

export default function UserExercisesPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const res = await fetchWorkouts({ isPublic: true, isActive: true });
      if (res.success && res.data) {
        setWorkouts(res.data);
      } else {
        setWorkouts([]);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const fallbackReason = status === 403 ? "403 on /workouts" : null;

      if (fallbackReason) {
        try {
          const results = await Promise.all(days.map((day) => fetchWorkoutsByDay(day)));
          const allWorkouts = results.flatMap((r) => (r?.success && Array.isArray(r.data) ? r.data : []));
          const unique = new Map<string, Workout>();
          for (const workout of allWorkouts) {
            if (workout?._id) unique.set(workout._id, workout);
          }
          setWorkouts(Array.from(unique.values()));
          return;
        } catch (fallbackError: any) {
          console.error("Failed to load workouts (fallback)", fallbackError);
        }
      }

      console.error("Failed to load workouts", error);
      toast.error("Could not load workouts", {
        description: error?.message || "Check API and token."
      });
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getExerciseName = (exercise: string | Exercise | null | undefined): string => {
    if (!exercise) return "Exercise";
    if (typeof exercise === "string") return "Exercise";
    return exercise.name || "Exercise";
  };

  return (
    <div className="space-y-6 pb-10">
      <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold flex items-center gap-2">
            <Dumbbell className="size-6" />
            Workouts
          </CardTitle>
          <CardDescription>
            Browse all available workouts. Checkout a workout to select exercises you completed and save your session.
          </CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="p-6 text-sm text-muted-foreground text-center">Loading workouts...</div>
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="text-sm">No workouts available right now.</p>
            <p className="text-xs mt-2">Check back later or contact your trainer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <Card
              key={workout._id}
              className="border border-border/70 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{workout.difficulty}</Badge>
                  <Badge variant="outline">{workout.type}</Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{workout.title}</CardTitle>
                {workout.description && (
                  <CardDescription className="line-clamp-2">{workout.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {workout.exercises.filter(ex => ex && ex.exerciseId).slice(0, 3).map((ex, idx) => {
                    return (
                      <div
                        key={idx}
                        className="flex items-start justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                        <div className="flex-1">
                          <p className="font-semibold">{getExerciseName(ex.exerciseId)}</p>
                          <p className="text-xs text-muted-foreground">
                            {ex.sets} x {ex.reps} reps • {ex.restInSeconds}s rest
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          #{ex.order}
                        </Badge>
                      </div>
                    );
                  })}
                  {workout.exercises.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{workout.exercises.length - 3} more exercises
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Dumbbell className="size-3" />
                    <span>{workout.exercises.length} exercises</span>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/user/workouts/${workout._id}`}>
                      <Play className="size-4 mr-1" />
                      Checkout
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
