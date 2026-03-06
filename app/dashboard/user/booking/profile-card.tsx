"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { getTrainerSubscriptionStatus } from "@/lib/api/services/subcription/subcription";
import { useAuth } from "@/lib/api/services/auth/context";
import {
  CalendarDays,
  ImageIcon,
  Mail,
  Phone,
  DollarSign,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

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
  subscriptionFees?: number | null;
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
  const searchParams = useSearchParams();
  const trainerIdFromParams = searchParams.get("trainer") ?? undefined;
  const payment = searchParams.get("payment") ?? undefined;

  const { user: authUser } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [trainerSubscriptionStatus, setTrainerSubscriptionStatus] = useState<{
    hasActiveSubscription: boolean;
    subscription: { currentPeriodEnd?: string | null } | null;
  } | null>(null);

  const hasOpenedDrawerFromParamsRef = useRef(false);

  const currentUserId =
    (authUser as { id?: string; _id?: string } | null)?.id ??
    (authUser as { id?: string; _id?: string } | null)?._id;

  useEffect(() => {
    if (!payment) return;
    const t = setTimeout(() => {
      if (payment === "success") {
        toast.success("Payment successful", {
          description: "You are now subscribed to the trainer.",
        });
      } else if (payment === "cancelled") {
        toast.error("Payment cancelled", {
          description: "You have not been subscribed to the trainer.",
        });
      }
    }, 100);
    return () => clearTimeout(t);
  }, [payment]);

  // Open drawer for trainer from query params (?trainer=123&payment=success)
  useEffect(() => {
    if (
      loading ||
      !trainerIdFromParams ||
      !staff.length ||
      hasOpenedDrawerFromParamsRef.current
    )
      return;
    const trainerUser = staff.find(
      (u) => String(u._id) === String(trainerIdFromParams)
    );
    if (trainerUser) {
      hasOpenedDrawerFromParamsRef.current = true;
      setSelectedUser(trainerUser);
      setDrawerOpen(true);
    }
  }, [loading, trainerIdFromParams, staff]);

  const fetchTrainerSubscriptionStatus = useCallback(
    async (trainerId: string) => {
      if (!currentUserId) {
        setTrainerSubscriptionStatus({ hasActiveSubscription: false, subscription: null });
        return;
      }
      try {
        const res = await getTrainerSubscriptionStatus(trainerId, currentUserId);
        setTrainerSubscriptionStatus({
          hasActiveSubscription: res.hasActiveSubscription,
          subscription: res.subscription,
        });
      } catch {
        setTrainerSubscriptionStatus({ hasActiveSubscription: false, subscription: null });
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await getUsersByRole("staff" as any, { page: 1, limit: 50 }, token);
        const users = extractStaff(res);
        setStaff(users);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Failed to fetch staff");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  useEffect(() => {
    if (drawerOpen && selectedUser?._id) {
      fetchTrainerSubscriptionStatus(selectedUser._id);
    } else {
      setTrainerSubscriptionStatus(null);
    }
  }, [drawerOpen, selectedUser?._id, fetchTrainerSubscriptionStatus]);

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

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 shrink-0" />
                      <span className="truncate">{user.email || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 shrink-0" />
                      <span className="truncate">{user.phone || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 shrink-0" />
                      <span>
                        {user.subscriptionFees != null
                          ? `$${Number(user.subscriptionFees).toLocaleString()} / subscription`
                          : "-"}
                      </span>
                    </div>
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
                hasActiveSubscription={trainerSubscriptionStatus?.hasActiveSubscription ?? false}
                subscriptionEndDate={trainerSubscriptionStatus?.subscription?.currentPeriodEnd ?? null}
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
