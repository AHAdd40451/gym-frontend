"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CircleUserRoundIcon, Trash2Icon } from "lucide-react";

import { usersApi } from "@/lib/api/services/users/users";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useAuth } from "@/lib/api/services/auth/context";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// =========================
// ZOD SCHEMA
// =========================
const profileFormSchema = z.object({
  username: z.string().min(2, "Username is required"),
  email: z.string().email("Invalid email"),
  bio: z.string().max(160).optional(),
  urls: z
    .array(
      z.object({
        value: z.string().url("Invalid URL").or(z.literal("")),
      })
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Helper to safely extract error message
function getErrorMessage(error: any): string {
  if (!error) return "An unknown error occurred";
  
  // Check various error formats
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  if (error.data?.message) return error.data.message;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  
  // If it's an object, try to stringify it
  try {
    return JSON.stringify(error);
  } catch {
    return "An unknown error occurred";
  }
}

function extractUserFromUsersApiResponse(res: any) {
  // usersApi uses handleApiResponse which returns: { data: axiosResponseData, success, status }
  const payload = res?.data;
  return (
    payload?.data?.user ??
    payload?.user ??
    payload?.data ??
    payload ??
    null
  );
}

// Helper function to update user in localStorage accounts
function updateAccountInLocalStorage(updatedUser: any) {
  try {
    // Get current accounts from localStorage
    const accountsStr = localStorage.getItem("accounts");
    if (!accountsStr) return;
    
    const accounts = JSON.parse(accountsStr);
    const userId = updatedUser?._id || updatedUser?.id;
    
    if (!userId) return;
    
    // Find and update the matching account
    const updatedAccounts = accounts.map((acc: any) => {
      const accId = acc?._id || acc?.id;
      if (accId === userId) {
        // Merge updated user data with existing account
        return { ...acc, ...updatedUser };
      }
      return acc;
    });
    
    // Save updated accounts back to localStorage
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
    
    // Also update currentUser if it matches
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      const currentUserId = currentUser?._id || currentUser?.id;
      if (currentUserId === userId) {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
    }
    
    console.log("✅ Updated user in localStorage accounts");
  } catch (error) {
    console.error("❌ Failed to update localStorage accounts:", error);
  }
}

export default function Page() {
  const { user, setUser } = useAuth();

  const userId = user?._id || user?.id || (user as any)?.userId;

  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  const [{ files }, { removeFile, openFileDialog, getInputProps }] =
    useFileUpload({ accept: "image/*" });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      urls: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "urls",
  });

  // =========================
  // LOAD USER DATA (API first, auth context fallback)
  // =========================
  useEffect(() => {
    const resetFormFromUser = (u: any) => {
      if (!u) return;
      form.reset({
        username: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
        email: u.email ?? "",
        bio: u.bio ?? "",
        urls: Array.isArray(u.urls) ? u.urls.map((val: string) => ({ value: val })) : [],
      });
    };

    const loadUserProfile = async () => {
      if (!userId) {
        console.log("No userId available yet, waiting...");
        return;
      }

      console.log("Loading profile for userId:", userId);
      setFetchingProfile(true);
      
      try {
        const res = await usersApi.getById(String(userId));
        console.log("API Response:", res);
        
        const freshUser = extractUserFromUsersApiResponse(res);
        console.log("Extracted user:", freshUser);

        if (freshUser) {
          setUser(freshUser);
          resetFormFromUser(freshUser);
        } else {
          console.warn("No user data in API response, using auth context");
          resetFormFromUser(user);
        }
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        console.error("Failed to fetch user profile:", errorMsg, err);
        toast.error(`Failed to load profile: ${errorMsg}`);
        
        // fallback to auth context user (still allows update)
        resetFormFromUser(user);
      } finally {
        setFetchingProfile(false);
      }
    };

    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, setUser, form]);

  // =========================
  // SUBMIT PROFILE (API update + refresh user state + update localStorage)
  // =========================
  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    console.log("Submitting profile update for userId:", userId);
    console.log("Form data:", data);

    try {
      setLoading(true);

      const [firstName, ...lastNameArr] = data.username.trim().split(" ");

      const updateData = {
        firstName,
        lastName: lastNameArr.join(" ") || "",
        email: data.email,
        bio: data.bio,
        urls: data.urls
          ?.map((u) => u.value)
          .filter((url) => url !== ""),
      };

      console.log("Update data:", updateData);

      const updateResponse = await usersApi.update(String(userId), updateData);
      console.log("Update response:", updateResponse);

      if (files[0]?.file instanceof File) {
        console.log("Uploading profile image...");
        const uploadResponse = await usersApi.uploadProfileImage(String(userId), files[0].file);
        console.log("Upload response:", uploadResponse);
      }

      // Refresh user from API so avatar/header/etc update everywhere
      console.log("Fetching updated user data...");
      const res = await usersApi.getById(String(userId));
      const freshUser = extractUserFromUsersApiResponse(res);
      
      if (freshUser) {
        // Update auth context
        setUser(freshUser);
        console.log("User state updated:", freshUser);
        
        // Update localStorage accounts and currentUser
        updateAccountInLocalStorage(freshUser);
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      console.error("Profile update error:", errorMsg, error);
      toast.error(errorMsg || "Profile update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async () => {
    if (!userId) return;

    try {
      await usersApi.deleteProfileImage(String(userId));

      if (files[0]?.id) {
        removeFile(files[0].id);
      }

      // Refresh user after deletion
      const res = await usersApi.getById(String(userId));
      const freshUser = extractUserFromUsersApiResponse(res);
      
      if (freshUser) {
        setUser(freshUser);
        
        // Update localStorage accounts
        updateAccountInLocalStorage(freshUser);
      }

      toast.success("Image removed");
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      console.error("Image deletion error:", errorMsg, error);
      toast.error(`Failed to remove image: ${errorMsg}`);
    }
  };

  const previewUrl = files[0]?.preview || (user as any)?.profileImage || "";

  // Show loading state
  if (fetchingProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={previewUrl} />
                <AvatarFallback>
                  <CircleUserRoundIcon />
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <Button type="button" onClick={openFileDialog}>
                  Upload Image
                </Button>
                <input {...getInputProps()} className="sr-only" />

                {previewUrl && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleDeleteImage}
                  >
                    <Trash2Icon />
                  </Button>
                )}
              </div>
            </div>

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Tell us about yourself (max 160 characters)"
                      maxLength={160}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URLs */}
            <div className="space-y-4">
              <FormLabel>URLs</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`urls.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder="https://example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ value: "" })}
              >
                Add URL
              </Button>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}