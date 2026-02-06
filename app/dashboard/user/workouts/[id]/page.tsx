"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Dumbbell, Clock, Flame, AlertCircle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchWorkoutById, checkoutWorkout, checkWorkoutCompletedToday, type Workout, type WorkoutExercise } from "@/lib/api/services/workouts/workouts";

type Exercise = {
  _id: string;
  name: string;
  description?: string;
  muscleGroup?: string[];
  equipment?: string;
  videoUrl?: string;
  imageUrl?: string;
};

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [checkingOut, setCheckingOut] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(true);
  
  // Store selected exercise data with complete info
  const [selectedExerciseData, setSelectedExerciseData] = useState<Map<string, WorkoutExercise>>(new Map());

  useEffect(() => {
    if (workoutId) {
      loadWorkout();
      checkIfAlreadyCompleted();
    }
  }, [workoutId]);

  const checkIfAlreadyCompleted = async () => {
    try {
      setCheckingCompletion(true);
      const completed = await checkWorkoutCompletedToday(workoutId);
      setAlreadyCompleted(completed);
      // No toast notification - UI Alert component will show the message
    } catch (error: any) {
      console.error("Failed to check workout completion", error);
      // Don't show error toast, just allow workout to proceed
    } finally {
      setCheckingCompletion(false);
    }
  };

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const res = await fetchWorkoutById(workoutId);
      if (res.success && res.data) {
        console.log("Workout loaded:", res.data);
        console.log("Exercises:", res.data.exercises);
        
        // Check if exercises exist
        if (!res.data.exercises || res.data.exercises.length === 0) {
          toast.error("No exercises found in this workout");
          router.push("/dashboard/user/exercises");
          return;
        }
        
        setWorkout(res.data);
        // Don't auto-select exercises - let user select manually
        setSelectedExercises(new Set());
      } else {
        toast.error("Workout not found");
        router.push("/dashboard/user/exercises");
      }
    } catch (error: any) {
      console.error("Failed to load workout", error);
      toast.error("Could not load workout", {
        description: error?.message || "Check API and token."
      });
      router.push("/dashboard/user/exercises");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (selectedExercises.size === 0) {
      toast.error("Please select at least one exercise");
      return;
    }

    // Check again before saving (in case user somehow bypassed the check)
    if (alreadyCompleted) {
      toast.error("You have already completed this workout today", {
        description: "Please try again tomorrow."
      });
      return;
    }

    try {
      setCheckingOut(true);
      // Get complete exercise data for selected exercises
      const selectedExerciseArray: WorkoutExercise[] = Array.from(selectedExercises).map(exerciseId => {
        const exerciseData = selectedExerciseData.get(exerciseId);
        if (!exerciseData) {
          // Fallback: find from workout exercises
          const workoutEx = workout?.exercises.find(ex => {
            const id = getExerciseId(ex.exerciseId);
            return id === exerciseId;
          });
          if (workoutEx) {
            return {
              exerciseId: exerciseId,
              sets: workoutEx.sets,
              reps: workoutEx.reps,
              restInSeconds: workoutEx.restInSeconds,
              order: workoutEx.order
            } as WorkoutExercise;
          }
        }
        return exerciseData;
      }).filter((ex): ex is WorkoutExercise => ex !== undefined && ex !== null);

      // Log the payload being sent
      console.log('Sending payload with selectedExercises:', selectedExerciseArray);
      console.log('Payload structure:', {
        workoutId,
        selectedExercises: selectedExerciseArray.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets, // This should be a number (count)
          reps: ex.reps, // This should be a number (count)
          restInSeconds: ex.restInSeconds, // This should be a number
          order: ex.order
        }))
      });

      const res = await checkoutWorkout(workoutId, selectedExerciseArray);
      
      if (res.success) {
        // Mark as completed after successful save
        setAlreadyCompleted(true);
        toast.success("Workout saved successfully!", {
          description: res.message || "Staff has been notified about your workout."
        });
        // Redirect back to workouts
        router.push("/dashboard/user/exercises");
      } else {
        toast.error("Save failed", {
          description: res.message || "Please try again."
        });
      }
    } catch (error: any) {
      console.error("Save error", error);
      toast.error("Save failed", {
        description: error?.message || "Check API and token."
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const getExerciseDetails = (exercise: string | Exercise): Exercise | null => {
    if (typeof exercise === "object" && exercise !== null) {
      return exercise;
    }
    return null;
  };

  const getExerciseId = (exercise: string | Exercise | null | undefined): string => {
    if (!exercise) return "";
    if (typeof exercise === "string") return exercise;
    return exercise._id || "";
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
        // Remove from selectedExerciseData
        setSelectedExerciseData((prevData) => {
          const nextData = new Map(prevData);
          nextData.delete(exerciseId);
          return nextData;
        });
      } else {
        next.add(exerciseId);
        // Add complete exercise data
        const workoutEx = workout?.exercises.find(ex => {
          const id = getExerciseId(ex.exerciseId);
          return id === exerciseId;
        });
        if (workoutEx) {
          setSelectedExerciseData((prevData) => {
            const nextData = new Map(prevData);
            nextData.set(exerciseId, {
              exerciseId: exerciseId,
              sets: workoutEx.sets,
              reps: workoutEx.reps,
              restInSeconds: workoutEx.restInSeconds,
              order: workoutEx.order
            } as WorkoutExercise);
            return nextData;
          });
        }
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground text-center">
        Loading workout...
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="text-sm">Workout not found.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/user/exercises">Back to Workouts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/user/exercises">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">{workout.title}</h1>
        </div>
      </div>

      {alreadyCompleted && (
        <Alert className="border-yellow-200 bg-yellow-50/50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Workout Already Completed</AlertTitle>
          <AlertDescription className="text-yellow-700">
            You have already completed this workout today. You can do this workout again tomorrow.
          </AlertDescription>
        </Alert>
      )}

      <Card className={`border border-border/70 shadow-sm ${alreadyCompleted ? 'opacity-60' : ''}`}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{workout.difficulty}</Badge>
            <Badge variant="outline">{workout.type}</Badge>
          </div>
          {workout.description && (
            <CardDescription className="mt-2">{workout.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Dumbbell className="size-5" />
                Exercises ({workout.exercises.length})
              </h2>
              <div className="text-sm text-muted-foreground">
                {selectedExercises.size} of {workout.exercises.length} selected
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {workout.exercises.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <p className="text-sm">No exercises found in this workout.</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/dashboard/user/exercises">Back to Workouts</Link>
                  </Button>
                </div>
              ) : (
                workout.exercises.filter(ex => ex && ex.exerciseId).map((ex, idx) => {
                  const exercise = getExerciseDetails(ex.exerciseId);
                  const exerciseId = getExerciseId(ex.exerciseId);
                  const isSelected = selectedExercises.has(exerciseId);

                  // If exercise is not populated, show a loading or error state
                  if (!exercise && typeof ex.exerciseId === "string") {
                    return (
                      <Card key={idx} className="border border-yellow-200 bg-yellow-50/50">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">
                            Exercise loading... (ID: {ex.exerciseId})
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                  <Card
                    key={idx}
                    className={`border transition-all ${
                      alreadyCompleted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    } ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-border/70 bg-muted/30"
                    }`}
                    onClick={() => !alreadyCompleted && toggleExercise(exerciseId)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isSelected}
                          disabled={alreadyCompleted}
                          onCheckedChange={() => !alreadyCompleted && toggleExercise(exerciseId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{exercise?.name || "Exercise"}</h3>
                              {exercise?.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {exercise.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              #{ex.order}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Dumbbell className="size-4" />
                              <span>{ex.sets} sets × {ex.reps} reps</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-4" />
                              <span>{ex.restInSeconds}s rest</span>
                            </div>
                            {exercise?.muscleGroup?.length ? (
                              <div className="flex items-center gap-1">
                                <Flame className="size-4" />
                                <span>{exercise.muscleGroup.join(", ")}</span>
                              </div>
                            ) : null}
                            {exercise?.equipment && (
                              <Badge variant="outline" className="text-xs">
                                {exercise.equipment}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {alreadyCompleted 
                  ? "You have already completed this workout today. Try again tomorrow."
                  : "Select exercises you completed, then save. Staff will be notified."}
              </div>
              <Button
                onClick={handleSave}
                disabled={selectedExercises.size === 0 || checkingOut || alreadyCompleted}
                size="lg"
                className="gap-2">
                {checkingOut ? (
                  "Saving..."
                ) : alreadyCompleted ? (
                  "Already Completed"
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

