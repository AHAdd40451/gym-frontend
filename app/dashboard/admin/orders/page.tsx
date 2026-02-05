import React from "react";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { getAllOrders } from "@/lib/api/services/order/order";
import { OrdersTabs } from "./orders-tabs";

const page = async () => {
  const { user, token } = await getServerAuth();
  const ordersResult = await getAllOrders({}, token || "");
  
  // Map backend orders to match OrdersDataTable columns
  const orders = ordersResult.data
    ? ordersResult.data.map((order: any, idx: number) => {
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
          status: (order.status ?? "pending").toString().toLowerCase().replace(/\s+/g, "_"),
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
        {/* <Button asChild>
          <Link href="#">
            <PlusIcon /> Create Order
          </Link>
        </Button> */}
      </div>

      <OrdersTabs orders={orders as any} />
    </div>
  );
};

export default page;