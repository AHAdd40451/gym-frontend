"use client";

import { useState } from "react";
import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";

import { ProfileSidebar } from "./profile-sidebar";
import { Gallery } from "./activity-stream";
import { ProfileHeader } from "./profile-header";
import { StaffDetailsEditModal } from "./staffDetailsEditModal";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
    return generateMeta({
        title: "Shadcn User Profile Page",
        description:
            "A page within a dashboard that shows detailed user information, profile settings, and recent activity. Built with shadcn/ui, Tailwind CSS, Next.js and React. Typescript is included.",
        canonical: "/pages/profile-v2"
    });
}

type StaffUser = {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
    role?: string;
    status?: string;
    language?: string;
    bio?: string;
    subscriptionFees?: number | null;
    profileImage?: string | null;
    coverImage?: string | null;
    createdAt?: string;
    location?: {
        country?: string;
        city?: string;
    };
    gallery?: string[];
};

function resolveUser(userData: any): StaffUser | null {
    if (!userData) return null;
    let parsed = userData;
    if (typeof userData === "string") {
        try {
            parsed = JSON.parse(userData);
        } catch {
            return null;
        }
    }
    return (
        parsed?.data?.data?.user ||
        parsed?.data?.user ||
        parsed?.user ||
        null
    );
}

export default function StaffProfile({ id, userData }: { id: string; userData: any }) {
    const user = resolveUser(userData);
    const userId = (user as { _id?: string } | null)?._id ?? user?.id ?? id;
    const gallery = (user?.gallery ?? []).filter(Boolean);
    const [editModalOpen, setEditModalOpen] = useState(false);

    return (
        <div className="mx-auto min-h-screen lg:max-w-7xl xl:pt-6">
            <div className="space-y-4">
                <div className="bg-card overflow-hidden rounded-md border">
                    <ProfileHeader user={user} userId={userId} />
                </div>

                <div className="gap-4 space-y-4 lg:grid lg:space-y-0 xl:grid-cols-[300px_1fr]">
                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => setEditModalOpen(true)}
                        >
                            <Pencil className="size-4" />
                            Edit profile
                        </Button>
                        <ProfileSidebar user={user} />
                    </div>

                    <main className="space-y-4">
                        <Gallery userId={userId} gallery={gallery} />
                    </main>
                </div>
            </div>

            <StaffDetailsEditModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                user={user}
                userId={userId}
                onSuccess={() => setEditModalOpen(false)}
            />
        </div>
    );
}
