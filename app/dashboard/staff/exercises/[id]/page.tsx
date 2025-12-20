import React from "react";
import { getExerciseById } from "@/lib/api/services/getexercises/exercises";
import type { Exercise } from "@/lib/api/services/getexercises/exercises";
import { Card, CardContent } from "@/components/ui/card";
import ExerciseVideo from "../ExerciseVideo";

interface PageProps {
  params: Promise<{ id: string }>;
}

const ExerciseDetailPage = async ({ params }: PageProps) => {
  const { id } = await params; // <- unwrap the promise

  const res = await getExerciseById(id);

  if (!res.data || res.error) {
    return <p className="text-center mt-10">Exercise not found ❌</p>;
  }

  const exercise: Exercise = res.data.data;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h1 className="text-3xl font-bold">{exercise.title}</h1>

          <ul className="list-disc ml-6 space-y-2">
            {exercise.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>

          <ExerciseVideo src={exercise.videoUrl} title={exercise.title} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseDetailPage;