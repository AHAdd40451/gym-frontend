import Link from "next/link";
import { Settings } from "lucide-react";
import { generateMeta } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardSkills } from "@/app/dashboard/(auth)/pages/profile/card-skills";
import { LatestActivity } from "./latest-activity";
import { AboutMe } from "./about-me";
import { Connections } from "@/app/dashboard/(auth)/pages/profile/connections";
import { ProfileCard } from "@/app/dashboard/user/profile/profile-card";
import { getServerAuth } from "@/lib/api/services/auth/server"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompleteYourProfileCard } from "./complete-your-profile";
// SEO Metadata
export async function generateMetadata() {
  return generateMeta({
    title: "Profile Page",
    description:
      "You can use the profile page template to show user details. Built with shadcn/ui components.",
    canonical: "/pages/profile"
  });
}

// ✅ Make it async to use await (server-side)
export default async function Page() {
  const { user } = await getServerAuth();
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

      {/* <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
      </Tabs> */}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <ProfileCard user={user} />
          <CompleteYourProfileCard />
          <CardSkills />
        </div>
        <div className="space-y-4 xl:col-span-2">
          <LatestActivity  user={user} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AboutMe />
            <Connections />
          </div>
        </div>
      </div>
    </div>
  );
}
