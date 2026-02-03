"use client";
import React, { useEffect, useState } from "react";
import { getUserWithSubscriptionsDetails } from "@/lib/api/services/subcription/subcription";

// Helper badge component
function StatusBadge({ status }: { status?: string }) {
  const colorMap: { [key: string]: string } = {
    active: "bg-green-100 text-green-800",
    trialing: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    canceled: "bg-red-100 text-red-800",
    expired: "bg-gray-300 text-gray-700",
    past_due: "bg-orange-100 text-orange-800",
    unpaid: "bg-rose-200 text-rose-800",
  };
  const color = colorMap[status || ""] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status?.toUpperCase()}</span>
  );
}

// ----------------------------
// Types for membership data
// ----------------------------
interface Transaction {
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  buttonText: string;
  buttonIcon?: React.ReactNode;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: string;
}

interface Subscription {
  plan?: { name?: string; description?: string };
  status?: string;
  startDate?: string;
  endDate?: string;
  transactions?: Transaction[];
}

interface Membership {
  user?: UserProfile;
  subscriptions?: Subscription[];
}

// Membership plans (UI only)
const PLANS: Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: 20,
    description: 'Entry-level plan with access to premium models, unlimited Tab completions, and more.',
    buttonText: 'Free 7-day trial',
    buttonIcon: (
      <svg height="18" width="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16.5 3.5v2M7.5 3.5v2"/><path d="M2 11h20"/></svg>
    ),
  },
  {
    id: 'proplus',
    name: 'Pro+',
    price: 60,
    description: 'Get 3x more usage than Pro, unlock higher limits on Agent, and more.',
    buttonText: 'Upgrade to Pro+',
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: 200,
    description: 'Get maximum value with 20x usage limits and early access to advanced features.',
    buttonText: 'Upgrade to Ultra',
  },
];

const MembershipPage = () => {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        let userId: string | null = null;
        let currentUser: Record<string, unknown> | null = null;
        if (typeof window !== "undefined") {
          const u = localStorage.getItem("currentUser");
          const token = localStorage.getItem("authToken") || localStorage.getItem("token");
          if (u) {
            try {
              const parsed = JSON.parse(u);
              currentUser = parsed;
              userId = parsed?._id ?? parsed?.id ?? null;
            } catch {
              userId = null;
            }
          }
          if (!userId) {
            setError("User not logged in");
            setLoading(false);
            return;
          }
          try {
            const res = await getUserWithSubscriptionsDetails(userId, token);
            setMembership(res);
          } catch (apiErr) {
            // Fallback: show page with profile from currentUser, no subscriptions (e.g. backend endpoint missing)
            const fallback: Membership = {
              user: currentUser
                ? {
                    firstName: (currentUser.firstName as string) ?? "",
                    lastName: (currentUser.lastName as string) ?? "",
                    email: (currentUser.email as string) ?? "",
                    role: (currentUser.role as string) ?? "user",
                    status: "active",
                  }
                : undefined,
              subscriptions: [],
            };
            setMembership(fallback);
          }
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        setError(errMsg || "Could not fetch membership info");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="min-h-[300px] flex items-center justify-center text-xl">Loading membership...</div>;
  if (error && !membership) return <div className="text-red-500 p-5">{error}</div>;
  if (!membership) return <div className="min-h-[300px] flex items-center justify-center text-xl text-muted-foreground">Loading membership...</div>;

  const user = membership.user || {};
  const subscriptions = membership?.subscriptions || [];
  const activeSub = subscriptions.find((sub) => ["active", "trialing", "pending"].includes(sub.status || ""));

  return (
    <div className="max-w-2xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-8 text-center">My Membership</h1>
      <div className="grid gap-8">
        {activeSub ? (
          <div className="rounded-lg shadow-lg border px-6 py-5 bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  {activeSub.plan?.name || 'Unnamed Plan'}
                  <StatusBadge status={activeSub.status} />
                </h2>
                <p className="text-gray-500 text-sm mb-1">
                  Started: <span className="font-medium">{activeSub.startDate ? new Date(activeSub.startDate).toLocaleDateString() : "N/A"}</span>
                </p>
                <p className="text-gray-500 text-sm ">
                  Expires: <span className="font-medium">{activeSub.endDate ? new Date(activeSub.endDate).toLocaleDateString() : "N/A"}</span>
                </p>
                {activeSub.transactions && activeSub.transactions.length > 0 && (
                  <p className="mt-2 text-gray-500 text-xs">Last payment: <span className="font-medium">{activeSub.transactions[activeSub.transactions.length-1]?.createdAt ? new Date(activeSub.transactions[activeSub.transactions.length-1]?.createdAt as string).toLocaleDateString() : "-"}</span></p>
                )}
              </div>
              {/* <div className="self-end mt-2 md:mt-0">
                <button className="bg-linear-to-r from-green-500 to-green-700 py-2 px-6 rounded text-white font-medium hover:from-green-600 hover:to-green-800 transition">Upgrade Plan</button>
              </div> */}
            </div>
            {/* Details toggle */}
            <details className="bg-gray-50 rounded p-3 mt-2">
              <summary className="font-semibold cursor-pointer mb-2">View membership details</summary>
              <div className="mt-2 text-sm text-gray-700">
                <div>Status: <StatusBadge status={activeSub.status} /></div>
                <div>Start: {activeSub.startDate ? new Date(activeSub.startDate).toLocaleString() : "-"}</div>
                <div>Expires: {activeSub.endDate ? new Date(activeSub.endDate).toLocaleString() : "-"}</div>
                {activeSub.plan?.description && <div className="mt-2">{activeSub.plan.description}</div>}
                <div className="mt-2">{activeSub.transactions && activeSub.transactions.length > 0 ? (
                  <div>
                    <b>Transactions ({activeSub.transactions.length}):</b>
                    <ul className="list-disc pl-4">
                      {activeSub.transactions.map((t, i) => (
                        <li key={i} className="mb-1">{t.amount ? `$${t.amount}` : ""} {t.currency || ""} — <span className="">{t.status}</span> <span className="text-gray-400 ml-2">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}</span></li>
                      ))}
                    </ul>
                  </div>
                ) : <span className="text-gray-500">No transaction history.</span>}</div>
              </div>
            </details>
          </div>
        ) : (
          <div className="rounded-lg border px-6 py-10 flex flex-col items-center bg-white shadow-sm">
            <h2 className="font-bold text-xl text-center mb-2">No Active Membership</h2>
            <p className="text-gray-500 text-center mb-5">You do not currently have an active subscription plan.</p>
            <button className="bg-primary-600 hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-blue-400 py-2 px-7 rounded text-white font-semibold">Subscribe Now</button>
          </div>
        )}
        <div className="rounded-lg border px-6 py-5 bg-gray-50">
          <h3 className="text-lg font-bold mb-1">Profile</h3>
          <div className="grid grid-cols-1 gap-y-2 text-sm">
            <div><b>Name:</b> {user.firstName} {user.lastName}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Status:</b> {user.status}, Role: {user.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
