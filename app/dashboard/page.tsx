"use client"

import { useAuth } from "@/lib/stores/auth";
import { redirect } from "next/navigation";

export default function DashboardPage() {

    const { user } = useAuth();


    console.log(user, "useruseruser");

    if (!user) {
        return <div>Unauthorized</div>;
    }

    if (user.role === "admin") {
        redirect("/dashboard/admin");
    }

    if (user.role === "staff") {
        redirect("/dashboard/staff");
    }

    if (user.role === "user") {
        redirect("/dashboard/user");
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome {user?.firstName} {user?.lastName}</p>
        </div>
    );
}
