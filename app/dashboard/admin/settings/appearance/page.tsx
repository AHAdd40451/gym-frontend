"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useTheme } from "next-themes";

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
import { useAuth } from "@/lib/api/services/auth/context";
import apiClient from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/constants/constants";

// ✅ Updated schema with fonts that exist in themes.css
const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark"], {
    required_error: "Please select a theme."
  }),
  font: z.enum(["outfit", "inter", "roboto", "poppins", "montserrat", "pt-sans"], {
    invalid_type_error: "Select a font",
    required_error: "Please select a font."
  })
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export default function Page() {
  const { user } = useAuth();
  
  // Get userId from auth context or localStorage as fallback
  const [userId, setUserId] = useState<string | null>(
    (user as any)?._id || (user as any)?.id || null
  );

  // Update userId when user changes or load from localStorage
  useEffect(() => {
    const id = (user as any)?._id || (user as any)?.id;
    if (id) {
      setUserId(id);
    } else {
      // Fallback to localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const storedId = parsedUser?._id || parsedUser?.id;
          if (storedId) setUserId(storedId);
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
        }
      }
    }
  }, [user]);
  const { theme, setTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mounted, setMounted] = useState(false);

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "light",
      font: "outfit"
    }
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    // Don't set default font here - let preferences fetch handle it
    // This prevents overriding saved preferences when navigating back to the page
  }, []);

  // Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
        if (!userId) {
        setFetching(false);
        // If no userId, apply default font and set cookie so layout uses it on next load
        if (!document.documentElement.getAttribute('data-theme-font')) {
          applyFont('outfit');
        }
        return;
      }

      try {
        setFetching(true);
        const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}/${userId}`);
        
        const userPreferences = response.data?.user?.preferences;
        
        // Get theme from user preferences or current theme
        const savedTheme = userPreferences?.theme || (theme as "light" | "dark") || "light";
        
        // Get font from preferences, or check localStorage, or check current attribute, or default to inter
        const currentFontAttribute = document.documentElement.getAttribute('data-theme-font');
        let savedFont = userPreferences?.font;
        
        // If no saved font in preferences, check localStorage
        if (!savedFont) {
          try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              savedFont = parsedUser?.preferences?.font;
            }
          } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
          }
        }
        
        // If still no font, use current attribute or default
        savedFont = savedFont || currentFontAttribute || "outfit";

        form.reset({
          theme: savedTheme,
          font: savedFont
        });

        // Apply theme
        if (savedTheme) {
          setTheme(savedTheme);
        }

        // Apply font using data-theme-font attribute (preserve if already set correctly)
        if (currentFontAttribute !== savedFont) {
          applyFont(savedFont);
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
        // On error, check if font is already set, otherwise set default
        if (!document.documentElement.getAttribute('data-theme-font')) {
          applyFont('outfit');
        }
        toast.error("Failed to load appearance settings");
      } finally {
        setFetching(false);
      }
    };

    if (mounted) {
      fetchPreferences();
    }
  }, [userId, mounted]);

  // Apply font using data-theme-font attribute (matches themes.css)
  const applyFont = (font: string) => {
    document.documentElement.setAttribute('data-theme-font', font);
    // Persist in cookie so layout can apply font on next server render
    document.cookie = `theme_font=${encodeURIComponent(font)}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
  };

  const onSubmit = async (data: AppearanceFormValues) => {
    if (!userId) {
      toast.error("User not found. Please login again.");
      return;
    }

    try {
      setLoading(true);

      // Update preferences in backend
      await apiClient.put(`${API_ENDPOINTS.USERS.BASE}/${userId}`, {
        preferences: {
          ...(user as any)?.preferences,
          theme: data.theme,
          font: data.font
        }
      });

      // Apply theme
      setTheme(data.theme);

      // Apply font
      applyFont(data.font);

      toast.success("Appearance settings updated successfully");
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      const isCorsError = errorMsg?.includes('CORS') || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error');
      
      if (isCorsError) {
        // CORS error - save to localStorage anyway (optimistic update)
        console.warn("CORS/Network error - saving to localStorage");
        
        // Apply theme and font locally
        setTheme(data.theme);
        applyFont(data.font);
        
        // Save to localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const updatedUser = {
              ...parsedUser,
              preferences: {
                ...(parsedUser as any)?.preferences,
                theme: data.theme,
                font: data.font
              }
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          } catch (e) {
            console.error('Failed to update localStorage:', e);
          }
        }
        
        toast.success("Appearance saved locally (offline mode)");
      } else {
        console.error("Failed to update preferences:", error);
        toast.error("Failed to update appearance settings");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || fetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the appearance of the app. Automatically switch between day and night themes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Font Selection Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-12 animate-pulse rounded bg-muted-foreground/20"></div>
              <div className="h-10 w-full animate-pulse rounded-md bg-muted-foreground/20"></div>
              <div className="h-3 w-64 animate-pulse rounded bg-muted-foreground/20"></div>
            </div>

            {/* Theme Selection Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/20"></div>
              <div className="h-3 w-56 animate-pulse rounded bg-muted-foreground/20"></div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 max-w-md">
                {/* Light Theme Skeleton */}
                <div className="space-y-2">
                  <div className="items-center rounded-lg border-2 border-muted p-1">
                    <div className="space-y-2 rounded-lg bg-[#ecedef] p-2">
                      <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-2 w-[80px] rounded-lg bg-[#ecedef] animate-pulse" />
                        <div className="h-2 w-[100px] rounded-lg bg-[#ecedef] animate-pulse" />
                      </div>
                      <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-[#ecedef] animate-pulse" />
                        <div className="h-2 w-[100px] rounded-lg bg-[#ecedef] animate-pulse" />
                      </div>
                      <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-[#ecedef] animate-pulse" />
                        <div className="h-2 w-[100px] rounded-lg bg-[#ecedef] animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/20"></div>
                </div>

                {/* Dark Theme Skeleton */}
                <div className="space-y-2">
                  <div className="items-center rounded-lg border-2 border-muted p-1">
                    <div className="space-y-2 rounded-lg bg-slate-950 p-2">
                      <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                        <div className="h-2 w-[80px] rounded-lg bg-slate-400 animate-pulse" />
                        <div className="h-2 w-[100px] rounded-lg bg-slate-400 animate-pulse" />
                      </div>
                      <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-slate-400 animate-pulse" />
                        <div className="h-2 w-[100px] rounded-lg bg-slate-400 animate-pulse" />
                      </div>
                      <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-slate-400 animate-pulse" />
                        <div className="h-2 w-[100px] rounded-lg bg-slate-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/20"></div>
                </div>
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="h-10 w-44 animate-pulse rounded-md bg-muted-foreground/20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the appearance of the app. Automatically switch between day and night themes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Font Selection */}
            <FormField
              control={form.control}
              name="font"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="outfit">Outfit</SelectItem>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="montserrat">Montserrat</SelectItem>
                      <SelectItem value="pt-sans">PT Sans</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the font you want to use in the dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Theme Selection */}
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Theme</FormLabel>
                  <FormDescription>
                    Select the theme for the dashboard.
                  </FormDescription>
                  <FormMessage />
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-4 pt-2 max-w-md"
                  >
                    {/* Light Theme Option */}
                    <FormItem>
                      <FormLabel 
                        className={cn(
                          "cursor-pointer",
                          "[&:has([data-state=checked])>div]:border-primary"
                        )}
                      >
                        <FormControl>
                          <RadioGroupItem value="light" className="sr-only" />
                        </FormControl>
                        <div className="items-center rounded-lg border-2 border-muted hover:border-accent p-1 transition-colors">
                          <div className="space-y-2 rounded-lg bg-[#ecedef] p-2">
                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal text-sm">
                          Light
                        </span>
                      </FormLabel>
                    </FormItem>

                    {/* Dark Theme Option */}
                    <FormItem>
                      <FormLabel 
                        className={cn(
                          "cursor-pointer",
                          "[&:has([data-state=checked])>div]:border-primary"
                        )}
                      >
                        <FormControl>
                          <RadioGroupItem value="dark" className="sr-only" />
                        </FormControl>
                        <div className="items-center rounded-lg border-2 border-muted hover:border-accent p-1 transition-colors">
                          <div className="space-y-2 rounded-lg bg-slate-950 p-2">
                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal text-sm">
                          Dark
                        </span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update preferences"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}