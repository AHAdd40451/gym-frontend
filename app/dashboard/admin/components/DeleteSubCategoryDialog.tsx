// ============================================
// 5. DeleteSubCategoryDialog.tsx
// ============================================
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { deleteSubCategory } from "@/lib/api/services/subcategory/subcategory";
import { useRouter } from "next/navigation";

interface DeleteSubCategoryDialogProps {
  subCategoryId: string;
  subCategoryName: string;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteSubCategoryDialog({
  subCategoryId,
  subCategoryName,
  token,
  open,
  onOpenChange,
}: DeleteSubCategoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);

    const res = await deleteSubCategory(subCategoryId, token || undefined);

    if (res?.data?.success) {
      onOpenChange(false);
      router.refresh();
    } else {
      alert(res?.data?.message || "Error deleting subcategory");
    }

    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the subcategory <strong>"{subCategoryName}"</strong>.
            This action cannot be undone.
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
}