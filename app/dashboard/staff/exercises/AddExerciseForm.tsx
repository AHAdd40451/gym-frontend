"use client";

import { useState } from "react";
import { toast } from "sonner";
import apiClient from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/constants/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const defaultState = {
  description: "",
  muscleGroup: "",
  equipment: "Barbell",
  difficulty: "Beginner"
};

type AddExerciseFormProps = {
  onSaved?: () => void;
};

export default function AddExerciseForm({ onSaved }: AddExerciseFormProps) {
  const [form, setForm] = useState(defaultState);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof typeof defaultState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.muscleGroup.trim()) {
      toast.error("Muscle group is required (e.g., Chest, Bicep)");
      return;
    }
    setSaving(true);
    try {
      // Use first muscle group as name (e.g., "Chest", "Bicep")
      const muscleGroups = form.muscleGroup
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      
      if (muscleGroups.length === 0) {
        toast.error("Please enter at least one muscle group");
        return;
      }
      
      const payload = {
        name: muscleGroups[0], // Use first muscle group as exercise name
        description: form.description.trim() || `${muscleGroups[0]} exercise`,
        muscleGroup: muscleGroups,
        equipment: form.equipment,
        difficulty: form.difficulty
      };
      const res = await apiClient.post(API_ENDPOINTS.EXERCISES.BASE, payload);
      if (res?.data?.success) {
        toast.success("Exercise created");
        setForm(defaultState);
        onSaved?.();
      } else {
        throw new Error(res?.data?.message || "Failed to create exercise");
      }
    } catch (error: any) {
      toast.error("Could not create exercise", { description: error?.message || "Check API/token." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Create Exercise</CardTitle>
        <CardDescription>Add exercises that can be used in workout plans.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Muscle Group (e.g., Chest, Bicep, Legs)</label>
          <Input
            value={form.muscleGroup}
            onChange={(e) => handleChange("muscleGroup", e.target.value)}
            placeholder="Chest"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            For multiple muscle groups, use comma: "Chest, Shoulders"
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Description (optional)</label>
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Exercise description..."
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Equipment</label>
            <Select value={form.equipment} onValueChange={(val) => handleChange("equipment", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                {["Barbell", "Dumbbell", "Machine", "Bodyweight"].map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Difficulty</label>
            <Select value={form.difficulty} onValueChange={(val) => handleChange("difficulty", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {["Beginner", "Intermediate", "Advanced"].map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="w-fit">
          {saving ? "Saving..." : "Create exercise"}
        </Button>
      </CardContent>
    </Card>
  );
}
