"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Product } from "@/lib/api/services/product/product";
import { updateProductAction } from "./actions";

const editProductSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.string().min(1, { message: "Price is required." }),
  stock: z.string().min(0, { message: "Stock must be 0 or greater." }),
  inStock: z.boolean(),
  category: z.string().min(1, { message: "Please select a category." }),
  ingredients: z.string().optional(),
  servingSize: z.string().optional(),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface Category {
  _id: string;
  name: string;
}

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  categories: Category[];
  onSuccess: (updatedProduct: Product) => void;
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}: EditProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.quantity?.toString() || "0",
      inStock: product.stock?.inStock ?? true,
      category: typeof product.category === "string" ? product.category : product.category?._id || "",
      ingredients: product.ingredients || "",
      servingSize: product.servingSize || "",
    },
  });

  // Reset form when dialog opens with new product
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.quantity?.toString() || "0",
        inStock: product.stock?.inStock ?? true,
        category: typeof product.category === "string" ? product.category : product.category?._id || "",
        ingredients: product.ingredients || "",
        servingSize: product.servingSize || "",
      });
    }
  }, [open, product, form]);

  const onSubmit = async (data: EditProductFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare update payload
      const updatePayload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        stock: {
          quantity: parseInt(data.stock, 10),
          inStock: data.inStock
        },
        category: data.category,
        ingredients: data.ingredients || "",
        servingSize: data.servingSize || "",
      };

      // Call server action
      const result = await updateProductAction(product._id, updatePayload);

      if (!result.success) {
        toast.error("Failed to update product", {
          description: result.error || "An error occurred while updating the product.",
        });
        return;
      }

      // Success!
      toast.success("Product updated successfully", {
        description: `${data.name} has been updated.`,
      });

      // Call onSuccess callback with updated product
      if (result.product) {
        onSuccess(result.product);
      }

      // Close dialog
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to update product", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Product Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* In Stock Switch */}
            <FormField
              control={form.control}
              name="inStock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">In Stock</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Is this product currently available?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ingredients (Optional) */}
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter ingredients"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Serving Size (Optional) */}
            <FormField
              control={form.control}
              name="servingSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serving Size (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 30g per serving" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

