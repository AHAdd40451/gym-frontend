import React from "react";
import { CalendarPlus } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileCard from "./profile-card";

const Page = () => {
  return (
    <div className="space-y-6 pb-8">
      <Card className="border-none bg-gradient-to-r from-primary/12 via-background to-background shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold md:text-3xl">
            <CalendarPlus className="size-6 text-primary" />
            Book Your Trainer
          </CardTitle>
          <CardDescription>
            Explore available staff trainers, compare plans, and open details to continue booking.
          </CardDescription>
        </CardHeader>
      </Card>

      <ProfileCard />
    </div>
  );
};

export default Page;
