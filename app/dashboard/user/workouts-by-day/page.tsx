"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar, Dumbbell } from "lucide-react";
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
import { fetchWorkouts } from "@/lib/api/services/workouts/workouts";

type Workout = {
  _id: string;
  title: string;
  description?: string;
  difficulty: string;
  type: string;
  day?: string;
  exercises: any[];
  createdBy?: { firstName?: string; lastName?: string };
};

export default function WorkoutsByDayPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const res = await fetchWorkouts({});
      if (res.success && res.data) {
        setWorkouts(res.data);
      } else {
        setWorkouts([]);
      }
    } catch (error: any) {
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


  return (
    <div className="space-y-6 pb-10">
      <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold flex items-center gap-2">
            <Calendar className="size-6" />
            Weekly Workouts
          </CardTitle>
          <CardDescription>
            Browse all available workouts. Select a workout to see exercises and start your session.
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
              <CardContent>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Dumbbell className="size-3" />
                    <span>{workout.exercises.length} exercises</span>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/user/workouts/${workout._id}`}>Start Workout</Link>
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

