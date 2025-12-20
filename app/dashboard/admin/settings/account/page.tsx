"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { usersApi } from "@/lib/api/services/users/users";
import { useAuth } from "@/lib/api/services/auth/context";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" }
] as const;

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters."
    })
    .max(30, {
      message: "Name must not be longer than 30 characters."
    }),
  dob: z.date({
    required_error: "A date of birth is required."
  }),
  language: z.string({
    required_error: "Please select a language."
  })
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

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

// Helper function to update user in localStorage accounts
function updateAccountInLocalStorage(updatedUser: any) {
  try {
    const accountsStr = localStorage.getItem("accounts");
    if (!accountsStr) return;
    
    const accounts = JSON.parse(accountsStr);
    const userId = updatedUser?._id || updatedUser?.id;
    
    if (!userId) return;
    
    const updatedAccounts = accounts.map((acc: any) => {
      const accId = acc?._id || acc?.id;
      if (accId === userId) {
        return { ...acc, ...updatedUser };
      }
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
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userUpdated'));
    
    console.log("✅ Updated user in localStorage accounts");
  } catch (error) {
    console.error("❌ Failed to update localStorage accounts:", error);
  }
}

export default function Page() {
  const { user, setUser } = useAuth();
  const userId = user?._id || user?.id || (user as any)?.userId;

  const [loading, setLoading] = useState(false);
  const [fetchingAccount, setFetchingAccount] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      dob: undefined,
      language: "en"
    }
  });

  // Load user account data
  useEffect(() => {
    const loadAccountData = async () => {
      if (!userId) {
        console.log("No userId available yet, waiting...");
        return;
      }

      console.log("Loading account data for userId:", userId);
      setFetchingAccount(true);
      
      try {
        const res = await usersApi.getById(String(userId));
        console.log("API Response:", res);
        
        const freshUser = extractUserFromUsersApiResponse(res);
        console.log("Extracted user:", freshUser);

        if (freshUser) {
          setUser(freshUser);
          
          // Reset form with user data
          form.reset({
            name: `${freshUser.firstName ?? ""} ${freshUser.lastName ?? ""}`.trim() || "",
            dob: freshUser.dateOfBirth ? new Date(freshUser.dateOfBirth) : undefined,
            language: freshUser.language || "en"
          });
        } else {
          console.warn("No user data in API response, using auth context");
          // Fallback to auth context
          if (user) {
            form.reset({
              name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "",
              dob: (user as any).dateOfBirth ? new Date((user as any).dateOfBirth) : undefined,
              language: (user as any).language || "en"
            });
          }
        }
      } catch (err: any) {
        const errorMsg = getErrorMessage(err);
        console.error("Failed to fetch account data:", errorMsg, err);
        toast.error(`Failed to load account: ${errorMsg}`);
        
        // Fallback to auth context user
        if (user) {
          form.reset({
            name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "",
            dob: (user as any).dateOfBirth ? new Date((user as any).dateOfBirth) : undefined,
            language: (user as any).language || "en"
          });
        }
      } finally {
        setFetchingAccount(false);
      }
    };

    loadAccountData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, setUser, form]);

  async function onSubmit(data: AccountFormValues) {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    console.log("Submitting account update for userId:", userId);
    console.log("Form data:", data);

    try {
      setLoading(true);

      const [firstName, ...lastNameArr] = data.name.trim().split(" ");

      const updateData = {
        firstName,
        lastName: lastNameArr.join(" ") || "",
        dateOfBirth: data.dob.toISOString(),
        language: data.language
      };

      console.log("Update data:", updateData);

      const updateResponse = await usersApi.update(String(userId), updateData);
      console.log("Update response:", updateResponse);

      // Refresh user from API
      console.log("Fetching updated user data...");
      const res = await usersApi.getById(String(userId));
      const freshUser = extractUserFromUsersApiResponse(res);
      
      if (freshUser) {
        // Update localStorage first
        updateAccountInLocalStorage(freshUser);
        
        // Then update auth context
        setUser(freshUser);
        console.log("User state updated:", freshUser);
      }

      toast.success("Account updated successfully!");
      
      // Force a small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      console.error("Account update error:", errorMsg, error);
      toast.error(errorMsg || "Account update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Show loading state
  if (fetchingAccount) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading account data...</p>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed on your profile and in emails.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="max-h-[--radix-popover-content-available-height] w-[--radix-popover-trigger-width] p-0"
                      align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Your date of birth is used to calculate your age.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Language</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}>
                          {field.value
                            ? languages.find((language) => language.value === field.value)?.label
                            : "Select language"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search language..." />
                        <CommandList>
                          <CommandEmpty>No language found.</CommandEmpty>
                          <CommandGroup>
                            {languages.map((language) => (
                              <CommandItem
                                value={language.label}
                                key={language.value}
                                onSelect={() => {
                                  form.setValue("language", language.value);
                                }}>
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    language.value === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {language.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is the language that will be used in the dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update account"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}