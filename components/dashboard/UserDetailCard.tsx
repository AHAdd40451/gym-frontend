"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteUser } from "@/lib/api/services/users/users";

// Types
interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role?: string;
  profileImage?: string;
  status?: string;
  isEmailVerified?: boolean;
  phoneNumber?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserDetailCardProps {
  user: User;
  token: string;
}

export function UserDetailCard({ user, token }: UserDetailCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.name || "N/A";

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.name
    ? user.name.substring(0, 2).toUpperCase()
    : "NA";

  const handleDelete = async () => {
    if (!user) return;

    setDeleting(true);

    try {
      const success = await deleteUser(token, user._id);

      if (success) {
        toast.success("User deleted successfully!");
        router.push("/dashboard/admin/all-users");
      } else {
        toast.error("Failed to delete user. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting the user.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center space-y-4 pt-4 pb-8">
        
        {/* Back Button */}
        <div className="mb-2 self-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-1">
            <ArrowLeft className="size-4" />
          </Button>
        </div>

        {/* Avatar */}
        <Avatar className="size-24">
          <AvatarImage src={user.profileImage || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        {/* Name and Role */}
        <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
          {displayName}
          {user.role && <Badge variant="info">{user.role}</Badge>}
        </h5>

        {/* Email */}
        <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
          <Mail className="size-4" /> {user.email}
        </div>

        {/* Status Badge */}
        {user.status && (
          <Badge
            variant={user.status === "active" ? "success" : "secondary"}
            className="mt-3"
          >
            {user.status}
          </Badge>
        )}

        {/* Email Verification Badge */}
        {user.isEmailVerified !== undefined && (
          <Badge
            variant={user.isEmailVerified ? "success" : "secondary"}
            className="mt-3"
          >
            {user.isEmailVerified ? "Verified" : "Not Verified"}
          </Badge>
        )}

        {/* Phone Number */}
        {user.phoneNumber && (
          <span className="mt-2 text-sm">📞 {user.phoneNumber}</span>
        )}

        {/* Additional Info */}
        <div className="mt-4 w-full text-sm space-y-2 text-center border-t pt-4">
          <p><strong>User ID:</strong> {user._id}</p>
          
          {user.address && (
            <p><strong>Address:</strong> {user.address}</p>
          )}
          
          {user.createdAt && (
            <p>
              <strong>Member Since:</strong>{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Delete Button with Confirmation Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="mt-6 w-full"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Remove User"}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-500">Delete User?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure you want to permanently delete{" "}
                <strong>{displayName}</strong>?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Yes, Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}


