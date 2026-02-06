"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getAttendanceByUserId } from "../../../../lib/api/services/attendence/attendence";

type CurrentUser = { id: string };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const getColor = (count: number) =>
  count === 1 ? "bg-emerald-500 dark:bg-emerald-500" : "bg-muted";

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-muted animate-pulse"
              style={{ animationDelay: `${i * 120}ms`, animationDuration: "1.2s" }}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">Loading attendance…</span>
      </div>
    );
  }

  /* ================= YEARS ================= */
  const years = Array.from(
    new Set(Array.from(dateMap.keys()).map(d => new Date(d).getFullYear()))
  ).sort((a,b)=>b-a);
  const yearsList = years.length ? years : [currentYear];

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

  /* ================= STATS ================= */
  const presentCount = weeks
    .flat()
    .filter((d) => {
      const dt = new Date(d.date);
      return d.count === 1 && dt >= gridStart && dt <= gridEnd;
    })
    .length;

 return (
  <div className="rounded-lg space-y-6">

    {/* ===== STATS BAR ===== */}
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-4 py-2">
        <CheckCircle2 className="size-4 text-emerald-500" />
        <span className="text-sm font-medium">
          <span className="text-foreground">{presentCount}</span>
          <span className="text-muted-foreground ml-1">days present in {selectedYear}</span>
        </span>
      </div>
    </div>

    {/* ===== MOBILE YEARS ===== */}
    <div className="flex sm:hidden gap-2 overflow-x-auto pb-2 -mx-1">
      {yearsList.map(y => (
        <button
          key={y}
          onClick={() => setSelectedYear(y)}
          className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all ${
            selectedYear === y
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
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
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: m.col * 12 }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex gap-2">

          {/* Day labels */}
          <div className="flex flex-col justify-between h-[92px] text-[10px] text-muted-foreground">
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
              week.map((day, di) => {
                const isInRange = new Date(day.date) >= gridStart && new Date(day.date) <= gridEnd;
                const label = isInRange
                  ? format(new Date(day.date), "MMM d, yyyy")
                  : day.date;
                const status = day.count === 1 ? "Present" : "Absent";
                return (
                  <Tooltip key={`${wi}-${di}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-[10px] h-[10px] rounded-[3px] transition-all duration-150 cursor-default hover:scale-125 hover:ring-2 hover:ring-foreground/20 hover:ring-offset-1 hover:ring-offset-background ${getColor(day.count)} ${isInRange ? "" : "opacity-40"}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="font-medium">
                      {label} — {status}
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP YEARS ===== */}
      <div className="hidden sm:flex flex-col gap-1.5 shrink-0">
        {yearsList.map(y => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`px-3 py-2 text-sm font-medium rounded-lg text-left transition-all ${
              selectedYear === y
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>

    {/* ===== LEGEND ===== */}
    <div className="flex items-center gap-6 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 w-fit">
      <span className="text-xs text-muted-foreground">Less</span>
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-[3px] bg-muted" title="Absent" />
        <span className="text-xs text-muted-foreground">Absent</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-500" title="Present" />
        <span className="text-xs text-muted-foreground">Present</span>
      </div>
      <span className="text-xs text-muted-foreground">More</span>
    </div>
  </div>
);


}
