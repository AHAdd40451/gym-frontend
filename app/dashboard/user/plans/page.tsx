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

export default async function PlansPage() {
  const { token } = await getServerAuth();

  if (!token) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Please sign in to view your plans.</p>
      </div>
    );
  }

  const res = await serverFetch<{ success: boolean; data: Workout[] }>(
    API_ENDPOINTS.WORKOUTS.ASSIGNED,
    {},
    token
  );

  const plans = res.data?.data || [];

  if (!plans.length) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Your workout plans</CardTitle>
            <CardDescription>No plans assigned to you yet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Your workout plans</h1>
        <p className="text-sm text-muted-foreground">
          Plans assigned to you by staff. Start a session and log your sets from the workout page.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan._id} className="border border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{plan.difficulty}</Badge>
                <Badge variant="outline">{plan.type}</Badge>
              </div>
              <CardTitle className="leading-tight">{plan.title}</CardTitle>
              <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Assigned {formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })} by{" "}
                {[plan.createdBy?.firstName, plan.createdBy?.lastName].filter(Boolean).join(" ") ||
                  "Coach"}
              </div>
              <Separator />
              <div className="space-y-2">
                {plan.exercises.map((ex) => (
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
