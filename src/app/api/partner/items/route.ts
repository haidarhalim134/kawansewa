import { NextResponse } from "next/server";
import { db } from "@/db";
import { items, itemImages } from "@/db/schema";
import { requireUser } from "@/lib/cookies";
import { eq, desc, isNull, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const user = await requireUser();

    // Fetch all items owned by the user (exclude deleted items)
    const userItems = await db
      .select({
        id: items.id,
        name: items.name,
        detail: items.detail,
        pricePerDay: items.pricePerDay,
        status: items.status,
      })
      .from(items)
      .where(and(eq(items.ownerId, user.id), isNull(items.deletedAt)))
      .orderBy(desc(items.id));

    // For each item, fetch the primary image (imageOrder = 0)
    const itemsWithImages = await Promise.all(
      userItems.map(async (item) => {
        const [primaryImage] = await db
          .select({ imageUrl: itemImages.imageUrl })
          .from(itemImages)
          .where(eq(itemImages.itemId, item.id))
          .orderBy(itemImages.imageOrder)
          .limit(1);

        return {
          ...item,
          primaryImage: primaryImage?.imageUrl || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      items: itemsWithImages,
    });
  } catch (error: any) {
    console.error("Error fetching partner items:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch partner items" },
      { status: 500 }
    );
  }
}
