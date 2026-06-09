"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, RefreshCcw, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useAuth } from "@/lib/api/services/auth/context";
import {
  notificationsApi,
  type Notification as ApiNotification,
} from "@/lib/api/services/notifications/notifications";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NotificationsDataTable, {
  type Notification,
} from "@/app/dashboard/(auth)/pages/notifications/data-table";

const FETCH_LIMIT = 100;

function normalizeNotifications(payload: any): ApiNotification[] {
  const body = payload?.data ?? payload;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.notifications)) return body.notifications;
  if (Array.isArray(body?.results)) return body.results;
  if (Array.isArray(body?.items)) return body.items;

  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.data?.notifications)) return body.data.notifications;
  if (Array.isArray(body?.data?.results)) return body.data.results;
  if (Array.isArray(body?.data?.items)) return body.data.items;

  return [];
}

function toTemplateType(type?: string): Notification["type"] {
  if (type === "success") return "team";
  if (type === "warning") return "ticket";
  if (type === "error") return "ticket";
  return "message";
}

function toRelativeTime(value?: string | null) {
  if (!value) return "just now";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "just now";

    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "just now";
  }
}

function getStoredUserId() {
  if (typeof window === "undefined") return undefined;

  const keys = ["currentUser", "loggedInUser", "user"];

  for (const key of keys) {
    const stored = localStorage.getItem(key);
    if (!stored) continue;

    try {
      const parsed = JSON.parse(stored);
      const id = parsed?._id || parsed?.id || parsed?.userId;
      if (id) return String(id);
    } catch {
      // ignore bad localStorage value
    }
  }

  return undefined;
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();

  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userId = useMemo(() => {
    const anyUser = user as any;
    const fromContext = anyUser?._id || anyUser?.id || anyUser?.userId;

    if (fromContext) return String(fromContext);

    return getStoredUserId();
  }, [user]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.isRead).length,
    [items]
  );

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await notificationsApi.getAll(String(userId), {
        page: 1,
        limit: FETCH_LIMIT,
      });

      const list = normalizeNotifications(res);

      list.sort((a, b) => {
        const at = Date.parse(a.createdAt || a.updatedAt || "");
        const bt = Date.parse(b.createdAt || b.updatedAt || "");

        if (!Number.isFinite(at) && !Number.isFinite(bt)) return 0;
        if (!Number.isFinite(at)) return 1;
        if (!Number.isFinite(bt)) return -1;

        return bt - at;
      });

      setItems(list);
    } catch (error: any) {
      const message = error?.message || "Could not load notifications.";
      setErrorMessage(message);
      setItems([]);
      toast.error("Could not load notifications", { description: message });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      setItems((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );

      try {
        await notificationsApi.markAsRead(notificationId, {
          userId: String(userId),
          isRead: true,
        });
      } catch {
        // optimistic update keep kar rahe hain
      }
    },
    [userId]
  );

  const handleDelete = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.delete(notificationId);

      setItems((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted.");
    } catch (error: any) {
      const message = error?.message || "Could not delete notification.";
      toast.error("Action failed", { description: message });
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (!userId || items.length === 0) return;

    try {
      await notificationsApi.markAllAsRead(String(userId));

      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch (error: any) {
      const message = error?.message || "Could not mark all as read.";
      toast.error("Action failed", { description: message });
    }
  }, [items.length, userId]);

  const tableData: Notification[] = useMemo(
    () =>
      items.map((item, index) => ({
        id: index + 1,
        title: item.title || "Notification",
        description: item.message || "",
        type: toTemplateType(item.type),
        time: toRelativeTime(item.createdAt || item.updatedAt),
        status: item.isRead ? "read" : "unread",
        actions: [
          ...(item.isRead
            ? []
            : [
                {
                  label: "Mark read",
                  variant: "outline" as const,
                  onClick: () => handleMarkRead(item._id),
                },
              ]),
          {
            label: "Delete",
            variant: "destructive" as const,
            onClick: () => handleDelete(item._id),
          },
        ],
      })),
    [handleDelete, handleMarkRead, items]
  );

  if (!userId) {
    return (
      <div className="mx-auto max-w-4xl xl:mt-8">
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Could not identify admin account. Please sign in again.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl xl:mt-8">
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Loading admin notifications...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 xl:mt-8">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button className="mt-4" variant="outline" onClick={loadNotifications}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 xl:mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
            Admin Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Latest admin account and gym updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{unreadCount} unread</Badge>

          <Button onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            <Check className="size-4" />
            Mark All as Read
          </Button>

          <Button onClick={loadNotifications} variant="outline">
            <RefreshCcw className="size-4" />
          </Button>

          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/settings/notifications">
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <NotificationsDataTable data={tableData} />
    </div>
  );
}