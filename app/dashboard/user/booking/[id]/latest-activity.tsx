"use client";

import * as React from "react";
import { DumbbellIcon, HeartPulseIcon, UsersIcon, ClockIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function LatestActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle> Qualities</CardTitle>
        <CardAction>
          <Link
            href="#"
            className="text-muted-foreground hover:text-primary text-sm hover:underline">
            View Details
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="ps-8">
        <ol className="relative border-s">
          <li className="ms-6 mb-10 space-y-2">
            <span className="bg-muted absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border">
              <DumbbellIcon className="text-primary size-3" />
            </span>
            <h3 className="flex items-center font-semibold">
              Fitness Expertise{" "}
              <Badge variant="outline" className="ms-2">
                Core Skill
              </Badge>
            </h3>
            <time className="text-muted-foreground flex items-center gap-1.5 text-sm leading-none">
              <ClockIcon className="size-3" /> Updated on November 2025
            </time>
            <p className="text-muted-foreground text-sm">
              A professional gym trainer has deep knowledge of exercise techniques, body mechanics,
              and workout planning tailored to individual goals.
            </p>
          </li>

          <li className="ms-6 mb-10 space-y-2">
            <span className="bg-muted absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border">
              <HeartPulseIcon className="text-primary size-3" />
            </span>
            <h3 className="font-semibold">Motivation & Discipline</h3>
            <time className="text-muted-foreground flex items-center gap-1.5 text-sm leading-none">
              <ClockIcon className="size-3" /> Updated on November 2025
            </time>
            <p className="text-muted-foreground text-sm">
              Keeps clients motivated through every session and leads by example with consistency,
              discipline, and positive energy.
            </p>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
