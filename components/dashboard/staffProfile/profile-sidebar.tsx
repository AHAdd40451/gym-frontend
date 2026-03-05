"use client";

import { BadgeCheck, Mail, MapPin, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StaffUser = {
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
};

export function ProfileSidebar({ user }: { user?: StaffUser | null }) {
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "Trainer";
  const locationParts = [user?.location?.city, user?.location?.country].filter(Boolean);
  const location = locationParts.length ? locationParts.join(", ") : "-";
  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Staff";
  const status = user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "-";
  const email = user?.email || "-";
  const phone = user?.phone || "-";
  const language = user?.language || "-";
  const bio = user?.bio?.trim();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User className="text-muted-foreground h-4 w-4" />
              <span>{fullName}</span>
            </div>
            <div className="flex items-center gap-3">
              <BadgeCheck className="text-muted-foreground h-4 w-4" />
              <span>{role} - {status}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-muted-foreground h-4 w-4" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-muted-foreground h-4 w-4" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-4 text-xs font-semibold">EN</span>
              <span>{language}</span>
            </div>
          </div>
          {bio && (
            <div className="pt-3 text-sm">
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Bio</p>
              <p>{bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
