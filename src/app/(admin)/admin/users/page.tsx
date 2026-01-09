"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type User = {
  id: number
  email: string
  name: string | null
  identificationImageUrl: string | null
}

export default function UserVerificationPage() {
  const [users, setUsers] = useState<User[]>([])
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/users/pending")
      .then(res => res.json())
      .then(setUsers)
  }, [])

  async function updateStatus(
    id: number,
    status: "verified" | "unverified"
  ) {
    await fetch(`/api/admin/users/${id}/update_status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })

    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Verification</CardTitle>
          <CardDescription>
            Review and verify pending user identities
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ID Document</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.email}
                  </TableCell>

                  <TableCell>
                    {u.name ?? (
                      <span className="text-muted-foreground">
                        —
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {u.identificationImageUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setImage(u.identificationImageUrl)
                        }
                      >
                        View ID
                      </Button>
                    ) : (
                      <Badge variant="secondary">
                        Not uploaded
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatus(u.id, "verified")
                      }
                    >
                      Verify
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        updateStatus(u.id, "unverified")
                      }
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users pending verification 🎉
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!image} onOpenChange={() => setImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Identification Document
            </DialogTitle>
          </DialogHeader>

          {image && (
            <img
              src={image}
              alt="Identification"
              className="w-full h-auto rounded-md border"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
