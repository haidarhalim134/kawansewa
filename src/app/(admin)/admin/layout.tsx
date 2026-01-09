import Link from "next/link"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  LogOut,
  TicketPercent,
  Users,
} from "lucide-react"
import { logout } from "@/app/actions/auth"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            Admin Panel
          </h2>
        </div>

        <nav className="p-4 space-y-2">
          <SidebarLink
            href="/admin"
            icon={<LayoutDashboard size={18} />}
          >
            Dashboard
          </SidebarLink>

          <SidebarLink
            href="/admin/vouchers"
            icon={<TicketPercent size={18} />}
          >
            Vouchers
          </SidebarLink>

          <SidebarLink
            href="/admin/users"
            icon={<Users size={18} />}
          >
            User Verification
          </SidebarLink>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-6">
          <span className="text-sm text-muted-foreground">
            Admin Dashboard
          </span>

          <form action={logout}>
              <button type="submit" className="flex w-full items-center cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
              </button>
          </form>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
    >
      {icon}
      {children}
    </Link>
  )
}
