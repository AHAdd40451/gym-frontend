"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  EyeOff,
  Flag,
  Heart,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  UserX
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toggleLike, addComment } from "@/lib/api/services/post/post";

export function PostItem({ post }: any) {
  const postId = post?.id || post?._id;

  const username = post?.username || "Unknown";
  const avatar = post?.avatar || "";
  // const comments = post?.comments || [];
  const [commentsState, setCommentsState] = useState(post?.comments || []);

  // ================= LIKE STATE (PERSISTENT) =================
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem("likedPosts");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const persistLikes = (next: Set<string>) => {
    localStorage.setItem("likedPosts", JSON.stringify([...next]));
  };

  // ================= OTHER STATES =================
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  // ================= LIKE HANDLER =================
  const handleLike = async () => {
    const token = localStorage.getItem("authToken");

    setLikedPosts((prev) => {
      const next = new Set(prev);

      if (next.has(postId)) next.delete(postId);
      else next.add(postId);

      persistLikes(next);
      return next;
    });

    try {
      await toggleLike(postId, token || "");
    } catch (err) {
      console.error("Like failed");

      // rollback
      setLikedPosts((prev) => {
        const next = new Set(prev);

        if (next.has(postId)) next.delete(postId);
        else next.add(postId);

        persistLikes(next);
        return next;
      });
    }
  };

  // ================= SAVE =================
  const handleSave = () => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  // ================= COMMENTS =================
  const toggleComments = () => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const handleAddComment = async () => {
    const text = newComments[postId]?.trim();
    if (!text) return;

    const token = localStorage.getItem("authToken");

    const tempComment = {
      _id: Date.now().toString(),
      text,
      user: {
        firstName: "You",
        lastName: ""
      }
    };

    // ✅ INSTANT UI UPDATE
    setCommentsState((prev) => [tempComment, ...prev]);

    setNewComments((prev) => ({ ...prev, [postId]: "" }));

    setExpandedComments((prev) => new Set(prev).add(postId));

    try {
      const res = await addComment(postId, { text }, token || "");

      // OPTIONAL: replace temp comment with real one from backend
      if (res?.comment) {
        setCommentsState((prev) =>
          prev.map((c) =>
            c._id === tempComment._id ? res.comment : c
          )
        );
      }
    } catch (err) {
      console.error("Comment failed");

      // rollback UI if fail
      setCommentsState((prev) =>
        prev.filter((c) => c._id !== tempComment._id)
      );
    }
  };
  // ================= LIKE COUNT =================
  const likeCount =
    (post?.likeCount || 0) + (likedPosts.has(postId) ? 1 : 0);

  return (
    <div className="space-y-3 rounded-2xl border  shadow-sm hover:shadow-md transition">

      <div className="space-y-3 px-4 pt-4">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatar} />
              <AvatarFallback>{username?.[0] || "U"}</AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">{username}</span>
              {post?.verified && <BadgeCheck className="size-4" />}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem><Bookmark /> Save</DropdownMenuItem>
              <DropdownMenuItem><Link2 /> Copy</DropdownMenuItem>
              <DropdownMenuItem><Share2 /> Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><EyeOff /> Hide</DropdownMenuItem>
              <DropdownMenuItem><UserX /> Unfollow</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <Flag /> Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* MEDIA */}
        {post?.image?.match(/\.(mp4|webm|ogg)$/i) ? (
          <video
            src={post.image}
            className="rounded-xl w-full max-h-[500px] object-cover"
            controls
          />
        ) : (
          <img
            src={post.image}
            className="rounded-xl w-full max-h-[500px] object-cover"
          />
        )}

        {post?.text && <p className="text-sm">{post.text}</p>}

        {/* ACTIONS */}
        <div className="flex justify-between items-center">

          <div className="flex gap-3">

            {/* LIKE */}
            <Button onClick={handleLike} variant="ghost" size="icon">
              <Heart
                className={`transition-all duration-200 ${likedPosts.has(postId)
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-gray-500"
                  }`}
              />
            </Button>

            <Button onClick={toggleComments} variant="ghost" size="icon">
              <MessageCircle />
            </Button>

            <Button variant="ghost" size="icon">
              <Send />
            </Button>
          </div>

          <Button onClick={handleSave} variant="ghost" size="icon">
            <Bookmark
              className={savedPosts.has(postId) ? "text-blue-500" : ""}
            />
          </Button>
        </div>

        {/* LIKE COUNT */}
        <p className="text-sm font-medium">{likeCount} likes</p>

        {/* CAPTION */}
        {post?.caption && (
          <p className="text-sm">
            <b>{username}</b> {post.caption}
          </p>
        )}


        <Button variant="link" onClick={toggleComments}>
          {expandedComments.has(postId)
            ? "Hide comments"
            : `View all ${commentsState.length} comments`}
        </Button>
        {/* COMMENTS */}
        {expandedComments.has(postId) && (
          <div className="space-y-3">
            {commentsState.map((c: any) => {
              const user = c?.user || {};
              const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

              return (
                <div key={c._id} className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={user.profileImage || ""} />
                    <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
                  </Avatar>

                  <div>
                    <b>{name || "User"}</b>
                    <p className="text-sm text-gray-700">{c.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMMENT INPUT */}
      <div className="flex gap-2 p-3 border-t  rounded-b-2xl">
        <Input
          placeholder="Add comment..."
          value={newComments[postId] || ""}
          onChange={(e) =>
            setNewComments((prev) => ({
              ...prev,
              [postId]: e.target.value
            }))
          }
        />

        <Button onClick={handleAddComment}>Post</Button>
      </div>
    </div>
  );
}