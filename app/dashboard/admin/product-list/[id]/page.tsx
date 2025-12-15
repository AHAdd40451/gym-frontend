import Link from "next/link";
import Image from "next/image";
import {
  CircleDollarSign,
  ChevronLeft,
  HandCoinsIcon,
  HeartIcon,
  Layers2Icon,
  ShoppingCart,
  Trash2Icon,
  TruckIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

import { getServerAuth } from "@/lib/api/services/auth/server";
import { getProductById } from "@/lib/api/services/product/product";
import { getProductReviews } from "@/lib/api/services/review/review";
import { getCategories } from "@/lib/api/services/category/category";
import ProductImageGallery from "./product-image-gallery";
import ProductReviewList from "./reviews";
import { EditProductButton } from "./edit-product-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const { user, token } = await getServerAuth();

  // Fetch product details
  const productResult = await getProductById(resolvedParams.id);
  const productData = productResult?.data?.product || productResult?.product;

  // Fetch categories for edit dialog
  const categoriesResult = await getCategories();
  const categories = categoriesResult?.data?.categories || categoriesResult?.categories || [];

  if (!productData) {
    return (
      <div className="mx-auto max-w-screen-lg space-y-4 lg:mt-10">
        <Card>
          <CardContent className="p-10 text-center">
            <h2 className="text-xl font-semibold">Product not found</h2>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/dashboard/admin/product-list">
                <ChevronLeft /> Back to Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Fetch reviews for stats
  const reviewsResult = await getProductReviews(productData._id);
  const reviewsData = reviewsResult?.data || reviewsResult;
  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || "0";
  const ratingDistribution = reviewsData?.ratingDistribution || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  // Calculate percentages
  const totalReviews = reviews.length;
  const getPercentage = (count: number) => {
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  };

  // Helper function to get category name
  const getCategoryName = (category: any) => {
    if (typeof category === "string") return category;
    return category?.name || "Unknown";
  };

  // Format price
  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-start justify-between">
        <div className="space-y-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin/product-list">
              <ChevronLeft /> Back
            </Link>
          </Button>
          <h1 className="font-display text-xl tracking-tight lg:text-2xl">
            {productData.name}
          </h1>
          <div className="text-muted-foreground inline-flex flex-col gap-2 text-sm lg:flex-row lg:gap-4">
            <div>
              <span className="text-foreground font-semibold">Category:</span>{" "}
              {getCategoryName(productData.category)}
            </div>
            <div>
              <span className="text-foreground font-semibold">Published:</span>{" "}
              {new Date(productData.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="text-foreground font-semibold">ID:</span>{" "}
              {productData._id.slice(-8)}
            </div>
          </div>
        </div>
        <EditProductButton product={productData} categories={categories} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-1">
          <ProductImageGallery images={productData.image ? [productData.image] : []} />
        </div>

        <div className="space-y-4 xl:col-span-2">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <CircleDollarSign className="size-6 opacity-40" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Price</span>
                <span className="text-lg font-semibold">{formatPrice(productData.price)}</span>
              </div>
            </div>
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <Layers2Icon className="size-6 opacity-40" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Available Stock</span>
                <span className="text-lg font-semibold">{productData.stock?.quantity || 0}</span>
              </div>
            </div>
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <TruckIcon className="size-6 opacity-40" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Status</span>
                <Badge
                  variant={productData.stock?.inStock ? "success" : "destructive"}
                  className="w-fit"
                >
                  {productData.stock?.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </div>
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <HandCoinsIcon className="size-6 opacity-40" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Category</span>
                <span className="text-lg font-semibold">{getCategoryName(productData.category)}</span>
              </div>
            </div>
          </div>

          {/* Product Details Card */}
          <Card>
            <CardContent className="space-y-4">
              <div className="grid items-start gap-8 xl:grid-cols-3">
                <div className="space-y-8 xl:col-span-2">
                  <div>
                    <h3 className="mb-2 font-semibold">Description:</h3>
                    <p className="text-muted-foreground">
                      {productData.description || "No description available"}
                    </p>
                  </div>
                  {productData.ingredients && (
                    <div>
                      <h3 className="mb-2 font-semibold">Ingredients:</h3>
                      <p className="text-muted-foreground">{productData.ingredients}</p>
                    </div>
                  )}
                </div>
                <div className="rounded-md border xl:col-span-1">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Category</TableCell>
                        <TableCell className="text-right">
                          {getCategoryName(productData.category)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Price</TableCell>
                        <TableCell className="text-right">{formatPrice(productData.price)}</TableCell>
                      </TableRow>
                      {productData.servingSize && (
                        <TableRow>
                          <TableCell className="font-semibold">Serving Size</TableCell>
                          <TableCell className="text-right">{productData.servingSize}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell className="font-semibold">Stock</TableCell>
                        <TableCell className="text-right">{productData.stock?.quantity || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Created</TableCell>
                        <TableCell className="text-right">
                          {new Date(productData.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Variants Section */}
              {productData.variants && productData.variants.length > 0 && (
                <div className="grid auto-cols-max grid-flow-row gap-8">
                  <div>
                    <div className="mb-4 font-semibold">Available Variants:</div>
                    <div className="space-y-4">
                      {productData.variants.map((variant: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 text-sm">
                          <Badge variant="outline">{variant.option}</Badge>
                          <span>{variant.value}</span>
                          <span className="font-semibold">Rs. {variant.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Card */}
          <Card>
            <CardHeader className="flex-row justify-between">
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="order-last lg:order-first xl:col-span-2">
                  {/* ✅ FIXED: productId prop pass kar rahe hain */}
                  <ProductReviewList productId={productData._id} />
                </div>
                <div className="order-first lg:order-last xl:col-span-1">
                  <div className="overflow-hidden rounded-lg border">
                    <div className="bg-muted flex items-center gap-4 p-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`size-4 ${
                              i < Math.round(parseFloat(averageRating))
                                ? "fill-orange-400 stroke-orange-400"
                                : "fill-gray-200 stroke-gray-200"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {averageRating} ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                    <div className="space-y-4 p-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">5 stars</span>
                        <Progress value={getPercentage(ratingDistribution[5])} className="bg-gray-200" />
                        <span className="w-10 text-right">{getPercentage(ratingDistribution[5])}%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">4 stars</span>
                        <Progress value={getPercentage(ratingDistribution[4])} className="bg-gray-200" />
                        <span className="w-10 text-right">{getPercentage(ratingDistribution[4])}%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">3 stars</span>
                        <Progress value={getPercentage(ratingDistribution[3])} className="bg-gray-200" />
                        <span className="w-10 text-right">{getPercentage(ratingDistribution[3])}%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">2 stars</span>
                        <Progress value={getPercentage(ratingDistribution[2])} className="bg-gray-200" />
                        <span className="w-10 text-right">{getPercentage(ratingDistribution[2])}%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">1 star</span>
                        <Progress value={getPercentage(ratingDistribution[1])} className="bg-gray-200" />
                        <span className="w-10 text-right">{getPercentage(ratingDistribution[1])}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}