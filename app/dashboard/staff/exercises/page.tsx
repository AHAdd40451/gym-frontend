import React from "react";
import { getExercises, type Exercise } from "@/lib/api/services/getexercises/exercises";
import { getServerAuth } from "@/lib/api/services/auth/server";
import ExerciseCards from "./ExerciseCards";
import AddExerciseForm from "./AddExerciseForm";

const ExercisesPage = async () => {
  const { token } = await getServerAuth();

  if (!token) {
    return <p className="text-center mt-10">You must be signed in to view exercises.</p>;
  }

  const res = await getExercises({ isActive: true, limit: 30, page: 1 }, token);

  if (!res.data || res.error || !res.data.data) {
    return <p className="text-center mt-10">Failed to load exercises ❌</p>;
  }

  const exercises: Exercise[] = res.data.data;

  return (
    <div className="space-y-6">
      <AddExerciseForm />
      <ExerciseCards exercises={exercises} />
    </div>
  );
};

export default ExercisesPage;
