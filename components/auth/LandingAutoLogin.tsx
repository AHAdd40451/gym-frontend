"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://gym.coderivals.ltd/api";

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch (error) {
    console.error("JWT decode failed:", error);
    return null;
  }
}

function getUserFromResponse(json: any) {
  return (
    json?.data?.user ||
    json?.user ||
    json?.data ||
    null
  );
}

function saveAuthData(token: string, user: any) {
  const maxAge = 60 * 60 * 24 * 7;
  const encodedUser = encodeURIComponent(JSON.stringify(user));

  document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `auth-user=${encodedUser}; path=/; max-age=${maxAge}; SameSite=Lax`;

  localStorage.setItem("token", token);
  localStorage.setItem("authToken", token);
  localStorage.setItem("accessToken", token);

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("authUser", JSON.stringify(user));
  localStorage.setItem("adminUser", JSON.stringify(user));
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("loggedInUser", JSON.stringify(user));

  window.dispatchEvent(new Event("auth-changed"));
  window.dispatchEvent(new Event("storage"));
}

export default function LandingAutoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const runAutoLogin = async () => {
      const token = searchParams.get("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      localStorage.removeItem("user");
      localStorage.removeItem("authUser");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("loggedInUser");

      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Failed to fetch profile");
        }

        const profileUser = getUserFromResponse(json);

        if (!profileUser) {
          throw new Error("User profile not found");
        }

        const payload = decodeJwtPayload(token);

        const user = {
          ...profileUser,
          _id:
            profileUser._id ||
            profileUser.id ||
            payload?._id ||
            payload?.id ||
            payload?.userId ||
            payload?.sub ||
            "",
          id:
            profileUser.id ||
            profileUser._id ||
            payload?.id ||
            payload?._id ||
            payload?.userId ||
            payload?.sub ||
            "",
          email: profileUser.email || payload?.email || "",
          firstName: profileUser.firstName || payload?.firstName || "",
          lastName: profileUser.lastName || payload?.lastName || "",
          name:
            profileUser.name ||
            `${profileUser.firstName || ""} ${profileUser.lastName || ""}`.trim() ||
            payload?.name ||
            "",
          role: profileUser.role || payload?.role || "admin",
          gymId: profileUser.gymId || payload?.gymId || null,
          isSuperAdmin: Boolean(profileUser.isSuperAdmin || payload?.isSuperAdmin),
        };

        saveAuthData(token, user);

        window.location.replace(user.isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin/ecommerce");
      } catch (error) {
        console.error("Landing auto login error:", error);

        const payload = decodeJwtPayload(token);

        if (!payload) {
          router.replace("/login");
          return;
        }

        const fallbackUser = {
          _id: payload._id || payload.id || payload.userId || payload.sub || "",
          id: payload.id || payload._id || payload.userId || payload.sub || "",
          email: payload.email || "",
          firstName: payload.firstName || "",
          lastName: payload.lastName || "",
          name: payload.name || "",
          role: payload.role || "admin",
          gymId: payload.gymId || null,
          isSuperAdmin: Boolean(payload.isSuperAdmin),
        };

        saveAuthData(token, fallbackUser);

        window.location.replace(fallbackUser.isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin/ecommerce");
      }
    };

    runAutoLogin();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-sm text-white/60">Opening your dashboard...</p>
      </div>
    </div>
  );
}
