import { generateMeta } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  EcommerceCustomerReviewsCard,
  EcommerceNewCustomersCard,
  EcommerceReturnRateCard,
  EcommerceRevenueCard,
  EcommerceSalesByLocationCard,
  EcommerceSalesCard,
  EcommerceTotalRevenueCard,
  EcommerceWelcomeCard
} from "../ecommerce/components";
import StatCards from "../ecommerce/components/stat-cards";
import { EcommerceBestSellingProductsCard } from "./components/best-selling-products";
import { EcommerceRecentOrdersCard } from "./components/table-order-status";

export async function generateMetadata() {
  return generateMeta({
    title: "Ecommerce Admin Dashboard",
    description:
      "The e-commerce admin dashboard template is an admin template that you can use for your e-commerce website projects. Built with shadcn/ui, Tailwind CSS, Next.js.",
    canonical: "/ecommerce"
  });
}

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">E-Commerce Dashboard</h1>
        {/* <div className="flex items-center space-x-2">
          <CustomDateRangePicker />
          <Button>
            <Download />
            <span className="hidden lg:inline">Download</span>
          </Button>
        </div> */}
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-12">
          <EcommerceWelcomeCard />
          <div className="md:col-span-12 lg:col-span-8">
            <StatCards />
          </div>
        </div>
        <div className="space-y-4 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
          <EcommerceTotalRevenueCard />
          <EcommerceReturnRateCard />
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          <EcommerceSalesByLocationCard />
          <EcommerceCustomerReviewsCard />
        </div>
        <div className="gap-4 space-y-4 lg:space-y-0 xl:grid xl:grid-cols-3">
                <div className="xl:col-span-1">
                  <EcommerceBestSellingProductsCard />
                </div>
                <div className="xl:col-span-2">
                  <EcommerceRecentOrdersCard />
                </div>
        </div>
      </div>
    </div>
  );
}
