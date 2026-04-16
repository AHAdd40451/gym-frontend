// "use client";

// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
// import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface User {
//   id: string;
//   name: string;
//   username: string;
//   avatar: string;
//   isFollowed?: boolean;
// }

// const suggestedUsers: User[] = [
//   {
//     id: "1",
//     name: "Azunyan Senpai",
//     username: "@nyancat221b",
//     avatar: "https://i.pravatar.cc/150?img=11"
//   },
//   {
//     id: "2",
//     name: "Oarack Babama",
//     username: "@oarackbabama",
//     avatar: "https://i.pravatar.cc/150?img=12"
//   },
//   {
//     id: "3",
//     name: "David Gilmore",
//     username: "@davidgilmore",
//     avatar: "https://i.pravatar.cc/150?img=13"
//   },
//   {
//     id: "4",
//     name: "Gerard Way",
//     username: "@gerardway",
//     avatar: "https://i.pravatar.cc/150?img=14",
//     isFollowed: true
//   },
//   {
//     id: "5",
//     name: "Mary Suez",
//     username: "@marysuez821",
//     avatar: "https://i.pravatar.cc/150?img=15"
//   },
//   {
//     id: "6",
//     name: "Edgar Wright",
//     username: "@davidgilmore",
//     avatar: "https://i.pravatar.cc/150?img=16"
//   }
// ];

// const trendingArtists: User[] = [
//   {
//     id: "1",
//     name: "Saylor Twift",
//     username: "@saylortwiftofficial",
//     avatar: "https://i.pravatar.cc/150?img=20"
//   },
//   {
//     id: "2",
//     name: "Frank Iero",
//     username: "@frankieroofficial",
//     avatar: "https://i.pravatar.cc/150?img=21"
//   },
//   {
//     id: "3",
//     name: "Charlie XXX",
//     username: "@clarliexx",
//     avatar: "https://i.pravatar.cc/150?img=22"
//   },
//   {
//     id: "4",
//     name: "Star Warz",
//     username: "@starwarzofficial",
//     avatar: "https://i.pravatar.cc/150?img=23"
//   }
// ];

// export function AsideRight() {
//   return (
//     <aside className="hidden flex-col gap-4 lg:flex">
//       <Card className="bg-muted">
//         <CardHeader className="flex items-center justify-between">
//           <CardTitle>Suggested For You</CardTitle>
//           <CardAction>
//             <Button variant="link" size="sm" className="text-xs font-normal">
//               See All
//             </Button>
//           </CardAction>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {suggestedUsers.map((user) => (
//             <div key={user.id} className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <Avatar>
//                   <AvatarImage src={user.avatar} />
//                   <AvatarFallback>{user.name[0]}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <p className="text-sm font-medium">{user.name}</p>
//                   <p className="text-muted-foreground text-xs">{user.username}</p>
//                 </div>
//               </div>
//               <Button
//                 variant="link"
//                 size="sm"
//                 className={user.isFollowed ? "text-muted-foreground" : ""}>
//                 {user.isFollowed ? "Followed" : "Follow"}
//               </Button>
//             </div>
//           ))}
//         </CardContent>
//       </Card>

//       <Card className="bg-muted">
//         <CardHeader className="flex items-center justify-between">
//           <CardTitle>Trending Artists</CardTitle>
//           <CardAction>
//             <Button variant="link" size="sm" className="text-xs font-normal">
//               See All
//             </Button>
//           </CardAction>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {trendingArtists.map((artist) => (
//             <div key={artist.id} className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <Avatar>
//                   <AvatarImage src={artist.avatar} />
//                   <AvatarFallback>{artist.name[0]}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <p className="text-sm font-medium">{artist.name}</p>
//                   <p className="text-muted-foreground text-xs">{artist.username}</p>
//                 </div>
//               </div>
//               <Button variant="link" size="sm">
//                 Follow
//               </Button>
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     </aside>
//   );
// }


"use client";

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

        // 🔥 filter out logged-in user + only role=user
        // const filtered = allUsers.filter(
        //   (u: User) => u.role === "user" && u._id !== currentUserId
        // );
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
                    <p className="text-sm font-medium">
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