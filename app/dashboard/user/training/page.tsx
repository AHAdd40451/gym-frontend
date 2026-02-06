'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { isSameDay } from 'date-fns';
import { fetchUserWorkoutHistory } from '@/lib/api/services/workouts/workouts';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Page = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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

  const filteredHistory = useMemo(() => {
    if (!selectedDate) return history;
    return history.filter((log) =>
      isSameDay(new Date(log.performedAt), selectedDate)
    );
  }, [history, selectedDate]);

  if (loading) return <div>Loading history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <h1 className="text-xl font-semibold">Workout History</h1>

        {filteredHistory.length === 0 && (
          <p className="text-muted-foreground text-sm">
            {selectedDate
              ? 'No workouts on this day. Select another date or clear selection.'
              : 'No workout history found'}
          </p>
        )}

        {filteredHistory.map((log, index) => (
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
              <div
                key={i}
                className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-3"
              >
                <p className="font-medium text-foreground">
                  {ex.exerciseId?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Muscle: {ex.exerciseId?.muscleGroup?.join(', ')} · Equipment: {ex.exerciseId?.equipment}
                </p>

                {/* 🔁 Total sets */}
                {ex.sets?.length != null && ex.sets.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Total sets: <span className="font-medium text-foreground">{ex.sets.length}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>

      <Card className="lg:w-[280px] mt-13 shrink-0 border border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pick a day</CardTitle>
          <p className="text-xs text-muted-foreground">
            View workouts by date
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            showOutsideDays
            showYearSwitcher={false}
            className="rounded-md border-0 p-0"
          />
          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setSelectedDate(undefined)}
            >
              Show all
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
