"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailsDrawer({
  open,
  onOpenChange,
  title,
  children,
  className,
}: DetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("w-[45vw] max-w-[45vw] sm:max-w-[45vw] p-0 flex flex-col", className)}
      >
        {title && (
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
