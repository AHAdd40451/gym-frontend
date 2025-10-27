import {
  useServerGet,
  useServerGetById,
  useServerPaginated,
  useServerSearch
} from "./use-server-fetch";

// Types for gym management entities
export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  ingredients?: string;
  servingSize?: string;
  category: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "member";
  phone?: string;
  address?: string;
  membership?: {
    type: string;
    startDate: string;
    endDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  _id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  _id: string;
  name: string;
  description: string;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  image?: string;
  video?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  userId: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  status: "present" | "absent" | "late";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Product hooks
export function useProducts(category?: string) {
  return useServerGet<{ success: boolean; count: number; products: Product[] }>(
    "/products",
    category ? { category } : undefined
  );
}

export function useProduct(id: string) {
  return useServerGetById<Product>(`/products`, id);
}

export function useProductsByCategory(category: string) {
  return useServerGet<{ success: boolean; count: number; products: Product[] }>("/products", {
    category
  });
}

export function useProductSearch(query: string) {
  return useServerSearch<Product>("/products/search", query, "search");
}

// Category hooks
export function useCategories() {
  return useServerGet<{ success: boolean; count: number; categories: Category[] }>("/categories");
}

export function useCategory(id: string) {
  return useServerGetById<Category>(`/categories`, id);
}

// User hooks
export function useUsers(page: number = 1, limit: number = 10, role?: string) {
  return useServerPaginated<User>("/users", page, limit, role ? { role } : {});
}

export function useUser(id: string) {
  return useServerGetById<User>(`/users`, id);
}

export function useUserSearch(query: string) {
  return useServerSearch<User>("/users/search", query, "search");
}

// Workout hooks
export function useWorkouts(page: number = 1, limit: number = 10, difficulty?: string) {
  return useServerPaginated<Workout>("/workouts", page, limit, difficulty ? { difficulty } : {});
}

export function useWorkout(id: string) {
  return useServerGetById<Workout>(`/workouts`, id);
}

export function useWorkoutsByUser(userId: string) {
  return useServerGet<{ success: boolean; count: number; workouts: Workout[] }>("/workouts", {
    userId
  });
}

export function useWorkoutSearch(query: string) {
  return useServerSearch<Workout>("/workouts/search", query, "search");
}

// Exercise hooks
export function useExercises(page: number = 1, limit: number = 10, category?: string) {
  return useServerPaginated<Exercise>("/exercises", page, limit, category ? { category } : {});
}

export function useExercise(id: string) {
  return useServerGetById<Exercise>(`/exercises`, id);
}

export function useExercisesByCategory(category: string) {
  return useServerGet<{ success: boolean; count: number; exercises: Exercise[] }>("/exercises", {
    category
  });
}

export function useExerciseSearch(query: string) {
  return useServerSearch<Exercise>("/exercises/search", query, "search");
}

// Attendance hooks
export function useAttendance(
  page: number = 1,
  limit: number = 10,
  userId?: string,
  date?: string
) {
  return useServerPaginated<Attendance>("/attendance", page, limit, {
    ...(userId && { userId }),
    ...(date && { date })
  });
}

export function useAttendanceByUser(userId: string, startDate?: string, endDate?: string) {
  return useServerGet<{ success: boolean; count: number; attendance: Attendance[] }>(
    "/attendance",
    {
      userId,
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    }
  );
}

export function useAttendanceByDate(date: string) {
  return useServerGet<{ success: boolean; count: number; attendance: Attendance[] }>(
    "/attendance",
    { date }
  );
}

// Dashboard/Stats hooks
export function useDashboardStats() {
  return useServerGet<{
    totalUsers: number;
    totalProducts: number;
    totalWorkouts: number;
    totalExercises: number;
    todayAttendance: number;
    monthlyRevenue: number;
  }>("/dashboard/stats");
}

export function useRevenueStats(startDate?: string, endDate?: string) {
  return useServerGet<{
    totalRevenue: number;
    monthlyRevenue: number[];
    topProducts: Array<{ product: Product; revenue: number }>;
  }>("/dashboard/revenue", {
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });
}

export function useAttendanceStats(startDate?: string, endDate?: string) {
  return useServerGet<{
    totalAttendance: number;
    averageDailyAttendance: number;
    attendanceByDay: Array<{ date: string; count: number }>;
    topUsers: Array<{ user: User; attendanceCount: number }>;
  }>("/dashboard/attendance", {
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });
}

// Membership hooks
export function useMemberships() {
  return useServerGet<{ success: boolean; count: number; memberships: any[] }>("/memberships");
}

export function useMembershipPlans() {
  return useServerGet<{ success: boolean; count: number; plans: any[] }>("/memberships/plans");
}

export function useUserMembership(userId: string) {
  return useServerGetById<any>(`/memberships/current`, userId);
}

// Service hooks
export function useServices() {
  return useServerGet<{ success: boolean; count: number; services: any[] }>("/services");
}

export function useService(id: string) {
  return useServerGetById<any>(`/services`, id);
}

// Contact hooks
export function useContactInquiries(page: number = 1, limit: number = 10) {
  return useServerPaginated<any>("/contact/inquiries", page, limit);
}

export function useContactInquiry(id: string) {
  return useServerGetById<any>(`/contact/inquiries`, id);
}

// Order hooks
export function useOrders(page: number = 1, limit: number = 10, userId?: string) {
  return useServerPaginated<any>("/orders", page, limit, userId ? { userId } : {});
}

export function useOrder(id: string) {
  return useServerGetById<any>(`/orders`, id);
}

export function useUserOrders(userId: string) {
  return useServerGet<{ success: boolean; count: number; orders: any[] }>("/orders", { userId });
}

// Card hooks
export function useCards(page: number = 1, limit: number = 10, userId?: string) {
  return useServerPaginated<any>("/cards", page, limit, userId ? { userId } : {});
}

export function useCard(id: string) {
  return useServerGetById<any>(`/cards`, id);
}

export function useUserCards(userId: string) {
  return useServerGet<{ success: boolean; count: number; cards: any[] }>("/cards", { userId });
}
