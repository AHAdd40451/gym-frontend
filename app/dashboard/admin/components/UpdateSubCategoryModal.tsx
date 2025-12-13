"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSubCategory } from "@/lib/api/services/subcategory/subcategory";
import { useRouter } from "next/navigation";

interface Category {
  _id: string;
  name: string;
}

interface UpdateSubCategoryModalProps {
  subCategoryId: string;
  currentName: string;
  currentCategoryId: string;
  currentDescription?: string;
  token: string | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateSubCategoryModal({
  subCategoryId,
  currentName,
  currentCategoryId,
  currentDescription,
  token,
  categories,
  open,
  onOpenChange,
}: UpdateSubCategoryModalProps) {
  const [name, setName] = useState(currentName);
  const [categoryId, setCategoryId] = useState(currentCategoryId);
  const [description, setDescription] = useState(currentDescription || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setName(currentName);
      setCategoryId(currentCategoryId);
      setDescription(currentDescription || "");
    }
  }, [open, currentName, currentCategoryId, currentDescription]);

  const handleUpdate = async () => {
    if (!name.trim()) return alert("Please enter subcategory name");
    if (!categoryId) return alert("Please select a category");
    
    setLoading(true);

    const res = await updateSubCategory(
      subCategoryId,
      { name, category: categoryId, description },
      token || undefined
    );

    if (res?.data?.success) {
      onOpenChange(false);
      router.refresh();
    } else {
      alert(res?.data?.message || "Error updating subcategory");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update SubCategory</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>SubCategory Name</Label>
            <Input
              placeholder="Enter subcategory name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Enter description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
