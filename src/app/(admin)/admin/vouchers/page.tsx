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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Voucher = {
  id: number
  code: string
  discountAmount: string
  maxUsage: number
  startDate: string
  endDate: string
  isActive: number
}

export default function VoucherAdminPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Voucher | null>(null)

  useEffect(() => {
    fetch("/api/admin/vouchers")
      .then(res => res.json())
      .then(setVouchers)
  }, [])

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openEdit(voucher: Voucher) {
    setEditing(voucher)
    setOpen(true)
  }

  async function deleteVoucher(id: number) {
    await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" })
    setVouchers(v => v.filter(x => x.id !== id))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Voucher Management</CardTitle>
            <CardDescription>
              Create and manage discount vouchers
            </CardDescription>
          </div>
          <Button onClick={openCreate}>Create Voucher</Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {vouchers.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    {v.code}
                  </TableCell>

                  <TableCell>
                    Rp. {v.discountAmount}
                  </TableCell>

                  <TableCell>
                    {v.maxUsage === 0 ? "∞" : v.maxUsage}
                  </TableCell>

                  <TableCell>
                    <Badge variant={v.isActive ? "default" : "secondary"}>
                      {v.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(v)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteVoucher(v.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {vouchers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-6"
                  >
                    No vouchers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <VoucherFormDialog
        open={open}
        onOpenChange={setOpen}
        voucher={editing}
        onSaved={(v) => {
          setOpen(false)
          setVouchers(prev =>
            editing
              ? prev.map(x => (x.id === v.id ? v : x))
              : [...prev, v]
          )
        }}
      />
    </div>
  )
}

function VoucherFormDialog({
  open,
  onOpenChange,
  voucher,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  voucher: Voucher | null
  onSaved: (v: Voucher) => void
}) {
  const emptyForm: Voucher = {
    id: 0,
    code: "",
    discountAmount: "",
    maxUsage: 0,
    startDate: "",
    endDate: "",
    isActive: 1,
  }

  const [form, setForm] = useState<Voucher>(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(voucher ?? emptyForm)
    }
  }, [voucher, open])

  async function submit() {
    const res = await fetch("/api/admin/vouchers", {
      method: voucher ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    onSaved(await res.json())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {voucher ? "Edit Voucher" : "Create Voucher"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Code</Label>
            <Input
              value={form.code}
              onChange={e =>
                setForm({ ...form, code: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Discount Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={form.discountAmount}
              onChange={e =>
                setForm({ ...form, discountAmount: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Max Usage</Label>
            <Input
              type="number"
              value={form.maxUsage}
              onChange={e =>
                setForm({
                  ...form,
                  maxUsage: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={e =>
                setForm({ ...form, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={e =>
                setForm({ ...form, endDate: e.target.value })
              }
            />
          </div>

          <div className="col-span-2">
            <Label>Status</Label>
            <Select
              value={String(form.isActive)}
              onValueChange={v =>
                setForm({ ...form, isActive: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            Save Voucher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
