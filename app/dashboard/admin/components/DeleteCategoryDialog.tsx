"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCategory } from "@/lib/api/services/category/category";

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteCategoryDialog = ({
  categoryId,
  categoryName,
  token,
  open,
  onOpenChange,
}: DeleteCategoryDialogProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!token) {
      toast.error("Please login to continue");
      return;
    }

    setLoading(true);

    try {
      const result = await deleteCategory(categoryId, token);
      console.log("Delete result:", result);

      // Check if response is wrapped in data property
      const responseData = result?.data || result;

      if (responseData?.success) {
        toast.success("Category deleted successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(responseData?.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("An error occurred while deleting category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the category{" "}
            <span className="font-semibold">{categoryName}</span>. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategoryDialog;