"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function LandingAutoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = decodeJwtPayload(token);

    if (!payload) {
      router.replace("/login");
      return;
    }

    const user = {
      _id: payload._id || payload.id || payload.userId || payload.sub || "",
      id: payload.id || payload._id || payload.userId || payload.sub || "",
      email: payload.email || "",
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
      name: payload.name || "",
      role: payload.role || "admin",
    };

    const maxAge = 60 * 60 * 24 * 7;
    const encodedUser = encodeURIComponent(JSON.stringify(user));

    document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `auth-user=${encodedUser}; path=/; max-age=${maxAge}; SameSite=Lax`;

    localStorage.setItem("authToken", token);
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    window.dispatchEvent(new Event("auth-changed"));

    setTimeout(() => {
      window.location.href = "/dashboard/admin/ecommerce";
    }, 500);
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