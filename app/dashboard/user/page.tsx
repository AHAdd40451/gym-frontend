"use client";

import Link from "next/link";
import { Dumbbell, User, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { useAuth } from "@/lib/api/services/auth/context";

const UserDashboardContent = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <CustomDateRangePicker />
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
            View your schedule and stay on track with your fitness goals.
          </CardDescription>
        </CardHeader>
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
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/user/profile">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
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
            <p>• Check your schedule regularly.</p>
            <p>• Update your profile when needed.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardContent;
