import { db } from "@/db";
import { items, itemImages, users, rentals, reviews } from "@/db/schema";
import { eq, avg } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/cookies";

interface Params {
  params: { itemId: string };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireUser(); // optional authentication
    const { params } = await context;
    const itemId = Number((await params).itemId);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    // Fetch item details + average rating
    const rows = await db
      .select({
        id: items.id,
        name: items.name,
        detail: items.detail,
        pricePerDay: items.pricePerDay,
        ownerId: users.id,
        ownerName: users.name,
        ownerProfileImageUrl: users.profileImageUrl,
        imageUrl: itemImages.imageUrl,
        imageOrder: itemImages.imageOrder,
        avgRating: avg(reviews.star).as("avgRating"), // use avg() from drizzle-orm
      })
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .leftJoin(itemImages, eq(items.id, itemImages.itemId))
      .leftJoin(rentals, eq(items.id, rentals.itemId))
      .leftJoin(reviews, eq(rentals.id, reviews.rentalId))
      .where(eq(items.id, itemId))
      .groupBy(
        items.id,
        users.id,
        users.name,
        users.profileImageUrl,
        itemImages.imageUrl,
        itemImages.imageOrder
      );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Group images by order
    const item = {
      id: rows[0].id,
      name: rows[0].name,
      detail: rows[0].detail,
      pricePerDay: rows[0].pricePerDay,
      owner: {
        id: rows[0].ownerId,
        name: rows[0].ownerName,
        profileImageUrl: rows[0].ownerProfileImageUrl,
      },
      rating: rows[0].avgRating ? Number(rows[0].avgRating) : null,
      images: rows
        .filter((r) => r.imageUrl)
        .map((r) => ({ url: r.imageUrl, order: r.imageOrder }))
        .sort((a, b) => a.order - b.order),
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
