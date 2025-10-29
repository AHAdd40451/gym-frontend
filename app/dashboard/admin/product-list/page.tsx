import React from 'react'
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductList from '@/app/dashboard/(auth)/pages/products/product-list';

const page = () => {
  // Dummy products data
  const products = [
    {
      id: 1,
      name: "Mass Gainer Pro 5kg",
      image: "/products/mass-gainer.jpg",
      category: "Protein",
      price: 8500,
      stock: 45,
      status: "active",
      description: "High-quality mass gainer for muscle building"
    },
    {
      id: 2,
      name: "Whey Protein Isolate",
      image: "/products/whey-protein.jpg",
      category: "Protein",
      price: 12000,
      stock: 32,
      status: "active",
      description: "Pure whey protein isolate"
    },
    {
      id: 3,
      name: "Creatine Monohydrate",
      image: "/products/creatine.jpg",
      category: "Supplements",
      price: 3500,
      stock: 78,
      status: "active",
      description: "Micronized creatine for strength"
    },
    {
      id: 4,
      name: "Pre-Workout Boost",
      image: "/products/pre-workout.jpg",
      category: "Energy",
      price: 4200,
      stock: 0,
      status: "out-of-stock",
      description: "Energy boost for intense workouts"
    },
    {
      id: 5,
      name: "BCAA Recovery",
      image: "/products/bcaa.jpg",
      category: "Recovery",
      price: 5800,
      stock: 23,
      status: "active",
      description: "Branch chain amino acids for recovery"
    },
    {
      id: 6,
      name: "Glutamine Powder",
      image: "/products/glutamine.jpg",
      category: "Recovery",
      price: 3200,
      stock: 56,
      status: "active",
      description: "Pure glutamine powder"
    },
    {
      id: 7,
      name: "Multivitamin Complex",
      image: "/products/multivitamin.jpg",
      category: "Vitamins",
      price: 2500,
      stock: 12,
      status: "low-stock",
      description: "Complete multivitamin formula"
    },
    {
      id: 8,
      name: "Omega-3 Fish Oil",
      image: "/products/omega3.jpg",
      category: "Health",
      price: 1800,
      stock: 67,
      status: "active",
      description: "Premium omega-3 supplement"
    }
  ];

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
        <Card>
          <CardHeader>
            <CardDescription>Total Sales</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">$30,230</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-green-600">+20.1%</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Number of Sales</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">982</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-green-600">+5.02</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Affiliate</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">$4,530</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-green-600">+3.1%</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Discounts</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">$2,230</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-red-600">-3.58%</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      </div>

      {/* Product List Table */}
      <div className="pt-4">
        <ProductList data={products} />
      </div>
    </div>
  )
}

export default page