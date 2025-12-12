"use client";

import { useState } from "react";
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
import { createSubCategory } from "@/lib/api/services/subcategory/subcategory";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@radix-ui/react-icons";

interface Category {
  _id: string;
  name: string;
}

interface CreateSubCategoryModalProps {
  token: string | null;
  categories: Category[];
}

export default function CreateSubCategoryModal({ token, categories }: CreateSubCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return alert("Please enter subcategory name");
    if (!categoryId) return alert("Please select a category");
    
    setLoading(true);

    const res = await createSubCategory(
      { name, category: categoryId, description },
      token || undefined
    );

    if (res?.data?.success) {
      setOpen(false);
      setName("");
      setCategoryId("");
      setDescription("");
      router.refresh();
    } else {
      alert(res?.data?.message || "Error creating subcategory");
    }

    setLoading(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon /> Create SubCategory
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New SubCategory</DialogTitle>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
