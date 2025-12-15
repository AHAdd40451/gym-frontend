"use client";

import * as React from "react";
import { Edit3Icon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Category } from "@/lib/api/services/category/category";
import { Product } from "@/lib/api/services/product/product";
import { EditProductDialog } from "../edit-product-dialog";

type EditProductButtonProps = {
  product: Product;
  categories: Category[];
};

export function EditProductButton({ product, categories }: EditProductButtonProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh(); // Refresh page data after successful edit
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Edit3Icon className="size-4" />
        Edit
      </Button>

      <EditProductDialog
        open={open}
        onOpenChange={setOpen}
        product={product}
        categories={categories}
        onSuccess={handleSuccess}
      />
    </>
  );
}

