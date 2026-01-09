import { NextResponse } from "next/server"
import { db } from "@/db"
import { vouchers } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const voucherId = Number(id)

  if (isNaN(voucherId)) {
    return NextResponse.json(
      { error: "Invalid voucher id" },
      { status: 400 }
    )
  }

  await db.delete(vouchers).where(eq(vouchers.id, voucherId))

  return NextResponse.json({ success: true })
}
