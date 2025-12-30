"use client";

import React, { useEffect, useState } from "react";
import { getAttendanceByUserId } from "../../../../lib/api/services/attendence/attendence";

/* ================= TYPES ================= */

type ContributionDay = {
  date: string;
  count: number | null;
};

type CurrentUser = {
  id: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getColor = (count: number) => (count === 1 ? "bg-[#39d353]" : "bg-[#161b22]");

/* ================= COMPONENT ================= */

const Graph = ({ currentUser }: { currentUser: CurrentUser }) => {
  const [loading, setLoading] = useState(true);
  const [dateMap, setDateMap] = useState<Map<string, number>>(new Map());
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  /* ================= FETCH ATTENDANCE ================= */

  useEffect(() => {
    if (!currentUser?.id) return;

    const toLocalDate = (iso: string) => (iso.includes("T") ? iso.split("T")[0] : iso.slice(0, 10));

    const fetchAttendance = async () => {
      try {
        const res = await getAttendanceByUserId(currentUser.id);
        const attendanceData = res?.data?.attendance || [];

        const map = new Map<string, number>();
        attendanceData.forEach((item: any) => {
          const date = toLocalDate(item.date);
          map.set(date, item.status === "present" ? 1 : 0);
        });

        setDateMap(map);

        /* ✅ AUTO SELECT CURRENT / LATEST YEAR */
        const years = attendanceData.map((i: any) => new Date(i.date).getFullYear());
        if (years.length > 0) {
          setSelectedYear(Math.max(...years));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [currentUser.id]);

  if (loading) {
    return <div className="text-sm text-gray-400">Loading attendance…</div>;
  }

  /* ================= YEARS ================= */

  const allDates = Array.from(dateMap.keys()).map((d) => new Date(d + "T00:00:00"));

  const availableYears = Array.from(new Set(allDates.map((d) => d.getFullYear()))).sort(
    (a, b) => b - a
  );

  /* ================= GRID RANGE ================= */

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const gridStart = new Date(selectedYear!, 0, 1);
  const gridEnd = selectedYear === today.getFullYear() ? today : new Date(selectedYear!, 11, 31);

  const start = new Date(gridStart);
  start.setDate(start.getDate() - start.getDay());

  const totalDays = (gridEnd.getTime() - start.getTime()) / 86400000;

  const totalWeeks = Math.ceil(totalDays / 7);

  /* ================= BUILD GRID ================= */

  const weeks: ContributionDay[][] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const week: ContributionDay[] = [];

    for (let d = 0; d < 7; d++) {
      const curr = new Date(start.getTime() + (w * 7 + d) * 86400000);
      const dateStr = curr.toISOString().slice(0, 10);

      let count: number | null = null;

      if (curr >= gridStart && curr <= gridEnd && curr <= today) {
        count = dateMap.get(dateStr) ?? 0;
      }

      week.push({ date: dateStr, count });
    }

    weeks.push(week);
  }

  /* ================= MONTH LABELS (FIXED) ================= */
  const monthLabels: { label: string; index: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, i) => {
    // ✅ Always use Thursday (index 4) to decide month
    const day = week[4];
    if (!day || day.count === null) return;

    const date = new Date(day.date + "T00:00:00");
    const month = date.getMonth();

    if (month !== lastMonth) {
      monthLabels.push({ label: MONTHS[month], index: i });
      lastMonth = month;
    }
  });

  /* ================= UI ================= */

  return (
    <div className="w-full rounded-lg bg-[#0d1117] p-3 text-xs text-[#8b949e] sm:p-6">
      {/* ===== MOBILE YEAR FILTER ===== */}
      <div className="mb-4 flex gap-2 overflow-x-auto sm:hidden">
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`shrink-0 rounded px-3 py-1 text-xs ${
              selectedYear === year ? "bg-blue-600 text-white" : "bg-[#161b22]"
            }`}>
            {year}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row">
        {/* ===== GRAPH ===== */}
        <div className="flex-1 overflow-x-auto sm:overflow-x-hidden">
          {/* ===== MONTH LABELS ===== */}
          <div className="relative mb-2 ml-8 h-4 min-w-[680px] sm:ml-10 sm:min-w-0">
            {monthLabels.map((m) => (
              <span
                key={m.index}
                className="absolute text-[10px] text-[#8b949e]"
                style={{ left: m.index * 18 }}>
                {m.label}
              </span>
            ))}
          </div>

          {/* ===== GRID ===== */}
          <div className="flex min-w-[680px] gap-2 sm:min-w-0">
            {/* Days */}
            <div className="flex h-[112px] flex-col justify-between text-[10px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Boxes */}
            <div
              className="grid grid-flow-col grid-rows-7 gap-1"
              style={{ gridAutoColumns: "13.5px" }}>
              {weeks.map((week, wi) =>
                week.map(
                  (day, di) =>
                    day.count !== null && (
                      <div
                        key={`${wi}-${di}`}
                        title={`${day.count ? "Present" : "Absent"} on ${day.date}`}
                        className={`h-3 w-3 rounded-sm ${getColor(day.count)}`}
                      />
                    )
                )
              )}
            </div>
          </div>
        </div>

        {/* ===== DESKTOP YEAR FILTER ===== */}
        <div className="mt-4 mr-2 hidden flex-row gap-2 sm:mt-0 sm:ml-4 sm:flex sm:flex-col">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`cursor-pointer rounded px-3 py-1 text-left text-xs transition-colors ${
                selectedYear === year ? "bg-blue-600 text-white " : "text-[#8b949e] hover:text-white"
              }`}>
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* ===== LEGEND ===== */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
        <span>Absent</span>
        <div className="h-3 w-3 bg-[#161b22]" />
        <div className="h-3 w-3 bg-[#39d353]" />
        <span>Present</span>
      </div>
    </div>
  );
};

export default Graph;
