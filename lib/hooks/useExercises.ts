import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { exercisesApi } from '../api/exercises';
import { QUERY_KEYS } from '../api/constants';
import type { 
  Exercise, 
  ExerciseFilters 
} from '../types/models';

// Exercise query hooks
export const useExercises = (filters?: ExerciseFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.EXERCISES.ALL, filters],
    queryFn: () => exercisesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExercise = (id: string) => {
  return useQuery({
    queryKey: ['exercises', 'detail', id],
    queryFn: () => exercisesApi.getById(id),
    enabled: !!id,
  });
};

export const useExercisesByCategory = (category: string, filters?: ExerciseFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.EXERCISES.BY_CATEGORY(category), filters],
    queryFn: () => exercisesApi.getByCategory(category, filters),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSearchExercises = (query: string, filters?: ExerciseFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.EXERCISES.SEARCH(query), filters],
    queryFn: () => exercisesApi.search(query, filters),
    enabled: !!query && query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSimilarExercises = (exerciseId: string, limit = 5) => {
  return useQuery({
    queryKey: ['exercises', 'similar', exerciseId, limit],
    queryFn: () => exercisesApi.getSimilar(exerciseId, limit),
    enabled: !!exerciseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePopularExercises = (limit = 10) => {
  return useQuery({
    queryKey: ['exercises', 'popular', limit],
    queryFn: () => exercisesApi.getPopular(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useExerciseStats = () => {
  return useQuery({
    queryKey: ['exercises', 'stats'],
    queryFn: exercisesApi.getStats,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useFavoriteExercises = () => {
  return useQuery({
    queryKey: ['exercises', 'favorites'],
    queryFn: exercisesApi.getFavorites,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Exercise mutation hooks
export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: exercisesApi.create,
    onSuccess: () => {
      // Invalidate exercise lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES.ALL });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'stats'] });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Exercise> }) => 
      exercisesApi.update(id, data),
    onSuccess: (updatedExercise) => {
      // Update the specific exercise in cache
      queryClient.setQueryData(
        ['exercises', 'detail', updatedExercise.id],
        updatedExercise
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES.ALL });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: exercisesApi.delete,
    onSuccess: (_, exerciseId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['exercises', 'detail', exerciseId] });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES.ALL });
    },
  });
};

export const useRateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ exerciseId, rating }: { exerciseId: string; rating: number }) => 
      exercisesApi.rate(exerciseId, rating),
    onSuccess: (updatedExercise) => {
      // Update the exercise in cache
      queryClient.setQueryData(
        ['exercises', 'detail', updatedExercise.id],
        updatedExercise
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES.ALL });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'popular'] });
    },
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: exercisesApi.addToFavorites,
    onSuccess: () => {
      // Invalidate favorites and popular exercises
      queryClient.invalidateQueries({ queryKey: ['exercises', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'popular'] });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: exercisesApi.removeFromFavorites,
    onSuccess: () => {
      // Invalidate favorites and popular exercises
      queryClient.invalidateQueries({ queryKey: ['exercises', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'popular'] });
    },
  });
};

export const useIncrementExerciseUsage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: exercisesApi.incrementUsage,
    onSuccess: () => {
      // Invalidate popular exercises and stats
      queryClient.invalidateQueries({ queryKey: ['exercises', 'popular'] });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'stats'] });
    },
  });
};

// Combined exercise service
export const useExerciseService = () => {
  const create = useCreateExercise();
  const update = useUpdateExercise();
  const deleteExercise = useDeleteExercise();
  const rate = useRateExercise();
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  const incrementUsage = useIncrementExerciseUsage();
  
  return {
    // Mutations
    create,
    update,
    delete: deleteExercise,
    rate,
    addToFavorites,
    removeFromFavorites,
    incrementUsage,
  };
};
