'use client';
import React, { useEffect, useState } from 'react';
import { fetchUserWorkoutHistory } from '@/lib/api/services/workouts/workouts';

const Page = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        const parsedUser = currentUser ? JSON.parse(currentUser) : null;
        const userId = parsedUser?.id || parsedUser?._id;

        if (!userId) throw new Error('User not found');

        const res = await fetchUserWorkoutHistory(userId);
        setHistory(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) return <div>Loading history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Workout History</h1>

      {history.length === 0 && <p>No workout history found</p>}

      {history.map((log, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          {/* 🏋️ Workout Info */}
          <div>
            <h2 className="text-lg font-semibold">
              {log.workoutId?.title}
            </h2>
            <p className="text-sm text-gray-600">
              {log.workoutId?.difficulty} · {log.workoutId?.type} · {log.workoutId?.day}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(log.performedAt).toLocaleString()}
            </p>
          </div>

          {/* 🧩 Exercises */}
          <div className="space-y-3">
            {log.exercises?.map((ex: any, i: number) => (
              <div key={i} className="border rounded p-3 ">
                <p className="font-medium">
                  {ex.exerciseId?.name}
                </p>
                <p className="text-xs text-gray-600">
                  Muscle: {ex.exerciseId?.muscleGroup?.join(', ')} | Equipment: {ex.exerciseId?.equipment}
                </p>

                {/* 🔁 Sets */}
                <div className="mt-2 space-y-1">
                  {ex.sets?.map((set: any, si: number) => (
                    <div
                      key={si}
                      className="flex gap-4 text-sm items-center"
                    >
                      <span>Set {si + 1}</span>
                      <span>Reps: {set.reps}</span>
                      <span>Weight: {set.weight}</span>
                      <span
                        className={
                          set.completed
                            ? 'text-green-600 font-medium'
                            : 'text-gray-400'
                        }
                      >
                        {set.completed ? '✓ Completed' : 'Not completed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Page;
