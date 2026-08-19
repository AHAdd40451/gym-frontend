'use client';

import { useEffect, useState, useRef } from "react";
import { Mail, MapPin, Link2, FileText, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usersApi } from "@/lib/api/services/users/users";

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gym.coderivals.ltd/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const getProfileImageUrl = (user: any) => {
  const image =
    user?.profileImage ||
    user?.avatar ||
    user?.image ||
    user?.photo;

  if (!image) return "";

  const imageString = String(image);

  if (imageString.startsWith("http")) {
    return imageString;
  }

  if (imageString.startsWith("/")) {
    return `${API_ORIGIN}${imageString}`;
  }

  return `${API_ORIGIN}/${imageString}`;
};

const getAvatarFallback = (user: any) => {
  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  return initials || user?.email?.[0]?.toUpperCase() || "U";
};

const extractUserFromResponse = (res: any) => {
  return (
    res?.data?.data?.user ||
    res?.data?.user ||
    res?.data?.data ||
    res?.data ||
    null
  );
};

interface ProfileCardProps {
  user?: any;
}

export function ProfileCard({ user: propUser }: ProfileCardProps) {
  const [authUser, setAuthUser] = useState<any>(propUser || null);
  const [userLocation, setUserLocation] = useState<string>("USA");
  const [imageFailed, setImageFailed] = useState(false);

  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (propUser) {
      setAuthUser(propUser);
      setUserLocation(propUser?.location?.country || "USA");
      currentUserIdRef.current = propUser?._id || propUser?.id || null;
      setImageFailed(false);
    }
  }, [propUser]);

  useEffect(() => {
    currentUserIdRef.current = authUser?._id || authUser?.id || null;
  }, [authUser]);

  useEffect(() => {
    if (!propUser && typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setAuthUser(parsedUser);
          setUserLocation(parsedUser?.location?.country || "USA");
          currentUserIdRef.current = parsedUser?._id || parsedUser?.id || null;
          setImageFailed(false);
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
        }
      }
    }
  }, [propUser]);

  useEffect(() => {
    const fetchFreshUser = async () => {
      const userId =
        propUser?._id ||
        propUser?.id ||
        authUser?._id ||
        authUser?.id ||
        currentUserIdRef.current;

      if (!userId) return;

      try {
        const res = await usersApi.getById(String(userId));
        const freshUser = extractUserFromResponse(res);

        if (freshUser) {
          setAuthUser(freshUser);
          setUserLocation(freshUser?.location?.country || "USA");
          currentUserIdRef.current = freshUser?._id || freshUser?.id || null;
          setImageFailed(false);

          if (typeof window !== "undefined") {
            localStorage.setItem("currentUser", JSON.stringify(freshUser));
          }
        }
      } catch (error) {
        console.error("Failed to fetch fresh profile user:", error);
      }
    };

    fetchFreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propUser?._id, propUser?.id]);

  useEffect(() => {
    const handleUserUpdate = () => {
      console.log("userUpdated event received in ProfileCard");

      const updatedUserStr = localStorage.getItem("currentUser");

      if (updatedUserStr) {
        try {
          const updatedUser = JSON.parse(updatedUserStr);
          const updatedUserId = updatedUser?._id || updatedUser?.id;
          const currentUserId = currentUserIdRef.current;

          if (currentUserId && updatedUserId && String(currentUserId) === String(updatedUserId)) {
            setAuthUser(updatedUser);
            setUserLocation(updatedUser?.location?.country || "USA");
            currentUserIdRef.current = updatedUserId;
            setImageFailed(false);
          } else if (!propUser) {
            setAuthUser(updatedUser);
            setUserLocation(updatedUser?.location?.country || "USA");
            currentUserIdRef.current = updatedUserId;
            setImageFailed(false);
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
  const profileImageUrl = getProfileImageUrl(authUser);
  const avatarFallback = getAvatarFallback(authUser);

  console.log("PROFILE IMAGE URL:", profileImageUrl);
  console.log("AUTH USER IMAGE:", authUser?.profileImage, authUser?.avatar);

  return (
    <Card className="relative">
      <CardContent>
        <div className="space-y-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="size-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {profileImageUrl && !imageFailed ? (
                <img
                  key={profileImageUrl}
                  src={`${profileImageUrl}?t=${Date.now()}`}
                  alt={`${authUser.firstName || ""} ${authUser.lastName || ""}`}
                  className="h-full w-full object-cover"
                  onError={() => {
                    console.log("IMAGE LOAD FAILED:", profileImageUrl);
                    setImageFailed(true);
                  }}
                />
              ) : (
                <span className="text-lg font-semibold">
                  {avatarFallback}
                </span>
              )}
            </div>

            <div className="text-center">
              <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
                {authUser.firstName} {authUser.lastName}
                <Badge variant="info">{authUser.role}</Badge>
              </h5>

              <div className="text-muted-foreground text-sm">
                {authUser.email}
              </div>
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

          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-muted-foreground size-4" /> {authUser.email}
            </div>

            {authUser.bio && (
              <div className="flex items-start gap-3 text-sm">
                <FileText className="text-muted-foreground size-4 mt-0.5" />
                <span className="flex-1">{authUser.bio}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="text-muted-foreground size-4" /> {userLocation}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Globe className="text-muted-foreground size-4" /> {userLanguage}
            </div>

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