import React from "react";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { getAllUsers } from "@/lib/api/services/users/users";
import UsersListClient from "../all-users/users-list-client";

const AdminStaffPage = async () => {
  const { token } = await getServerAuth();

  const res = await getAllUsers({}, token || "");

  const allUsers = res?.data?.data?.users || [];
  const users = allUsers.filter((u: any) => u.role === "admin" || u.role === "staff");

  return (
    <UsersListClient
      users={users}
      title="Admin & Staff"
      description="Manage admin and staff accounts for your gym."
      createHref="/dashboard/admin/staff/add"
      createLabel="Create Admin / Staff"
    />
  );
};

export default AdminStaffPage;
