"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api/services/users/users";
import { useAuth } from "@/lib/api/services/auth/context";

const features = [
  {
    title: "Dashboard Overview",
    description:
      "View key gym stats such as active members, today’s check-ins, revenue, and upcoming renewals.",
  },
  {
    title: "Member Management",
    description:
      "Add new members, view member details, update profiles, and manage each member’s gym journey.",
  },
  {
    title: "Subscriptions",
    description:
      "Create walk-in subscriptions, renew memberships, track expiry dates, and manage active or pending plans.",
  },
  {
    title: "Attendance Tracking",
    description:
      "Mark daily attendance, check member attendance history, and monitor gym activity.",
  },
  {
    title: "Staff and Trainers",
    description:
      "Manage your gym staff, trainers, roles, and access from one place.",
  },
  {
    title: "Plans and Billing",
    description:
      "Create membership plans, review billing information, and track gym revenue.",
  },
];

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  const keys = ["user", "authUser", "adminUser", "currentUser"];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (!value) continue;

    try {
      const parsed = JSON.parse(value);

      if (parsed?.user) return parsed.user;
      if (parsed?.state?.user) return parsed.state.user;

      return parsed;
    } catch {
      continue;
    }
  }

  return null;
};

const getGymId = (user: any) => {
  return (
    user?.gymId ||
    user?.gym?._id ||
    user?.gym ||
    user?.data?.gymId ||
    null
  );
};

const getUserId = (user: any) => {
  return user?._id || user?.id || user?.userId || null;
};

const updateUserInLocalStorage = (updatedUser: any) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    const accountsStr = localStorage.getItem("accounts");

    if (accountsStr) {
      const accounts = JSON.parse(accountsStr);
      const updatedUserId = getUserId(updatedUser);

      const updatedAccounts = accounts.map((acc: any) => {
        const accId = getUserId(acc);

        if (String(accId) === String(updatedUserId)) {
          return {
            ...acc,
            ...updatedUser,
          };
        }

        return acc;
      });

      localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
    }

    window.dispatchEvent(new Event("userUpdated"));
  } catch (error) {
    console.error("Failed to update user in localStorage:", error);
  }
};

export default function AdminWelcomeOnboarding({ user }: { user?: any }) {
  const { user: authUser, setUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [gymId, setGymId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [resolvedUser, setResolvedUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    const finalUser = user || authUser || storedUser;

    if (!finalUser) return;

    const resolvedGymId = getGymId(finalUser);
    const resolvedUserId = getUserId(finalUser);

    if (!resolvedGymId || !resolvedUserId) return;

    setResolvedUser(finalUser);
    setGymId(String(resolvedGymId));
    setUserId(String(resolvedUserId));

    const storageKey = `admin_onboarding_seen_${resolvedGymId}`;

    const alreadySeenInDatabase =
      finalUser?.hasSeenAdminWelcome === true ||
      finalUser?.hasSeenAdminWelcome === "true";

    if (alreadySeenInDatabase) {
      localStorage.setItem(storageKey, "true");
      setOpen(false);
      return;
    }

    const alreadySeenInLocalStorage = localStorage.getItem(storageKey);

    if (!alreadySeenInLocalStorage) {
      setOpen(true);
    }
  }, [user, authUser]);

  const handleFinish = async () => {
    if (!gymId || !userId) {
      setOpen(false);
      return;
    }

    try {
      setSaving(true);

      const storageKey = `admin_onboarding_seen_${gymId}`;

      localStorage.setItem(storageKey, "true");

      const updatedUser = {
        ...resolvedUser,
        hasSeenAdminWelcome: true,
      };

      setUser(updatedUser);
      updateUserInLocalStorage(updatedUser);

      setOpen(false);

      await usersApi.update(String(userId), {
        hasSeenAdminWelcome: true,
      });
    } catch (error) {
      console.error("Failed to save admin welcome status:", error);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-3 py-4 sm:px-4">
      <div className="max-h-[88svh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-2xl sm:p-6">
        {step === 1 ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground sm:h-16 sm:w-16 sm:text-3xl">
              👋
            </div>

            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Welcome to your Gym Dashboard
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your subscription is active. This dashboard is your main control
              center where you can manage members, staff, subscriptions,
              attendance, plans, and billing.
            </p>

            <button
              onClick={() => setStep(2)}
              className="mt-6 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:w-auto"
            >
              Next
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Quick Guide
            </p>

            <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              What you can do here
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Here is a quick overview of the main tools available in your gym
              management system.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-muted/40 p-3 sm:p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setStep(1)}
                disabled={saving}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-60"
              >
                Back
              </button>

              <button
                onClick={handleFinish}
                disabled={saving}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Start Using Dashboard"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}