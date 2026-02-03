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
  name: "",
  description: "",
  muscleGroup: "",
  equipment: "Barbell",
  difficulty: "Beginner",
  videoUrl: "",
  imageUrl: ""
};

export default function AddExerciseForm() {
  const [form, setForm] = useState(defaultState);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof typeof defaultState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        muscleGroup: form.muscleGroup
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        equipment: form.equipment,
        difficulty: form.difficulty,
        videoUrl: form.videoUrl.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined
      };
      const res = await apiClient.post(API_ENDPOINTS.EXERCISES.BASE, payload);
      if (res?.data?.success) {
        toast.success("Exercise created");
        setForm(defaultState);
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
        <CardTitle>Add exercise</CardTitle>
        <CardDescription>Create a new exercise and reuse it in workouts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Muscle groups (comma separated)</label>
            <Input
              value={form.muscleGroup}
              onChange={(e) => handleChange("muscleGroup", e.target.value)}
              placeholder="Chest, Shoulders"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
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
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Video URL (optional)</label>
            <Input
              value={form.videoUrl}
              onChange={(e) => handleChange("videoUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Image URL (optional)</label>
            <Input
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="w-fit">
          {saving ? "Saving..." : "Create exercise"}
        </Button>
      </CardContent>
    </Card>
  );
}
