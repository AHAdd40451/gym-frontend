

import { getServerAuth } from "@/lib/auth/server";
import { useAuth } from "@/lib/hooks";
import { redirect } from "next/navigation";



export default async function Home() {
    const { user } = await getServerAuth();

    if (user) {
        redirect("/dashboard");
    } else {
        redirect("/login");
    }

}