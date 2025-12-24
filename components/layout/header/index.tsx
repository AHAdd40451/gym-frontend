"use client";

import { useEffect } from "react";
import { PanelLeftIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import Notifications from "@/components/layout/header/notifications";
import Search from "@/components/layout/header/search";
import ThemeSwitch from "@/components/layout/header/theme-switch";
import UserMenu from "@/components/layout/header/user-menu";
import { ThemeCustomizerPanel } from "@/components/theme-customizer";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { getFcmToken } from "@/app/dashboard/firebase";
import { notificationsApi } from "@/lib/api/services/notifications/notifications";

const FCM_TOKEN_KEY_PREFIX = "fcm_token";
const FCM_REGISTERED_KEY_PREFIX = "fcm_token_registered";
const LEGACY_FCM_TOKEN_KEY = "fcm_token";
const LEGACY_FCM_REGISTERED_KEY = "fcm_token_registered";

const getUserIdFromStorage = (authToken: string | null) => {
  if (typeof window === "undefined") return null;

  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    try {
      const parsed = JSON.parse(currentUser);
      return parsed?._id || parsed?.id || null;
    } catch {
      return null;
    }
  }

  if (!authToken) return null;

  try {
    const payload = authToken.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = JSON.parse(atob(padded));
    return decoded?.userId || decoded?.id || null;
  } catch {
    return null;
  }
};

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    let active = true;

    const registerDevice = async () => {
      if (typeof window === "undefined") return;

      const authToken = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!authToken) return;

      const userId = getUserIdFromStorage(authToken);
      const tokenKey = `${FCM_TOKEN_KEY_PREFIX}:${userId || "unknown"}`;
      const registeredKey = `${FCM_REGISTERED_KEY_PREFIX}:${userId || "unknown"}`;

      const existingToken =
        localStorage.getItem(tokenKey) || localStorage.getItem(LEGACY_FCM_TOKEN_KEY);
      const registered = localStorage.getItem(registeredKey) === "true";

      if (existingToken && registered) return;

      const token = await getFcmToken();
      if (!token || !active) return;

      if (existingToken && existingToken !== token) {
        localStorage.removeItem(registeredKey);
        localStorage.removeItem(LEGACY_FCM_REGISTERED_KEY);
      }

      localStorage.setItem(tokenKey, token);
      localStorage.setItem(LEGACY_FCM_TOKEN_KEY, token);

      const response = await notificationsApi.registerDevice({
        token,
        platform: "web"
      });

      if (response?.success) {
        localStorage.setItem(registeredKey, "true");
      }
    };

    const runRegister = () => {
      registerDevice().catch((error) => {
        console.warn("FCM device registration failed", error);
      });
    };

    runRegister();
    window.addEventListener("auth-changed", runRegister);

    return () => {
      active = false;
      window.removeEventListener("auth-changed", runRegister);
    };
  }, []);

  return (
    <header className="bg-background/40 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-tl-xl md:rounded-tr-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <Button onClick={toggleSidebar} size="icon" variant="ghost">
          <PanelLeftIcon />
        </Button>
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Search />

        <div className="ml-auto flex items-center gap-2">
          <Notifications />
          <ThemeSwitch />
          {/* <ThemeCustomizerPanel /> */}
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
