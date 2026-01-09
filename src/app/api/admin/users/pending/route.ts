import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const data = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      identificationImageUrl: users.identificationImageUrl,
    })
    .from(users)
    .where(eq(users.status, "pending_verification"))

  return NextResponse.json(data)
}
