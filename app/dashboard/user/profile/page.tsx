"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LatestActivity } from "../../../../components/dashboard/Profile/latest-activity";
import { AboutMe } from "../../../../components/dashboard/Profile/about-me";
import { Connections } from "../../../../components/dashboard/Profile/connections";
import { ProfileCard } from "../../../../components/dashboard/Profile/profile-card";
import { useAuth } from "@/lib/api/services/auth/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompleteYourProfileCard } from "../../../../components/dashboard/Profile/complete-your-profile";

// Client Component - gets user from auth context and localStorage
export default function Page() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(authUser || null);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
        }
      }
    }
  }, []);

  // Update user when auth context changes
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // Listen to userUpdated events to refresh user data
  useEffect(() => {
    const handleUserUpdate = () => {
      console.log("🔄 userUpdated event received in Profile Page");
      if (typeof window !== "undefined") {
        const updatedUserStr = localStorage.getItem("currentUser");
        if (updatedUserStr) {
          try {
            const updatedUser = JSON.parse(updatedUserStr);
            console.log("✅ Updating Profile Page with new user data");
            setUser(updatedUser);
          } catch (error) {
            console.error("Failed to parse updated user from localStorage:", error);
          }
        }
      }
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-lg font-semibold">Please log in to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
          Profile Page ({user.role})
        </h1>
        <div className="flex items-center space-x-2">
          {/* <Button asChild>
            <Link href="/dashboard/pages/settings">
              <Settings />
              Settings
            </Link>
          </Button> */}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <ProfileCard user={user} />
          {/* <CompleteYourProfileCard /> */}
        </div>
        <div className="space-y-4 xl:col-span-2">
          <LatestActivity user={user} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AboutMe user={user} />
            {/* <Connections /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
