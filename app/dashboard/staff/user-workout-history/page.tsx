"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mail, Search, History } from "lucide-react";
import { usersApi } from "@/lib/api/services/users/users";
import { toast } from "sonner";
import apiClient from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/constants/constants";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: string;
  role?: string;
  workoutCount?: number;
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
        // Get all users with role "user" (members)
        // Try direct API call first to see actual response structure
        const directResponse: any = await apiClient.get(`${API_ENDPOINTS.USERS.BY_ROLE}/user?limit=100&page=1`);
        console.log("Direct API Response:", directResponse.data); // Debug log
        
        // Also try using usersApi
        const response: any = await usersApi.getByRole("user", { limit: 100, page: 1 });
        console.log("usersApi Response:", response); // Debug log
        
        // Use direct response if available, otherwise use usersApi response
        const apiResponse = directResponse?.data || response;
        
        // Backend returns paginated response with structure:
        // { data: { users: [...] }, meta: { pagination: {...} } }
        // OR from handleApiResponse: { data: { users: [...] }, pagination: {...} }
        let userList: User[] = [];
        
        if (apiResponse) {
          // Try different response structures
          if (Array.isArray(apiResponse)) {
            userList = apiResponse as User[];
          } else if (apiResponse.data) {
            if (Array.isArray(apiResponse.data)) {
              userList = apiResponse.data as User[];
            } else if (apiResponse.data.users && Array.isArray(apiResponse.data.users)) {
              userList = apiResponse.data.users as User[];
            } else if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
              userList = apiResponse.data.data as User[];
            }
          } else if (apiResponse.users && Array.isArray(apiResponse.users)) {
            userList = apiResponse.users as User[];
          }
        }
        
        console.log("Extracted userList:", userList.length); // Debug log
        
        // If there are more pages, fetch them (max 5 pages = 500 users)
        const pagination = apiResponse?.pagination || apiResponse?.meta?.pagination || apiResponse?.data?.pagination || response?.pagination || response?.meta?.pagination;
        if (pagination && (pagination.pages || pagination.totalPages) > 1) {
          const totalPages = pagination.pages || pagination.totalPages;
          if (totalPages <= 5) {
            const allUsers = [...userList];
            // Fetch remaining pages
            for (let page = 2; page <= totalPages; page++) {
              try {
                const nextResponse: any = await usersApi.getByRole("user", { limit: 100, page });
                let nextUsers: User[] = [];
                
                if (nextResponse) {
                  if (Array.isArray(nextResponse)) {
                    nextUsers = nextResponse as User[];
                  } else if (nextResponse.data) {
                    if (Array.isArray(nextResponse.data)) {
                      nextUsers = nextResponse.data as User[];
                    } else if (nextResponse.data.users && Array.isArray(nextResponse.data.users)) {
                      nextUsers = nextResponse.data.users as User[];
                    }
                  } else if (nextResponse.users && Array.isArray(nextResponse.users)) {
                    nextUsers = nextResponse.users as User[];
                  }
                }
                
                if (Array.isArray(nextUsers) && nextUsers.length > 0) {
                  allUsers.push(...nextUsers);
                }
              } catch (err) {
                console.error(`Failed to fetch page ${page}:`, err);
                // Continue with users we have
              }
            }
            userList = allUsers;
          } else {
            // If more than 5 pages, show message
            toast.info(`Showing first 500 users. Total: ${pagination.total}`);
          }
        }
        
        console.log("Final userList:", userList.length); // Debug log
        setUsers(Array.isArray(userList) ? userList : []);
      } catch (error: any) {
        console.error("Failed to fetch users", error);
        const errorMessage = error?.errors?.[0]?.message || error?.message || "Please try again later.";
        toast.error("Failed to load users", {
          description: errorMessage
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = Array.isArray(users) ? users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  }) : [];

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
          <CardTitle className="flex items-center gap-2 text-3xl font-semibold">
            <History className="size-6 text-[var(--primary)]" />
            User Workout History
          </CardTitle>
          <CardDescription>
            Select a user to view their workout history and exercise logs
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filteredUsers.length} users</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchQuery ? "No users found matching your search." : "No users found."}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredUsers.map((user) => {
                const fullName = `${user.firstName} ${user.lastName}`;
                const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

                return (
                  <Card
                    key={user._id}
                    onClick={() => handleUserClick(user._id)}
                    className="cursor-pointer transition hover:shadow-lg hover:border-[var(--primary)]/50"
                  >
                    <CardContent className="flex flex-col items-center space-y-4 pt-6 pb-6">
                      <Avatar className="size-16">
                        <AvatarFallback className="bg-[var(--primary)]/10 text-[var(--primary)]">
                          {initials || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="text-center space-y-1">
                        <h5 className="text-lg font-semibold">{fullName || "Unknown User"}</h5>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Mail className="size-3" />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                        {user.status && (
                          <Badge variant={user.status === "active" ? "default" : "secondary"} className="mt-2">
                            {user.status}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

