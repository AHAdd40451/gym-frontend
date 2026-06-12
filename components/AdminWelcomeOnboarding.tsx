"use client";

import { useEffect, useState } from "react";

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

export default function AdminWelcomeOnboarding({ user }: { user?: any }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [gymId, setGymId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    const resolvedUser = user || storedUser;
    const resolvedGymId = getGymId(resolvedUser);

    if (!resolvedGymId) {
      return;
    }

    const finalGymId = String(resolvedGymId);
    setGymId(finalGymId);

    const storageKey = `admin_onboarding_seen_${finalGymId}`;
    const alreadySeen = localStorage.getItem(storageKey);

    if (!alreadySeen) {
      setOpen(true);
    }
  }, [user]);

  const handleFinish = () => {
    if (gymId) {
      localStorage.setItem(`admin_onboarding_seen_${gymId}`, "true");
    }

    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-background p-6 shadow-2xl">
        {step === 1 ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl text-primary-foreground">
              👋
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Welcome to your Gym Dashboard
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your subscription is active. This dashboard is your main control
              center where you can manage members, staff, subscriptions,
              attendance, plans, and billing.
            </p>

            <button
              onClick={() => setStep(2)}
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Next
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Quick Guide
            </p>

            <h2 className="mt-1 text-2xl font-bold text-foreground">
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
                  className="rounded-xl border border-border bg-muted/40 p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setStep(1)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
              >
                Back
              </button>

              <button
                onClick={handleFinish}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Start Using Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}