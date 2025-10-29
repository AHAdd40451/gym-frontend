import React from 'react'
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersDataTable from '../../(auth)/pages/orders/data-table'

const page = () => {
  // Dummy data according to OrdersDataTable columns
  const orders = [
    {
      id: 1,
      product_name: "Mass Gainer Pro 5kg",
      image: "/products/mass-gainer.jpg",
      customer: {
        name: "Ahmed Ali",
        email: "ahmed.ali@example.com"
      },
      price: "Rs. 8,500",
      status: "completed",
      date: "2024-10-15",
      type: "sale"
    },
    {
      id: 2,
      product_name: "Whey Protein Isolate",
      image: "/products/whey-protein.jpg",
      customer: {
        name: "Fatima Khan",
        email: "fatima.khan@example.com"
      },
      price: "Rs. 12,000",
      status: "active",
      date: "2024-10-20",
      type: "sale"
    },
    {
      id: 3,
      product_name: "Creatine Monohydrate",
      image: "/products/creatine.jpg",
      customer: {
        name: "Hassan Raza",
        email: "hassan.raza@example.com"
      },
      price: "Rs. 3,500",
      status: "transportation",
      date: "2024-10-22",
      type: "sale"
    },
    {
      id: 4,
      product_name: "Pre-Workout Boost",
      image: "/products/pre-workout.jpg",
      customer: {
        name: "Ayesha Malik",
        email: "ayesha.malik@example.com"
      },
      price: "Rs. 4,200",
      status: "pending",
      date: "2024-10-25",
      type: "sale"
    },
    {
      id: 5,
      product_name: "BCAA Recovery",
      image: "/products/bcaa.jpg",
      customer: {
        name: "Usman Sheikh",
        email: "usman.sheikh@example.com"
      },
      price: "Rs. 5,800",
      status: "cancel",
      date: "2024-10-18",
      type: "refund"
    },
    {
      id: 6,
      product_name: "Glutamine Powder",
      image: "/products/glutamine.jpg",
      customer: {
        name: "Sara Ahmed",
        email: "sara.ahmed@example.com"
      },
      price: "Rs. 3,200",
      status: "completed",
      date: "2024-10-12",
      type: "sale"
    },
    {
      id: 7,
      product_name: "Multivitamin Complex",
      image: "/products/multivitamin.jpg",
      customer: {
        name: "Bilal Hussain",
        email: "bilal.hussain@example.com"
      },
      price: "Rs. 2,500",
      status: "active",
      date: "2024-10-26",
      type: "sale"
    },
    {
      id: 8,
      product_name: "Omega-3 Fish Oil",
      image: "/products/omega3.jpg",
      customer: {
        name: "Zainab Tariq",
        email: "zainab.tariq@example.com"
      },
      price: "Rs. 1,800",
      status: "transportation",
      date: "2024-10-24",
      type: "sale"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header Section with Title and Button */}
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Orders</h1>
        {/* <Button asChild>
          <Link href="#">
            <PlusIcon /> Create category
          </Link>
        </Button> */}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
          <TabsTrigger value="returned">Returned</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
        </TabsList>

        {/* Orders Data Table */}
        <OrdersDataTable data={orders} />
      </Tabs>
    </div>
  )
}

export default page