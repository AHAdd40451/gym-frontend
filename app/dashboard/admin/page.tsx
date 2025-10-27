import { generateMeta } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  EcommerceBestSellingProductsCard,
  EcommerceCustomerReviewsCard,
  EcommerceNewCustomersCard,
  EcommerceRecentOrdersCard,
  EcommerceReturnRateCard,
  EcommerceRevenueCard,
  EcommerceSalesByLocationCard,
  EcommerceSalesCard,
  EcommerceTotalRevenueCard,
  EcommerceVisitBySourceCard,
  EcommerceWelcomeCard
} from "@/app/dashboard/user/components";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Download } from "lucide-react";
import StatCards from "@/app/dashboard/user/components/stat-cards";
import { getServerAuth } from "@/lib/auth/server";
import { getAllOrders, transformOrdersToUI } from "@/lib/api/order";

export async function generateMetadata() {
  return generateMeta({
    title: "Ecommerce Admin Dashboard",
    description:
      "The e-commerce admin dashboard template  an admin template that you can use for your e-commerce website projects. Built with shadcn/ui, Tailwind CSS, Next.js.",
    canonical: "/ecommerce"
  });
}

// Fetch data on the server side

export default async function AdminDashboardPage() {
  const { user, token } = await getServerAuth();

  const ordersResult = await getAllOrders({}, token || "");

  // Transform backend orders to UI component format
  const transformedOrders = ordersResult.data ? transformOrdersToUI(ordersResult.data) : [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <EcommerceRecentOrdersCard orders={transformedOrders} />
      </div>
    </div>
  );
}
