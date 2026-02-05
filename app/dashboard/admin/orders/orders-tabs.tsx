"use client";

import React, { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersDataTable from "./data-table";
import type { Order } from "./data-table";

// Same statuses as order detail modal: Processing, Shipped, Out for Delivery, Delivered, Cancelled
function normalizeStatus(status: string): string {
  return (status || "").toLowerCase().replace(/\s+/g, "_");
}

export function OrdersTabs({ orders }: { orders: Order[] }) {
  const [activeTab, setActiveTab] = useState("overview");

  const filteredOrders = useMemo(() => {
    if (activeTab === "overview") return orders;
    return orders.filter((order) => {
      const status = normalizeStatus(order.status);
      return status === activeTab;
    });
  }, [orders, activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">All</TabsTrigger>
        <TabsTrigger value="processing">Processing</TabsTrigger>
        <TabsTrigger value="shipped">Shipped</TabsTrigger>
        <TabsTrigger value="out_for_delivery">Out for Delivery</TabsTrigger>
        <TabsTrigger value="delivered">Delivered</TabsTrigger>
        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
      </TabsList>
      <OrdersDataTable data={filteredOrders} />
    </Tabs>
  );
}
