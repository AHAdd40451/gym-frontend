"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Camera, MapPin, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarFallback } from "@/lib/utils";
import { usersApi } from "@/lib/api/services/users/users";
import type { User } from "@/lib/types/models";

const DEFAULT_COVER_URL =
  "https://images.unsplash.com/photo-1735926199195-85b726600751?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000";

type StaffUser = {
  firstName?: string;
  lastName?: string;
  role?: string;
  location?: {
    country?: string;
    city?: string;
  };
  createdAt?: string;
  profileImage?: string | null;
  coverImage?: string | null;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ProfileHeader({
  user,
  userId,
}: {
  user?: StaffUser | null;
  userId?: string;
}) {
  const router = useRouter();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCover, setSavingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "Trainer";
  const role = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Staff";
  const locationParts = [user?.location?.city, user?.location?.country].filter(
    Boolean
  );
  const location =
    locationParts.length > 0 ? locationParts.join(", ") : "-";
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  const coverSrc = user?.coverImage || DEFAULT_COVER_URL;
  const canEdit = Boolean(userId);

  const saveProfileImage = async (base64: string) => {
    if (!userId) return;
    setSavingProfile(true);
    setError(null);
    try {
      await usersApi.update(
        userId,
        { profileImage: base64 } as Partial<User>
      );
      router.refresh();
    } catch (e: unknown) {
      setError(
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Failed to update profile image"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const saveCoverImage = async (base64: string) => {
    if (!userId) return;
    setSavingCover(true);
    setError(null);
    try {
      await usersApi.update(
        userId,
        { coverImage: base64 } as Partial<User>
      );
      router.refresh();
    } catch (e: unknown) {
      setError(
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Failed to update cover image"
      );
    } finally {
      setSavingCover(false);
    }
  };

  const onProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    try {
      const base64 = await fileToBase64(file);
      await saveProfileImage(base64);
    } finally {
      e.target.value = "";
    }
  };

  const onCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    try {
      const base64 = await fileToBase64(file);
      await saveCoverImage(base64);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={onCoverFileChange}
      />
      <input
        ref={profileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={onProfileFileChange}
      />

      {/* Cover image - clickable when canEdit */}
      <div
        className="group relative aspect-3/1 w-full cursor-pointer rounded-t-md bg-cover bg-center md:max-h-[240px]"
        style={{ backgroundImage: `url('${coverSrc}')` }}
        onClick={() => canEdit && !savingCover && coverInputRef.current?.click()}
        role={canEdit ? "button" : undefined}
        aria-label={canEdit ? "Change cover image" : undefined}
      >
        {canEdit && (
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-t-md transition-colors ${
              savingCover ? "bg-black/50" : "bg-black/0 group-hover:bg-black/40"
            }`}
          >
            {savingCover ? (
              <span className="text-sm font-medium text-white">Saving…</span>
            ) : (
              <Camera className="text-white opacity-0 size-8 transition-opacity group-hover:opacity-100" />
            )}
          </div>
        )}
      </div>

      {/* Profile avatar - clickable when canEdit */}
      <div className="-mt-10 px-4 pb-4 text-center lg:-mt-14">
        <button
          type="button"
          className="relative mx-auto block rounded-full ring-4 ring-background focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => canEdit && profileInputRef.current?.click()}
          disabled={!canEdit || savingProfile}
          aria-label={canEdit ? "Change profile image" : undefined}
        >
          <Avatar className="size-20 lg:size-28">
            <AvatarImage src={user?.profileImage || undefined} alt={fullName} />
            <AvatarFallback>{generateAvatarFallback(fullName)}</AvatarFallback>
          </Avatar>
          {canEdit && (
            <span className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
              {savingProfile ? (
                <span className="text-xs">…</span>
              ) : (
                <Camera className="size-4" />
              )}
            </span>
          )}
        </button>

        {error && (
          <p className="text-destructive mt-2 text-sm">{error}</p>
        )}

        <h4 className="text-lg font-semibold lg:text-2xl">{fullName}</h4>

        <div className="text-muted-foreground mt-3 flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span>{role}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span className="text-blue-500">{location}</span>
          </div>

          {joinedDate && (
            <div className="hidden items-center gap-1.5 lg:flex">
              <Calendar className="h-4 w-4" />
              <span>Joined {joinedDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
