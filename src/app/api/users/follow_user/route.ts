// app/api/users/[userId]/follow/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db"; // your drizzle instance
import { userFollows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

export async function POST(req: Request, context: { searchParams: Promise<{ userId: string }> }) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  const currentUser = await requireUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const followingId = parseInt(userId, 10);
  const followerId = currentUser.id;

  if (followerId === followingId) {
    return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
  }

  const existing = await db.query.userFollows.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.followerId, followerId), eq(table.followingId, followingId)),
  });

  if (existing) {
    return NextResponse.json({ error: "Already following this user." }, { status: 400 });
  }

  await db.insert(userFollows).values({
    followerId,
    followingId,
  });

  return NextResponse.json({ success: true });
}
