"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/api/services/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, User, Shield, Crown } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "staff" | "admin">("user");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginAction({ email, password, role });

      if (result?.success) {
        // 🔹 Save current user
        localStorage.setItem("authToken", result.token);
        // localStorage.setItem('auth-user', JSON.stringify(result.user));
        localStorage.setItem("currentUser", JSON.stringify(result.user));

        // 🔹 Multi-account support - store user with token
        const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
        const existingIndex = accounts.findIndex((a: any) => a.email === result.user.email);
        const userWithToken = { ...result.user, token: result.token };
        if (existingIndex === -1) {
          accounts.push(userWithToken);
        } else {
          accounts[existingIndex] = userWithToken; // update existing with token
        }
        localStorage.setItem("accounts", JSON.stringify(accounts));

        // 🔹 Dispatch event for auth-change listeners
        window.dispatchEvent(new Event("auth-changed"));

        // 🔹 Redirect to dashboard
        window.location.href = `/dashboard/${result.user.role}`;
      } else {
        setError(result?.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case "admin":
        return <Crown className="h-4 w-4" />;
      case "staff":
        return <Shield className="h-4 w-4" />;
      case "user":
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (roleType: string) => {
    switch (roleType) {
      case "admin":
        return "Full system access and management";
      case "staff":
        return "Member management and training";
      case "user":
      default:
        return "Personal fitness tracking";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Gym Management System</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(error || urlError) && (
              <Alert variant="destructive">
                <AlertDescription>{error || urlError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select
                value={role}
                onValueChange={(value: "user" | "staff" | "admin") => setRole(value)}
                disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Member</div>
                        <div className="text-muted-foreground text-xs">
                          Personal fitness tracking
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Staff</div>
                        <div className="text-muted-foreground text-xs">
                          Member management and training
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Admin</div>
                        <div className="text-muted-foreground text-xs">Full system access</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                disabled={isLoading}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>

            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                {getRoleIcon(role)}
                <span className="font-medium capitalize">{role} Account</span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{getRoleDescription(role)}</p>
            </div>

            <Button type="button" className="w-full" disabled={isLoading} onClick={handleLogin}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Button variant="link" className="h-auto p-0">
                Contact your administrator
              </Button>
            </p>

            {/* Debug button */}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                console.log("Current localStorage:", {
                  authToken: localStorage.getItem("currentUser"),
                  authUser: localStorage.getItem("currentUser"),
                  accounts: JSON.parse(localStorage.getItem("accounts") || "[]")
                });
              }}>
              Debug localStorage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
