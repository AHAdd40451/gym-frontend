import React from "react";
import { getExerciseById, type Exercise } from "@/lib/api/services/getexercises/exercises";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ExerciseVideo from "../ExerciseVideo";

interface PageProps {
  params: { id: string };
}

const ExerciseDetailPage = async ({ params }: PageProps) => {
  const { id } = params;
  const { token } = await getServerAuth();

  if (!token) {
    return <p className="text-center mt-10">You must be signed in to view this exercise.</p>;
  }

  const res = await getExerciseById(id, token);

  if (!res.data || res.error) {
    return <p className="text-center mt-10">Exercise not found ❌</p>;
  }

  const exercise: Exercise = res.data.data;

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{exercise.name}</h1>
            <Badge variant="outline">{exercise.difficulty}</Badge>
            {exercise.equipment ? <Badge variant="secondary">{exercise.equipment}</Badge> : null}
          </div>

          <p className="text-muted-foreground leading-relaxed">{exercise.description}</p>

          <div className="flex flex-wrap gap-2">
            {exercise.muscleGroup?.map((m) => (
              <Badge key={m} className="bg-slate-100 text-slate-700 border-slate-200">
                {m}
              </Badge>
            ))}
          </div>

          {exercise.videoUrl ? (
            <ExerciseVideo src={exercise.videoUrl} title={exercise.name} />
          ) : exercise.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="w-full rounded-lg border"
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseDetailPage;
