import { getUserByIdServerSide } from "@/lib/api/services/users/users";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { UserDetailCard } from "@/components/dashboard/UserDetailCard";
import { redirect } from "next/navigation";

const UserDetailPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const { token } = await getServerAuth();

  if (!token) {
    redirect("/login");
  }

  const response = await getUserByIdServerSide(id, token);

  if (!response.data || response.error) {
    return (
      <div className="mt-10 flex justify-center px-6">
        <p className="text-red-500">User not found or failed to load.</p>
      </div>
    );
  }

  const user = response.data.data.user;

  return (
    <div className="mt-10 flex justify-center px-6">
      <UserDetailCard user={user} token={token} />
    </div>
  );
};

export default UserDetailPage;
