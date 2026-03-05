"use client";

import { Calendar, MapPin, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DEFAULT_COVER_URL =
  "https://images.unsplash.com/photo-1735926199195-85b726600751?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000";

export type DrawerProfileHeaderUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: string;
  profileImage?: string | null;
  coverImage?: string | null;
  createdAt?: string;
  location?: {
    country?: string;
    city?: string;
  };
};

function getInitials(user: DrawerProfileHeaderUser) {
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";
  return `${first}${last}`.toUpperCase() || "ST";
}

export function DrawerProfileHeader({
  user,
  fallbackImageUrl,
}: {
  user: DrawerProfileHeaderUser;
  fallbackImageUrl?: string;
}) {
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
  const avatarSrc =
    user?.profileImage || fallbackImageUrl || undefined;

  return (
    <div className="relative">
      <div
        className="relative aspect-[3/1] w-full shrink-0 rounded-t-lg bg-cover bg-center"
        style={{ backgroundImage: `url('${coverSrc}')` }}
      />

      <div className="-mt-17 px-4 pb-3 text-center">
        <Avatar className="border-background mx-auto size-16 border-4 sm:size-35">
          <AvatarImage src={avatarSrc} alt={fullName} />
          <AvatarFallback className="text-lg font-medium">
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>

        <h3 className="mt-2 text-base font-semibold sm:text-lg">{fullName}</h3>

        <div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-3.5 sm:size-4" />
            <span>{role}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 sm:size-4" />
            <span className="text-blue-500">{location}</span>
          </div>
          {joinedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 sm:size-4" />
              <span>Joined {joinedDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
