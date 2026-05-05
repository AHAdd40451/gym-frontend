import { serverFetch } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";


export interface StoryViewer {
    _id?: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    viewedAt: string;
}

export interface Story {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    image?: string;
    text?: string;
    caption?: string;
    viewers?: StoryViewer[]; 
    createdAt: string;
    updatedAt: string;
}
// =========================
// ➕ Create Story Payload
// =========================
export interface CreateStoryPayload {
    image?: string; // URL (Cloudinary)
    text?: string;
    caption?: string;
}

// =========================
// 📤 Create Story
// =========================
export async function createStory(
    payload: CreateStoryPayload,
    token?: string
) {
    return serverFetch(API_ENDPOINTS.STORY.BASE, {
        method: "POST",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}

// =========================
// 📥 Get Stories (Feed)
// =========================
export async function getStories(token?: string) {
    return serverFetch<Story[]>(API_ENDPOINTS.STORY.ALL, {
        method: "GET",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    });
}
export async function viewStory(
    storyId: string,
    token?: string
) {
    return serverFetch(`${API_ENDPOINTS.STORY.VIEW}/view/${storyId}`, {
        method: "POST",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
        },
    });
}

export async function deleteStory(
    storyId: string,
    token?: string
) {
    return serverFetch(`${API_ENDPOINTS.STORY.DELETE}/${storyId}`, {
        method: "DELETE",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    });
}