"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCategory } from "@/lib/api/services/category/category";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@radix-ui/react-icons";

interface CreateCategoryModalProps {
  token: string | null; // <-- type defined here
}

export default function CreateCategoryModal({ token }: CreateCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return alert("Please enter category name");
    setLoading(true);

    const res = await createCategory(name, token  || undefined); // IMPORTANT

    if (res?.data?.success) {
      setOpen(false);
      setName("");
      router.refresh();
    } else {
      alert(res?.data?.message || "Error creating category");
    }

    setLoading(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon /> Create Category
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <label className="text-sm font-medium">Category Name</label>
            <Input
              placeholder="Enter category name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
