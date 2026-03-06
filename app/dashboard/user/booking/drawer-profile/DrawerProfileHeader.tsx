"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import apiClient from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/constants/constants";
import { useAuth } from "@/lib/api/services/auth/context";

const DEFAULT_COVER_URL =
  "https://images.unsplash.com/photo-1735926199195-85b726600751?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000";

export type DrawerProfileHeaderUser = {
  _id?: string;
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
  subscriptionFees?: number | null;
};

function getInitials(user: DrawerProfileHeaderUser) {
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";
  return `${first}${last}`.toUpperCase() || "ST";
}

export function DrawerProfileHeader({
  user,
  fallbackImageUrl,
  subscribingUserId,
  hasActiveSubscription = false,
  subscriptionEndDate = null,
}: {
  user: DrawerProfileHeaderUser;
  fallbackImageUrl?: string;
  /** User ID to subscribe to the trainer (e.g. member). If not set, uses logged-in user. */
  subscribingUserId?: string;
  /** When true, show "Subscribed" instead of "Subscribe" and disable checkout. */
  hasActiveSubscription?: boolean;
  /** Optional end date of current period to display (e.g. "Valid until Jan 15, 2026"). */
  subscriptionEndDate?: string | null;
}) {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    const trainerId = user._id;
    if (!trainerId) {
      toast.error("Invalid trainer.");
      return;
    }
    const userId =
      subscribingUserId ??
      (authUser as { id?: string; _id?: string } | null)?.id ??
      (authUser as { id?: string; _id?: string } | null)?._id;
    if (!userId) {
      toast.error("Please log in or select a member to subscribe.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.STRIPE.CREATE_TRAINER_CHECKOUT_SESSION,
        {
          trainerId,
          userId,
          price: user?.subscriptionFees,
        }
      );
      const data = response?.data;
      if (data?.success && data?.url) {
        window.location.href = data.url;
        return;
      }
      toast.error(data?.message ?? "Could not start checkout.");
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
        ? String(
            (err as { response: { data?: { message?: string } } }).response.data
              ?.message
          )
        : err instanceof Error
          ? err.message
          : "Failed to start checkout.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="mt-2 flex flex-col items-center gap-1">
          {hasActiveSubscription ? (
            <>
              <span className="rounded-md bg-emerald-600 px-5 py-1.5 text-base font-semibold text-white dark:text-emerald-400">
                Subscribed
              </span>
              {subscriptionEndDate && (
                <span className="text-muted-foreground text-xs">
                  Valid until{" "}
                  {new Date(subscriptionEndDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={loading}
              className="cursor-pointer rounded-md bg-primary px-5 py-1.5 text-base font-semibold text-white shadow transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? "Subscribing…" : "Subscribe"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
