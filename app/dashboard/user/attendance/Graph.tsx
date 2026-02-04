"use client";

import React, { useEffect, useState } from "react";
import { getAttendanceByUserId } from "../../../../lib/api/services/attendence/attendence";

type CurrentUser = { id: string };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CELL = 12; 

const getColor = (count: number) =>
  count === 1 ? "bg-[#39d353]" : "bg-[#161b22]";

export default function Graph({ currentUser }: { currentUser: CurrentUser }) {
  const currentYear = new Date().getFullYear();

  const [loading, setLoading] = useState(true);
  const [dateMap, setDateMap] = useState<Map<string, number>>(new Map());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!currentUser?.id) return;

    (async () => {
      try {
        const res = await getAttendanceByUserId(currentUser.id);
        const data = res?.data?.attendance || res?.attendance || [];

        const map = new Map<string, number>();
        data.forEach((i: any) => {
          const d = new Date(i.date);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          map.set(key, i.status === "present" ? 1 : 0);
        });
        setDateMap(map);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser.id]);

  if (loading) return <div className="text-sm text-gray-400">Loading…</div>;

  /* ================= YEARS ================= */
  const years = Array.from(
    new Set(Array.from(dateMap.keys()).map(d => new Date(d).getFullYear()))
  ).sort((a,b)=>b-a);

  /* ================= RANGE ================= */
  const gridStart = new Date(selectedYear,0,1);
  const gridEnd = new Date(selectedYear,11,31,23,59,59);

  const start = new Date(gridStart);
  const day = start.getDay();
  start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));

  const days =
    Math.ceil((gridEnd.getTime() - start.getTime()) / 86400000) + 1;
  const weeksCount = Math.ceil(days / 7);

  const weeks: { date: string; count: number }[][] = [];

  for (let w = 0; w < weeksCount; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const curr = new Date(start.getTime() + (w*7 + d)*86400000);
      const key = `${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,"0")}-${String(curr.getDate()).padStart(2,"0")}`;
      const count = curr >= gridStart && curr <= gridEnd ? dateMap.get(key) ?? 0 : 0;
      week.push({ date: key, count });
    }
    weeks.push(week);
  }

  /* ================= MONTH LABELS ================= */
  const monthLabels: { label: string; col: number }[] = [];
  let last = "";

  weeks.forEach((w,i)=>{
    const d = new Date(w[0].date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key !== last) {
      monthLabels.push({ label: MONTHS[d.getMonth()], col: i });
      last = key;
    }
  });

 return (
  <div className="bg-[#0d1117] rounded-lg p-4">

    {/* ===== MOBILE YEARS ===== */}
    <div className="flex sm:hidden gap-2 mb-4 overflow-x-auto">
      {years.map(y => (
        <button
          key={y}
          onClick={() => setSelectedYear(y)}
          className={`px-3 py-1 text-xs rounded ${
            selectedYear === y
              ? "bg-blue-600 text-white"
              : "bg-[#161b22]"
          }`}
        >
          {y}
        </button>
      ))}
    </div>

    {/* 🔥 inline-flex is the KEY */}
    <div className="inline-flex gap-6 items-start justify-start">

      {/* ===== GRAPH (GitHub style) ===== */}
      <div className="overflow-x-auto">

        {/* Month labels */}
        <div className="relative h-4 ml-[34px] w-[636px]">
          {monthLabels.map(m => (
            <span
              key={m.col}
              className="absolute text-[10px] text-gray-400"
              style={{ left: m.col * 12 }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex gap-2">

          {/* Day labels */}
          <div className="flex flex-col justify-between h-[92px] text-[10px] text-gray-400">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Grid */}
          <div
            className="grid grid-flow-col grid-rows-7 gap-[2px]"
            style={{
              gridAutoColumns: "10px",
              width: "636px"
            }}
          >
            {weeks.map((week, wi) =>
              week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  title={day.date}
                  className={`w-[10px] h-[10px] rounded- ${getColor(day.count)}`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP YEARS ===== */}
      <div className="hidden sm:flex flex-col gap-1 shrink-0">
        {years.map(y => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`px-2 py-1 text-xs rounded text-left ${
              selectedYear === y
                ? "bg-blue-600 text-white"
                : "hover:bg-[#161b22]"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>

    {/* ===== LEGEND ===== */}
    <div className="flex gap-3 mt-4 text-[10px] text-gray-400">
      <span>Absent</span>
      <div className="w-3 h-3 bg-[#161b22]" />
      <div className="w-3 h-3 bg-[#39d353]" />
      <span>Present</span>
    </div>
  </div>
);


}
