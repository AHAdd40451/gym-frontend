import { Suspense } from "react";
import LandingAutoLogin from "@/components/auth/LandingAutoLogin";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          <p className="text-sm text-white/60">Opening your dashboard...</p>
        </div>
      }
    >
      <LandingAutoLogin />
    </Suspense>
  );
}