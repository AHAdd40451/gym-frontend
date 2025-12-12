import React from "react";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { getAllOrders, transformOrdersToUI } from "@/lib/api/services/order/order";
import OrdersDataTable from "./data-table";

const page = async () => {
  const { user, token } = await getServerAuth();
  const ordersResult = await getAllOrders({}, token || "");
  
  // Map backend orders to match OrdersDataTable columns
  const orders = ordersResult.data
    ? ordersResult.data.map((order, idx) => {
        // Extract customer info from shippingAddress
        const shippingAddr = order.shippingAddress || {};
        const customerName = `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim() || order.guest || "Guest Customer";
        const customerEmail = shippingAddr.email || "";

        return {
          id: idx + 1,
          _id: order._id,
          product_name: order.items?.[0]?.title ?? "Product",
          image: order.items?.[0]?.image || "/products/placeholder.jpg",
          customer: {
            name: customerName,
            email: customerEmail,
            phone: shippingAddr.phone || "",
            address: shippingAddr.address || "",
            city: shippingAddr.city || "",
            postalCode: shippingAddr.postalCode || ""
          },
          price: `Rs. ${order.total || 0}`,
          status: order.status?.toLowerCase() ?? "pending",
          date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "",
          type: "sale"
        };
      })
    : [];

  return (
    <div className="space-y-4">
      {/* Header Section with Title and Button */}
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Orders</h1>
        <Button asChild>
          <Link href="#">
            <PlusIcon /> Create Order
          </Link>
        </Button>
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
        <OrdersDataTable data={orders as any} />
      </Tabs>
    </div>
  );
};

export default page;