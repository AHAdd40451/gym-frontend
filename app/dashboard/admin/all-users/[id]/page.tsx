import { getUserWithSubscriptions } from "@/lib/api/services/users/users";
import { UserDetailCard } from "@/components/dashboard/UserDetailCard";
import { getServerAuth } from "@/lib/api/services/auth/server";
import { redirect } from "next/navigation";
import { CardSkills } from "../card-skills";
import { LatestActivity } from "../latest-activity";
import { AboutMe } from "../about-me";
import { Connections } from "@/components/dashboard/Profile/connections";
import { ProfileCard } from "./profile-card";
import Link from "next/link";
import { Settings } from "lucide-react";
import { generateMeta } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompleteYourProfileCard } from "../complete-your-profile";

const UserDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { user, auth, token } = await getServerAuth();

  const { id } = await params;
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-lg font-semibold">Please log in to view your profile.</h2>
      </div>
    );
  }

  const res = await getUserWithSubscriptions(id, token);





  console.log(res,"resssssss")
  const getUser = res.data?.user

  const subsUser = res.data?.subscriptions
  const transec = res.data?.transactions


  if (!getUser) {
    return <div className="mt-10 text-center text-red-500">User not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <ProfileCard user={getUser} />
          <CompleteYourProfileCard />
          <CardSkills />
        </div>
        <div className="space-y-4 xl:col-span-2">
          <LatestActivity user={subsUser} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* <AboutMe user={transec}/> */}
            <AboutMe subscriptions={subsUser} />

            <Connections />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
