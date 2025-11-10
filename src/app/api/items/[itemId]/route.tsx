import { db } from "@/db"; // your Drizzle client
import { items, itemImages, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/cookies";

interface Params {
  params: { itemId: string };
}

export async function GET(request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const user = await requireUser(); // optional authentication
    const { params } = await context
    const itemId = Number((await params).itemId);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const rows = await db
      .select({
        id: items.id,
        name: items.name,
        detail: items.detail,
        pricePerDay: items.pricePerDay,
        owner: {
          id: users.id,
          name: users.name,
          profileImageUrl: users.profileImageUrl,
        },
        images: itemImages.imageUrl,
        imageOrder: itemImages.imageOrder,
      })
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .leftJoin(itemImages, eq(items.id, itemImages.itemId))
      .where(eq(items.id, itemId));

    if (rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Group images for this item
    const item = {
      id: rows[0].id,
      name: rows[0].name,
      detail: rows[0].detail,
      pricePerDay: rows[0].pricePerDay,
      owner: rows[0].owner,
      images: rows
        .filter((r) => r.images)
        .map((r) => ({ url: r.images, order: r.imageOrder })),
    };

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("❌ Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}
