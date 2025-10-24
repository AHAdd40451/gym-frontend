'use client';

import { useAuth, useAuthActions } from '@/lib/hooks';
import { useWorkouts, useWorkoutStats } from '@/lib/hooks/useWorkouts';
import { useExercises } from '@/lib/hooks/useExercises';
import { useUsers } from '@/lib/hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Dumbbell, Activity, TrendingUp } from 'lucide-react';

export default function GymDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthActions();
  
  // Fetch data using the hooks
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: workoutStats, isLoading: statsLoading } = useWorkoutStats();
  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const { data: users, isLoading: usersLoading } = useUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please log in to access the gym dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gym Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} {user?.lastName}
          </p>
        </div>
        <Button variant="outline" onClick={() => logout()}>
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                users?.data?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Active gym members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workoutsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                workouts?.data?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed workouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercises</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exercisesLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                exercises?.data?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Available exercises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                workoutStats?.totalCalories || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Calories burned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
          <CardDescription>
            Latest workout sessions from your gym members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workoutsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {workouts?.data?.slice(0, 5).map((workout: any) => (
                <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{workout.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {workout.type} • {workout.duration} minutes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={workout.completed ? 'default' : 'secondary'}>
                      {workout.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(workout.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Exercises */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Exercises</CardTitle>
          <CardDescription>
            Most used exercises in your gym
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exercisesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises?.data?.slice(0, 6).map((exercise: any) => (
                <div key={exercise.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {exercise.category} • {exercise.difficulty}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{exercise.category}</Badge>
                    <Badge variant="secondary">{exercise.difficulty}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
