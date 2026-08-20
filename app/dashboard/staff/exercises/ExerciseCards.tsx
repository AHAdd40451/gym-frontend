"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Dumbbell, PlayCircle, Pencil } from "lucide-react";
import { updateExercise, type Exercise } from "@/lib/api/services/getexercises/exercises";

interface Props {
  exercises: Exercise[];
  onUpdated?: () => void;
}

const difficultyVariant: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Advanced: "bg-rose-100 text-rose-700 border-rose-200"
};

const getToken = () => {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("adminToken") ||
    ""
  );
};

type EditFormState = {
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
};

const toEditForm = (ex: Exercise): EditFormState => ({
  name: ex.name || "",
  description: ex.description || "",
  muscleGroup: (ex.muscleGroup || []).join(", "),
  equipment: ex.equipment || "Barbell",
  difficulty: ex.difficulty || "Beginner"
});

const ExerciseCards = ({ exercises, onUpdated }: Props) => {
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    setEditForm(toEditForm(ex));
  };

  const closeEdit = () => {
    setEditingExercise(null);
    setEditForm(null);
  };

  const handleChange = (key: keyof EditFormState, value: string) => {
    setEditForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!editingExercise || !editForm) return;

    if (!editForm.name.trim()) {
      toast.error("Exercise name is required");
      return;
    }

    const muscleGroup = editForm.muscleGroup
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    if (muscleGroup.length === 0) {
      toast.error("Please enter at least one muscle group");
      return;
    }

    setSaving(true);

    try {
      const token = getToken();

      const res = await updateExercise(
        editingExercise._id,
        {
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          muscleGroup,
          equipment: editForm.equipment,
          difficulty: editForm.difficulty
        },
        token
      );

      const success = (res as any)?.success ?? (res as any)?.data?.success;
      const message = (res as any)?.message ?? (res as any)?.data?.message;

      if (!success) {
        throw new Error(message || "Failed to update exercise");
      }

      toast.success("Exercise updated");
      closeEdit();
      onUpdated?.();
    } catch (error: any) {
      toast.error("Could not update exercise", {
        description: error?.message || "Check API/token."
      });
    } finally {
      setSaving(false);
    }
  };

  if (exercises.length === 0) {
    return <p className="text-center col-span-full text-muted-foreground mt-10">No exercises found.</p>;
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {exercises.map((ex) => (
          <Card key={ex._id} className="hover:shadow-lg transition group">
            <CardHeader className="space-y-3 pb-0">
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                {ex.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ex.imageUrl}
                    alt={ex.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <PlayCircle className="size-14 text-primary" />
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg line-clamp-1">{ex.name}</CardTitle>
                <Badge
                  className={`text-xs ${difficultyVariant[ex.difficulty] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                >
                  {ex.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{ex.description}</p>
            </CardHeader>

            <CardContent className="pb-6 space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="gap-1">
                  <Dumbbell className="size-3" />
                  {ex.equipment || "Any"}
                </Badge>
                {ex.muscleGroup?.slice(0, 3).map((m) => (
                  <Badge key={m} variant="secondary" className="bg-slate-100 text-slate-700">
                    {m}
                  </Badge>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => openEdit(ex)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingExercise} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>

          {editForm && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Exercise name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Muscle Group (comma separated)</label>
                <Input
                  value={editForm.muscleGroup}
                  onChange={(e) => handleChange("muscleGroup", e.target.value)}
                  placeholder="Chest, Shoulders"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Exercise description..."
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Equipment</label>
                  <Select value={editForm.equipment} onValueChange={(val) => handleChange("equipment", val)}>
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
                  <Select value={editForm.difficulty} onValueChange={(val) => handleChange("difficulty", val)}>
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

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                <Button variant="secondary" onClick={closeEdit} disabled={saving} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseCards;
