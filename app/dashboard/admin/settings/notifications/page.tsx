"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { notificationsApi, type NotificationSettings } from "@/lib/api/services/notifications/notifications";
import { useAuth } from "@/lib/api/services/auth/context";

const notificationsFormSchema = z.object({
  type: z.enum(["all", "mentions", "none"], {
    required_error: "You need to select a notification type."
  }),
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean()
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

// Helper to safely extract error message
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

function extractSettingsFromResponse(res: any): NotificationSettings | null {
  const payload = res?.data;
  return (
    payload?.data ??
    payload ??
    null
  );
}

export default function Page() {
  const { user } = useAuth();
  const userId = user?._id || user?.id || (user as any)?.userId;

  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(false);

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      type: "all",
      mobile: false,
      communication_emails: false,
      social_emails: true,
      marketing_emails: false,
      security_emails: true
    }
  });

  // Load notification settings
  useEffect(() => {
    const loadNotificationSettings = async () => {
      if (!userId) {
        console.log("No userId available yet, waiting...");
        return;
      }

      console.log("Loading notification settings for userId:", userId);
      setFetchingSettings(true);
      
      try {
        const res = await notificationsApi.getSettings(String(userId));
        console.log("API Response:", res);
        
        const settings = extractSettingsFromResponse(res);
        console.log("Extracted settings:", settings);

        if (settings) {
          // Reset form with settings data
          form.reset({
            type: settings.type || "all",
            mobile: settings.mobile ?? false,
            communication_emails: settings.communication_emails ?? false,
            social_emails: settings.social_emails ?? true,
            marketing_emails: settings.marketing_emails ?? false,
            security_emails: settings.security_emails ?? true
          });
        }
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        console.error("Failed to fetch notification settings:", errorMsg, err);
        
        // Don't show error toast on first load if settings don't exist yet
        // The API will create default settings automatically
        if (!errorMsg.includes("not found")) {
          toast.error(`Failed to load settings: ${errorMsg}`);
        }
      } finally {
        setFetchingSettings(false);
      }
    };

    loadNotificationSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, form]);

  async function onSubmit(data: NotificationsFormValues) {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    console.log("Submitting notification settings for userId:", userId);
    console.log("Form data:", data);

    try {
      setLoading(true);

      const updateData = {
        type: data.type,
        mobile: data.mobile ?? false,
        communication_emails: data.communication_emails ?? false,
        social_emails: data.social_emails ?? true,
        marketing_emails: data.marketing_emails ?? false,
        security_emails: true, // Always true
      };

      console.log("Update data:", updateData);

      const response = await notificationsApi.updateSettings(String(userId), updateData);
      console.log("Update response:", response);

      toast.success("Notification settings updated successfully!");
      
      // Force a small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      console.error("Notification settings update error:", errorMsg, error);
      toast.error(errorMsg || "Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Show loading skeleton
  if (fetchingSettings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Notify me about... Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/20"></div>
              <div className="flex flex-col space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-4 w-4 animate-pulse rounded-full bg-muted-foreground/20"></div>
                    <div className="h-4 w-40 animate-pulse rounded bg-muted-foreground/20"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Notifications Skeleton */}
            <div>
              <div className="h-6 w-48 animate-pulse rounded bg-muted-foreground/20 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex flex-row items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-48 animate-pulse rounded bg-muted-foreground/20"></div>
                      <div className="h-3 w-64 animate-pulse rounded bg-muted-foreground/20"></div>
                    </div>
                    <div className="h-6 w-11 animate-pulse rounded-full bg-muted-foreground/20"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Settings Checkbox Skeleton */}
            <div className="flex flex-row items-start space-x-3">
              <div className="h-4 w-4 animate-pulse rounded bg-muted-foreground/20"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-80 animate-pulse rounded bg-muted-foreground/20"></div>
                <div className="h-3 w-72 animate-pulse rounded bg-muted-foreground/20"></div>
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="h-10 w-48 animate-pulse rounded-md bg-muted-foreground/20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Notify me about...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <RadioGroupItem value="all" />
                        </FormControl>
                        <FormLabel className="font-normal">All new messages</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <RadioGroupItem value="mentions" />
                        </FormControl>
                        <FormLabel className="font-normal">Direct messages and mentions</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <RadioGroupItem value="none" />
                        </FormControl>
                        <FormLabel className="font-normal">Nothing</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <h3 className="mb-4 text-lg font-medium">Email Notifications</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="communication_emails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Communication emails</FormLabel>
                        <FormDescription>
                          Receive emails about your account activity.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketing_emails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Marketing emails</FormLabel>
                        <FormDescription>
                          Receive emails about new products, features, and more.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social_emails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Social emails</FormLabel>
                        <FormDescription>
                          Receive emails for friend requests, follows, and more.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="security_emails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Security emails</FormLabel>
                        <FormDescription>
                          Receive emails about your account activity and security.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Use different settings for my mobile devices</FormLabel>
                    <FormDescription>
                      You can manage your mobile notifications in the{" "}
                      <Link href="/settings/notifications" className="underline">mobile settings</Link> page.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update notifications"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}