import { NextResponse } from "next/server";
import { db } from "@/db";
import { items, itemImages, rentals, reviews } from "@/db/schema";
import { ilike, or, eq, avg } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");

    if (!term || term.trim() === "") {
      return NextResponse.json(
        { error: "Missing or empty search term" },
        { status: 400 }
      );
    }

    const matchedItemsRows = await db
      .select({
        id: items.id,
        name: items.name,
        detail: items.detail,
        pricePerDay: items.pricePerDay,
        avgRating: avg(reviews.star).as("avgRating"),
      })
      .from(items)
      .leftJoin(rentals, eq(items.id, rentals.itemId))
      .leftJoin(reviews, eq(rentals.id, reviews.rentalId))
      .where(
        or(ilike(items.name, `%${term}%`), ilike(items.detail, `%${term}%`))
      )
      .groupBy(items.id, items.name, items.detail, items.pricePerDay);

    if (matchedItemsRows.length === 0) {
      return NextResponse.json([]);
    }

    const itemIds = matchedItemsRows.map((item) => item.id);

    const images = await db
      .select()
      .from(itemImages)
      .where(or(...itemIds.map((id) => eq(itemImages.itemId, id))));

    const results = matchedItemsRows.map((item) => ({
      ...item,
      rating: item.avgRating ? Number(item.avgRating) : null,
      images: images
        .filter((img) => img.itemId === item.id)
        .sort((a, b) => a.imageOrder - b.imageOrder)
        .map((img) => ({ url: img.imageUrl, order: img.imageOrder })),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
