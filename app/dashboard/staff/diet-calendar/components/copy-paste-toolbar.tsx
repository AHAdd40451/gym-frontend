"use client";

import React from "react";
import { Copy, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDietCopy } from "../context/diet-copy-context";
import { toast } from "sonner";

interface CopyPasteToolbarProps {
  onCopy: () => void;
  onPaste: () => void;
  type: "day" | "week";
}

export function CopyPasteToolbar({ onCopy, onPaste, type }: CopyPasteToolbarProps) {
  const { hasCopiedDay, hasCopiedWeek } = useDietCopy();
  const hasCopied = type === "day" ? hasCopiedDay : hasCopiedWeek;

  const handleCopy = () => {
    onCopy();
    toast.success(type === "day" ? "Day diet copied" : "Week diet copied");
  };

  const handlePaste = () => {
    if (!hasCopied) return;
    onPaste();
    toast.success(type === "day" ? "Day diet pasted" : "Week diet pasted");
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-2">
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">
                {type === "day" ? "Copy Day Plan" : "Copy Week Plan"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{type === "day" ? "Copy this day's diet plan" : "Copy this week's diet plan"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePaste}
              disabled={!hasCopied}
              className="h-8 gap-2">
              <ClipboardPaste className="h-4 w-4" />
              <span className="hidden sm:inline">
                {type === "day" ? "Paste Day Plan" : "Paste Week Plan"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {hasCopied
                ? type === "day"
                  ? "Paste copied diet plan here"
                  : "Paste copied week plan here"
                : "No diet plan copied"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

