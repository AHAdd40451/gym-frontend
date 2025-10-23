# API Integration Architecture

This document outlines the complete API integration architecture implemented in the shadcn-ui-kit dashboard, mirroring the structure from the React frontend.

## 🏗️ Architecture Overview

The integration follows the same patterns as the React frontend but adapted for Next.js:

- **API Layer**: Axios-based HTTP client with interceptors
- **State Management**: Zustand for authentication state
- **Data Fetching**: TanStack Query for server state management
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Authentication**: JWT-based auth with refresh tokens

## 📁 File Structure

```
lib/
├── api/
│   ├── axios.ts              # Axios client with interceptors
│   ├── constants.ts          # API endpoints and query keys
│   ├── utils.ts              # API utility functions
│   ├── auth.ts               # Authentication API functions
│   ├── workouts.ts           # Workout API functions
│   ├── exercises.ts          # Exercise API functions
│   ├── users.ts              # User API functions
│   └── index.ts              # API exports
├── hooks/
│   ├── useAuth.ts            # Authentication hooks
│   ├── useWorkouts.ts        # Workout hooks
│   ├── useExercises.ts       # Exercise hooks
│   ├── useUsers.ts           # User hooks
│   └── index.ts              # Hooks exports
├── stores/
│   └── auth.ts               # Zustand auth store
├── types/
│   └── models.ts             # TypeScript type definitions
├── providers/
│   └── query-provider.tsx    # TanStack Query provider
├── middleware/
│   └── auth.ts               # Authentication middleware
└── config/
    └── env.ts                # Environment configuration
```

## 🔧 Key Features

### 1. API Client (`lib/api/axios.ts`)
- Axios instance with base configuration
- Request interceptor for automatic token attachment
- Response interceptor for error handling
- Automatic token refresh and logout on 401 errors

### 2. Authentication Store (`lib/stores/auth.ts`)
- Zustand store for authentication state
- Persistent storage with localStorage
- Actions for login, logout, profile updates
- Type-safe state management

### 3. TanStack Query Hooks
- **useAuth**: Authentication operations (login, register, logout, profile)
- **useWorkouts**: Workout CRUD operations and statistics
- **useExercises**: Exercise management and search
- **useUsers**: User management and administration

### 4. Type Safety
- Complete TypeScript definitions for all models
- API response types
- Authentication types
- Filter and pagination types

## 🚀 Usage Examples

### Authentication
```typescript
import { useAuth, useLogin } from '@/lib/hooks';

function LoginComponent() {
  const { user, isAuthenticated } = useAuth();
  const login = useLogin();

  const handleLogin = async (credentials) => {
    try {
      await login.mutateAsync(credentials);
      // User is automatically logged in
    } catch (error) {
      // Handle error
    }
  };
}
```

### Data Fetching
```typescript
import { useWorkouts, useWorkoutStats } from '@/lib/hooks/useWorkouts';

function WorkoutDashboard() {
  const { data: workouts, isLoading } = useWorkouts();
  const { data: stats } = useWorkoutStats();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Workouts: {workouts?.data?.length}</h1>
      <p>Total Calories: {stats?.totalCalories}</p>
    </div>
  );
}
```

### State Management
```typescript
import { useAuthStore } from '@/lib/stores/auth';

function ProfileComponent() {
  const { user, updateProfile } = useAuthStore();

  const handleUpdate = (data) => {
    updateProfile(data);
  };
}
```

## 🔐 Authentication Flow

1. **Login**: User submits credentials → API call → Token stored → User state updated
2. **Token Management**: Automatic token attachment to requests
3. **Refresh**: Automatic token refresh on expiration
4. **Logout**: Clear tokens and redirect to login

## 📊 Data Management

- **Caching**: TanStack Query handles intelligent caching
- **Background Updates**: Automatic data refetching
- **Optimistic Updates**: Immediate UI updates with rollback on error
- **Error Handling**: Comprehensive error states and retry logic

## 🛠️ Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Gym Management Dashboard
NEXT_PUBLIC_DEBUG_MODE=true
```

### Query Client Configuration
- 5-minute stale time for most queries
- 3 retry attempts for failed requests
- Background refetching disabled for performance
- Automatic garbage collection

## 🔄 Integration with Backend

The dashboard is fully integrated with the existing backend API:

- **Authentication**: `/api/auth/*` endpoints
- **Users**: `/api/users/*` endpoints  
- **Workouts**: `/api/workouts/*` endpoints
- **Exercises**: `/api/exercises/*` endpoints

## 📱 Pages Created

1. **Login Page** (`/login`): Authentication form with error handling
2. **Gym Dashboard** (`/dashboard/gym`): Main dashboard with stats and data
3. **Layout Integration**: QueryProvider added to root layout

## 🎯 Benefits

1. **Consistency**: Same architecture as React frontend
2. **Type Safety**: Full TypeScript support
3. **Performance**: Optimized caching and data fetching
4. **Developer Experience**: Comprehensive hooks and utilities
5. **Maintainability**: Clean separation of concerns
6. **Scalability**: Easy to extend with new features

## 🚀 Next Steps

1. **Add More Pages**: Create workout management, user administration pages
2. **Implement Forms**: Add forms for creating/editing workouts and exercises
3. **Add Charts**: Integrate data visualization components
4. **Testing**: Add unit and integration tests
5. **Deployment**: Configure for production deployment

This architecture provides a solid foundation for building a comprehensive gym management dashboard with the same patterns and practices as the React frontend.
