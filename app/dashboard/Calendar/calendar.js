"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

const BookingCalendar = ({ events: initialEvents }) => {
  // Use passed events or default example events
  const [events, setEvents] = useState(
    initialEvents || [
      { title: "Event 1", date: "2025-11-21" },
      { title: "Event 2", date: "2025-11-22" },
      { title: "Event 3", date: "2025-11-23" },
    ]
  );

  return (
    <div className="bg-white p-4 rounded shadow">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listWeek",
        }}
        events={events}
        height="auto"
      />
    </div>
  );
};

export default BookingCalendar;
