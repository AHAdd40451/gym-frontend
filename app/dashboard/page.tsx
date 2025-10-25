import { getServerAuth } from "@/lib/auth/server";
import { useAuth } from "@/lib/stores/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {

    const { user } = await getServerAuth();

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome {user?.firstName} {user?.lastName}</p>
        </div>
    );
}


