"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Mail, Plus, Search, ShieldCheck, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type UserItem = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "admin" | "staff" | "user" | string;
  staffType?: "trainer" | "operator" | null | string;
  status?: string;
  isSuperAdmin?: boolean;
};

type UsersListClientProps = {
  users: UserItem[];
  title?: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
};

const getFullName = (user: UserItem) => {
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User";
};

const getInitials = (user: UserItem) => {
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";

  return `${first}${last}`.toUpperCase() || "?";
};

const getRoleLabel = (user: UserItem) => {
  if (user.isSuperAdmin) return "Super Admin";
  if (user.role === "admin") return "Admin";
  if (user.role === "staff") {
    if (user.staffType === "operator") return "Operator";
    if (user.staffType === "trainer") return "Trainer";
    return "Staff";
  }
  return "Member";
};

const getRoleBadgeClass = (user: UserItem) => {
  if (user.isSuperAdmin) {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }

  if (user.role === "admin") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (user.role === "staff") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

const getRoleIcon = (user: UserItem) => {
  if (user.isSuperAdmin) return <ShieldCheck className="size-3.5" />;
  if (user.role === "admin") return <UserCog className="size-3.5" />;
  return <Users className="size-3.5" />;
};

export default function UsersListClient({
  users,
  title = "All Users",
  description = "Search users and quickly identify admin, staff, and members.",
  createHref,
  createLabel = "Create",
}: UsersListClientProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      const fullName = getFullName(user).toLowerCase();
      const email = user.email?.toLowerCase() || "";
      const role = getRoleLabel(user).toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        role.includes(query)
      );
    });
  }, [users, search]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (a.isSuperAdmin && !b.isSuperAdmin) return -1;
      if (!a.isSuperAdmin && b.isSuperAdmin) return 1;

      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;

      if (a.role === "staff" && b.role === "user") return -1;
      if (a.role === "user" && b.role === "staff") return 1;

      return getFullName(a).localeCompare(getFullName(b));
    });
  }, [filteredUsers]);

  return (
    <div className="mt-8 space-y-6">
      {/* Search Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <div className="relative w-full md:w-[380px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          {createHref && (
            <Button asChild className="shrink-0">
              <Link href={createHref}>
                <Plus className="size-4" />
                {createLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedUsers.length} of {users.length} users
        </p>

        {search && (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>
            Clear Search
          </Button>
        )}
      </div>

      {/* Users Grid */}
      {sortedUsers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedUsers.map((u) => (
            <Card key={u._id} className="hover:shadow-lg transition">
              <CardContent className="pt-6 pb-6 flex flex-col items-center space-y-4">
                {/* Avatar */}
                <Avatar className="size-20">
                  <AvatarFallback>{getInitials(u)}</AvatarFallback>
                </Avatar>

                <div className="w-full text-center">
                  <div className="mb-3 flex justify-center">
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1.5 capitalize ${getRoleBadgeClass(u)}`}
                    >
                      {getRoleIcon(u)}
                      {getRoleLabel(u)}
                    </Badge>
                  </div>

                  <h5 className="text-xl font-semibold capitalize">
                    {getFullName(u)}
                  </h5>

                  {/* Email */}
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4" />
                    <span className="break-all">{u.email || "No email"}</span>
                  </div>

                  {/* Status */}
                  <div className="mt-3">
                    <Badge
                      variant={u.status === "active" ? "info" : "secondary"}
                      className="capitalize"
                    >
                      {u.status || "unknown"}
                    </Badge>
                  </div>

                  {/* View Details Button */}
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href={`/dashboard/admin/all-users/${u._id}`}>
                      View Details <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No users found for "{search}".
          </CardContent>
        </Card>
      )}
    </div>
  );
}
