'use client';

import { useEffect, useState } from "react";
import { Mail, MapPin, PhoneCall, Link2Icon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileCard() {
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser"); // localStorage se current auth user
    if (storedUser) setAuthUser(JSON.parse(storedUser));
  }, []);

  if (!authUser) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </Card>
    );
  }

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
                {authUser._id?.slice(0, 4) || "----"}
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
            <div className="flex items-center gap-3 text-sm">
              <PhoneCall className="text-muted-foreground size-4" /> (+1) 555-1234
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="text-muted-foreground size-4" /> USA
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link2Icon className="text-muted-foreground size-4" />
              <a
                href="https://example.com"
                className="hover:text-primary hover:underline"
                target="_blank"
              >
                example.com
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
