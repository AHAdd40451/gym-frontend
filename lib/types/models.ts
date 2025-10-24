// Base Model Types
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User Model
export interface User extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  role: 'admin' | 'staff' | 'user';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  profileImage?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    privacy?: {
      profileVisibility?: 'public' | 'private';
      showEmail?: boolean;
      showPhone?: boolean;
    };
    units?: {
      weight?: 'kg' | 'lbs';
      height?: 'cm' | 'ft';
      distance?: 'km' | 'miles';
    };
  };
  isEmailVerified?: boolean;
  lastLogin?: string;
}

// Workout Model
export interface Workout extends BaseModel {
  userId: string;
  name: string;
  description?: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'mixed';
  intensity: 'low' | 'moderate' | 'high' | 'extreme';
  duration: number; // in minutes
  calories?: number;
  exercises: ExerciseSet[];
  date: string;
  scheduledDate?: string;
  completed: boolean;
  completedAt?: string;
  startedAt?: string;
  pausedAt?: string;
  totalPauseTime?: number; // in seconds
  notes?: string;
  tags?: string[];
  isTemplate?: boolean;
  templateId?: string;
  isPublic?: boolean;
  sharedWith?: Array<{
    userId: string;
    permissions: 'view' | 'edit';
  }>;
  rating?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  equipment?: string[];
  location?: {
    name?: string;
    type?: 'gym' | 'home' | 'outdoor' | 'studio';
    address?: string;
  };
}

// Exercise Set Model
export interface ExerciseSet {
  exerciseId: string;
  name: string;
  sets: Array<{
    reps?: number;
    weight?: number;
    duration?: number; // in seconds
    distance?: number; // in meters
    restTime?: number; // in seconds
    notes?: string;
  }>;
  order: number;
}

// Exercise Model
export interface Exercise extends BaseModel {
  name: string;
  description: string;
  category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'full_body';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  instructions: Array<{
    step: number;
    instruction: string;
  }>;
  tips?: string[];
  equipment?: string[];
  muscleGroups?: {
    primary?: string[];
    secondary?: string[];
  };
  images?: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  videos?: Array<{
    url: string;
    title?: string;
    duration?: number; // in seconds
    isPrimary?: boolean;
  }>;
  variations?: Array<{
    name: string;
    description?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
  tags?: string[];
  isActive?: boolean;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  rating?: {
    average: number;
    count: number;
  };
  usageCount?: number;
  favoritesCount?: number;
  caloriesPerMinute?: number;
  difficultyScore?: number;
  timeToComplete?: number; // in minutes
  spaceRequired?: 'small' | 'medium' | 'large';
  noiseLevel?: 'quiet' | 'moderate' | 'loud';
}

// Membership Model
export interface Membership extends BaseModel {
  userId: string;
  type: 'basic' | 'premium' | 'vip' | 'family';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  price: number;
  features: string[];
  autoRenew: boolean;
}

// Schedule Model
export interface Schedule extends BaseModel {
  trainerId: string;
  memberId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  type: 'personal_training' | 'group_class' | 'consultation';
  notes?: string;
}

// Trainer Model
export interface Trainer extends BaseModel {
  userId: string;
  specializations: string[];
  experience: number; // in years
  certifications: string[];
  rating: number;
  bio?: string;
  availability?: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  hourlyRate: number;
}

// Blog Model
export interface Blog extends BaseModel {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: 'fitness' | 'nutrition' | 'lifestyle' | 'tips' | 'news';
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  tags: string[];
  images: string[];
  publishedAt?: string;
}

// Contact Model
export interface Contact extends BaseModel {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: 'inquiry' | 'feedback' | 'complaint' | 'suggestion';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: number;
  success: boolean;
  errors?: string[];
}

// Pagination Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filter Types
export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Workout Types
export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  avgDuration: number;
  avgCalories: number;
  byType: Record<string, number>;
  byIntensity: Record<string, number>;
}

export interface WorkoutFilters extends FilterOptions {
  type?: string;
  intensity?: string;
  completed?: boolean;
  userId?: string;
}

// Exercise Types
export interface ExerciseFilters extends FilterOptions {
  category?: string;
  difficulty?: string;
  equipment?: string[];
  muscleGroups?: string[];
}

// User Types
export interface UserFilters extends FilterOptions {
  role?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalWorkouts: number;
  totalExercises: number;
  activeMembers: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'workout' | 'registration' | 'login' | 'profile_update';
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
