"use client";

import { BadgeCheck, CalendarDays, Mail, MapPin, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DrawerProfileAboutUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  status?: string;
  language?: string;
  bio?: string;
  location?: {
    country?: string;
    city?: string;
  };
  trainerProfile?: {
    qualities?: string[];
    availability?: { days?: string[] | string };
    plan?: { name?: string; price?: number; durationInDays?: number };
  };
};

export function DrawerProfileAbout({ user }: { user: DrawerProfileAboutUser }) {
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "Trainer";
  const locationParts = [user?.location?.city, user?.location?.country].filter(
    Boolean
  );
  const location =
    locationParts.length > 0 ? locationParts.join(", ") : "-";
  const role = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Staff";
  const status = user?.status
    ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
    : "-";
  const email = user?.email || "-";
  const phone = user?.phone || "-";
  const language = user?.language || "-";
  const bio = user?.bio?.trim();
  const plan = user?.trainerProfile?.plan;
  const availability = user?.trainerProfile?.availability?.days;
  const days =
    Array.isArray(availability)
      ? availability.join(", ")
      : typeof availability === "string"
        ? availability
        : "Not specified";
  const qualities = user?.trainerProfile?.qualities ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">About</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {/* Left column */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="text-muted-foreground size-4 shrink-0" />
              <span>{fullName}</span>
            </div>
            <div className="flex items-center gap-3">
              <BadgeCheck className="text-muted-foreground size-4 shrink-0" />
              <span>
                {role} – {status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-muted-foreground size-4 shrink-0" />
              <span>{location}</span>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="text-muted-foreground size-4 shrink-0" />
              <span className="break-all">{email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-muted-foreground size-4 shrink-0" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-4 text-xs font-semibold">
                EN
              </span>
              <span>{language}</span>
            </div>

            {plan && (
              <>
                <div className="flex items-center gap-3">
                  <CalendarDays className="text-muted-foreground size-4 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      Plan
                    </p>
                    <p className="font-medium">{plan.name || "Custom"}</p>
                  </div>
                </div>
                {typeof plan.price === "number" && (
                  <p className="text-muted-foreground pl-7 text-xs">
                    ${plan.price}
                    {plan.durationInDays
                      ? ` / ${plan.durationInDays} days`
                      : ""}
                  </p>
                )}
                <div className="pl-7">
                  <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                    Availability
                  </p>
                  <p className="text-xs">{days}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {qualities.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <p className="text-muted-foreground mb-1.5 text-xs font-medium uppercase">
              Qualities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {qualities.map((q, i) => (
                <span
                  key={i}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs"
                >
                  {q}
                </span>
              ))}
            </div>
          </div>
        )}

        {bio && (
          <div className="mt-4 border-t pt-3">
            <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
              Bio
            </p>
            <p>{bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
