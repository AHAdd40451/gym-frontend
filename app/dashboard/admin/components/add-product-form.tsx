"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  ChevronLeft,
  CirclePlusIcon,
  ImageIcon,
  Trash2Icon,
  UploadIcon,
  XIcon
} from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { AddMediaFromUrl } from "@/app/dashboard/(auth)/pages/products/create/add-media-from-url";
import AddNewCategory from "@/app/dashboard/(auth)/pages/products/create/add-category";

import { createProduct } from "@/lib/api/services/product/product";
import { getCategories } from "@/lib/api/services/category/category";
import { getSubCategoriesByCategory } from "@/lib/api/services/subcategory/subcategory";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters."
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters."
  }),
  price: z.string().min(1, {
    message: "Price is required."
  }),
  discountedPrice: z.string().optional(),
  ingredients: z.string().optional(),
  servingSize: z.string().optional(),
  stockQuantity: z.number().min(0, {
    message: "Stock must be 0 or greater."
  }),
  category: z.string().min(1, {
    message: "Please select a category."
  }),
  subCategory: z.string().optional(),
  status: z.string().default("draft"),
  inStock: z.boolean().default(true),
  chargeTax: z.boolean().default(false)
});

interface Variant {
  id: string;
  option: string;
  value: string;
  price: string;
}

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  category: string;
}

interface AddProductFormProps {
  token: string | null;
}

