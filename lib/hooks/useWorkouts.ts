import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutsApi } from '../api/workouts';
import { QUERY_KEYS } from '../api/constants';
import type { 
  Workout, 
  WorkoutStats, 
  WorkoutFilters,
  ExerciseSet 
} from '../types/models';

// Workout query hooks
export const useWorkouts = (filters?: WorkoutFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKOUTS.ALL, filters],
    queryFn: () => workoutsApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWorkout = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.WORKOUTS.DETAIL(id),
    queryFn: () => workoutsApi.getById(id),
    enabled: !!id,
  });
};

export const useWorkoutsByUser = (userId: string, filters?: WorkoutFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKOUTS.BY_USER(userId), filters],
    queryFn: () => workoutsApi.getByUser(userId, filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWorkoutsByDate = (date: string, filters?: WorkoutFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKOUTS.BY_DATE(date), filters],
    queryFn: () => workoutsApi.getByDate(date, filters),
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWorkoutStats = (userId?: string, filters?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKOUTS.STATS(userId || 'current'), filters],
    queryFn: () => workoutsApi.getStats(userId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWorkoutTemplates = (filters?: { type?: string; difficulty?: string }) => {
  return useQuery({
    queryKey: ['workouts', 'templates', filters],
    queryFn: () => workoutsApi.getTemplates(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Workout mutation hooks
export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workoutsApi.create,
    onSuccess: (newWorkout) => {
      // Invalidate and refetch workout lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.BY_USER(newWorkout.userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.STATS(newWorkout.userId) });
    },
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workout> }) => 
      workoutsApi.update(id, data),
    onSuccess: (updatedWorkout) => {
      // Update the specific workout in cache
      queryClient.setQueryData(
        QUERY_KEYS.WORKOUTS.DETAIL(updatedWorkout.id),
        updatedWorkout
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.BY_USER(updatedWorkout.userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.STATS(updatedWorkout.userId) });
    },
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workoutsApi.delete,
    onSuccess: (_, workoutId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.WORKOUTS.DETAIL(workoutId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.ALL });
    },
  });
};

export const useStartWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workoutsApi.start,
    onSuccess: (updatedWorkout) => {
      // Update the workout in cache
      queryClient.setQueryData(
        QUERY_KEYS.WORKOUTS.DETAIL(updatedWorkout.id),
        updatedWorkout
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.BY_USER(updatedWorkout.userId) });
    },
  });
};

export const usePauseWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workoutsApi.pause,
    onSuccess: (updatedWorkout) => {
      // Update the workout in cache
      queryClient.setQueryData(
        QUERY_KEYS.WORKOUTS.DETAIL(updatedWorkout.id),
        updatedWorkout
      );
    },
  });
};

export const useResumeWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workoutsApi.resume,
    onSuccess: (updatedWorkout) => {
      // Update the workout in cache
      queryClient.setQueryData(
        QUERY_KEYS.WORKOUTS.DETAIL(updatedWorkout.id),
        updatedWorkout
      );
    },
  });
};

export const useCompleteWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workoutsApi.complete,
    onSuccess: (updatedWorkout) => {
      // Update the workout in cache
      queryClient.setQueryData(
        QUERY_KEYS.WORKOUTS.DETAIL(updatedWorkout.id),
        updatedWorkout
      );
      
      // Invalidate stats and lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.BY_USER(updatedWorkout.userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.STATS(updatedWorkout.userId) });
    },
  });
};

export const useAddExerciseToWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workoutId, exercise }: { workoutId: string; exercise: ExerciseSet }) => 
      workoutsApi.addExercise(workoutId, exercise),
    onSuccess: (updatedWorkout) => {
      // Update the workout in cache
      queryClient.setQueryData(
        QUERY_KEYS.WORKOUTS.DETAIL(updatedWorkout.id),
        updatedWorkout
      );
    },
  });
};

export const useUpdateExerciseInWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      workoutId, 
      exerciseId, 
      exercise 
    }: { 
      workoutId: string; 
      exerciseId: string; 
      exercise: Partial<ExerciseSet> 
    }) => workoutsApi.updateExercise(workoutId, exerciseId, exercise),
    onSuccess: (updatedWorkout) => {
      // Update the workout in cache
      queryClient.setQueryData(
        QUERY_KEYS.WORKOUTS.DETAIL(updatedWorkout.id),
        updatedWorkout
      );
    },
  });
};

export const useRemoveExerciseFromWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workoutId, exerciseId }: { workoutId: string; exerciseId: string }) => 
      workoutsApi.removeExercise(workoutId, exerciseId),
    onSuccess: (updatedWorkout) => {
      // Update the workout in cache
      queryClient.setQueryData(
        QUERY_KEYS.WORKOUTS.DETAIL(updatedWorkout.id),
        updatedWorkout
      );
    },
  });
};

export const useCreateWorkoutFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, workoutData }: { templateId: string; workoutData?: Partial<Workout> }) => 
      workoutsApi.createFromTemplate(templateId, workoutData),
    onSuccess: (newWorkout) => {
      // Invalidate workout lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS.BY_USER(newWorkout.userId) });
    },
  });
};

// Combined workout service
export const useWorkoutService = () => {
  const create = useCreateWorkout();
  const update = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const start = useStartWorkout();
  const pause = usePauseWorkout();
  const resume = useResumeWorkout();
  const complete = useCompleteWorkout();
  const addExercise = useAddExerciseToWorkout();
  const updateExercise = useUpdateExerciseInWorkout();
  const removeExercise = useRemoveExerciseFromWorkout();
  const createFromTemplate = useCreateWorkoutFromTemplate();
  
  return {
    // Mutations
    create,
    update,
    delete: deleteWorkout,
    start,
    pause,
    resume,
    complete,
    addExercise,
    updateExercise,
    removeExercise,
    createFromTemplate,
  };
};
