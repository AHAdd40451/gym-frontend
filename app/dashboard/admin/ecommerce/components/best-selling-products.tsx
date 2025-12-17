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
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

import { getAllProducts, Product } from "@/lib/api/services/product/product";

export function EcommerceBestSellingProductsCard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await getAllProducts();

      // ⚠️ serverFetch pattern
      if (res?.data?.success) {
        // TEMP: top 6 products
        setProducts(res.data.products.slice(0, 6));
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">Loading products...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Best Selling Products</CardTitle>
        <CardDescription>Top products overview</CardDescription>
        <CardAction>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline">
                  <ChevronRight />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View All</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/dashboard/pages/products/${product._id}`}
            className="hover:bg-muted flex items-center justify-between rounded-md border px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <Image
                src={product.image || "/images/placeholder.png"}
                width={40}
                height={40}
                className="rounded-md"
                alt={product.name}
                unoptimized
              />
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-muted-foreground">
                  ${product.price}
                </div>
              </div>
            </div>

            {/* TEMP text (real selling orders se aayega) */}
            <div className="text-sm text-green-600">
              In Stock: {product.stock?.quantity ?? 0}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
