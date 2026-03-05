"use client";

import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  CircleUserRoundIcon,
  Trash2Icon,
  Lock,
  UserIcon,
  MapPinIcon,
  BellIcon,
  LinkIcon,
  CameraIcon,
} from "lucide-react";

import { usersApi } from "@/lib/api/services/users/users";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useAuth } from "@/lib/api/services/auth/context";
import { generateAvatarFallback } from "@/lib/utils";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const staffProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  bio: z.string().max(300).optional(),
  urls: z
    .array(z.object({ value: z.string().url("Invalid URL").or(z.literal("")) }))
    .optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  preferences: z
    .object({
      notifications: z
        .object({
          email: z.boolean().optional(),
          sms: z.boolean().optional(),
          push: z.boolean().optional(),
        })
        .optional(),
      privacy: z
        .object({
          profileVisibility: z.enum(["public", "private"]).optional(),
          showEmail: z.boolean().optional(),
          showPhone: z.boolean().optional(),
        })
        .optional(),
      units: z
        .object({
          weight: z.enum(["kg", "lbs"]).optional(),
          height: z.enum(["cm", "ft"]).optional(),
          distance: z.enum(["km", "miles"]).optional(),
        })
        .optional(),
    })
    .optional(),
});

type StaffProfileFormValues = z.infer<typeof staffProfileSchema>;

function getErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred";
  if (typeof error === "string") return error;
  const e = error as Record<string, unknown>;
  if (e.message && typeof e.message === "string") return e.message;
  if (e.error && typeof e.error === "string") return e.error;
  const data = e.data as Record<string, unknown> | undefined;
  if (data?.message && typeof data.message === "string") return data.message;
  const res = e.response as { data?: Record<string, unknown> } | undefined;
  if (res?.data?.message && typeof res.data.message === "string")
    return res.data.message as string;
  if (res?.data?.error && typeof res.data.error === "string")
    return res.data.error as string;
  try {
    return JSON.stringify(error);
  } catch {
    return "An unknown error occurred";
  }
}

function extractUserFromResponse(res: unknown): Record<string, unknown> | null {
  const payload = (res as { data?: unknown })?.data;
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const user =
    (p.data as Record<string, unknown> | undefined)?.user ??
    p.user ??
    p.data ??
    p;
  return user && typeof user === "object" ? (user as Record<string, unknown>) : null;
}

function updateAccountInLocalStorage(updatedUser: Record<string, unknown>) {
  try {
    const accountsStr = localStorage.getItem("accounts");
    if (!accountsStr) return;
    const accounts = JSON.parse(accountsStr) as Record<string, unknown>[];
    const userId =
      (updatedUser._id as string) || (updatedUser.id as string) || "";
    if (!userId) return;
    const updated = accounts.map((acc: Record<string, unknown>) => {
      const accId = (acc._id as string) || (acc.id as string) || "";
      return accId === userId ? { ...acc, ...updatedUser } : acc;
    });
    localStorage.setItem("accounts", JSON.stringify(updated));
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr) as Record<string, unknown>;
      const currentUserId =
        (currentUser._id as string) || (currentUser.id as string) || "";
      if (currentUserId === userId) {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("userUpdated"));
    }
  } catch (err) {
    console.error("Failed to update localStorage accounts:", err);
  }
}

const defaultPreferences = {
  notifications: { email: true, sms: false, push: true },
  privacy: {
    profileVisibility: "public" as const,
    showEmail: true,
    showPhone: false,
  },
  units: { weight: "kg" as const, height: "cm" as const, distance: "km" as const },
};

