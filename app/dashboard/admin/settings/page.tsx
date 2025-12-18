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
        // Auth context restores async from localStorage; wait until we actually have an id
        return;
      }

      setFetchingProfile(true);
      try {
        const res = await usersApi.getById(String(userId));
        const freshUser = extractUserFromUsersApiResponse(res);

        if (freshUser) {
          setUser(freshUser);
          resetFormFromUser(freshUser);
        } else {
          // fallback to whatever we have in auth context
          resetFormFromUser(user);
        }
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err);
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
  // SUBMIT PROFILE (API update + refresh user state)
  // =========================
  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

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

      await usersApi.update(String(userId), updateData);

      if (files[0]?.file instanceof File) {
        await usersApi.uploadProfileImage(String(userId), files[0].file);
      }

      // Refresh user from API so avatar/header/etc update everywhere
      const res = await usersApi.getById(String(userId));
      const freshUser = extractUserFromUsersApiResponse(res);
      if (freshUser) setUser(freshUser);

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error?.message || "Profile update failed. Please try again.");
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
      if (freshUser) setUser(freshUser);

      toast.success("Image removed");
    } catch (error) {
      console.error("Image deletion error:", error);
      toast.error("Failed to remove image");
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