"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllSubscriptions } from "@/lib/api/services/subcription/subcription";
import { EventCalendar } from "./event-calendar";
import { CalendarEvent } from "./";

export default function EventCalendarApp() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getColorByPlan = (planName?: string): CalendarEvent["color"] => {
    switch (planName) {
      case "Premium Plan":
        return "rose";
      case "Medium Plan":
        return "amber";
      case "Small Plan":
        return "sky";
      case "Basic Plan":
        return "sky";
      case "Elite Plan":
        return "emerald";
      default:
        return "amber";
    }
  };

  const getLocalCalendarDate = (dateValue?: string | Date) => {
    if (!dateValue) {
      const today = new Date();
      return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        12,
        0,
        0,
        0
      );
    }

    const rawDate = String(dateValue);

    // If value is coming as YYYY-MM-DD from date input
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      const [year, month, day] = rawDate.split("-").map(Number);

      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    // If value is coming from MongoDB as ISO date
    const parsedDate = new Date(rawDate);

    if (Number.isNaN(parsedDate.getTime())) {
      const fallback = new Date();

      return new Date(
        fallback.getFullYear(),
        fallback.getMonth(),
        fallback.getDate(),
        12,
        0,
        0,
        0
      );
    }

    return new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
      12,
      0,
      0,
      0
    );
  };

  const formatDate = (dateValue?: string | Date) => {
    if (!dateValue) return "";

    const date = getLocalCalendarDate(dateValue);

    return date.toLocaleDateString();
  };

  const handleAddSubscription = () => {
    router.push("/dashboard/admin/all-sub/add");
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getAllSubscriptions({ page: 1, limit: 50 }, "");

      if (res?.data?.data && Array.isArray(res.data.data)) {
        const formatted: CalendarEvent[] = res.data.data.map((item: any) => {
          const subscriptionStartDate = getLocalCalendarDate(
            item.startDate || item.currentPeriodStart || item.createdAt
          );

          // Keep event on same day only.
          // Do not use expiry date here, otherwise calendar shows long bars.
          const subscriptionEndDate = new Date(subscriptionStartDate);
          subscriptionEndDate.setHours(13, 0, 0, 0);

          const expiryDate = item.endDate || item.currentPeriodEnd;

          const customerName =
            [item.firstName, item.lastName].filter(Boolean).join(" ") ||
            [item.user?.firstName, item.user?.lastName]
              .filter(Boolean)
              .join(" ") ||
            item.user?.name ||
            "Customer";

          const planName = item.planName || item.plan?.name || "No Plan";

          return {
            id: item.id || item._id,
            title: planName,
            description: `Customer: ${customerName}${
              expiryDate ? ` | Expires: ${formatDate(expiryDate)}` : ""
            }`,
            start: subscriptionStartDate,
            end: subscriptionEndDate,
            color: getColorByPlan(planName),
            location: customerName,
          };
        });

        setEvents(formatted);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="space-y-4 subscription-calendar">
      <style>
        {`
          .subscription-calendar .line-through,
          .subscription-calendar [class*="line-through"] {
            text-decoration-line: none !important;
            text-decoration: none !important;
          }

          .subscription-calendar [style*="line-through"] {
            text-decoration-line: none !important;
            text-decoration: none !important;
          }
        `}
      </style>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">All Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer subscriptions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSubscription}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Subscription
        </button>
      </div>

      <EventCalendar
        events={events}
        initialView="month"
        onEventSelect={(event) => {
          router.push(`/dashboard/admin/all-sub/${event.id}`);
        }}
        onEventCreate={(startTime) => {
          console.log("Create event at:", startTime);
        }}
        onEventUpdate={(event) => {
          console.log("Update event:", event);
        }}
      />
    </div>
  );
}