export function StaffProfile() {
  const { user, setUser } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const [{ files }, { removeFile, openFileDialog, getInputProps }] =
    useFileUpload({ accept: "image/*" });

  const form = useForm<StaffProfileFormValues>({
    resolver: zodResolver(staffProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      urls: [],
      address: {},
      preferences: defaultPreferences,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "urls",
  });

  useEffect(() => {
    const u = user as Record<string, unknown> | null;
    const id = (u?._id as string) || (u?.id as string) || (u?.userId as string) || null;
    setUserId(id);
  }, [user]);

  useEffect(() => {
    if (!userId) {
      setFetchingProfile(false);
      return;
    }

    let cancelled = false;
    const id = userId;

    async function load() {
      setFetchingProfile(true);
      try {
        const res = await usersApi.getById(id);
        const freshUser = extractUserFromResponse(res);
        if (cancelled) return;
        if (freshUser) {
          setUser(freshUser as never);
          const prefs = (freshUser.preferences as Record<string, unknown>) || {};
          const notif = (prefs.notifications as Record<string, unknown>) || {};
          const privacy = (prefs.privacy as Record<string, unknown>) || {};
          const units = (prefs.units as Record<string, unknown>) || {};
          form.reset({
            firstName: (freshUser.firstName as string) ?? "",
            lastName: (freshUser.lastName as string) ?? "",
            email: (freshUser.email as string) ?? "",
            phone: (freshUser.phone as string) ?? "",
            bio: (freshUser.bio as string) ?? "",
            urls: Array.isArray(freshUser.urls)
              ? (freshUser.urls as string[]).map((val) => ({ value: val }))
              : [],
            address: (freshUser.address as Record<string, unknown>) || {},
            preferences: {
              notifications: {
                email: (notif.email as boolean) ?? true,
                sms: (notif.sms as boolean) ?? false,
                push: (notif.push as boolean) ?? true,
              },
              privacy: {
                profileVisibility:
                  (privacy.profileVisibility as "public" | "private") ?? "public",
                showEmail: (privacy.showEmail as boolean) ?? true,
                showPhone: (privacy.showPhone as boolean) ?? false,
              },
              units: {
                weight: (units.weight as "kg" | "lbs") ?? "kg",
                height: (units.height as "cm" | "ft") ?? "cm",
                distance: (units.distance as "km" | "miles") ?? "km",
              },
            },
          });
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(`Failed to load profile: ${getErrorMessage(err)}`);
          const u = (userRef.current ?? null) as unknown as Record<string, unknown> | null;
          if (u) {
            form.reset({
              firstName: (u.firstName as string) ?? "",
              lastName: (u.lastName as string) ?? "",
              email: (u.email as string) ?? "",
              phone: (u.phone as string) ?? "",
              bio: (u.bio as string) ?? "",
              urls: [],
              address: (u.address as Record<string, unknown>) || {},
              preferences: defaultPreferences,
            });
          }
        }
      } finally {
        if (!cancelled) setFetchingProfile(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const onSubmit = async (data: StaffProfileFormValues) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }
    try {
      setLoading(true);
      const updateData: Record<string, unknown> = {
        firstName: data.firstName,
        lastName: data.lastName ?? "",
        email: data.email,
        bio: (data.bio ?? "").trim(),
        urls: (data.urls ?? []).map((u) => u.value).filter((v) => v !== ""),
        address: data.address ?? {},
        preferences: data.preferences ?? defaultPreferences,
      };
      // Only include optional fields when they have a value (backend rejects empty string for phone)
      if (data.phone != null && String(data.phone).trim() !== "") {
        updateData.phone = String(data.phone).trim();
      }

      await usersApi.update(userId, updateData);

      if (files[0]?.file instanceof File) {
        await usersApi.uploadProfileImage(userId, files[0].file);
      }

      const res = await usersApi.getById(userId);
      let freshUser = extractUserFromResponse(res);
      if (!freshUser) {
        freshUser = {
          ...(user as unknown as Record<string, unknown>),
          ...updateData,
        };
      }
      setUser(freshUser as never);
      updateAccountInLocalStorage(freshUser);
      if (files[0]?.id) removeFile(files[0].id);
      toast.success("Profile updated successfully");
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg || "Profile update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!userId) return;
    try {
      await usersApi.deleteProfileImage(userId);
      if (files[0]?.id) removeFile(files[0].id);
      const res = await usersApi.getById(userId);
      const freshUser = extractUserFromResponse(res);
      if (freshUser) {
        setUser(freshUser as never);
        updateAccountInLocalStorage(freshUser);
      }
      toast.success("Photo removed");
    } catch (error) {
      toast.error(`Failed to remove photo: ${getErrorMessage(error)}`);
    }
  };

  const u = user as Record<string, unknown> | null;
  const previewUrl =
    (files[0] as { preview?: string } | undefined)?.preview ||
    (u?.profileImage as string) ||
    "";
  const displayName = [form.watch("firstName"), form.watch("lastName")]
    .filter(Boolean)
    .join(" ")
    .trim();
  const role = (u?.role as string) || "staff";

  if (fetchingProfile) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-64 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Profile header */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="relative shrink-0">
              <Avatar className="h-28 w-28 border-4 border-background shadow-lg ring-2 ring-primary/20">
                <AvatarImage src={previewUrl} alt={displayName || "Staff"} />
                <AvatarFallback className="bg-primary/15 text-primary text-2xl">
                  {displayName ? generateAvatarFallback(displayName) : <CircleUserRoundIcon className="h-14 w-14" />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-full shadow-md"
                  onClick={openFileDialog}
                >
                  <CameraIcon className="h-4 w-4" />
                </Button>
                <input {...getInputProps()} className="sr-only" />
                {previewUrl && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-9 w-9 rounded-full shadow-md"
                    onClick={handleDeleteImage}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {displayName || "Staff Member"}
              </h1>
              <p className="text-muted-foreground truncate">
                {form.watch("email") || "No email"}
              </p>
              <Badge variant="secondary" className="capitalize">
                {role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 h-auto flex-wrap gap-1 bg-muted/60 p-1.5">
              <TabsTrigger value="profile" className="gap-2">
                <UserIcon className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-2">
                <MapPinIcon className="h-4 w-4" />
                Contact &amp; Address
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <BellIcon className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                Links
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal information</CardTitle>
                  <CardDescription>
                    Update your name and bio. Email cannot be changed here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="First name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Last name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              readOnly
                              className="bg-muted cursor-not-allowed pr-10"
                            />
                            <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormDescription>Email cannot be changed from this page.</FormDescription>
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
                            placeholder="A short bio (max 300 characters)"
                            maxLength={300}
                            rows={3}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact &amp; address</CardTitle>
                  <CardDescription>
                    Phone and address for your profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1 234 567 8900" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <div className="space-y-4">
                    <FormLabel>Address (optional)</FormLabel>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="address.street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground font-normal">Street</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Street" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground font-normal">City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground font-normal">State / Province</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="State" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground font-normal">ZIP / Postal code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ZIP" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="text-muted-foreground font-normal">Country</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Country" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="preferences.notifications.email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email notifications</FormLabel>
                          <FormDescription>Receive updates and reminders by email.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? true}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences.notifications.sms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">SMS notifications</FormLabel>
                          <FormDescription>Receive text messages for important updates.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences.notifications.push"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Push notifications</FormLabel>
                          <FormDescription>Receive in-app push notifications.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? true}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Units</CardTitle>
                  <CardDescription>
                    Preferred units for weight, height, and distance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="preferences.units.weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value ?? "kg"}
                              onChange={(e) =>
                                field.onChange(e.target.value as "kg" | "lbs")
                              }
                            >
                              <option value="kg">kg</option>
                              <option value="lbs">lbs</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferences.units.height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value ?? "cm"}
                              onChange={(e) =>
                                field.onChange(e.target.value as "cm" | "ft")
                              }
                            >
                              <option value="cm">cm</option>
                              <option value="ft">ft</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferences.units.distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value ?? "km"}
                              onChange={(e) =>
                                field.onChange(e.target.value as "km" | "miles")
                              }
                            >
                              <option value="km">km</option>
                              <option value="miles">miles</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                  <CardDescription>
                    Add social or professional links to your profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`urls.${index}.value`}
                        render={({ field: f }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...f} placeholder="https://example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        className="shrink-0"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ value: "" })}
                    className="w-full sm:w-auto"
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Add link
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} size="lg" className="min-w-[160px]">
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
