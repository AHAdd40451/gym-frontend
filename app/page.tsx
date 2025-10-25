

import { getServerAuth } from "@/lib/auth/server";
import { useAuth } from "@/lib/hooks";
import { isAuthenticated } from "@/lib/middleware/auth";
import { redirect } from "next/navigation";



export default async function Home() {
    return <div>Home</div>;
}