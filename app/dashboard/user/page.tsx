// "use client";

// import { CalendarCheck, Dumbbell, User, Target } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   EcommerceBestSellingProductsCard,
//   EcommerceCustomerReviewsCard,
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
// import { useAuth } from "@/lib/api/services/auth/context";

// const UserDashboardContent = () => {
//   const router = useRouter();
//   const { user } = useAuth();

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-row items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <CustomDateRangePicker />
//           <Button onClick={() => router.push("/dashboard/user/attendancecheck")}>
//             <CalendarCheck />
//             <span className="hidden lg:inline ml-2">Attendance</span>
//           </Button>
//         </div>
//       </div>

//       {/* Welcome */}
//       <Card className="bg-muted/50 border-border">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-xl font-semibold tracking-tight">
//             Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName ?? user?.email ?? "Member"}
//           </CardTitle>
//           <CardDescription className="text-muted-foreground">
//             View your schedule, check attendance, and stay on track with your fitness goals.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="pt-0">
//           <p className="text-sm text-muted-foreground">
//             Use the options above to pick a date range or mark your attendance for the day.
//           </p>
//         </CardContent>
//       </Card>

//       {/* Quick actions & Stay on Track */}
//       <div className="grid gap-4 lg:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Target className="h-5 w-5" />
//               Quick Actions
//             </CardTitle>
//             <CardDescription>Shortcuts to common tasks</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-2">
//             <Button
//               className="w-full justify-start"
//               variant="outline"
//               onClick={() => router.push("/dashboard/user/attendancecheck")}
//             >
//               <CalendarCheck className="mr-2 h-4 w-4" />
//               Mark Attendance
//             </Button>
//             <Button className="w-full justify-start" variant="outline" onClick={() => router.push("/dashboard/user/profile")}>
//               <User className="mr-2 h-4 w-4" />
//               My Profile
//             </Button>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Dumbbell className="h-5 w-5" />
//               Stay on Track
//             </CardTitle>
//             <CardDescription>Tips for your fitness journey</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-3 text-sm text-muted-foreground">
//             <p>• Mark your attendance daily to keep your streak and track progress.</p>
//             <p>• Check your schedule regularly for class timings and any updates.</p>
//             <p>• Update your profile if your contact or preferences change.</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* <div className="space-y-4">
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
//       </div> */}
//     </div>
//   );
// };

// export default UserDashboardContent;
"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Dumbbell, User, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { useAuth } from "@/lib/api/services/auth/context";
import { checkTodayAttendance, createAttendance } from "@/lib/api/services/attendence/attendence";
import { Toaster, toast } from "sonner";

const UserDashboardContent = () => {
  const { user } = useAuth();

  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch today attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const storedUser = localStorage.getItem("currentUser");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser?.id ?? parsedUser?._id;
        if (!userId) return;

        const res = await checkTodayAttendance(userId);
        setAlreadyMarked(Boolean(res?.data?.alreadyMarked));
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };

    fetchAttendance();
  }, []);

  // 🔹 Open modal instead of navigate
  const handleAttendanceClick = () => {
    if (checking || alreadyMarked) return;
    setModalOpen(true);
  };

  // 🔹 Mark attendance inside modal
  const handleCreateAttendance = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("currentUser");
      if (!userStr) throw new Error("User not logged in");

      const userId = JSON.parse(userStr)?.id;
      const today = new Date().toISOString().split("T")[0];

      const res = await createAttendance(userId, today, "present");

      if (res?.data?.message) {
        toast.success(res.data.message);
        setAlreadyMarked(true);
        setModalOpen(false);
      } else if (res?.error) {
        toast.error(res.error);
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <CustomDateRangePicker />

          <Button
            className=" justify-start"
            variant={alreadyMarked ? "secondary" : "outline"}
            disabled={checking || alreadyMarked}
            onClick={handleAttendanceClick}>
            <CalendarCheck className="mr-2 h-4 w-4" />
            {checking
              ? "Checking Attendance..."
              : alreadyMarked
                ? "Attendance Already Marked"
                : "Mark Attendance"}
          </Button>
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="bg-muted/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Welcome back,{" "}
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : (user?.firstName ?? user?.email ?? "Member")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            View your schedule, check attendance, and stay on track with your fitness goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm">
            {checking
              ? "⏳ Checking today’s attendance..."
              : alreadyMarked
                ? "✅ You have already marked your attendance today."
                : "📌 Don’t forget to mark your attendance for today."}
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
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
              onClick={handleAttendanceClick}
              disabled={checking || alreadyMarked}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              {checking
                ? "Checking Attendance..."
                : alreadyMarked
                  ? "Attendance Already Marked"
                  : "Mark Attendance"}
            </Button>

            <Button className="w-full justify-start" variant="outline">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Button>
          </CardContent>
        </Card>

        {/* Fitness Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Stay on Track
            </CardTitle>
            <CardDescription>Tips for your fitness journey</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <p>• Mark your attendance daily to keep your streak.</p>
            <p>• Check your schedule regularly.</p>
            <p>• Update your profile when needed.</p>
          </CardContent>
        </Card>
      </div>

      {/* 🔥 Modal using same ManualAttendance UI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-black">
              <X />
            </button>

            <h2 className="mb-4 text-2xl font-bold text-black">Manual Attendance</h2>
            <p className="mb-6 text-sm text-gray-600">Apni attendance manually mark karein</p>

            <button
              onClick={handleCreateAttendance}
              disabled={loading || alreadyMarked}
              className="w-full cursor-pointer rounded-lg bg-black py-3 font-semibold text-white shadow transition disabled:opacity-50">
              {loading
                ? "Processing..."
                : alreadyMarked
                  ? "Attendance Marked"
                  : "Create Attendance"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardContent;
