import { NextResponse } from "next/server"
import { db } from "@/db"
import { vouchers } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const data = await db.select().from(vouchers)
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()

  const [voucher] = await db
    .insert(vouchers)
    .values({
      code: body.code,
      discountAmount: body.discountAmount,
      maxUsage: body.maxUsage,
      startDate: body.startDate,
      endDate: body.endDate,
      isActive: body.isActive ?? 1,
    })
    .returning()

  return NextResponse.json(voucher)
}

export async function PUT(req: Request) {
  const body = await req.json()

  const [voucher] = await db
    .update(vouchers)
    .set({
      code: body.code,
      discountAmount: body.discountAmount,
      maxUsage: body.maxUsage,
      startDate: body.startDate,
      endDate: body.endDate,
      isActive: body.isActive,
    })
    .where(eq(vouchers.id, body.id))
    .returning()

  return NextResponse.json(voucher)
}
