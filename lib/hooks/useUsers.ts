import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { QUERY_KEYS } from '../api/constants';
import type { 
  User, 
  UserFilters 
} from '../types/models';

// User query hooks
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS.ALL, filters],
    queryFn: () => usersApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.PROFILE(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
};

export const useSearchUsers = (query: string, filters?: UserFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS.LIST({ search: query, ...filters })],
    queryFn: () => usersApi.search(query, filters),
    enabled: !!query && query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useActiveUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS.ALL, { status: 'active', ...filters }],
    queryFn: () => usersApi.getActive(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUsersByRole = (role: string, filters?: UserFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS.ALL, { role, ...filters }],
    queryFn: () => usersApi.getByRole(role, filters),
    enabled: !!role,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserStats = (id: string) => {
  return useQuery({
    queryKey: ['users', 'stats', id],
    queryFn: () => usersApi.getStats(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserDashboardData = (id: string) => {
  return useQuery({
    queryKey: ['users', 'dashboard', id],
    queryFn: () => usersApi.getDashboardData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserActivityLog = (id: string, filters?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: ['users', 'activity', id, filters],
    queryFn: () => usersApi.getActivityLog(id, filters),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// User mutation hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      // Invalidate user lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      usersApi.update(id, data),
    onSuccess: (updatedUser) => {
      // Update the specific user in cache
      queryClient.setQueryData(
        QUERY_KEYS.USERS.PROFILE(updatedUser.id),
        updatedUser
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: (_, userId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.USERS.PROFILE(userId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      usersApi.updateStatus(id, status),
    onSuccess: (updatedUser) => {
      // Update the user in cache
      queryClient.setQueryData(
        QUERY_KEYS.USERS.PROFILE(updatedUser.id),
        updatedUser
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
    },
  });
};

export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userIds, 
      updateData 
    }: { 
      userIds: string[]; 
      updateData: Partial<User> 
    }) => usersApi.bulkUpdate(userIds, updateData),
    onSuccess: () => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
    },
  });
};

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => 
      usersApi.uploadProfileImage(id, file),
    onSuccess: (_, { id }) => {
      // Invalidate user profile
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.PROFILE(id) });
    },
  });
};

export const useDeleteProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.deleteProfileImage,
    onSuccess: (_, userId) => {
      // Invalidate user profile
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.PROFILE(userId) });
    },
  });
};

export const useExportUserData = () => {
  return useMutation({
    mutationFn: usersApi.exportData,
  });
};

// Combined user service
export const useUserService = () => {
  const create = useCreateUser();
  const update = useUpdateUser();
  const deleteUser = useDeleteUser();
  const updateStatus = useUpdateUserStatus();
  const bulkUpdate = useBulkUpdateUsers();
  const uploadProfileImage = useUploadProfileImage();
  const deleteProfileImage = useDeleteProfileImage();
  const exportData = useExportUserData();
  
  return {
    // Mutations
    create,
    update,
    delete: deleteUser,
    updateStatus,
    bulkUpdate,
    uploadProfileImage,
    deleteProfileImage,
    exportData,
  };
};
