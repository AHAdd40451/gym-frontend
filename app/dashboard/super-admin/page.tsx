import { generateMeta } from "@/lib/utils";
import OverviewClient from "./components/overview-client";

export async function generateMetadata() {
  return generateMeta({
    title: "Super Admin Overview",
    description: "Global SaaS overview for all gyms",
    canonical: "/dashboard/super-admin",
  });
}

export default function SuperAdminPage() {
  return <OverviewClient />;
}
