// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";

// import { SocialMediaSidebar } from "./components/social-media-sidebar";
// import { SocialMediaStories } from "./components/social-media-stories";
// import { AsideRight } from "./components/aside-right";
// import { PostItem } from "./components/post-item";

// import { getAllPosts } from "@/lib/api/services/post/post";
// import { Post } from "./data";

// export default function Page() {
//   const [posts, setPosts] = useState<Post[]>([]);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const token = localStorage.getItem("authToken");

//         const res = await getAllPosts(token || "");

//         let rawData: any[] = [];

//         if (Array.isArray(res)) {
//           rawData = res;
//         } else if (res?.data) {
//           rawData = res.data;
//         } else if (res?.posts) {
//           rawData = res.posts;
//         }


//         const formattedPosts: Post[] = rawData.map((item: any) => {
//           const p = item?.post;

//           if (!p) return null; // 🚨 skip invalid posts

//           return {
//             id: p._id,

//             username: `${p?.user?.firstName || ""} ${p?.user?.lastName || ""}`.trim(),

//             avatar: p?.user?.profileImage || "",

//             verified: false,

//             type: p?.media?.length ? "image" : "text",

//             image: p?.media?.[0] || "",

//             text: p?.caption || "",

//             likeCount: item?.stats?.likes || 0,

//             caption: p?.caption || "",

//             comments: item?.comments || [] // ✅ REAL COMMENTS ONLY
//           };
//         }).filter(Boolean); // 🚨 remove nulls
//         setPosts(formattedPosts);

//       } catch (error) {
//         console.error("Error fetching posts:", error);
//       }
//     };

//     fetchPosts();
//   }, []);

//   return (
//     <div className="grid h-[var(--content-full-height)] flex-1 gap-4 overflow-hidden md:grid-cols-[280px_auto] lg:grid-cols-[280px_auto_280px]">
//       <SocialMediaSidebar />

//       <main className="flex-1 overflow-y-auto">
//         <div className="mx-auto lg:max-w-xl">
//           <div className="space-y-4">
//             <SocialMediaStories />

//             <div className="space-y-4 divide-y lg:space-y-6 [&>div]:py-4">

//               {posts.length === 0 ? (
//                 <div className="text-center text-gray-500 py-10">
//                   Post not found
//                 </div>
//               ) : (
//                 posts.map((post, index) => (
//                   <PostItem key={post.id || index} post={post} />
//                 ))
//               )}

//             </div>
//           </div>
//         </div>
//       </main>

//       <AsideRight />
//     </div>
//   );
// }

/// nrew///

"use client";

import { useEffect, useState } from "react";

import { SocialMediaSidebar } from "./components/social-media-sidebar";
import { SocialMediaStories } from "./components/social-media-stories";
import { AsideRight } from "./components/aside-right";
import { PostItem } from "./components/post-item";

import { getFollowingFeed } from "@/lib/api/services/post/post";
import { Post } from "./data";

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("authToken");

        const res = await getFollowingFeed(token || "");


        console.log("FULL RESPONSE:", res);
        const rawData = res?.data?.posts || res?.posts || [];

        console.log("RAW DATA:", rawData);
        console.log("COUNT:", rawData.length);


        const formattedPosts: Post[] = rawData
          .map((item: any) => {
            if (!item?._id) {
              console.log("❌ BAD ITEM:", item);
              return null;
            }

            return {
              id: item._id,
              userId: item?.user?._id,

              username: `${item?.user?.firstName || ""} ${item?.user?.lastName || ""}`.trim(),
              avatar: item?.user?.profileImage || "",
              verified: false,
              type: item?.media?.length ? "image" : "text",
              image: item?.media?.[0] || "",
              text: item?.caption || "",
              likeCount: item?.likes?.length || 0,
              caption: item?.caption || "",

              // ✅ FIXED
              comments: item?.comments || []
            };
          })
          .filter((p): p is Post => p !== null);
        console.log("🚀 FINAL formattedPosts:", formattedPosts);
        setPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();

  },
    []);

  return (
    <div className="grid h-[var(--content-full-height)] flex-1 gap-4 overflow-hidden md:grid-cols-[280px_auto] lg:grid-cols-[280px_auto_280px]">
      <SocialMediaSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto lg:max-w-xl">
          <div className="space-y-4">
            <SocialMediaStories />

            <div className="space-y-4 divide-y lg:space-y-6 [&>div]:py-4">
              {loading ? (
                <div className="text-center text-gray-500 py-10">
                  Loading feed...
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No posts found. Follow people to see content.
                </div>
              ) : (
                posts.map((post, index) => (
                  <PostItem key={post.id || index} post={post} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <AsideRight />
    </div>
  );
}