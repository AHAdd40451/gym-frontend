"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface DayDietData {
  meals: {
    [mealId: string]: {
      description: string;
      calories: string;
      protein: string;
      carbs: string;
      fats: string;
      notes: string;
    };
  };
  waterIntake: string;
  supplements: {
    multivitamin: boolean;
    omega3: boolean;
    protein: boolean;
    custom: string[];
  };
  specialInstructions: string;
  status: string;
}

export interface WeekDietData {
  [dayName: string]: DayDietData;
}

interface DietCopyContextType {
  copiedDayData: DayDietData | null;
  copiedWeekData: WeekDietData | null;
  copyDay: (data: DayDietData) => void;
  copyWeek: (data: WeekDietData) => void;
  clearCopy: () => void;
  hasCopiedDay: boolean;
  hasCopiedWeek: boolean;
}

const DietCopyContext = createContext<DietCopyContextType | undefined>(undefined);

export function DietCopyProvider({ children }: { children: ReactNode }) {
  const [copiedDayData, setCopiedDayData] = useState<DayDietData | null>(null);
  const [copiedWeekData, setCopiedWeekData] = useState<WeekDietData | null>(null);

  const copyDay = (data: DayDietData) => {
    setCopiedDayData(data);
    setCopiedWeekData(null); // Clear week data when copying day
  };

  const copyWeek = (data: WeekDietData) => {
    setCopiedWeekData(data);
    setCopiedDayData(null); // Clear day data when copying week
  };

  const clearCopy = () => {
    setCopiedDayData(null);
    setCopiedWeekData(null);
  };

  return (
    <DietCopyContext.Provider
      value={{
        copiedDayData,
        copiedWeekData,
        copyDay,
        copyWeek,
        clearCopy,
        hasCopiedDay: copiedDayData !== null,
        hasCopiedWeek: copiedWeekData !== null
      }}>
      {children}
    </DietCopyContext.Provider>
  );
}

export function useDietCopy() {
  const context = useContext(DietCopyContext);
  if (context === undefined) {
    throw new Error("useDietCopy must be used within a DietCopyProvider");
  }
  return context;
}

