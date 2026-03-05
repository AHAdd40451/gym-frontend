"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DetailsDrawer } from "@/components/DetailsDrawer";
import {
  DrawerProfileHeader,
  DrawerProfileAbout,
  DrawerProfileGallery,
} from "@/app/dashboard/user/booking/drawer-profile";
import { getUsersByRole } from "@/lib/api/services/getstaff/staff";
import {
  CalendarDays,
  Clock3,
  ImageIcon,
  Mail,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

type StaffUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: string;
  profileImage?: string;
  bio?: string;
  phone?: string | null;
  language?: string;
  createdAt?: string;
  location?: {
    country?: string;
    city?: string;
  };
  gallery?: string[];
  coverImage?: string | null;
  trainerProfile?: {
    qualities?: string[];
    availability?: { days?: string[] | string };
    plan?: { name?: string; price?: number; durationInDays?: number };
  };
  [key: string]: unknown;
};

const CACHE_KEY = "booking_staff_cache_v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

const extractStaff = (res: any): StaffUser[] => {
  const candidates = [
    res?.data?.data?.users,
    res?.data?.users,
    res?.data?.data,
    res?.data,
    res?.users,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as StaffUser[];
  }
  return [];
};

const getInitials = (user: StaffUser) => {
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";
  return `${first}${last}`.toUpperCase() || "ST";
};

const fullName = (user: StaffUser) => `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Staff Member";
const fallbackImage = (user: StaffUser) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName(user))}`;

const statusClass = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "active") {
    return "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }
  if (s === "inactive") {
    return "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
  return "border-border bg-muted text-muted-foreground";
};

const BookingUsers = () => {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    const hydrateFromCache = () => {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return false;

        const parsed = JSON.parse(raw) as { ts: number; data: StaffUser[] };
        if (!parsed?.ts || !Array.isArray(parsed?.data)) return false;

        const isFresh = Date.now() - parsed.ts < CACHE_TTL_MS;
        if (!isFresh) return false;

        setStaff(parsed.data);
        setFromCache(true);
        setLoading(false);
        return true;
      } catch {
        return false;
      }
    };

    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await getUsersByRole("staff" as any, { page: 1, limit: 50 }, token);
        const users = extractStaff(res);
        setStaff(users);
        setFromCache(false);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: users }));
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Failed to fetch staff");
      } finally {
        setLoading(false);
      }
    };

    const hadFreshCache = hydrateFromCache();
    // Always refresh in background for accuracy even if cache exists.
    if (hadFreshCache) {
      fetchStaff();
      return;
    }

    fetchStaff();
  }, []);

  const filteredStaff = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return staff;
    return staff.filter((user) => {
      const name = fullName(user).toLowerCase();
      const email = (user.email || "").toLowerCase();
      const qualities = (user.trainerProfile?.qualities || []).join(" ").toLowerCase();
      return name.includes(q) || email.includes(q) || qualities.includes(q);
    });
  }, [staff, query]);

  const handleUserClick = (user: StaffUser) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="animate-pulse border border-border/60">
            <CardContent className="space-y-4 p-5">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
              <div className="h-8 w-full rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="mt-10 text-center text-destructive">{error}</p>;
  }

  return (
    <>
      <Card className="border border-border/80">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="size-5 text-primary" />
                Available Trainers
              </CardTitle>
              <CardDescription>
                Browse trainers and choose the best fit for your goals.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {fromCache ? (
                <Badge variant="outline" className="gap-1">
                  <Clock3 className="size-3.5" />
                  Cached
                </Badge>
              ) : null}
              <Badge variant="secondary">{filteredStaff.length} trainers</Badge>
            </div>
          </div>

          <div className="relative mt-2 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              placeholder="Search by name, email, or quality..."
            />
          </div>
        </CardHeader>
      </Card>

      {filteredStaff.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredStaff.map((user) => {
            const plan = user.trainerProfile?.plan;
            const availability = user.trainerProfile?.availability?.days;
            const days = Array.isArray(availability) ? availability.join(", ") : availability || "Not specified";
            const profileSrc = user.profileImage || fallbackImage(user);

            return (
              <Card
                key={user._id}
                onClick={() => handleUserClick(user)}
                className="group relative cursor-pointer overflow-hidden border border-border/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="pointer-events-none absolute inset-0 z-0">
                  <img
                    src={profileSrc}
                    alt={fullName(user)}
                    className="h-full w-full scale-110 object-cover opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                <CardContent className="relative z-10 space-y-4 p-5 transition-opacity duration-300 group-hover:opacity-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="size-16 ring-2 ring-primary/20 transition-all duration-300 group-hover:size-20 group-hover:ring-primary/50">
                          <AvatarImage
                            src={profileSrc}
                            alt={fullName(user)}
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <AvatarFallback className="bg-primary/10 text-base font-semibold">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="pointer-events-none absolute -bottom-1 -right-1 rounded-full border border-border bg-background p-1 opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
                          <ImageIcon className="size-3 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold leading-tight">{fullName(user)}</h4>
                        <p className="text-muted-foreground mt-0.5 text-sm">{user.role || "Staff"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={statusClass(user.status)}>
                      {(user.status || "active").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Mail className="size-4" />
                    <span className="truncate">{user.email || "-"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-border/70 bg-muted/30 p-2">
                      <p className="text-muted-foreground">Plan</p>
                      <p className="mt-0.5 font-medium">{plan?.name || "Custom"}</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-muted/30 p-2">
                      <p className="text-muted-foreground">Price</p>
                      <p className="mt-0.5 font-medium">{typeof plan?.price === "number" ? `$${plan.price}` : "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-md border border-border/70 bg-muted/20 p-2 text-xs">
                    <CalendarDays className="mt-0.5 size-3.5 text-primary" />
                    <p className="text-muted-foreground line-clamp-2">{days}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-muted-foreground text-xs">Tap to view details</span>
                    <Button size="sm" className="gap-1">
                      <Sparkles className="size-3.5" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="mt-6 border border-dashed border-border/80">
          <CardContent className="py-12 text-center text-muted-foreground">
            No staff users found.
          </CardContent>
        </Card>
      )}

      <DetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedUser ? undefined : "Trainer details"}
      >
        {selectedUser && (
          <div className="flex flex-col gap-4">
            <div className="bg-card shrink-0 overflow-hidden rounded-lg border">
              <DrawerProfileHeader
                user={selectedUser}
                fallbackImageUrl={fallbackImage(selectedUser)}
              />
            </div>

            <div className="flex min-h-0 flex-col gap-4">
              <DrawerProfileAbout user={selectedUser} />
              <DrawerProfileGallery
                gallery={selectedUser.gallery ?? []}
              />
            </div>
          </div>
        )}
      </DetailsDrawer>
    </>
  );
};

export default BookingUsers;
