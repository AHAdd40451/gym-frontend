"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserById, buyTrainer } from "@/lib/api/services/getstaff/staff";

// ⬅️ NEW IMPORT (Just this one)
import BookingCalendar from "../../../../Calendar/calendar"; 

const BookingUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [alreadyBought, setAlreadyBought] = useState(false);

  const loggedInUser =
    JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await getUserById(id as string, token);

        const userData = res?.data?.data?.user || res?.data?.user || null;
        setUser(userData);

        if (loggedInUser?.purchasedTrainerId === userData?._id) {
          setAlreadyBought(true);
        }

      } catch (err) {
        console.error("Error fetching user:", err);
        alert("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) return <p className="mt-10 text-center">Loading...</p>;
  if (!user) return <p className="mt-10 text-center">No user found.</p>;

  const trainer = user.trainerProfile;

  const handleBuyPlan = async () => {
    try {
      setBuying(true);
      const token = localStorage.getItem("authToken") || "";
      const res = await buyTrainer(user._id, token);

      const backendMsg =
        res?.error ||
        res?.data?.message ||
        res?.message ||
        "Unexpected response from server.";

      alert(backendMsg);

      if (backendMsg.toLowerCase().includes("already")) {
        setAlreadyBought(true);
      }

    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";

      alert(errMsg);

      if (errMsg.toLowerCase().includes("already")) {
        setAlreadyBought(true);
      }

    } finally {
      setBuying(false);
    }
  };

  const qualities =
    trainer?.qualities?.length > 0
      ? trainer.qualities
      : ["Motivation", "Discipline", "HIIT"];

  return (
    <div className="mt-10 flex flex-col justify-center px-10 gap-10">

      {/* ----------- USER DETAIL CARD -------------- */}
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center space-y-4 pt-6 pb-8">

          <Avatar className="size-24">
            <AvatarImage src={user.profileImage || undefined} />
            <AvatarFallback>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
            {user.firstName} {user.lastName}
            <Badge variant="info">{user.role}</Badge>
          </h5>

          <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
            <Mail className="size-4" /> {user.email}
          </div>

          <Badge
            variant={user.status === "active" ? "success" : "secondary"}
            className="mt-3"
          >
            {user.status}
          </Badge>

          <Badge
            variant={user.isEmailVerified ? "success" : "secondary"}
            className="mt-3"
          >
            {user.isEmailVerified ? "Verified" : "Not Verified"}
          </Badge>

          {user.role === "staff" && trainer && (
            <div className="mt-4 w-full text-sm space-y-2 text-center border-t pt-4">
              <p><strong>Trainer:</strong> Yes</p>

              {trainer.plan && (
                <p>
                  <strong>Plan:</strong> {trainer.plan.name} — ${trainer.plan.price}
                </p>
              )}

              {trainer.availability?.days && (
                <p>
                  <strong>Available Days:</strong> {trainer.availability.days}
                </p>
              )}

              <div>
                <strong>Qualities:</strong>
                <ul className="list-disc ml-6 mt-1 text-left">
                  {qualities.map((q: string, index: number) => (
                    <li key={index}>{q}</li>
                  ))}
                </ul>
              </div>

              {loggedInUser.role !== "staff" && (
                <></>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ----------- ⬇️ CALENDAR ADDED HERE -------------- */}
      <div className="w-full max-w-4xl mx-auto">
        <BookingCalendar />
      </div>

    </div>
  );
};

export default BookingUserDetail;
