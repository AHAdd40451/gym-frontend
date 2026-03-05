"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronRight, History, Mail, Search, Users } from "lucide-react";
import { usersApi } from "@/lib/api/services/users/users";
import { toast } from "sonner";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: string;
};

const extractUsers = (payload: any): User[] => {
  if (!payload) return [];

  const isUserLike = (item: any) =>
    item &&
    typeof item === "object" &&
    (typeof item.email === "string" ||
      typeof item.firstName === "string" ||
      typeof item.lastName === "string");

  const visited = new Set<any>();

  const walk = (node: any): User[] => {
    if (!node || visited.has(node)) return [];
    if (typeof node === "object") visited.add(node);

    if (Array.isArray(node)) {
      const userLikeItems = node.filter(isUserLike);
      if (userLikeItems.length) return userLikeItems as User[];

      for (const item of node) {
        const found = walk(item);
        if (found.length) return found;
      }
      return [];
    }

    if (typeof node === "object") {
      const priorityKeys = ["users", "members", "items", "results", "data"];
      for (const key of priorityKeys) {
        if (key in node) {
          const found = walk((node as any)[key]);
          if (found.length) return found;
        }
      }

      for (const value of Object.values(node)) {
        const found = walk(value);
        if (found.length) return found;
      }
    }

    return [];
  };

  return walk(payload);
};

const statusClass = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "active") {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }
  if (s === "inactive") {
    return "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
  return "border-border bg-muted text-muted-foreground";
};

export default function UserWorkoutHistoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response: any = await usersApi.getByRole("user", { limit: 200, page: 1 });
        setUsers(extractUsers(response));
      } catch (error: any) {
        console.error("Failed to fetch users", error);
        const errorMessage = error?.errors?.[0]?.message || error?.message || "Please try again later.";
        toast.error("Failed to load users", { description: errorMessage });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }, [users, searchQuery]);

  const handleUserClick = (userId: string) => {
    router.push(`/dashboard/staff/user-workout-history/${userId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Card className="border-none bg-gradient-to-r from-[var(--primary)]/10 via-background to-background shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold md:text-3xl">
            <History className="size-6 text-[var(--primary)]" />
            User Workout History
          </CardTitle>
          <CardDescription>Select a user to view their workout history and exercise logs</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="w-fit">
              <Users className="mr-1 size-3.5" />
              {filteredUsers.length} users
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {searchQuery ? "No users found matching your search." : "No users found."}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/70">
              {filteredUsers.map((user, index) => {
                const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User";
                const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";

                return (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleUserClick(user._id)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      index !== filteredUsers.length - 1 ? "border-b border-border/70" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{fullName}</p>
                          <p className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Mail className="size-3.5" />
                            <span className="truncate">{user.email || "-"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusClass(user.status)}>
                          {(user.status || "unknown").toUpperCase()}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-primary">
                          View history
                          <ChevronRight className="ml-1 size-4" />
                        </Button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
