import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/api/services/auth/server";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getServerAuth();

  if (!user?.isAuthenticated) {
    redirect("/login");
  }

  if (user?.role !== "admin" || !user?.isSuperAdmin) {
    redirect("/dashboard/admin/ecommerce");
  }

  return <>{children}</>;
}
