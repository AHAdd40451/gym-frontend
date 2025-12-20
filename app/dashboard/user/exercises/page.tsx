import React from "react";
import { getExercises } from "@/lib/api/services/getexercises/exercises";
import type { Exercise } from "@/lib/api/services/getexercises/exercises";
import ExerciseCards from "./ExerciseCards";

const ExercisesPage = async () => {
  const res = await getExercises({ page: 1, limit: 20 });

  if (!res.data || res.error) {
    return <p className="text-center mt-10">Failed to load exercises ❌</p>;
  }

  const exercises: Exercise[] = res.data.data;

  return <ExerciseCards exercises={exercises} />;
};

export default ExercisesPage;
