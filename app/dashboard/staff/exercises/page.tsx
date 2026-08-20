"use client";

import { useEffect, useState } from "react";
import { getExercises, type Exercise } from "@/lib/api/services/getexercises/exercises";
import ExerciseCards from "./ExerciseCards";
import AddExerciseForm from "./AddExerciseForm";

const getToken = () => {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("adminToken") ||
    ""
  );
};

const ExercisesPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);

      const token = getToken();

      if (!token) {
        setError(true);
        setLoading(false);
        return;
      }

      const res = await getExercises({ isActive: true, limit: 30, page: 1 }, token);

      if (!res.data || res.error || !res.data.data) {
        setError(true);
        setExercises([]);
      } else {
        setExercises(res.data.data);
      }

      setLoading(false);
    };

    load();
  }, [refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  if (loading) {
    return <p className="text-center mt-10 text-muted-foreground">Loading exercises...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-destructive">Failed to load exercises ❌</p>;
  }

  return (
    <div className="space-y-6">
      <AddExerciseForm onSaved={refresh} />
      <ExerciseCards exercises={exercises} onUpdated={refresh} />
    </div>
  );
};

export default ExercisesPage;
