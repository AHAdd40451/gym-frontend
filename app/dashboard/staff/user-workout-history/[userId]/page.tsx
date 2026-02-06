"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, startOfDay, isSameDay, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Clock, Flame, Dumbbell, Activity } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api/constants/constants";
import apiClient from "@/lib/api/axios";
import { usersApi } from "@/lib/api/services/users/users";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type WorkoutLog = {
  _id: string;
  workoutId: {
    _id: string;
    title: string;
    type: string;
    difficulty: string;
  };
  exercises: Array<{
    exerciseId: {
      _id: string;
      name: string;
      muscleGroup: string[];
      equipment: string;
    };
    sets: Array<{
      reps: number;
      weight: number;
      completed: boolean;
    }>;
    notes?: string;
  }>;
  totalDurationInMinutes?: number;
  caloriesBurned?: number;
  notes?: string;
  performedAt: string;
  createdAt: string;
};

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function UserWorkoutHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, logsRes] = await Promise.all([
          usersApi.getById(userId),
          apiClient.get(API_ENDPOINTS.WORKOUT_LOGS.HISTORY(userId))
        ]);

        // Handle user response - could be nested
        const userData = 
          (userRes as any)?.data?.user || 
          (userRes as any)?.user || 
          (userRes as any)?.data || 
          userRes;
        setUser(userData);

        // Handle workout logs response
        const logs = 
          logsRes.data?.data || 
          logsRes.data?.logs || 
          logsRes.data || 
          [];
        const validLogs = Array.isArray(logs) ? logs.filter(log => log && log.performedAt) : [];
        setWorkoutLogs(validLogs);
        
        // If there are workouts, set the first workout date as selected
        if (validLogs.length > 0 && validLogs[0].performedAt) {
          try {
            const firstDate = typeof validLogs[0].performedAt === 'string'
              ? parseISO(validLogs[0].performedAt)
              : new Date(validLogs[0].performedAt);
            setSelectedDate(startOfDay(firstDate));
          } catch (error) {
            console.error('Error setting initial date:', error);
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to load workout history", {
          description: error?.message || "Please try again later."
        });
        setWorkoutLogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Get dates that have workouts
  const workoutDates = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) return [];
    return workoutLogs
      .filter((log) => log.performedAt)
      .map((log) => {
        try {
          const date = typeof log.performedAt === 'string' 
            ? parseISO(log.performedAt) 
            : new Date(log.performedAt);
          return startOfDay(date);
        } catch (error) {
          console.error('Error parsing date:', log.performedAt, error);
          return null;
        }
      })
      .filter((date): date is Date => date !== null);
  }, [workoutLogs]);

  // Get workouts for selected date
  const selectedDateWorkouts = useMemo(() => {
    if (!selectedDate || !workoutLogs || workoutLogs.length === 0) return [];
    return workoutLogs.filter((log) => {
      if (!log.performedAt) return false;
      try {
        const logDate = typeof log.performedAt === 'string' 
          ? parseISO(log.performedAt) 
          : new Date(log.performedAt);
        return isSameDay(logDate, selectedDate);
      } catch (error) {
        console.error('Error comparing dates:', error);
        return false;
      }
    });
  }, [workoutLogs, selectedDate]);

  // Custom day renderer to highlight dates with workouts
  const modifiers = {
    hasWorkout: (date: Date) => workoutDates.some((workoutDate) => isSameDay(workoutDate, date))
  };

  const modifiersClassNames = {
    hasWorkout: "bg-[var(--primary)]/20 text-[var(--primary)] font-semibold rounded-md"
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">Loading workout history...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">User not found</div>
      </div>
    );
  }

  const userName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/dashboard/staff/user-workout-history")}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <CardTitle className="text-3xl font-semibold">{userName}'s Workout History</CardTitle>
              </div>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {workoutLogs.length} total workouts
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Workout Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDate ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5 text-[var(--primary)]" />
                    Workouts on {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDateWorkouts.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-muted-foreground">No workouts recorded on this date.</p>
                      <p className="text-xs text-muted-foreground">
                        Select a highlighted date from the calendar to view workouts.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateWorkouts.map((log) => (
                        <Card key={log._id} className="border-l-4 border-l-[var(--primary)]">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg">{log.workoutId?.title || "Workout"}</CardTitle>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge variant="outline">{log.workoutId?.type || "N/A"}</Badge>
                                  <Badge variant="outline">{log.workoutId?.difficulty || "N/A"}</Badge>
                                  {log.totalDurationInMinutes && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <Clock className="size-3" />
                                      {log.totalDurationInMinutes} min
                                    </Badge>
                                  )}
                                  {log.caloriesBurned && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <Flame className="size-3" />
                                      {log.caloriesBurned} cal
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {(() => {
                                  try {
                                    const date = typeof log.performedAt === 'string' 
                                      ? parseISO(log.performedAt) 
                                      : new Date(log.performedAt);
                                    return format(date, "h:mm a");
                                  } catch (error) {
                                    return "N/A";
                                  }
                                })()}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Exercises */}
                              <div>
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Dumbbell className="size-4" />
                                  Exercises
                                </h4>
                                <div className="space-y-3">
                                  {log.exercises?.map((exercise, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-lg border bg-muted/30 p-3 space-y-2"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <p className="font-medium">{exercise.exerciseId?.name || "Exercise"}</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {exercise.exerciseId?.muscleGroup?.map((muscle, i) => (
                                              <Badge key={i} variant="outline" className="text-xs">
                                                {muscle}
                                              </Badge>
                                            ))}
                                          </div>
                                          {exercise.exerciseId?.equipment && (
                                            <Badge variant="secondary" className="text-xs mt-1">
                                              {exercise.exerciseId.equipment}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      {/* Sets */}
                                      {exercise.sets && exercise.sets.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          <p className="text-xs font-medium text-muted-foreground">Sets:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {exercise.sets.map((set, setIdx) => (
                                              <Badge
                                                key={setIdx}
                                                variant={set.completed ? "default" : "outline"}
                                                className="text-xs"
                                              >
                                                {set.reps} reps
                                                {set.weight && ` @ ${set.weight}kg`}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {exercise.notes && (
                                        <p className="text-xs text-muted-foreground mt-2 italic">
                                          Note: {exercise.notes}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Workout Notes */}
                              {log.notes && (
                                <div className="rounded-lg border bg-muted/30 p-3">
                                  <p className="text-sm font-medium mb-1">Workout Notes:</p>
                                  <p className="text-sm text-muted-foreground">{log.notes}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">
                  Select a date from the calendar to view workouts
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calendar Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
              <CardDescription>Click on a date to view workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="rounded-md border-0"
                classNames={{
                  day_selected: "bg-[var(--primary)] text-primary-foreground hover:bg-[var(--primary)] hover:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground"
                }}
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-3 rounded-md bg-[var(--primary)]/20"></div>
                  <span className="text-muted-foreground">Date with workout</span>
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  Total workouts: <strong>{workoutLogs.length}</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

