import StaffProfile from "@/components/dashboard/staffProfile/staffProfile";
import { getUserByIdServerSide } from "@/lib/api/services/users/users";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { token } = await getServerAuth();
  if (!token) {
    redirect("/login");
  }
  const response = await getUserByIdServerSide(id, token);
  return <StaffProfile id={id} userData={response} />;
}
