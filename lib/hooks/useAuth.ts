import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { QUERY_KEYS } from '../api/constants';
import { useAuthStore } from '../stores/auth';
import type { 
  LoginCredentials, 
  RegisterData, 
  PasswordChangeData, 
  ForgotPasswordData, 
  ResetPasswordData,
  User 
} from '../types/models';

// Auth query hooks
export const useAuthProfile = () => {
  const { setUser, setError } = useAuthStore();
  
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.PROFILE,
    queryFn: async () => {
      try {
        const user = await authApi.getProfile();
        setUser(user);
        return user;
      } catch (error: any) {
        setError(error.message);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth failures
    enabled: !!useAuthStore.getState().token, // Only run if we have a token
  });
};

export const useAuthUser = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.USER,
    queryFn: authApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth failures
    enabled: !!useAuthStore.getState().token, // Only run if we have a token
  });
};

// Auth mutation hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setToken, setLoading, setError } = useAuthStore();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      setLoading(true);
      try {
        const response = await authApi.login(credentials);
        return response;
      } catch (error: any) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      console.log('useLogin onSuccess called with:', data);
      
      // The data is already the AuthResponse object
      console.log('Auth response data:', data);
      
      // Store tokens
      if (data.token) {
        console.log('Setting token:', data.token);
        setToken(data.token, data.refreshToken);
      }
      
      // Store user data
      if (data.user) {
        console.log('Setting user data:', data.user);
        setUser(data.user);
      }
      
      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.USER });
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { setUser, setToken, setLoading, setError } = useAuthStore();
  
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      setLoading(true);
      try {
        const response = await authApi.register(userData);
        return response;
      } catch (error: any) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      // Store tokens if auto-login is enabled
      if (data.token) {
        setToken(data.token, data.refreshToken);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
      }
      
      // Store user data
      if (data.user) {
        setUser(data.user);
      }
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout, setLoading, setError } = useAuthStore();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear auth state
      logout();
      
      // Clear all queries
      queryClient.clear();
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
      setError(error.message || 'Logout failed');
      // Still clear local data even if logout fails
      logout();
      queryClient.clear();
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateProfile, setError } = useAuthStore();
  
  return useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      try {
        const updatedUser = await authApi.updateProfile(profileData);
        return updatedUser;
      } catch (error: any) {
        setError(error.message);
        throw error;
      }
    },
    onSuccess: (updatedUser) => {
      // Update user in store
      updateProfile(updatedUser);
      
      // Invalidate auth profile queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.USER });
    },
    onError: (error: any) => {
      console.error('Profile update failed:', error);
      setError(error.message || 'Profile update failed');
    },
  });
};

export const useChangePassword = () => {
  const { setError } = useAuthStore();
  
  return useMutation({
    mutationFn: authApi.changePassword,
    onError: (error: any) => {
      console.error('Password change failed:', error);
      setError(error.message || 'Password change failed');
    },
  });
};

export const useForgotPassword = () => {
  const { setError } = useAuthStore();
  
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onError: (error: any) => {
      console.error('Forgot password failed:', error);
      setError(error.message || 'Forgot password failed');
    },
  });
};

export const useResetPassword = () => {
  const { setError } = useAuthStore();
  
  return useMutation({
    mutationFn: authApi.resetPassword,
    onError: (error: any) => {
      console.error('Password reset failed:', error);
      setError(error.message || 'Password reset failed');
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  const { setError } = useAuthStore();
  
  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
    onError: (error: any) => {
      console.error('Email verification failed:', error);
      setError(error.message || 'Email verification failed');
    },
  });
};

export const useResendVerification = () => {
  const { setError } = useAuthStore();
  
  return useMutation({
    mutationFn: authApi.resendVerification,
    onError: (error: any) => {
      console.error('Resend verification failed:', error);
      setError(error.message || 'Resend verification failed');
    },
  });
};

// Combined auth service
export const useAuthService = () => {
  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  
  const profile = useAuthProfile();
  const user = useAuthUser();
  
  return {
    // Mutations
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    
    // Queries
    profile,
    user,
  };
};
