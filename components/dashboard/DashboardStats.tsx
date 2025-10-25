import React from "react";

// Types
interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalWorkouts: number;
  totalExercises: number;
  todayAttendance: number;
  monthlyRevenue: number;
}

interface DashboardStatsProps {
  stats: DashboardStats | null;
  loading?: boolean;
  error?: string | null;
}

export function DashboardStats({ stats, loading, error }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading dashboard stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="text-red-800">Error loading stats: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg text-gray-500">No stats available</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: "📦",
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "Total Workouts",
      value: stats.totalWorkouts,
      icon: "💪",
      color: "bg-purple-500",
      textColor: "text-purple-600"
    },
    {
      title: "Total Exercises",
      value: stats.totalExercises,
      icon: "🏃",
      color: "bg-orange-500",
      textColor: "text-orange-600"
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: "📅",
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: "💰",
      color: "bg-emerald-500",
      textColor: "text-emerald-600"
    }
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <div className={`rounded-full p-3 ${card.color}`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
