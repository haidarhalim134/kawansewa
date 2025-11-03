import { redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";


export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");


    return (
        <div className="space-y-3">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p>Signed in as {session.email}</p>
            <p className="text-sm text-gray-600">Your user id: {session.userId}</p>
        </div>
    );
}