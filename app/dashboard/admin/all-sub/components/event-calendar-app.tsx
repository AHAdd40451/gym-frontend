
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

  const fetchData = async () => {
    try {
      setLoading(true); // start loading

      const res = await getAllSubscriptions({ page: 1, limit: 50 }, "");

      if (res?.data?.data && Array.isArray(res.data.data)) {
        const formatted: CalendarEvent[] = res.data.data.map((item: any) => ({
          id: item.id,
          title: item.planName || "No Plan",
          description: `User: ${item.firstName}`,
          start: new Date(item.startDate),
          end: new Date(item.endDate),
          color: getColorByPlan(item.planName),
          location: item.firstName,
        }));

        setEvents(formatted);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false); // stop loading
    }
  };

  useEffect(() => {
    fetchData(); // single fetch on component mount
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        Loading calendar...
      </div>
    );
  }

  return (
    <EventCalendar
      events={events}
      initialView="month"
      onEventSelect={(event) =>
        router.push(`/dashboard/admin/all-sub/${event.id}`)
      }
      onEventCreate={(startTime) => {
        // Handle event creation - you can customize this behavior
        console.log("Create event at:", startTime);
      }}
      onEventUpdate={(event) => {
        // Handle event update - you can customize this behavior
        console.log("Update event:", event);
      }}
    />
  );
}
