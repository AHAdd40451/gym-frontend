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
      case "Basic Plan":
        return "sky";
      case "Premium Plan":
        return "rose";
      case "Elite Plan":
        return "emerald";
      default:
        return "amber";
    }
  };

  const handleAddSubscription = () => {
    router.push("/dashboard/admin/all-sub/add");
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getAllSubscriptions({ page: 1, limit: 50 }, "");

      if (res?.data?.data && Array.isArray(res.data.data)) {
        const formatted: CalendarEvent[] = res.data.data.map((item: any) => ({
          id: item.id,
          title: item.planName || "No Plan",
          description: `User: ${item.firstName || "Walk-in Customer"}`,
          start: new Date(item.startDate),
          end: new Date(item.endDate),
          color: getColorByPlan(item.planName),
          location: item.firstName || "Walk-in Customer",
        }));

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
      <div className="w-full h-[400px] flex items-center justify-center">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">All Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer subscriptions and walk-in customers.
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