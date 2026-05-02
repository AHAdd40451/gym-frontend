"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAvatarFallback } from "@/lib/utils";
import useChatStore from "@/app/dashboard/(auth)/apps/chat/useChatStore";
import { usersApi } from "@/lib/api/services/users/users";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
} from "@/components/ui/avatar";

import { UserPropsTypes } from "@/app/dashboard/(auth)/apps/chat/types";

export function ChatHeader({ user }: { user: UserPropsTypes }) {
  const { setSelectedChat } = useChatStore();

  const [open, setOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [counts, setCounts] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 OPEN MODAL + FETCH USER
 const handleOpenUserModal = async (id: string) => {
  try {
    setLoading(true);
    setOpen(true);

    const res = await usersApi.getById(id);

    // 🔥 DEBUG (must do once)
    console.log("API RESPONSE:", res);

    // ✅ FIXED MAPPING
    const user = res?.user || res?.data?.user || res;

    setUserDetails(user);
    setCounts(res?.counts || {});
  } catch (error) {
    console.error("User fetch error:", error);
    setUserDetails(null);
    setCounts(null);
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <div className="flex justify-between gap-4 lg:px-4">
        <div className="flex gap-4">
          <Button
            size="sm"
            variant="outline"
            className="flex size-10 p-0 lg:hidden"
            onClick={() => setSelectedChat(null)}
          >
            <ArrowLeft />
          </Button>

          <Avatar className="overflow-visible lg:size-10">
            <AvatarImage src={user?.avatar} alt="avatar image" />
            <AvatarIndicator variant={user?.online_status} />
            <AvatarFallback>
              {generateAvatarFallback(user?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            {/* ✅ CLICKABLE NAME */}
            <span
              onClick={() => handleOpenUserModal(user?._id || user?.id)}
              className="text-sm font-semibold cursor-pointer hover:underline"
            >
              {user?.name}
            </span>

            {user?.online_status === "online" ? (
              <span className="text-xs text-green-500">Online</span>
            ) : (
              <span className="text-xs text-muted-foreground">Offline</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="hidden lg:flex lg:gap-2">
         
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : userDetails ? (
            <div className="space-y-4">

              {/* Cover / Profile */}
              <div className="flex items-center gap-3">
                <img
                  src={userDetails?.profileImage}
                  className="w-14 h-14 rounded-full object-cover"
                  alt="profile"
                />
                <div>
                  <p className="font-semibold">
                    {userDetails?.firstName} {userDetails?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userDetails?.email}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="text-sm space-y-1">
                <p>
                  <strong>Country:</strong>{" "}
                  {userDetails?.location?.country || "N/A"}
                </p>

                <p>
                  <strong>Status:</strong> {userDetails?.status}
                </p>

                <p>
                  <strong>Bio:</strong>{" "}
                  {userDetails?.bio || "No bio available"}
                </p>
              </div>

              {/* Counts */}
              <div className="flex gap-4 text-sm pt-2 border-t">
                <p>
                  <strong>Posts:</strong> {counts?.posts ?? 0}
                </p>
                <p>
                  <strong>Followers:</strong> {counts?.followers ?? 0}
                </p>
                <p>
                  <strong>Following:</strong> {counts?.following ?? 0}
                </p>
              </div>

            </div>
          ) : (
            <p className="text-sm text-red-500">User not found</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}