"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usersApi } from "@/lib/api/services/users/users";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CircleUserRoundIcon } from "lucide-react";

import {
    toggleLike,
    toggleSave,
    addComment,
} from "@/lib/api/services/post/post";

export default function ProfilePage() {
    const params = useParams();
    const userId = params?.id as string;

    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [commentText, setCommentText] = useState<Record<string, string>>({});
    const [showComments, setShowComments] = useState<Set<string>>(new Set());
    const [openCommentsPost, setOpenCommentsPost] = useState<any>(null);
    const myId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await usersApi.getById(userId);

                setUser(res?.data?.user);
                setPosts(res?.data?.posts || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchUser();
    }, [userId]);

    // ❤️ LIKE
    const handleLike = async (postId: string) => {
        await toggleLike(postId);

        setPosts((prev) =>
            prev.map((p) =>
                p._id === postId
                    ? {
                        ...p,
                        likes: p.likes.includes(myId)
                            ? p.likes.filter((id: string) => id !== myId)
                            : [...p.likes, myId],
                    }
                    : p
            )
        );
    };

    // 💬 COMMENT (INSTANT UI UPDATE)
    const handleComment = async (postId: string) => {
        const text = commentText[postId];
        if (!text?.trim()) return;

        const token = localStorage.getItem("authToken");

        if (!token) {
            console.error("No token found");
            return;
        }

        const tempComment = {
            _id: Date.now(),
            text,
            user: {
                firstName: "You",
                lastName: "",
            },
        };

        // ✅ instant UI update
        setPosts((prev) =>
            prev.map((p) =>
                p._id === postId
                    ? {
                        ...p,
                        comments: [tempComment, ...(p.comments || [])],
                    }
                    : p
            )
        );

        try {
            const res = await addComment(postId, { text }, token);

            // replace temp
            if (res?.comment) {
                setPosts((prev) =>
                    prev.map((p) =>
                        p._id === postId
                            ? {
                                ...p,
                                comments: p.comments.map((c: any) =>
                                    c._id === tempComment._id ? res.comment : c
                                ),
                            }
                            : p
                    )
                );
            }
        } catch (err) {
            console.error("Comment failed");
        }

        setCommentText((prev) => ({ ...prev, [postId]: "" }));
    };

    const toggleComments = (postId: string) => {
        setShowComments((prev) => {
            const next = new Set(prev);
            next.has(postId) ? next.delete(postId) : next.add(postId);
            return next;
        });
    };

    const isVideo = (url: string) => /\.(mp4|webm|ogg)/i.test(url);

    if (loading) return <div className="p-4">Loading...</div>;
    if (!user) return <div className="p-4">User not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-4">

            {/* PROFILE */}
            <Card>
                <CardContent className="p-0">
                    <div className="h-48 bg-muted">
                        {user.coverImage && (
                            <img src={user.coverImage} className="w-full h-full object-cover" />
                        )}
                    </div>

                    <div className="p-4 flex gap-3">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback><CircleUserRoundIcon /></AvatarFallback>
                        </Avatar>

                        <div>
                            <h2>{user.firstName} {user.lastName}</h2>
                            <p className="text-sm text-gray-500">{user.bio}</p>
                        </div>

                    </div>
                    <div className="flex gap-10 mt-4 border-t pt-4 ml-6">
                        <div>
                            <p className="font-bold">{posts.length}</p>
                            <p className="text-xs">Posts</p>
                        </div>

                        <div>
                            <p className="font-bold">{user?.followers?.length || 0}</p>
                            <p className="text-xs">Followers</p>
                        </div>

                        <div>
                            <p className="font-bold">{user?.following?.length || 0}</p>
                            <p className="text-xs">Following</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* POSTS */}
            <div className="grid grid-cols-3 gap-4">
                {posts.map((post) => {
                    const media = post.media?.[0];
                    const isOpen = showComments.has(post._id);
                    const comments = post.comments || [];

                    return (
                        <Card key={post._id}>
                            <CardContent className="p-0">

                                {/* MEDIA */}
                                <div className="w-full aspect-square bg-black">
                                    {media &&
                                        (isVideo(media) ? (
                                            <video
                                                src={media}
                                                className="w-full h-full object-cover"
                                                controls
                                            />
                                        ) : (
                                            <img
                                                src={media}
                                                className="w-full h-full object-cover"
                                                alt="post"
                                            />
                                        ))}
                                </div>

                                {/* ACTIONS */}
                                <div className="p-2 flex justify-between">
                                    <button onClick={() => handleLike(post._id)}>
                                        ❤️ {post.likes?.length || 0}
                                    </button>
                                </div>

                                {/* CAPTION */}
                                <div className="px-2 text-sm">
                                    {post.caption}
                                </div>

                                {/* VIEW COMMENTS BUTTON */}
                                {comments.length > 0 && (
                                    <button
                                        onClick={() => setOpenCommentsPost(post)}
                                        className="text-xs cursor-pointer text-gray-500 px-2 mt-1 hover:text-white"
                                    >
                                        View all {comments.length} comments
                                    </button>
                                )}

                                {/* COMMENTS */}
                                <div className="px-2 mt-2 space-y-1">
                                    {openCommentsPost && (
                                        <div className="fixed inset-0  flex items-center justify-center z-50">

                                            <div className="bg-blue-400 w-full max-w-md rounded-xl p-4 max-h-[80vh] overflow-y-auto">

                                                {/* HEADER */}
                                                <div className="flex justify-between items-center mb-3">
                                                    <h2 className="font-semibold">Comments</h2>

                                                    <button onClick={() => setOpenCommentsPost(null)} className="cursor-pointer">
                                                        ✖
                                                    </button>
                                                </div>

                                                {/* COMMENTS LIST */}
                                                <div className="space-y-3">
                                                    {(openCommentsPost.comments || []).map((c: any) => {
                                                        const name = `${c?.user?.firstName || ""} ${c?.user?.lastName || ""}`;

                                                        return (
                                                            <div key={c._id} className="text-sm">
                                                                <b>{name || "User"}</b> {c.text}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* ADD COMMENT */}
                                                <div className="flex gap-2 mt-4 border-t pt-3">
                                                    <input
                                                        value={commentText[openCommentsPost._id] || ""}
                                                        onChange={(e) =>
                                                            setCommentText({
                                                                ...commentText,
                                                                [openCommentsPost._id]: e.target.value,
                                                            })
                                                        }
                                                        className="flex-1 text-sm outline-none"
                                                        placeholder="Add comment..."
                                                    />

                                                    <Button
                                                        onClick={() => handleComment(openCommentsPost._id)}
                                                    >
                                                        Post
                                                    </Button>
                                                </div>

                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ADD COMMENT */}
                                <div className="flex gap-2 p-2 border-t mt-2">
                                    <input
                                        value={commentText[post._id] || ""}
                                        onChange={(e) =>
                                            setCommentText({
                                                ...commentText,
                                                [post._id]: e.target.value,
                                            })
                                        }
                                        placeholder="Add comment..."
                                        className="flex-1 text-sm outline-none"
                                    />

                                    <Button onClick={() => handleComment(post._id)}>
                                        Post
                                    </Button>
                                </div>

                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}