"use client";

import { DayDietData } from "@/app/dashboard/staff/diet-calendar/context/diet-copy-context";

export type DietPlanSummary = {
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: string;
  goal: string;
  coachNote: string;
  recovery: string;
};

export type DietPlanTimelineItem = {
  time: string;
  title: string;
  details: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  badge?: string;
};

export type DietPlanPreset = {
  dietData: DayDietData;
  summary: DietPlanSummary;
  timeline: DietPlanTimelineItem[];
  meta?: {
    dateKey?: string;
    dayName?: string;
    rawDate?: string;
  };
};

export const mockUserDietPlan: Record<string, DietPlanPreset> = {
  default: {
    dietData: {
      meals: {
        breakfast: {
          description: "Greek yogurt bowl with berries, granola, chia seeds, and honey.",
          calories: "420",
          protein: "32",
          carbs: "48",
          fats: "12",
          notes: "Add a handful of almonds if hungry."
        },
        "mid-morning": {
          description: "Apple + peanut butter, or cottage cheese with pineapple.",
          calories: "210",
          protein: "14",
          carbs: "22",
          fats: "8",
          notes: "Keep sugar-free peanut butter if available."
        },
        lunch: {
          description: "Grilled chicken, quinoa, mixed greens, cucumbers, cherry tomatoes, olive oil.",
          calories: "620",
          protein: "52",
          carbs: "58",
          fats: "18",
          notes: "Swap chicken with paneer on vegetarian days."
        },
        evening: {
          description: "Protein shake with banana + handful of roasted chickpeas.",
          calories: "280",
          protein: "28",
          carbs: "30",
          fats: "6",
          notes: "Take shake within 45 mins post workout."
        },
        dinner: {
          description: "Baked salmon (or tofu), sweet potato mash, steamed broccoli.",
          calories: "540",
          protein: "46",
          carbs: "45",
          fats: "16",
          notes: "Light dinner; avoid late-night snacking."
        }
      },
      waterIntake: "3",
      supplements: {
        multivitamin: true,
        omega3: true,
        protein: true,
        custom: ["Vitamin D3 (alternate days)"]
      },
      specialInstructions: "Keep sodium low, avoid deep-fried food, and prefer whole grains.",
      status: "active"
    },
    summary: {
      targetCalories: 2070,
      protein: 172,
      carbs: 203,
      fats: 60,
      water: "3.0L",
      goal: "Lean muscle gain + steady energy",
      coachNote: "If morning workout feels heavy, move shake to pre-workout split.",
      recovery: "8k–10k steps, 7.5h sleep target"
    },
    timeline: [
      {
        time: "07:30",
        title: "Breakfast",
        details: "Greek yogurt bowl + berries",
        calories: 420,
        protein: 32,
        carbs: 48,
        fats: 12,
        badge: "High Protein"
      },
      {
        time: "10:30",
        title: "Mid-Morning",
        details: "Apple + peanut butter",
        calories: 210,
        protein: 14,
        carbs: 22,
        fats: 8
      },
      {
        time: "13:30",
        title: "Lunch",
        details: "Grilled chicken + quinoa bowl",
        calories: 620,
        protein: 52,
        carbs: 58,
        fats: 18,
        badge: "Balanced"
      },
      {
        time: "17:30",
        title: "Evening",
        details: "Protein shake + roasted chickpeas",
        calories: 280,
        protein: 28,
        carbs: 30,
        fats: 6,
        badge: "Post Workout"
      },
      {
        time: "20:30",
        title: "Dinner",
        details: "Baked salmon, sweet potato, broccoli",
        calories: 540,
        protein: 46,
        carbs: 45,
        fats: 16,
        badge: "Light"
      }
    ]
  },
  "2025-01-02": {
    dietData: {
      meals: {
        breakfast: {
          description: "Veg omelette with spinach, mushrooms, whole wheat toast.",
          calories: "380",
          protein: "30",
          carbs: "38",
          fats: "12",
          notes: "Add avocado if feeling hungry."
        },
        "mid-morning": {
          description: "Seasonal fruit + handful of walnuts.",
          calories: "190",
          protein: "6",
          carbs: "22",
          fats: "10",
          notes: "Stay light before lunch meeting."
        },
        lunch: {
          description: "Paneer tikka, brown rice, mixed salad, curd.",
          calories: "640",
          protein: "44",
          carbs: "64",
          fats: "20",
          notes: "Skip rice if no workout planned."
        },
        evening: {
          description: "Buttermilk + trail mix (pumpkin seeds, almonds).",
          calories: "220",
          protein: "12",
          carbs: "18",
          fats: "12",
          notes: "Hydrate well, keep salt low."
        },
        dinner: {
          description: "Dal, mixed veggies, 1-2 rotis, cucumber salad.",
          calories: "520",
          protein: "32",
          carbs: "60",
          fats: "14",
          notes: "Finish dinner by 9:00 PM."
        }
      },
      waterIntake: "3.2",
      supplements: {
        multivitamin: true,
        omega3: false,
        protein: true,
        custom: ["Magnesium (before bed)"]
      },
      specialInstructions: "No sugary drinks; add lemon-mint to water bottle.",
      status: "planned"
    },
    summary: {
      targetCalories: 1950,
      protein: 156,
      carbs: 190,
      fats: 58,
      water: "3.2L",
      goal: "Recovery + hydration focus",
      coachNote: "Prioritize sleep; stretch 10 mins post walk.",
      recovery: "Light walk + mobility"
    },
    timeline: [
      {
        time: "07:15",
        title: "Breakfast",
        details: "Veg omelette + toast",
        calories: 380,
        protein: 30,
        carbs: 38,
        fats: 12
      },
      {
        time: "10:45",
        title: "Mid-Morning",
        details: "Fruit + walnuts",
        calories: 190,
        protein: 6,
        carbs: 22,
        fats: 10
      },
      {
        time: "13:30",
        title: "Lunch",
        details: "Paneer tikka + brown rice",
        calories: 640,
        protein: 44,
        carbs: 64,
        fats: 20,
        badge: "Veg Day"
      },
      {
        time: "17:30",
        title: "Evening",
        details: "Buttermilk + trail mix",
        calories: 220,
        protein: 12,
        carbs: 18,
        fats: 12
      },
      {
        time: "20:45",
        title: "Dinner",
        details: "Dal, veggies, rotis",
        calories: 520,
        protein: 32,
        carbs: 60,
        fats: 14
      }
    ]
  }
};

export const weeklyPlanSnapshot = [
  { day: "Monday", calories: "2050 kcal", hydration: "3.0 L", focus: "High protein" },
  { day: "Tuesday", calories: "1950 kcal", hydration: "3.2 L", focus: "Recovery & hydration" },
  { day: "Wednesday", calories: "2100 kcal", hydration: "3.0 L", focus: "Balanced carbs" },
  { day: "Thursday", calories: "2050 kcal", hydration: "3.0 L", focus: "Light dinner" },
  { day: "Friday", calories: "2150 kcal", hydration: "3.0 L", focus: "Strength day" },
  { day: "Saturday", calories: "2200 kcal", hydration: "3.2 L", focus: "Long run fuel" },
  { day: "Sunday", calories: "1900 kcal", hydration: "3.0 L", focus: "Refeed + rest" }
];



