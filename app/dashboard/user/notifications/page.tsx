"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentProps } from "react";
import { toast } from "sonner";
import {
  BellIcon,
  CheckCircle2Icon,
  ClockIcon,
  RefreshCcwIcon,
  SearchIcon,
  Trash2Icon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/api/services/auth/context";
import {
  notificationsApi,
  type Notification
} from "@/lib/api/services/notifications/notifications";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Pagination = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
};

const LIMIT = 20;

function normalizeNotifications(payload: any): Notification[] {
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

function extractPagination(payload: any): Pagination | null {
  const body = payload?.data ?? payload;
  return (
    body?.pagination ??
    body?.meta?.pagination ??
    body?.data?.pagination ??
    body?.data?.meta?.pagination ??
    null
  );
}

function formatRelativeTime(timestamp?: string | null) {
  if (!timestamp) return "just now";

  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return "just now";
  }
}

function mergeUniqueById(existing: Notification[], incoming: Notification[]) {
  const seen = new Set(existing.map((n) => n._id));
  const merged = [...existing];
  for (const item of incoming) {
    if (item?._id && !seen.has(item._id)) {
      merged.push(item);
      seen.add(item._id);
    }
  }
  return merged;
}

function getTypeBadgeVariant(type: Notification["type"]): ComponentProps<typeof Badge>["variant"] {
  if (type === "success") return "success";
  if (type === "warning") return "warning";
  if (type === "error") return "destructive";
  return "info";
}

