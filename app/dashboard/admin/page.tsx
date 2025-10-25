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
import { getOrders } from "@/lib/api/server";
import { OrderList } from "@/components/dashboard/OrderList";
import { getServerAuth } from "@/lib/auth/server";

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
  const [ordersResult] = await Promise.all([
    getOrders(1, 10, undefined, token || "") // page 1, limit 10
  ]);

  console.log(ordersResult, "ordersResult");

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <EcommerceRecentOrdersCard />
      </div>
    </div>
  );
}
