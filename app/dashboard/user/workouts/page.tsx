import { getServerAuth } from "@/lib/api/services/auth/server";
import { serverFetch } from "@/lib/api/api-actions/server";
import { API_ENDPOINTS } from "@/lib/api/constants/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

type Difficulty = "Beginner" | "Intermediate" | "Advanced" | string;
type WorkoutType = "Strength" | "Cardio" | "Weight Loss" | string;

type ExerciseItem = {
  exerciseId: {
    _id: string;
    name: string;
    muscleGroup?: string[];
    equipment?: string;
    videoUrl?: string;
    imageUrl?: string;
  };
  sets: number;
  reps: number;
  restInSeconds: number;
  order: number;
};

type Workout = {
  _id: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  type: WorkoutType;
  exercises: ExerciseItem[];
  createdBy?: { firstName?: string; lastName?: string };
  createdAt: string;
};

export default async function UserWorkoutsPage() {
  const { token } = await getServerAuth();

  if (!token) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Please sign in to view your workouts.</p>
      </div>
    );
  }

  const res = await serverFetch<{ success: boolean; data: Workout[] }>(
    API_ENDPOINTS.WORKOUTS.ASSIGNED,
    {},
    token
  );

  const workouts = res.data?.data || [];

  if (!workouts.length) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's workouts</CardTitle>
            <CardDescription>No workouts assigned yet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Today's workouts</h1>
        <p className="text-sm text-muted-foreground">
          Plans assigned to you by your coach. Start a session and log your sets.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {workouts.map((workout) => (
          <Card key={workout._id} className="border border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{workout.difficulty}</Badge>
                <Badge variant="outline">{workout.type}</Badge>
              </div>
              <CardTitle className="leading-tight">{workout.title}</CardTitle>
              <CardDescription className="line-clamp-2">{workout.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Assigned {formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true })} by{" "}
                {[workout.createdBy?.firstName, workout.createdBy?.lastName].filter(Boolean).join(" ") ||
                  "Coach"}
              </div>
              <Separator />
              <div className="space-y-2">
                {workout.exercises.map((ex) => (
                  <div
                    key={ex.order}
                    className="flex items-start justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold">{ex.exerciseId?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ex.sets} x {ex.reps} reps • {ex.restInSeconds}s rest
                      </p>
                      {ex.exerciseId?.muscleGroup?.length ? (
                        <p className="text-xs text-muted-foreground">
                          {ex.exerciseId.muscleGroup.join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{ex.order}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
