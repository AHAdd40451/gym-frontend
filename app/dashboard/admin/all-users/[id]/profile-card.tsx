import { Link2Icon, Mail, MapPin, PhoneCall } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileCardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  };
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="relative">
      <CardContent>
        <div className="space-y-12">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="size-20">
              <AvatarImage src={`/images/avatars/10.png`} alt={user.firstName} />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <h5 className="flex items-center gap-2 text-xl font-semibold capitalize">
                {user.firstName} {user.lastName}
                {user.status === "active" && <Badge variant="info">Active</Badge>}
              </h5>

              <div className="text-muted-foreground text-sm capitalize">
                {user.role}
              </div>
            </div>
          </div>

          {/* Static stats (abhi dummy) */}
          <div className="bg-muted grid grid-cols-3 divide-x rounded-md border text-center *:py-3">
            <div>
              <h5 className="text-lg font-semibold">184</h5>
              <div className="text-muted-foreground text-sm">Post</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">32</h5>
              <div className="text-muted-foreground text-sm">Projects</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">4.5K</h5>
              <div className="text-muted-foreground text-sm">Members</div>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-muted-foreground size-4" />
              {user.email}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <PhoneCall className="text-muted-foreground size-4" />
(123) 456 789            </div>

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="text-muted-foreground size-4" />
             USA
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Link2Icon className="text-muted-foreground size-4" />
              <span className="text-muted-foreground">https://shadcnuikit.com</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