export default function AddProductForm({ token }: AddProductFormProps) {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      ingredients: "",
      servingSize: "",
      stockQuantity: 0,
      price: "",
      discountedPrice: "",
      category: "",
      subCategory: "",
      status: "draft",
      inStock: true,
      chargeTax: false
    }
  });

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps
    }
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg",
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
    maxFiles: 5
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategories(selectedCategory);
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const result = await getCategories({});
      const responseData = result?.data || result;
      
      if (responseData?.categories) {
        setCategories(responseData.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    try {
      setLoadingSubCategories(true);
      const result = await getSubCategoriesByCategory(categoryId);
      const responseData = result?.data || result;
      
      if (responseData?.subcategories) {
        setSubCategories(responseData.subcategories);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const addVariant = () => {
    const newVariant: Variant = {
      id: Math.random().toString(36).substr(2, 9),
      option: "",
      value: "",
      price: ""
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(variant => variant.id !== id));
  };

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setVariants(variants.map(variant => 
      variant.id === id ? { ...variant, [field]: value } : variant
    ));
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!token) {
      toast.error("Please login to continue");
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    setLoading(true);

    try {
      // Prepare product payload with proper stock object
      const productPayload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        stock: {
          quantity: data.stockQuantity,
          inStock: data.inStock
        },
        category: data.category,
        subCategory: data.subCategory,
        ingredients: data.ingredients,
        servingSize: data.servingSize,
        image: files[0].preview,
        variants: variants.length > 0 ? variants : undefined,
        status: data.status,
        chargeTax: data.chargeTax,
        discountedPrice: data.discountedPrice ? parseFloat(data.discountedPrice) : undefined
      };

      console.log("Sending product payload:", productPayload); // Debug log

      const result = await createProduct(productPayload, token);
      const responseData = result?.data || result;

      if (responseData?.success || responseData?.product) {
        toast.success("Product created successfully!");
        router.push("/dashboard/admin/product-list");
        router.refresh();
      } else {
        toast.error(responseData?.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  }

  const handleDiscard = () => {
    form.reset();
    setVariants([]);
    setSelectedCategory("");
    router.push("/dashboard/admin/product-list");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-4 flex flex-col justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-2">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/pages/products">
                <ChevronLeft />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={handleDiscard}>
              Discard
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter product name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter product description" />
                        </FormControl>
                        <FormDescription>
                          Set a description to the product for better visibility.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredients (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="List ingredients" />
                        </FormControl>
                        <FormDescription>
                          List the ingredients for this product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 lg:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="servingSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serving Size (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 100g, 1 scoop" />
                          </FormControl>
                          <FormDescription>
                            Specify the serving size for this product.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the available stock quantity.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardAction>
                  <AddMediaFromUrl>
                    <Button variant="link" size="sm" className="mt-0! h-auto p-0">
                      <span className="hidden lg:block">Add media from URL</span>
                      <span className="block lg:hidden">Add URL</span>
                    </Button>
                  </AddMediaFromUrl>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-dragging={isDragging || undefined}
                    data-files={files.length > 0 || undefined}
                    className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]">
                    <input
                      {...getInputProps()}
                      className="sr-only"
                      aria-label="Upload image file"
                    />
                    {files.length > 0 ? (
                      <div className="flex w-full flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-medium">
                            Uploaded Files ({files.length})
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openFileDialog}
                            disabled={files.length >= 5}>
                            <UploadIcon
                              className="-ms-0.5 size-3.5 opacity-60"
                              aria-hidden="true"
                            />
                            Add more
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className="bg-accent relative aspect-square rounded-md border">
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="size-full rounded-[inherit] object-cover"
                              />
                              <Button
                                type="button"
                                onClick={() => removeFile(file.id)}
                                size="icon"
                                className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none">
                                <XIcon className="size-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                        <div
                          className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                          aria-hidden="true">
                          <ImageIcon className="size-4 opacity-60" />
                        </div>
                        <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
                        <p className="text-muted-foreground text-xs">PNG or JPG (max. 5MB)</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={openFileDialog}>
                          <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                          Select images
                        </Button>
                      </div>
                    )}
                  </div>

                  {errors.length > 0 && (
                    <div
                      className="text-destructive flex items-center gap-1 text-xs"
                      role="alert">
                      <AlertCircleIcon className="size-3 shrink-0" />
                      <span>{errors[0]}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Variants */}
            <Card className="pb-0">
              <CardHeader>
                <CardTitle>Variants (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {variants.length > 0 ? (
                    variants.map((variant) => (
                      <div key={variant.id} className="space-y-4">
                        <div className="grid gap-4 lg:grid-flow-col">
                          <FormItem>
                            <FormLabel>Options</FormLabel>
                            <Select
                              value={variant.option}
                              onValueChange={(value) => updateVariant(variant.id, "option", value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="size">Size</SelectItem>
                                  <SelectItem value="color">Color</SelectItem>
                                  <SelectItem value="weight">Weight</SelectItem>
                                  <SelectItem value="flavor">Flavor</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormItem>
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input
                                value={variant.value}
                                onChange={(e) => updateVariant(variant.id, "value", e.target.value)}
                                placeholder="Enter value"
                              />
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                value={variant.price}
                                onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                                placeholder="Enter price"
                                type="number"
                              />
                            </FormControl>
                          </FormItem>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariant(variant.id)}
                              className="text-destructive hover:text-destructive">
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No variants added yet. Click "Add Variant" to create one.
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t p-0!">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-tl-none rounded-tr-none"
                  onClick={addVariant}>
                  <CirclePlusIcon className="mr-2" /> Add Variant
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-4 lg:col-span-2">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    name="price"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="discountedPrice"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discounted Price (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chargeTax"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Charge tax on this product</FormLabel>
                      </FormItem>
                    )}
                  />
                  <hr />
                  <FormField
                    control={form.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-x-2">
                        <Label className="!mt-0">In stock</Label>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select {...field} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>Set the product status.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Categories */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    name="category"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <div className="grow">
                              <Select 
                                {...field} 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedCategory(value);
                                  form.setValue("subCategory", "");
                                }}
                                disabled={loadingCategories}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Select a category"} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {categories.map((cat) => (
                                      <SelectItem key={cat._id} value={cat._id}>
                                        {cat.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <AddNewCategory />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="subCategory"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Category (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <div className="grow">
                              <Select 
                                {...field} 
                                onValueChange={field.onChange}
                                disabled={!selectedCategory || loadingSubCategories}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue 
                                    placeholder={
                                      !selectedCategory 
                                        ? "Select category first" 
                                        : loadingSubCategories 
                                        ? "Loading..." 
                                        : "Select a sub category"
                                    } 
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {subCategories.length > 0 ? (
                                      subCategories.map((subCat) => (
                                        <SelectItem key={subCat._id} value={subCat._id}>
                                          {subCat.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="no-subcategories" disabled>
                                        No subcategories available
                                      </SelectItem>
                                    )}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <AddNewCategory />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}