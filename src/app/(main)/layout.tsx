import { ReactNode } from "react";
import Link from "next/link";
import { getSession } from "@/lib/cookies";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";


export default async function MainLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    return (
        <>
            <header className="border-b bg-white">
                <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
                    <Link href="/" className="text-lg font-semibold">
                        KawanSewa
                    </Link>
                    <div className="flex items-center gap-3 text-sm">
                        {session ? (
                            <form action={logout}>
                                <Button variant="outline" size="sm" type="submit">
                                    Sign out
                                </Button>
                            </form>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-700 hover:text-gray-900">
                                    Login
                                </Link>
                                <Link href="/register">
                                    <Button variant="default" size="sm">
                                        Register
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>
            <main className="mx-auto max-w-5xl p-4">{children}</main>
        </>
    );
}
