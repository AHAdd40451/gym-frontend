"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar, User, Dumbbell, Clock, Flame, TrendingUp } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, formatDistanceToNow } from "date-fns";
import { fetchTodayUserActivities } from "@/lib/api/services/workouts/workouts";

type Exercise = {
  _id: string;
  name: string;
  muscleGroup?: string[];
  equipment?: string;
};

type LoggedSet = {
  reps: number;
  weight: number;
  completed: boolean;
};

type LoggedExercise = {
  exerciseId: string | Exercise;
  sets: LoggedSet[];
  notes?: string;
};

type Activity = {
  _id: string;
  userId: string | { _id: string; firstName?: string; lastName?: string; email?: string };
  workoutId: string | { _id: string; title?: string; type?: string; difficulty?: string; day?: string };
  exercises: LoggedExercise[];
  totalDurationInMinutes: number;
  caloriesBurned: number;
  notes?: string;
  performedAt: string;
  createdAt: string;
};

export default function UserActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [lastActivityCount, setLastActivityCount] = useState<number>(0);

  useEffect(() => {
    loadActivities();
    
    // Auto-refresh every 30 seconds to get new activities
    const interval = setInterval(() => {
      loadActivities();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [selectedDate, filterUserId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params: { date?: string; userId?: string } = {};
      if (selectedDate) {
        params.date = selectedDate;
      }
      if (filterUserId) {
        params.userId = filterUserId;
      }
      
      const res = await fetchTodayUserActivities(params);
      if (res.success && res.data) {
        // Check if new activities were added
        if (res.data.length > lastActivityCount && lastActivityCount > 0) {
          toast.success("New activity detected!", {
            description: `${res.data.length - lastActivityCount} new workout(s) completed.`
          });
        }
        setLastActivityCount(res.data.length);
        setActivities(res.data);
      } else {
        setActivities([]);
        setLastActivityCount(0);
      }
    } catch (error: any) {
      console.error("Failed to load activities", error);
      toast.error("Could not load user activities", {
        description: error?.message || "Check API and token."
      });
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (user: string | { _id: string; firstName?: string; lastName?: string; email?: string }): string => {
    if (typeof user === "object" && user !== null) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
      return name || user.email || user._id || "Unknown User";
    }
    return "Unknown User";
  };

  const getWorkoutTitle = (workout: string | { _id: string; title?: string }): string => {
    if (typeof workout === "object" && workout !== null) {
      return workout.title || "Workout";
    }
    return "Workout";
  };

  const getExerciseName = (exercise: string | Exercise): string => {
    if (typeof exercise === "object" && exercise !== null) {
      return exercise.name || "Exercise";
    }
    return "Exercise";
  };

  const getExerciseDetails = (exercise: string | Exercise): Exercise | null => {
    if (typeof exercise === "object" && exercise !== null && "_id" in exercise) {
      return exercise;
    }
    return null;
  };

  const totalStats = activities.reduce(
    (acc, activity) => ({
      totalDuration: acc.totalDuration + activity.totalDurationInMinutes,
      totalCalories: acc.totalCalories + activity.caloriesBurned,
      totalExercises: acc.totalExercises + activity.exercises.length,
      totalSets: acc.totalSets + activity.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
    }),
    { totalDuration: 0, totalCalories: 0, totalExercises: 0, totalSets: 0 }
  );

  return (
    <div className="space-y-6 pb-10">
      <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold flex items-center gap-2">
            <TrendingUp className="size-6" />
            User Activities
          </CardTitle>
          <CardDescription>
            View what users have completed today. Track their workout progress and performance.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-semibold">{activities.length}</p>
              </div>
              <Calendar className="size-8 text-[var(--primary)]/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-semibold">{totalStats.totalDuration} min</p>
              </div>
              <Clock className="size-8 text-[var(--primary)]/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Calories</p>
                <p className="text-2xl font-semibold">{totalStats.totalCalories}</p>
              </div>
              <Flame className="size-8 text-[var(--primary)]/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sets</p>
                <p className="text-2xl font-semibold">{totalStats.totalSets}</p>
              </div>
              <Dumbbell className="size-8 text-[var(--primary)]/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/70 shadow-sm">
        <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Activity Log
                {activities.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                View detailed workout sessions performed by users. Auto-refreshes every 30 seconds.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <Input
                type="text"
                placeholder="Filter by User ID"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                className="w-auto"
              />
              <Button onClick={loadActivities} variant="outline" size="sm" disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground text-center">
              Loading activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p className="text-sm">No activities found for {format(new Date(selectedDate), "MMM d, yyyy")}.</p>
              <p className="text-xs mt-2">Users will appear here after they complete workouts.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px] pr-4">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity._id} className="border border-border/70 bg-muted/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <span className="font-semibold">{getUserName(activity.userId)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{getWorkoutTitle(activity.workoutId)}</span>
                            {typeof activity.workoutId === "object" && activity.workoutId.day && (
                              <Badge variant="outline" className="text-xs">
                                {activity.workoutId.day}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.performedAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-sm">
                          <Badge variant="outline">
                            {activity.totalDurationInMinutes} min
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {activity.caloriesBurned} kcal
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {activity.exercises.map((ex, idx) => {
                          const exercise = getExerciseDetails(ex.exerciseId);
                          const completedSets = ex.sets.filter((s) => s.completed).length;
                          return (
                            <div
                              key={idx}
                              className="rounded-lg border border-border/60 bg-background p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold">{getExerciseName(ex.exerciseId)}</p>
                                  {exercise?.muscleGroup?.length ? (
                                    <p className="text-xs text-muted-foreground">
                                      {exercise.muscleGroup.join(", ")}
                                    </p>
                                  ) : null}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {completedSets}/{ex.sets.length} sets
                                </Badge>
                              </div>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                {ex.sets.map((set, setIdx) => (
                                  <div
                                    key={setIdx}
                                    className={`rounded border p-2 text-center ${
                                      set.completed
                                        ? "border-green-500 bg-green-500/10"
                                        : "border-border/60 bg-muted/30"
                                    }`}>
                                    <div className="font-semibold">
                                      {set.reps} × {set.weight}kg
                                    </div>
                                    {set.completed && (
                                      <div className="text-green-600 text-[10px] mt-1">✓</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {ex.notes && (
                                <p className="text-xs text-muted-foreground mt-2 italic">
                                  "{ex.notes}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {activity.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground italic">
                            "{activity.notes}"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

