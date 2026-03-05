"use client";

import { Calendar, MapPin, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarFallback } from "@/lib/utils";

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
};
export function ProfileHeader({ user }: { user?: StaffUser | null }) {
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "Trainer";
  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Staff";
  const locationParts = [user?.location?.city, user?.location?.country].filter(Boolean);
  const location = locationParts.length ? locationParts.join(", ") : "-";
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="relative">

      <div
        className="relative aspect-3/1 w-full rounded-t-md bg-cover bg-center md:max-h-[240px]"
        style={{ backgroundImage: `url('${DEFAULT_COVER_URL}')` }}
      >
      </div>

      <div className="-mt-10 px-4 pb-4 text-center lg:-mt-14">

        <Avatar className="border-background mx-auto size-20 border-4 lg:size-28">
          <AvatarImage src={user?.profileImage || undefined} alt={fullName} />
          <AvatarFallback>{generateAvatarFallback(fullName)}</AvatarFallback>
        </Avatar>

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
