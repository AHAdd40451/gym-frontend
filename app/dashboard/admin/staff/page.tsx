import React from "react";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { getAllUsers } from "@/lib/api/services/users/users";
import UsersListClient from "../all-users/users-list-client";

const AdminStaffPage = async () => {
  const { token, user } = await getServerAuth();

  const res = await getAllUsers({}, token || "");

  const allUsers = res?.data?.data?.users || [];
  const isOperatorStaff =
    user?.role === "staff" && user?.staffType === "operator";
  const users = isOperatorStaff
    ? allUsers.filter(
        (u: any) =>
          u.role === "staff" &&
          (u.staffType === "trainer" || u.staffType == null)
      )
    : allUsers.filter((u: any) => u.role === "admin" || u.role === "staff");
  const canCreateTeam =
    user?.role === "admin" ||
    isOperatorStaff;
  const createLabel =
    isOperatorStaff
      ? "Create Trainer"
      : "Create Admin / Staff";
  const createHref =
    isOperatorStaff
      ? "/dashboard/admin/staff/add?mode=trainer-only"
      : "/dashboard/admin/staff/add";

  return (
    <UsersListClient
      users={users}
      title="Admin & Staff"
      description="Manage admin and staff accounts for your gym."
      createHref={canCreateTeam ? createHref : undefined}
      createLabel={canCreateTeam ? createLabel : undefined}
    />
  );
};

export default AdminStaffPage;
