import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const userId = Number(id)

  if (isNaN(userId)) {
    return NextResponse.json(
      { error: "Invalid user id" },
      { status: 400 }
    )
  }

  const { status } = await req.json()

  if (!["verified", "unverified"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    )
  }

  const [user] = await db
    .update(users)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  return NextResponse.json(user)
}
