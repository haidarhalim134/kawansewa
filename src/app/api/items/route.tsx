import { db } from "@/db";
import { items, itemImages, users, rentals, reviews } from "@/db/schema";
import { eq, avg } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/cookies";

// GET /api/items
export async function GET() {
  try {
    // (Optional) require logged-in user
    const user = await requireUser();

    // Fetch all items with owner info, images, and average rating
    const allItems = await db
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
        avgRating: avg(reviews.star).as("avgRating"), // average rating
      })
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .leftJoin(itemImages, eq(items.id, itemImages.itemId))
      .leftJoin(rentals, eq(items.id, rentals.itemId))
      .leftJoin(reviews, eq(rentals.id, reviews.rentalId))
      .groupBy(
        items.id,
        users.id,
        users.name,
        users.profileImageUrl,
        itemImages.imageUrl,
        itemImages.imageOrder
      );

    // Group images by item
    const grouped = Object.values(
      allItems.reduce((acc: any, row) => {
        const id = row.id;
        if (!acc[id]) {
          acc[id] = {
            id: row.id,
            name: row.name,
            detail: row.detail,
            pricePerDay: row.pricePerDay,
            owner: {
              id: row.ownerId,
              name: row.ownerName,
              profileImageUrl: row.ownerProfileImageUrl,
            },
            rating: row.avgRating ? Number(row.avgRating) : null,
            images: [],
          };
        }
        if (row.imageUrl) {
          acc[id].images.push({
            url: row.imageUrl,
            order: row.imageOrder,
          });
        }
        return acc;
      }, {})
    );

    // Optional: sort images by order
    grouped.forEach((item) => {
      item.images.sort((a: any, b: any) => a.order - b.order);
    });

    return NextResponse.json(grouped);
  } catch (error: any) {
    console.error("❌ Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
