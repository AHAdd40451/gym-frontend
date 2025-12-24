import { useCallback, useEffect, useState } from "react";
import { BellIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from "date-fns";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { notificationsApi, type Notification } from "@/lib/api/services/notifications/notifications";

const Notifications = () => {
  const isMobile = useIsMobile();
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const readCurrentUser = () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const [currentUser, setCurrentUser] = useState(readCurrentUser);

  const userId = currentUser?._id || currentUser?.id || null;
  const viewAllHref = currentUser?.role === "user" ? "/dashboard/user/notifications" : "#";

  const normalizeNotifications = (payload: any) => {
    const body = payload?.data ?? payload;
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body?.notifications)) return body.notifications;
    if (Array.isArray(body?.results)) return body.results;
    if (Array.isArray(body?.items)) return body.items;
    if (Array.isArray(body?.data?.data)) return body.data.data;
    return [];
  };

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationsApi.getUnreadCount(String(userId));
      const data = res?.data ?? res;
      const count = data?.count ?? data?.data?.count ?? 0;
      setUnreadCount(Number.isFinite(count) ? count : 0);
    } catch {
      setUnreadCount(0);
    }
  }, [userId]);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await notificationsApi.getAll(String(userId), { page: 1, limit: 10 });
      const list = normalizeNotifications(res);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await notificationsApi.markAllAsRead(String(userId));
      if (res?.success || res?.data?.success) {
        setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      // ignore
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string, ownerId?: string) => {
    try {
      const res = await notificationsApi.markAsRead(notificationId, {
        userId: ownerId,
        isRead: true
      });
      if (res?.success || res?.data?.success) {
        setItems((prev) =>
          prev.map((item) =>
            item._id === notificationId ? { ...item, isRead: true } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    refreshUnreadCount();

    const handleAuthChange = () => {
      setCurrentUser(readCurrentUser());
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [loadNotifications, refreshUnreadCount]);

  useEffect(() => {
    if (open) {
      loadNotifications();
      refreshUnreadCount();
    }
  }, [open, loadNotifications, refreshUnreadCount]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          <>
            <BellIcon className="animate-tada" />
            {unreadCount > 0 && (
              <span className="bg-destructive absolute end-0 top-0 block size-2 shrink-0 rounded-full"></span>
            )}
          </>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={isMobile ? "center" : "end"} className="ms-4 w-80 p-0">
        <DropdownMenuLabel className="bg-background dark:bg-muted sticky top-0 z-10 p-0">
          <div className="flex justify-between border-b px-6 py-4">
            <div className="font-medium">Notifications</div>
            <div className="flex items-center gap-3">
              <Button
                variant="link"
                className="h-auto p-0 text-xs"
                size="sm"
                onClick={markAllAsRead}
                disabled={!items.length}>
                Mark all read
              </Button>
              {viewAllHref !== "#" && (
                <Button variant="link" className="h-auto p-0 text-xs" size="sm" asChild>
                  <Link href={viewAllHref}>View all</Link>
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <ScrollArea className="h-[350px]">
          {loading ? (
            <div className="text-muted-foreground px-6 py-6 text-sm">Loading notifications...</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground px-6 py-6 text-sm">No notifications</div>
          ) : (
            items.map((item) => {
              const timestamp = item.createdAt || item.updatedAt;
              const timeLabel = timestamp
                ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
                : "just now";

              return (
                <DropdownMenuItem
                  key={item._id}
                  onSelect={() => {
                    if (!item.isRead) {
                      markAsRead(item._id, item.userId);
                    }
                  }}
                  className="group flex cursor-pointer items-start gap-9 rounded-none border-b px-4 py-3">
                  <div className="flex flex-1 items-start gap-2">
                    <div className="flex-none">
                      <Avatar className="size-8">
                        <AvatarFallback>{item.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="dark:group-hover:text-default-800 truncate text-sm font-medium">
                        {item.title}
                      </div>
                      <div className="dark:group-hover:text-default-700 text-muted-foreground line-clamp-1 text-xs">
                        {item.message}
                      </div>
                      <div className="dark:group-hover:text-default-500 text-muted-foreground flex items-center gap-1 text-xs">
                        <ClockIcon className="size-3!" />
                        {timeLabel}
                      </div>
                    </div>
                  </div>
                  {!item.isRead && (
                    <div className="flex-0">
                      <span className="bg-destructive/80 block size-2 rounded-full border" />
                    </div>
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
