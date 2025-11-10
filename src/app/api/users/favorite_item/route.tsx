import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; 
import { itemFavorites } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

export async function POST(req: NextRequest) {
    try {
        const user = await requireUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const itemId = Number(searchParams.get("itemId"));

        if (!itemId || isNaN(itemId)) {
            return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
        }

        const existing = await db
            .select()
            .from(itemFavorites)
            .where(
                and(
                    eq(itemFavorites.userId, user.id),
                    eq(itemFavorites.itemId, itemId)
                )
            );

        if (existing.length > 0) {
            await db
                .delete(itemFavorites)
                .where(
                    and(
                        eq(itemFavorites.userId, user.id),
                        eq(itemFavorites.itemId, itemId)
                    )
                );

            return NextResponse.json({ message: "Item unfavorited" });
        } else {
            await db.insert(itemFavorites).values({
                userId: user.id,
                itemId,
            });

            return NextResponse.json({ message: "Item favorited" });
        }
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
