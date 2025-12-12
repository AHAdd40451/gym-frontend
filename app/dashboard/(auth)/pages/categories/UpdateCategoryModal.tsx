"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCategory } from "@/lib/api/services/category/category";

interface UpdateCategoryModalProps {
  categoryId: string;
  currentName: string;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateCategoryModal = ({
  categoryId,
  currentName,
  token,
  open,
  onOpenChange,
}: UpdateCategoryModalProps) => {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Reset name when modal opens with new category
  useEffect(() => {
    setName(currentName);
  }, [currentName, open]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!token) {
      toast.error("Please login to continue");
      return;
    }

    setLoading(true);

    try {
      const result = await updateCategory(categoryId, name, token);
      console.log("Update result:", result);

      // Check if response is wrapped in data property
      const responseData = result?.data || result;

      if (responseData?.success) {
        toast.success("Category updated successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(responseData?.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("An error occurred while updating category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Category</DialogTitle>
          <DialogDescription>
            Update the category name.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleUpdate();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCategoryModal;