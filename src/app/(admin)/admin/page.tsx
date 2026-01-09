import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TicketPercent,
  Users,
} from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage platform settings and approvals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent size={18} />
              Voucher Management
            </CardTitle>
            <CardDescription>
              Create and manage discount vouchers
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button asChild>
              <Link href="/admin/vouchers">
                Manage Vouchers
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* User Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} />
              User Verification
            </CardTitle>
            <CardDescription>
              Review and approve user identities
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button asChild>
              <Link href="/admin/users">
                Review Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
