import { getServerAuth } from "@/lib/api/services/auth/server";

export default async function DashboardPage() {
  const { user } = await getServerAuth();

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Welcome back, {user?.firstName} {user?.lastName}!
        </p>
      </div>
    </div>
  );
}
