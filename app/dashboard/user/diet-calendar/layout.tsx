"use client";

import React from "react";
import { DietCopyProvider } from "./context/diet-copy-context";
import { Toaster } from "@/components/ui/sonner";

export default function DietCalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <DietCopyProvider>
      {children}
      <Toaster />
    </DietCopyProvider>
  );
}

