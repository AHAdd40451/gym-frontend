import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

// 💎 Types aligned with backend Post model
export interface Post {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  caption?: string;
  media: string[];
  likes: string[];
  saves: string[];
  createdAt: string;
  updatedAt: string;
}

// 💌 Payload for creating a post
export interface CreatePostPayload {
  caption?: string;
  media: File[]; // for uploading
}

// 📝 Payload for adding a comment
export interface CommentPayload {
  text: string;
}

export async function createPost(payload: CreatePostPayload, token?: string) {
  const res = await serverFetch(API_ENDPOINTS.POSTS.BASE, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res;
}
// 2️⃣ Toggle Like
export async function toggleLike(postId: string, token?: string) {
  return serverFetch<Post>(`${API_ENDPOINTS.POSTS.BASE}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

// 3️⃣ Toggle Save
export async function toggleSave(postId: string, token?: string) {
  return serverFetch<Post>(`${API_ENDPOINTS.POSTS.BASE}/${postId}/save`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

// 4️⃣ Add Comment
export async function addComment(
  postId: string,
  payload: CommentPayload,
  token?: string
) {
  return serverFetch(`${API_ENDPOINTS.POSTS.BASE}/${postId}/comment`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// 5️⃣ Get Feed
export async function getFeed(token?: string) {
  return serverFetch<Post[]>(`${API_ENDPOINTS.POSTS.FEED}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

// 🧩 UI Transformation Utilities
export interface UIPost {
  id: number;
  userName: string;
  caption?: string;
  media: string[];
  likesCount: number;
  isLiked: boolean;
  savesCount: number;
  isSaved: boolean;
  createdAt: string;
}

export function transformPostToUI(post: Post, currentUserId: string, index?: number): UIPost {
  const numericId =
    parseInt(post._id.slice(-8), 16) || (index !== undefined ? index + 5000 : 0);

  return {
    id: numericId,
    userName: `${post.user.firstName} ${post.user.lastName}`,
    caption: post.caption,
    media: post.media,
    likesCount: post.likes.length,
    isLiked: post.likes.includes(currentUserId),
    savesCount: post.saves.length,
    isSaved: post.saves.includes(currentUserId),
    createdAt: post.createdAt,
  };
}

export async function getAllPosts(token?: string) {
  return serverFetch<Post[]>(API_ENDPOINTS.POSTS.ALL, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

// 7️⃣ Get Post By ID (single post)
export async function getPostById(postId: string, token?: string) {
  return serverFetch<Post>(`${API_ENDPOINTS.POSTS.BASE}/${postId}`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
// 💬 Get Comments by Post ID
export async function getCommentsByPostId(postId: string, token?: string) {
  return serverFetch(`${API_ENDPOINTS.POSTS.BASE}/${postId}/comment`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
export async function deletePost(postId: string, token?: string) {
  return serverFetch(`${API_ENDPOINTS.POSTS.BASE}/${postId}/delete`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
export async function getPostsByUserId(userId: string, token?: string) {
  return serverFetch<Post[]>(
    `${API_ENDPOINTS.POSTS.BASE}/user/${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );
}
export function transformPostsToUI(posts: Post[], currentUserId: string): UIPost[] {
  return posts.map((p, i) => transformPostToUI(p, currentUserId, i));
}

export async function getFollowingFeed(token?: string) {
  return serverFetch<Post[]>(API_ENDPOINTS.POSTS.FEED, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}