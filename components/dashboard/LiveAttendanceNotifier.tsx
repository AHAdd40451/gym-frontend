"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5003/api"
).replace(/\/api\/?$/, "");

type LiveAttendanceEvent = {
  _id: string;
  date: string;
  status: string;
  checkInTime?: string;
  user?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  };
};

const readCurrentUser = (): { gymId?: string; role?: string } | null => {
  if (typeof window === "undefined") return null;

  for (const key of ["user", "currentUser", "authUser", "adminUser"]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (parsed?.gymId) return parsed;
    } catch {
      // ignore malformed entries and try the next key
    }
  }

  return null;
};

const getCheckInTime = (isoString?: string) => {
  if (!isoString) return "";

  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Mounted once at the dashboard layout level. Shows a live toast the
 * instant a biometric device punch is marked as attendance — works no
 * matter which dashboard page the admin/staff is currently viewing.
 */
export function LiveAttendanceNotifier() {
  useEffect(() => {
    const currentUser = readCurrentUser();

    if (!currentUser?.gymId) return;
    if (!["admin", "staff"].includes(currentUser.role || "")) return;

    const socket: Socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      socket.emit("joinGym", currentUser.gymId);
    });

    socket.on("attendance:new", (event: LiveAttendanceEvent) => {
      const name =
        `${event.user?.firstName || ""} ${event.user?.lastName || ""}`.trim() ||
        "A member";

      toast.success(`✅ ${name} marked present`, {
        description: getCheckInTime(event.checkInTime),
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
}
