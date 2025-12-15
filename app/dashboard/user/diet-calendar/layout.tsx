"use client";

import React from "react";
import { DietCopyProvider } from "@/app/dashboard/staff/diet-calendar/context/diet-copy-context";
import { Toaster } from "@/components/ui/sonner";

export default function UserDietCalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <DietCopyProvider>
      {children}
      <Toaster />
    </DietCopyProvider>
  );
}

