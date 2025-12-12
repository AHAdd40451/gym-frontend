import React from 'react'
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllProducts } from '@/lib/api/services/product/product';
import ProductListTable from './product-list-table';

// Server Component - This runs on the server
const page = async () => {
  // Fetch products from API on the server
  const response = await getAllProducts();
  
  // Handle API response
  const products = response.data?.products || [];
  const hasError = response.error;

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/dashboard/pages/products/create">
            <PlusIcon /> Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* <Card>
          <CardHeader>
            <CardDescription>Total Sales</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">$30,230</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-green-600">+20.1%</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card> */}
        {/* <Card>
          <CardHeader>
            <CardDescription>Number of Sales</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">982</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-green-600">+5.02</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card> */}
        {/* <Card>
          <CardHeader>
            <CardDescription>Affiliate</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">$4,530</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-green-600">+3.1%</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card> */}
        {/* <Card>
          <CardHeader>
            <CardDescription>Discounts</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">$2,230</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-red-600">-3.58%</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card> */}
      </div>

      {/* Error Message */}
      {hasError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">Failed to load products. Please try again later.</p>
        </div>
      )}

      {/* Product List Table - Client Component */}
      <div className="pt-4">
        <ProductListTable products={products} />
      </div>
    </div>
  )
}

export default page