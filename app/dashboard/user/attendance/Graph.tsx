"use client";

import React, { useEffect, useState } from "react";
import { getAttendanceByUserId } from "../../../../lib/api/services/attendence/attendence";

type ContributionDay = {
  date: string;
  count: number; // 0 | 1
};

type CurrentUser = {
  id: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getColor = (count: number) => (count === 1 ? "bg-[#39d353]" : "bg-[#161b22]");

const Graph = ({ currentUser }: { currentUser: CurrentUser }) => {
  const [loading, setLoading] = useState(true);
  const [dateMap, setDateMap] = useState<Map<string, number>>(new Map());
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser?.id) return;

    const toLocalDate = (iso: string) => {
      // Extract date part directly from ISO string to avoid timezone issues
      // If it's already in YYYY-MM-DD format, use it directly
      if (iso.includes("T")) {
        return iso.split("T")[0];
      }
      return iso.slice(0, 10);
    };

    const fetchAttendance = async () => {
      try {
        const res = await getAttendanceByUserId(currentUser.id);

        console.log("Full Attendance API Response:", JSON.stringify(res, null, 2)); // Debug log

        // API response structure: { data: { attendance: [...], success: true, ... }, error: null, status: 200 }
        const attendanceData = res?.data?.attendance || res?.attendance || [];

        console.log("Attendance Array:", attendanceData); // Debug log
        console.log("Number of attendance records:", attendanceData.length); // Debug log

        const map = new Map<string, number>();
        attendanceData.forEach((item: any) => {
          console.log("Processing item:", item); // Debug log
          const originalDate = item.date;
          const date = toLocalDate(originalDate);
          const isPresent = item.status === "present";
          console.log(
            `Original Date: ${originalDate}, Extracted Date: ${date}, Status: ${item.status}, IsPresent: ${isPresent}`
          ); // Debug log

          if (isPresent) {
            map.set(date, 1);
            console.log(`✅ Set date ${date} to 1 (present)`); // Debug log
          } else {
            map.set(date, 0);
            console.log(`❌ Set date ${date} to 0 (not present)`); // Debug log
          }
        });

        console.log("Final Date Map:", Array.from(map.entries())); // Debug log
        console.log("Date Map size:", map.size); // Debug log
        setDateMap(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [currentUser.id]);

  if (loading) {
    return <div className="text-sm text-gray-400">Loading attendance…</div>;
  }

  /* ---------- EXTRACT AVAILABLE YEARS ---------- */
  const allDates = Array.from(dateMap.keys()).map((d) => {
    const date = new Date(d + "T00:00:00Z");
    return date;
  });

  // Get all unique years from attendance data
  const availableYears = Array.from(new Set(allDates.map((d) => d.getFullYear()))).sort(
    (a, b) => b - a
  ); // Sort descending (newest first)

  // Default: show all years (selectedYear is null)
  // Only filter when user explicitly clicks a year
  const activeYear = selectedYear;

  /* ---------- BUILD 52 WEEK GRID ---------- */

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If year filter is active, show only that year
  let gridStart: Date;
  let gridEnd: Date;

  if (selectedYear !== null) {
    // Show selected year: Jan 1 to Dec 31 of that year (but not beyond today)
    gridStart = new Date(selectedYear, 0, 1); // January 1
    const yearEnd = new Date(selectedYear, 11, 31); // December 31
    gridEnd = yearEnd > today ? today : yearEnd; // Don't show future dates
    gridEnd.setHours(23, 59, 59);
  } else {
    // Default: show last 365 days (but not beyond today)
    const maxAttendanceDate =
      allDates.length > 0 ? new Date(Math.max(...allDates.map((d) => d.getTime()))) : today;

    // Don't go beyond today
    gridEnd = today;

    gridStart = new Date(gridEnd);
    gridStart.setDate(gridStart.getDate() - 365);
  }

  // Start from Sunday of the week containing gridStart
  const start = new Date(gridStart);
  start.setDate(start.getDate() - start.getDay()); // Sunday

  const startDateStr = start.toISOString().slice(0, 10);
  const endDateStr = gridEnd.toISOString().slice(0, 10);
  console.log(`📅 Grid date range: ${startDateStr} to ${endDateStr}`); // Debug log
  console.log(`📊 Date Map keys:`, Array.from(dateMap.keys())); // Debug log
  console.log(`📅 Selected Year: ${selectedYear || "All"}`); // Debug log
  console.log(`📅 Available Years:`, availableYears); // Debug log

  // Calculate number of weeks needed
  // For year view, show exactly that year (52-53 weeks)
  // For "All" view, show at least 52 weeks
  const totalDays = Math.ceil((gridEnd.getTime() - start.getTime()) / 86400000);
  const totalWeeks =
    selectedYear !== null
      ? Math.ceil(totalDays / 7) // Exact weeks for the year
      : Math.max(52, Math.ceil(totalDays / 7)); // At least 52 weeks for "All"

  const weeks: { date: string; count: number }[][] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const curr = new Date(start.getTime() + (w * 7 + d) * 86400000);
      const dateStr = curr.toISOString().slice(0, 10);

      // Get count from dateMap, but only if date is within grid range AND not in future
      let count = 0;
      if (curr >= gridStart && curr <= gridEnd && curr <= today) {
        // If year filter is active, only show dates from that year
        if (selectedYear === null || curr.getFullYear() === selectedYear) {
          count = dateMap.get(dateStr) ?? 0;
        }
      }

      // Debug: log if we find a match
      if (count === 1) {
        console.log(`🎯 Found present date in grid: ${dateStr} (week ${w}, day ${d})`);
      }

      week.push({
        date: dateStr,
        count: count
      });
    }
    weeks.push(week);
  }

  console.log("Grid built. Total weeks:", weeks.length); // Debug log
  const presentCount = weeks.flat().filter((d) => d.count === 1).length;
  console.log(`✅ Present days in grid: ${presentCount}`); // Debug log
  console.log(
    `📋 Sample grid dates (first week):`,
    weeks[0]?.map((d) => `${d.date}:${d.count}`)
  ); // Debug log

  /* ---------- MONTH LABELS ---------- */
  const monthLabels: { label: string; index: number }[] = [];
  let lastMonth = -1;
  let lastYear = -1;

  weeks.forEach((week, i) => {
    // Find the first day in the week that's within the grid range
    let weekDate: Date | null = null;
    for (const day of week) {
      const dayDate = new Date(day.date + "T00:00:00Z");
      if (dayDate >= gridStart && dayDate <= gridEnd) {
        weekDate = dayDate;
        break;
      }
    }

    // If no valid day found in week, skip
    if (!weekDate) return;

    const m = weekDate.getMonth();
    const y = weekDate.getFullYear();

    // Only add label if month changed
    if (m !== lastMonth || y !== lastYear) {
      monthLabels.push({ label: MONTHS[m], index: i });
      lastMonth = m;
      lastYear = y;
    }
  });

  return (
    <div className="relative w-full rounded-lg bg-[#0d1117] p-4 font-sans text-xs text-[#8b949e] sm:p-6">
      {/* ===== Top (Mobile) Year Filter ===== */}
      {availableYears.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:hidden">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(selectedYear === year ? null : year)}
              className={`right-2 shrink-0 rounded px-3 py-1 text-xs transition-colors ${
                selectedYear === year ? "bg-blue-600 text-white" : "bg-[#161b22] text-[#8b949e]"
              }`}>
              {year}
            </button>
          ))}
        </div>
      )}

      <div className="relative w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* ===== Graph Section ===== */}
          <div className="min-w-0 flex-1 overflow-x-auto sm:overflow-x-visible">
            <div className="relative mb-2 ml-10 h-4 min-w-[720px] sm:min-w-0">
              {monthLabels.map((m) => (
                <span
                  key={m.index}
                  className="absolute px-1 text-[10px]"
                  style={{ left: m.index * 18 }}>
                  {m.label}
                </span>
              ))}
            </div>

            <div className="flex min-w-[720px] gap-2 sm:min-w-0">
              <div className="flex h-[112px] shrink-0 flex-col justify-between text-[10px]">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div
                className="grid grid-flow-col grid-rows-7 gap-1"
                style={{ gridAutoColumns: "14px" }}>
                {weeks.map((week, wi) =>
                  week.map((day, di) => (
                    <div
                      key={`${wi}-${di}`}
                      title={`${day.count ? "Present" : "Absent"} on ${day.date}`}
                      className={`h-3 w-3.1 rounded-sm ${getColor(
                        day.count
                      )} hover:ring-1 hover:ring-gray-400`}
                    />
                   
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Desktop Year Filter - Right Side ===== */}
        {availableYears.length > 0 && (
          <div
            className="absolute top-0 left-[61.4rem] hidden flex-col gap-1 sm:flex"
            style={{ top: "2px", height: "112px", justifyContent: "space-between", zIndex: 10 }}>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                className={`rounded px-2 py-1 cursor-pointer text-left text-xs whitespace-nowrap transition-colors ${
                  selectedYear === year
                    ? "bg-blue-600 font-medium text-white"
                    : "text-[#8b949e] hover:text-white"
                }`}>
                {year}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== Legend ===== */}
      <div className="mt-4 flex items-center gap-2 text-[11px]">
        <span>Absent</span>
        <div className="h-3 w-3 rounded-sm bg-[#161b22]" />
        <div className="h-3 w-3 rounded-sm bg-[#39d353]" />
        <span>Present</span>
      </div>
    </div>
  );
};

export default Graph;