export default function NotificationsPage() {
  const { user } = useAuth();

  const [items, setItems] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<Notification["type"] | "all">("all");
  const [query, setQuery] = useState("");

  const userId = useMemo(() => {
    const anyUser = user as any;
    const fromContext = (anyUser?._id || anyUser?.id) as string | undefined;
    if (fromContext) return fromContext;

    if (typeof window === "undefined") return undefined;

    const stored = localStorage.getItem("currentUser");
    if (!stored) return undefined;
    try {
      const parsed = JSON.parse(stored);
      return (parsed?._id || parsed?.id) as string | undefined;
    } catch {
      return undefined;
    }
  }, [user]);

  const userLabel = useMemo(() => {
    if (!user) return "You";
    return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "You";
  }, [user]);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(null);
      return;
    }

    try {
      const res = await notificationsApi.getUnreadCount(String(userId));
      const data = (res as any)?.data ?? res;
      const count = data?.count ?? (data as any)?.data?.count ?? 0;
      setUnreadCount(Number.isFinite(count) ? count : 0);
    } catch {
      setUnreadCount(null);
    }
  }, [userId]);

  const loadPage = useCallback(
    async (targetPage: number, options?: { append?: boolean }) => {
      if (!userId) {
        setItems([]);
        setPagination(null);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const filters: any = {
          page: targetPage,
          limit: LIMIT
        };

        if (showUnreadOnly) filters.isRead = false;
        if (typeFilter !== "all") filters.type = typeFilter;

        const res = await notificationsApi.getAll(String(userId), filters);
        const list = normalizeNotifications(res);
        const nextPagination = extractPagination(res);

        setPagination(nextPagination);
        setItems((prev) => (options?.append ? mergeUniqueById(prev, list) : list));

        const deriveHasMore = () => {
          if (nextPagination) {
            if (typeof nextPagination.hasNext === "boolean") return nextPagination.hasNext;
            if (typeof nextPagination.totalPages === "number") {
              return targetPage < nextPagination.totalPages;
            }
            if (typeof nextPagination.total === "number") {
              const perPage = Number(nextPagination.limit || LIMIT);
              return targetPage * perPage < nextPagination.total;
            }
          }
          return list.length >= LIMIT;
        };

        setHasMore(deriveHasMore());
      } catch (error: any) {
        const message = error?.message || "Could not load notifications. Check API and token.";
        setErrorMessage(message);
        setItems([]);
        setPagination(null);
        setHasMore(false);

        toast.error("Could not load notifications", {
          description: message
        });
      } finally {
        setLoading(false);
      }
    },
    [showUnreadOnly, typeFilter, userId]
  );

  useEffect(() => {
    setPage(1);
    loadPage(1, { append: false });
    refreshUnreadCount();
  }, [loadPage, refreshUnreadCount]);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return items;

    return items.filter((item) => {
      const haystack = `${item.title || ""} ${item.message || ""}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [items, query]);

  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    list.sort((a, b) => {
      const at = Date.parse(a.createdAt || a.updatedAt || "");
      const bt = Date.parse(b.createdAt || b.updatedAt || "");
      if (!Number.isFinite(at) && !Number.isFinite(bt)) return 0;
      if (!Number.isFinite(at)) return 1;
      if (!Number.isFinite(bt)) return -1;
      return bt - at;
    });
    return list;
  }, [filteredItems]);

  const totalCount = useMemo(() => {
    const total = pagination?.total;
    return typeof total === "number" ? total : null;
  }, [pagination]);

  const derivedUnreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const statsTotal = totalCount ?? items.length;
  const statsUnread = unreadCount ?? derivedUnreadCount;
  const statsRead = Math.max(0, statsTotal - statsUnread);

  const handleRefresh = async () => {
    setPage(1);
    await loadPage(1, { append: false });
    await refreshUnreadCount();
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    await loadPage(nextPage, { append: true });
    setPage(nextPage);
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;

    try {
      await notificationsApi.markAllAsRead(String(userId));
      setItems((prev) => (showUnreadOnly ? [] : prev.map((n) => ({ ...n, isRead: true }))));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (error: any) {
      const message = error?.message || "Could not mark all as read.";
      toast.error("Action failed", { description: message });
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    if (!userId) return;

    setItems((prev) => {
      if (showUnreadOnly) return prev.filter((n) => n._id !== notificationId);
      return prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n));
    });
    setUnreadCount((prev) => (typeof prev === "number" ? Math.max(0, prev - 1) : prev));

    try {
      await notificationsApi.markAsRead(notificationId, {
        userId: String(userId),
        isRead: true
      });
    } catch {
      // Optimistic UI; keep state.
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsApi.delete(notificationId);
      setItems((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted.");
      refreshUnreadCount();
    } catch (error: any) {
      const message = error?.message || "Could not delete notification.";
      toast.error("Action failed", { description: message });
    }
  };

  const handleClearAll = async () => {
    if (!userId) return;
    if (!window.confirm("Clear all notifications? This cannot be undone.")) return;

    try {
      await notificationsApi.deleteAll(String(userId));
      setItems([]);
      setPagination(null);
      setHasMore(false);
      setUnreadCount(0);
      toast.success("All notifications cleared.");
    } catch (error: any) {
      const message = error?.message || "Could not clear notifications.";
      toast.error("Action failed", { description: message });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <Card className="via-background to-background border-none bg-gradient-to-r from-[var(--primary)]/10 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl font-semibold">
            <BellIcon className="size-6" />
            Notifications
          </CardTitle>
          <CardDescription>All updates and alerts related to your account.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-border/70 border shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="size-5" />
                All Notifications
                <Badge variant="secondary" className="ml-2">
                  {userLabel}
                </Badge>
              </CardTitle>
              <CardDescription>
                Use filters to find what you need. Click a notification to mark it as read.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={showUnreadOnly ? "outline" : "default"}
                  onClick={() => setShowUnreadOnly(false)}
                  disabled={loading}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={showUnreadOnly ? "default" : "outline"}
                  onClick={() => setShowUnreadOnly(true)}
                  disabled={loading}
                >
                  Unread
                </Button>
              </div>

             

              <div className="relative w-full sm:w-[260px]">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notifications..."
                  className="pl-9"
                  disabled={loading && items.length === 0}
                />
              </div>

              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
                <RefreshCcwIcon className="size-4" />
                Refresh
              </Button>

              <Button
                onClick={handleMarkAllRead}
                variant="outline"
                size="sm"
                disabled={loading || items.length === 0 || derivedUnreadCount === 0}
              >
                <CheckCircle2Icon className="size-4" />
                Mark all read
              </Button>

              <Button
                onClick={handleClearAll}
               
                size="sm"
                disabled={loading || items.length === 0}
              >
                <Trash2Icon className="size-4" />
                
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!userId ? (
            <div className="text-muted-foreground p-6 text-center">
              <p className="text-sm">Could not identify your account.</p>
              <p className="mt-2 text-xs">Please sign out and sign in again.</p>
            </div>
          ) : loading && items.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">
              Loading notifications...
            </div>
          ) : errorMessage ? (
            <div className="text-muted-foreground p-6 text-center">
              <p className="text-sm">Could not load notifications.</p>
              <p className="mt-2 text-xs">{errorMessage}</p>
              <div className="mt-4 flex justify-center">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  Try again
                </Button>
              </div>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center">
              <p className="text-sm">No notifications found.</p>
              <p className="mt-2 text-xs">
                {showUnreadOnly
                  ? "You have no unread notifications."
                  : "New notifications will appear here."}
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[650px] pr-4">
                <div className="space-y-3">
                  {sortedItems.map((item) => (
                    <Card
                      key={item._id}
                      className={cn(
                        "border-border/70 border shadow-none",
                        item.isRead ? "bg-background" : "bg-[var(--primary)]/5"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback>
                                {item.title?.trim?.()?.charAt(0)?.toUpperCase?.() || "N"}
                              </AvatarFallback>
                            </Avatar>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="leading-none font-semibold">{item.title}</p>
                                <Badge
                                  variant={getTypeBadgeVariant(item.type)}
                                  className="text-[11px]"
                                >
                                  {item.type}
                                </Badge>
                                {!item.isRead ? (
                                  <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                                    <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                                    Unread
                                  </span>
                                ) : null}
                              </div>

                              <p className="text-muted-foreground text-sm">{item.message}</p>

                              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                <ClockIcon className="size-3" />
                                {formatRelativeTime(item.createdAt || item.updatedAt)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {!item.isRead ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkRead(item._id)}
                              >
                                Mark read
                              </Button>
                            ) : null}

                            <Button
                              size="sm"
                             
                              onClick={() => handleDelete(item._id)}
                            >
                            <Trash2Icon className="size-4" />
                            </Button>
                          </div>
                        </div>

                        {item.updatedAt && item.updatedAt !== item.createdAt ? (
                          <>
                            <Separator className="my-3" />
                            <p className="text-muted-foreground text-xs">
                              Updated {formatRelativeTime(item.updatedAt)}
                            </p>
                          </>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">
                  Showing {sortedItems.length}
                  {totalCount !== null ? ` of ${totalCount}` : ""} notifications
                </p>

                {hasMore ? (
                  <Button onClick={handleLoadMore} variant="outline" size="sm" disabled={loading}>
                    {loading ? "Loading..." : "Load more"}
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
