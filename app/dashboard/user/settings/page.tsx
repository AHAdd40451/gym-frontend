"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CircleUserRoundIcon, Trash2Icon, Lock } from "lucide-react";

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

function getErrorMessage(error: any): string {
  if (!error) return "An unknown error occurred";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  if (error.data?.message) return error.data.message;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  try {
    return JSON.stringify(error);
  } catch {
    return "An unknown error occurred";
  }
}

function extractUserFromUsersApiResponse(res: any) {
  const payload = res?.data;
  return (
    payload?.data?.user ??
    payload?.user ??
    payload?.data ??
    payload ??
    null
  );
}

function updateAccountInLocalStorage(updatedUser: any) {
  try {
    const accountsStr = localStorage.getItem("accounts");
    if (!accountsStr) return;
    const accounts = JSON.parse(accountsStr);
    const userId = updatedUser?._id || updatedUser?.id;
    if (!userId) return;
    const updatedAccounts = accounts.map((acc: any) => {
      const accId = acc?._id || acc?.id;
      if (accId === userId) return { ...acc, ...updatedUser };
      return acc;
    });
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      const currentUserId = currentUser?._id || currentUser?.id;
      if (currentUserId === userId) {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("userUpdated"));
    }
  } catch (error) {
    console.error("Failed to update localStorage accounts:", error);
  }
}

export default function Page() {
  const { user, setUser } = useAuth();

  const [userId, setUserId] = useState<string | null>(
    (user as any)?._id || (user as any)?.id || (user as any)?.userId || null
  );

  useEffect(() => {
    const id = (user as any)?._id || (user as any)?.id || (user as any)?.userId;
    if (id) {
      setUserId(id);
    } else {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const storedId = parsedUser?._id || parsedUser?.id;
          if (storedId) setUserId(storedId);
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
        }
      }
    }
  }, [user]);

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
      if (!userId) return;
      setFetchingProfile(true);
      try {
        const res = await usersApi.getById(String(userId));
        const freshUser = extractUserFromUsersApiResponse(res);
        if (freshUser) {
          setUser(freshUser);
          resetFormFromUser(freshUser);
        } else {
          resetFormFromUser(user);
        }
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        const isCorsError = errorMsg?.includes("CORS") || err?.code === "ERR_NETWORK" || err?.message?.includes("Network Error");
        if (isCorsError) {
          resetFormFromUser(user);
        } else {
          toast.error(`Failed to load profile: ${errorMsg}`);
          resetFormFromUser(user);
        }
      } finally {
        setFetchingProfile(false);
      }
    };

    loadUserProfile();
  }, [userId, setUser, form]);

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
        urls: data.urls?.map((u) => u.value).filter((url) => url !== "") ?? [],
      };

      await usersApi.update(String(userId), updateData);

      if (files[0]?.file instanceof File) {
        await usersApi.uploadProfileImage(String(userId), files[0].file);
      }

      const res = await usersApi.getById(String(userId));
      let freshUser = extractUserFromUsersApiResponse(res);
      if (!freshUser) {
        freshUser = {
          ...(user as any),
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData.email,
          bio: updateData.bio,
          urls: updateData.urls,
        };
      }

      setUser(freshUser as any);
      updateAccountInLocalStorage(freshUser);

      form.reset({
        username: `${freshUser.firstName ?? ""} ${freshUser.lastName ?? ""}`.trim(),
        email: freshUser.email ?? "",
        bio: freshUser.bio ?? "",
        urls: Array.isArray(freshUser.urls) ? freshUser.urls.map((val: string) => ({ value: val })) : [],
      });

      if (files[0]?.id) removeFile(files[0].id);

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      const isCorsError = errorMsg?.includes("CORS") || error?.code === "ERR_NETWORK" || error?.message?.includes("Network Error");

      if (isCorsError) {
        const [firstName, ...lastNameArr] = data.username.trim().split(" ");
        const updatedUser = {
          ...user,
          firstName,
          lastName: lastNameArr.join(" ") || "",
          email: data.email,
          bio: data.bio,
          urls: data.urls?.map((u) => u.value).filter((url) => url !== ""),
        };
        updateAccountInLocalStorage(updatedUser);
        setUser(updatedUser as any);
        toast.success("Profile saved locally (offline mode)");
      } else {
        toast.error(errorMsg || "Profile update failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!userId) return;
    try {
      await usersApi.deleteProfileImage(String(userId));
      if (files[0]?.id) removeFile(files[0].id);
      const res = await usersApi.getById(String(userId));
      const freshUser = extractUserFromUsersApiResponse(res);
      if (freshUser) {
        setUser(freshUser);
        updateAccountInLocalStorage(freshUser);
      }
      toast.success("Image removed");
    } catch (error: any) {
      toast.error(`Failed to remove image: ${getErrorMessage(error)}`);
    }
  };

  const previewUrl = files[0]?.preview || (user as any)?.profileImage || "";

  if (fetchingProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 animate-pulse rounded-full bg-muted-foreground/20" />
              <div className="flex gap-2">
                <div className="h-10 w-32 animate-pulse rounded-md bg-muted-foreground/20" />
                <div className="h-10 w-10 animate-pulse rounded-md bg-muted-foreground/20" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/20" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted-foreground/20" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/20" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted-foreground/20" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-12 animate-pulse rounded bg-muted-foreground/20" />
              <div className="h-24 w-full animate-pulse rounded-md bg-muted-foreground/20" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-md bg-muted-foreground/20" />
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

            {/* Email - read-only, cannot be changed */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input
                        {...field}
                        placeholder="Enter your email"
                        readOnly
                        className="bg-muted cursor-not-allowed pr-10"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
