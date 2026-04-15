import { useEffect, useState } from "react";
import {
    getPostsByUserId,
    Post as PostType,
    deletePost,
} from "../../../../lib/api/services/post/post";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

function UserPosts({ userId }: { userId: string }) {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const token = localStorage.getItem("authToken");

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await getPostsByUserId(userId, token || undefined);
            const data = (res as any)?.data || res;

            const normalizedPosts = Array.isArray(data)
                ? data.map((item: any) => item.post)
                : [];

            setPosts(normalizedPosts);
        } catch (err: any) {
            setError(err?.message || "Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            setPosts((prev) => prev.filter((p) => p._id !== deleteId));
            await deletePost(deleteId, token || undefined);
            setDeleteId(null);
        } catch (err) {
            console.error(err);
            fetchPosts();
        }
    };

    useEffect(() => {
        if (!userId) return;
        fetchPosts();
    }, [userId]);

    if (loading) return <p>Loading posts...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!posts.length) return <p>No posts found</p>;

    return (
        <>
            <div className="grid grid-cols-3 gap-4">
                {posts.map((post) => (
                    
                    <div
                        key={post._id}
                        className="relative flex group aspect-square  bg-black"
                    >
                        
{/* {post.media.map((url: string, i: number) =>
  url.match(/\.(mp4|webm|ogg)$/i) ? (
    <video
      key={i}
      src={url}
      controls
      className="w-full rounded"
    />
  ) : (
    <img
      key={i}
      src={url}
      className="w-full rounded"
    />
  )
)} */}
<div className="w-full h-full overflow-hidden rounded">
  {post.media.map((url: string, i: number) =>
    url.match(/\.(mp4|webm|ogg)$/i) ? (
      <video
        key={i}
        src={url}
        controls
        className="w-full h-full object-cover"
      />
    ) : (
      <img
        key={i}
        src={url}
        className="w-full h-full object-cover"
      />
    )
  )}
</div>
                        {/* hover overlay (Instagram style dark fade) */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                            <Button
                                variant="destructive"
                                className="opacity-0 group-hover:opacity-100 transition"
                                onClick={() => setDeleteId(post._id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* SHADCN MODAL */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="sm:max-w-[350px]">
                    <DialogHeader>
                        <DialogTitle>Delete this post?</DialogTitle>
                    </DialogHeader>

                    <DialogFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default UserPosts;