"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipProvider
} from "@/components/ui/tooltip";

import { getAllProducts, Product } from "@/lib/api/services/product/product";

const getProductImage = (image?: string) => {
  if (!image) return "/images/placeholder.png";
  return image;
};

export function EcommerceBestSellingProductsCard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getAllProducts();

        if (res?.data?.success) {
          setProducts(res.data.products.slice(0, 6));
        }
      } catch (error) {
        console.error("Products fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Card className="h-full overflow-hidden">
        <CardHeader>
          <CardTitle>Best Selling Products</CardTitle>
          <CardDescription>Top products overview</CardDescription>
          <CardAction>
            <TooltipProvider>
              <Tooltip />
            </TooltipProvider>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-md border px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-muted-foreground/20" />
                <div className="min-w-0 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/20" />
                  <div className="h-3 w-16 animate-pulse rounded bg-muted-foreground/20" />
                </div>
              </div>

              <div className="h-4 w-20 shrink-0 animate-pulse rounded bg-muted-foreground/20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Best Selling Products</CardTitle>
        <CardDescription>Top products overview</CardDescription>
        <CardAction>
          <TooltipProvider>
            <Tooltip />
          </TooltipProvider>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        {products.length > 0 ? (
          products.map((product) => (
            <Link
              key={product._id}
              href={`/dashboard/admin/product-list/${product._id}`}
              className="hover:bg-muted flex flex-col gap-3 rounded-md border px-4 py-3 transition sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={getProductImage(product.image)}
                    fill
                    className="object-cover"
                    alt={product.name || "Product image"}
                    unoptimized
                  />
                </div>

                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {product.name}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    ${product.price}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-left text-sm text-green-600 sm:text-right">
                In Stock: {product.stock?.quantity ?? 0}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            No products found.
          </p>
        )}
      </CardContent>
    </Card>
  );
}