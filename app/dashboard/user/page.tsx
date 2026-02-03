// import { generateMeta } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   EcommerceBestSellingProductsCard,
//   EcommerceCustomerReviewsCard,
//   EcommerceNewCustomersCard,
//   EcommerceRecentOrdersCard,
//   EcommerceReturnRateCard,
//   EcommerceRevenueCard,
//   EcommerceSalesByLocationCard,
//   EcommerceSalesCard,
//   EcommerceTotalRevenueCard,
//   EcommerceVisitBySourceCard,
//   EcommerceWelcomeCard
// } from "@/app/dashboard/user/components";
// import CustomDateRangePicker from "@/components/custom-date-range-picker";
// import { Download } from "lucide-react";
// import StatCards from "@/app/dashboard/user/components/stat-cards";
// import { useRouter } from "next/navigation";

// export async function generateMetadata() {
//   return generateMeta({
//     title: "Ecommerce Admin Dashboard",
//     description:
//       "The e-commerce admin dashboard template is an admin template that you can use for your e-commerce website projects. Built with shadcn/ui, Tailwind CSS, Next.js.",
//     canonical: "/ecommerce"
//   });
// }

// const UserDashboardContent = () => {
//     const router = useRouter();

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-row items-center justify-between">
//         <h1 className="text-xl font-bold tracking-tight lg:text-2xl">E-Commerce Dashboard</h1>
//         <div className="flex items-center space-x-2">
//           <CustomDateRangePicker />
//          <Button onClick={() => router.push("/download")}>
//       <Download />
//       <span className="hidden lg:inline ml-2">Download</span>
//     </Button>
//         </div>
//       </div>
//       <div className="space-y-4">
//         <div className="grid gap-4 lg:grid-cols-12">
//           <EcommerceWelcomeCard />
//           <div className="md:col-span-12 lg:col-span-8">
//             <StatCards />
//           </div>
//         </div>
//         <div className="space-y-4 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
//           <EcommerceTotalRevenueCard />
//           <EcommerceReturnRateCard />
//         </div>
//         <div className="grid gap-4 lg:grid-cols-12">
//           <EcommerceSalesByLocationCard />
//           <EcommerceVisitBySourceCard />
//           <EcommerceCustomerReviewsCard />
//         </div>
//         <div className="space-y-4 xl:grid xl:grid-cols-12 xl:gap-4 xl:space-y-0">
//           <EcommerceRecentOrdersCard />
//           <EcommerceBestSellingProductsCard />
//         </div>
//       </div>
//     </div>
//   );
// }
// export default function Page() {
//   return (
//       <UserDashboardContent />
//   );
// }





"use client";

import { CalendarCheck, Dumbbell, User, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EcommerceBestSellingProductsCard,
  EcommerceCustomerReviewsCard,
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
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/api/services/auth/context";

const UserDashboardContent = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <CustomDateRangePicker />
          <Button onClick={() => router.push("/dashboard/user/attendancecheck")}>
            <CalendarCheck />
            <span className="hidden lg:inline ml-2">Attendance</span>
          </Button>
        </div>
      </div>

      {/* Welcome */}
      <Card className="bg-muted/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName ?? user?.email ?? "Member"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            View your schedule, check attendance, and stay on track with your fitness goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Use the options above to pick a date range or mark your attendance for the day.
          </p>
        </CardContent>
      </Card>

      {/* Quick actions & Stay on Track */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Shortcuts to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/dashboard/user/attendancecheck")}
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => router.push("/dashboard/user/profile")}>
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Stay on Track
            </CardTitle>
            <CardDescription>Tips for your fitness journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Mark your attendance daily to keep your streak and track progress.</p>
            <p>• Check your schedule regularly for class timings and any updates.</p>
            <p>• Update your profile if your contact or preferences change.</p>
          </CardContent>
        </Card>
      </div>

      {/* <div className="space-y-4">
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
          <EcommerceVisitBySourceCard />
          <EcommerceCustomerReviewsCard />
        </div>

        <div className="space-y-4 xl:grid xl:grid-cols-12 xl:gap-4 xl:space-y-0">
          <EcommerceRecentOrdersCard />
          <EcommerceBestSellingProductsCard />
        </div>
      </div> */}
    </div>
  );
};

export default UserDashboardContent;
