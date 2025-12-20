import Link from "next/link";
import { Settings } from "lucide-react";
import { generateMeta } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardSkills } from "../../../../components/dashboard/Profile/card-skills";
import { LatestActivity } from "../../../../components/dashboard/Profile/latest-activity";
import { AboutMe } from "../../../../components/dashboard/Profile/about-me";
import { Connections } from "../../../../components/dashboard/Profile/connections";
import { ProfileCard } from "../../../../components/dashboard/Profile/profile-card";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompleteYourProfileCard } from "../../../../components/dashboard/Profile/complete-your-profile";

// SEO Metadata
export async function generateMetadata() {
  return generateMeta({
    title: "Profile Page",
    description:
      "You can use the profile page template to show user details. Built with shadcn/ui components.",
    canonical: "/pages/profile"
  });
}

// Server Component
export default async function Page() {
  const { user } = await getServerAuth();
  console.log("profile", user);
  

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
          <Button asChild>
            <Link href="/dashboard/pages/settings">
              <Settings />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <ProfileCard user={user} />
          <CompleteYourProfileCard />
          <CardSkills />
        </div>
        <div className="space-y-4 xl:col-span-2">
          <LatestActivity user={user} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AboutMe />
            <Connections />
          </div>
        </div>
      </div>
    </div>
  );
}
