import { db } from "@/db"; // your Drizzle client
import { items, itemImages, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/cookies"; // for authenticated user

// GET /api/items
export async function GET() {
  try {
    // (Optional) require logged-in user
    const user = await requireUser();

    // Fetch all items with their images and owner info
    const allItems = await db
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
      .leftJoin(itemImages, eq(items.id, itemImages.itemId));

    // Group images by item (Drizzle returns flattened rows)
    const grouped = Object.values(
      allItems.reduce((acc: any, row) => {
        const id = row.id;
        if (!acc[id]) {
          acc[id] = {
            id: row.id,
            name: row.name,
            detail: row.detail,
            pricePerDay: row.pricePerDay,
            owner: row.owner,
            images: [],
          };
        }
        if (row.images) {
          acc[id].images.push({
            url: row.images,
            order: row.imageOrder,
          });
        }
        return acc;
      }, {})
    );

    return NextResponse.json(grouped);
  } catch (error: any) {
    console.error("❌ Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
