'use client';

import { useEffect, useState, useRef } from "react";
import { Mail, MapPin, Link2, FileText, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const languages: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese"
};

interface ProfileCardProps {
  user?: any;
}

export function ProfileCard({ user: propUser }: ProfileCardProps) {
  // Always prioritize propUser if provided
  const [authUser, setAuthUser] = useState<any>(propUser || null);
  const [userLocation, setUserLocation] = useState<string>("USA");
  
  // Use ref to store current user ID for comparison in event listener
  const currentUserIdRef = useRef<string | null>(null);

  // Update state when propUser changes
  useEffect(() => {
    if (propUser) {
      setAuthUser(propUser);
      setUserLocation(propUser?.location?.country || "USA");
      currentUserIdRef.current = propUser?._id || propUser?.id || null;
    }
  }, [propUser]);

  // Update ref whenever authUser changes
  useEffect(() => {
    currentUserIdRef.current = authUser?._id || authUser?.id || null;
  }, [authUser]);

  // Listen to localStorage updates and userUpdated events
  useEffect(() => {
    // Read from localStorage initially if no propUser
    if (!propUser) {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setAuthUser(user);
          setUserLocation(user?.location?.country || "USA");
          currentUserIdRef.current = user?._id || user?.id || null;
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
        }
      }
    }

    // Listen to userUpdated events to refresh data from localStorage
    // This works even when propUser is provided, so profile updates reflect immediately
    const handleUserUpdate = () => {
      console.log("🔄 userUpdated event received in ProfileCard");
      const updatedUserStr = localStorage.getItem("currentUser");
      if (updatedUserStr) {
        try {
          const updatedUser = JSON.parse(updatedUserStr);
          const updatedUserId = updatedUser?._id || updatedUser?.id;
          const currentUserId = currentUserIdRef.current;
          
          console.log("Current User ID:", currentUserId, "Updated User ID:", updatedUserId);
          
          // Always update if user IDs match (even when propUser is provided)
          // This ensures real-time updates from settings page
          if (currentUserId && updatedUserId && currentUserId === updatedUserId) {
            console.log("✅ Updating ProfileCard with new user data");
            setAuthUser(updatedUser);
            setUserLocation(updatedUser?.location?.country || "USA");
            currentUserIdRef.current = updatedUserId;
          } else if (!propUser) {
            // If no propUser, always update
            console.log("✅ Updating ProfileCard (no propUser)");
            setAuthUser(updatedUser);
            setUserLocation(updatedUser?.location?.country || "USA");
            currentUserIdRef.current = updatedUserId;
          } else {
            console.log("❌ User ID mismatch, not updating");
          }
        } catch (error) {
          console.error("Failed to parse updated user from localStorage:", error);
        }
      }
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [propUser]);


  if (!authUser) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </Card>
    );
  }

  const userLanguage = languages[authUser.language] || "English";

  return (
    <Card className="relative">
      <CardContent>
        <div className="space-y-12">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="size-20">
              <AvatarImage
                src={authUser.profileImage || `/images/avatars/10.png`}
                alt={`${authUser.firstName} ${authUser.lastName}`}
              />
              <AvatarFallback>
                {authUser.firstName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
                {authUser.firstName} {authUser.lastName}
                <Badge variant="info">{authUser.role}</Badge>
              </h5>
              <div className="text-muted-foreground text-sm">{authUser.email}</div>
            </div>
          </div>

          <div className="bg-muted grid grid-cols-3 divide-x rounded-md border text-center *:py-3">
            <div>
              <h5 className="text-lg font-semibold">
                {authUser._id || authUser.id 
                  ? `${(authUser._id || authUser.id).slice(0, 4)}...` 
                  : "----"}
              </h5>
              <div className="text-muted-foreground text-sm">User ID</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">{authUser.role}</h5>
              <div className="text-muted-foreground text-sm">Role</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">True</h5>
              <div className="text-muted-foreground text-sm">Authenticated</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-muted-foreground size-4" /> {authUser.email}
            </div>
            
            {/* Bio */}
            {authUser.bio && (
              <div className="flex items-start gap-3 text-sm">
                <FileText className="text-muted-foreground size-4 mt-0.5" />
                <span className="flex-1">{authUser.bio}</span>
              </div>
            )}
            
            {/* Location from localStorage */}
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="text-muted-foreground size-4" /> {userLocation}
            </div>

            {/* Language */}
            <div className="flex items-center gap-3 text-sm">
              <Globe className="text-muted-foreground size-4" /> {userLanguage}
            </div>
            
            {/* URLs */}
            {authUser.urls && authUser.urls.length > 0 && (
              <div className="flex flex-col gap-2">
                {authUser.urls.map((url: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <Link2 className="text-muted-foreground size-4" />
                    <a
                      href={url}
                      className="hover:text-primary hover:underline truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}