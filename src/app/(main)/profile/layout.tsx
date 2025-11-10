import { ReactNode } from "react";
import Link from "next/link";
import { getSession } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { User, History, Heart } from "lucide-react";

export default async function ProfileLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const menuItems = [
        {
            href: "/profile",
            icon: User,
            label: "Profile",
            description: "Manage your account"
        },
        {
            href: "/profile/rentals",
            icon: History,
            label: "Rental History",
            description: "View your rentals"
        },
        {
            href: "/profile/favorites",
            icon: Heart,
            label: "Favorites",
            description: "Saved items"
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
                    {/* Sidebar */}
                    <aside className="space-y-2">
                        <div className="bg-white rounded-lg border p-4 sticky top-24">
                            <h2 className="font-semibold text-lg mb-4">Account</h2>
                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                                        >
                                            <Icon className="h-5 w-5 text-gray-600 group-hover:text-gray-900 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 group-hover:text-blue-600">
                                                    {item.label}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}
