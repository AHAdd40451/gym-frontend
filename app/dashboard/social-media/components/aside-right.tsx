"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAllUsers } from "@/lib/api/services/users/users";
import { followApi } from "@/lib/api/services/users/useFollow";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  role: string;
  isFollowed?: boolean;
}

export function AsideRight() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFollowId, setLoadingFollowId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("authToken");

        if (!token) return;

        const decoded: any = jwtDecode(token);
        const currentUserId = decoded?.userId;
        const res = await getAllUsers({ page: 1, limit: 20 }, token);

        const allUsers = res?.data?.data?.users || [];


        const filtered = allUsers.filter(
          (u: User) =>
            u.role === "user" &&
            u._id !== currentUserId
        );
        setUsers(filtered);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  const router = useRouter();
  // ======================
  // Follow / Unfollow
  // ======================
  const handleFollowToggle = async (
    userId: string,
    isFollowed?: boolean
  ) => {
    try {
      setLoadingFollowId(userId);

      if (isFollowed) {
        await followApi.unfollowUser(userId);
      } else {
        await followApi.followUser(userId);
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isFollowed: !isFollowed }
            : user
        )
      );
    } catch (err) {
      console.error("❌ Follow/Unfollow error:", err);
    } finally {
      setLoadingFollowId(null);
    }
  };
  const goToProfile = (userId: string) => {
    router.push(`/dashboard/social-media/user/${userId}`);
  };
  return (
    <aside className="hidden flex-col gap-4 lg:flex">
      <Card className="bg-muted">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Suggested For You</CardTitle>
          <CardAction>
            <Button variant="link" size="sm" className="text-xs font-normal">
              See All
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between"
              >
                {/* LEFT */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.profileImage} />
                    <AvatarFallback>
                      {user.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p
                      className="text-sm font-medium cursor-pointer hover:underline"
                      onClick={() => goToProfile(user._id)}
                    >
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>

                {/* BUTTON */}
                <Button
                  variant="link"
                  size="sm"
                  disabled={loadingFollowId === user._id}
                  onClick={() =>
                    handleFollowToggle(user._id, user.isFollowed)
                  }
                  className={
                    user.isFollowed ? "text-muted-foreground" : ""
                  }
                >
                  {loadingFollowId === user._id
                    ? "Loading..."
                    : user.isFollowed
                      ? "Unfollow"
                      : "Follow"}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </aside>
  );
}