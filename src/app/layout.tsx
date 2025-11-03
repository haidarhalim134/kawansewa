import "@/app/globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { getSession } from "@/lib/cookies";


export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <Link href="/" className="font-semibold">Next + Drizzle Custom Auth</Link>
            <div className="space-x-3 text-sm">
              {session ? (
                <>
                  <Link href="/dashboard">Dashboard</Link>
                  <form action="/api/auth/logout" method="post" className="inline">
                    <button className="rounded-lg border px-3 py-1">Sign out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">Login</Link>
                  <Link href="/register" className="rounded-lg border px-3 py-1">Register</Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-4">{children}</main>
      </body>
    </html>
  );
}